<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'identifier' => 'required|string',
            'password' => 'required|string',
        ]);

        $identifier = $request->identifier;
        $password = $request->password;

        $user = User::where('nip', $identifier)
                    ->orWhere('username', $identifier)
                    ->orWhere('email', $identifier)
                    ->first();

        if (!$user || !Hash::check($password, $user->password)) {
            throw ValidationException::withMessages([
                'identifier' => ['Username/NIP atau password salah.'],
            ]);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Login berhasil',
            'user' => $user,
            'access_token' => $token,
            'token_type' => 'Bearer',
        ]);
    }

    public function updateProfile(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['message' => 'Tidak terautentikasi.'], 401);
        }

        $request->validate([
            'name'             => 'sometimes|required|string|max:255',
            'username'         => 'sometimes|required|string|max:255|unique:users,username,' . $user->id,
            'email'            => 'sometimes|nullable|email|max:255|unique:users,email,' . $user->id,
            'current_password' => 'required_with:new_password|string',
            'new_password'     => 'sometimes|nullable|string|min:8|confirmed',
        ]);

        if ($request->filled('new_password')) {
            if (!Hash::check($request->current_password, $user->password)) {
                return response()->json([
                    'message' => 'Password lama tidak sesuai.',
                    'errors'  => ['current_password' => ['Password lama tidak sesuai.']],
                ], 422);
            }
            $user->password = $request->new_password;
        }

        if ($request->filled('name'))     $user->name     = $request->name;
        if ($request->filled('username')) $user->username = $request->username;
        if ($request->has('email'))       $user->email    = $request->email;

        $user->save();

        return response()->json([
            'message' => 'Profil berhasil diperbarui.',
            'user'    => $user->fresh(),
        ]);
    }
}
