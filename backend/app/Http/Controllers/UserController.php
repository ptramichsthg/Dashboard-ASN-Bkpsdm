<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class UserController extends Controller
{
    /**
     * Display a listing of users (Super Admin only).
     */
    public function index(Request $request)
    {
        $query = User::query();

        // Search by keyword (name, username, email, nip)
        if ($request->filled('search')) {
            $search = trim($request->search);
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('username', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('nip', 'like', "%{$search}%");
            });
        }

        // Filter by role
        if ($request->filled('role')) {
            $query->where('role', $request->role);
        }

        $users = $query->orderBy('id', 'desc')->paginate($request->input('per_page', 10));

        return response()->json($users);
    }

    /**
     * Store a newly created user (Super Admin only).
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'     => 'required|string|max:255',
            'username' => 'nullable|string|max:255|unique:users,username',
            'email'    => 'nullable|email|max:255|unique:users,email',
            'nip'      => 'nullable|string|max:255|unique:users,nip',
            'role'     => ['required', 'string', Rule::in(['super_admin', 'admin', 'user'])],
            'password' => 'required|string|min:6',
        ], [
            'role.in'           => 'Peran harus salah satu dari: super_admin, admin, atau user.',
            'username.unique'   => 'Username sudah digunakan oleh akun lain.',
            'email.unique'      => 'Email sudah digunakan oleh akun lain.',
            'nip.unique'        => 'NIP sudah digunakan oleh akun lain.',
            'password.min'      => 'Kata sandi minimal 6 karakter.',
        ]);

        $user = User::create([
            'name'     => $validated['name'],
            'username' => $validated['username'] ?? null,
            'email'    => $validated['email'] ?? null,
            'nip'      => $validated['nip'] ?? null,
            'role'     => $validated['role'],
            'password' => Hash::make($validated['password']),
        ]);

        return response()->json([
            'message' => 'Pengguna baru berhasil ditambahkan.',
            'user'    => $user,
        ], 201);
    }

    /**
     * Display the specified user.
     */
    public function show($id)
    {
        $user = User::findOrFail($id);
        return response()->json($user);
    }

    /**
     * Update the specified user (Super Admin only).
     */
    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);

        $validated = $request->validate([
            'name'     => 'required|string|max:255',
            'username' => ['nullable', 'string', 'max:255', Rule::unique('users', 'username')->ignore($user->id)],
            'email'    => ['nullable', 'email', 'max:255', Rule::unique('users', 'email')->ignore($user->id)],
            'nip'      => ['nullable', 'string', 'max:255', Rule::unique('users', 'nip')->ignore($user->id)],
            'role'     => ['required', 'string', Rule::in(['super_admin', 'admin', 'user'])],
        ]);

        // Cegah super admin mencabut role-nya sendiri jika dia satu-satunya super admin
        if ($user->id === $request->user()->id && $validated['role'] !== 'super_admin') {
            $otherSuperAdmin = User::where('role', 'super_admin')->where('id', '!=', $user->id)->count();
            if ($otherSuperAdmin === 0) {
                return response()->json([
                    'message' => 'Tidak dapat mengubah peran karena Anda adalah satu-satunya Super Admin.',
                ], 422);
            }
        }

        $user->update($validated);

        return response()->json([
            'message' => 'Data pengguna berhasil diperbarui.',
            'user'    => $user->fresh(),
        ]);
    }

    /**
     * Reset password of a user (Super Admin only).
     */
    public function resetPassword(Request $request, $id)
    {
        $user = User::findOrFail($id);

        $validated = $request->validate([
            'password' => 'required|string|min:6',
        ], [
            'password.min' => 'Kata sandi baru minimal 6 karakter.',
        ]);

        $user->password = Hash::make($validated['password']);
        $user->save();

        return response()->json([
            'message' => 'Kata sandi pengguna ' . $user->name . ' berhasil di-reset.',
        ]);
    }

    /**
     * Remove the specified user (Super Admin only).
     */
    public function destroy(Request $request, $id)
    {
        $user = User::findOrFail($id);

        // Cegah menghapus akun sendiri
        if ($user->id === $request->user()->id) {
            return response()->json([
                'message' => 'Anda tidak dapat menghapus akun Anda sendiri.',
            ], 422);
        }

        $user->tokens()->delete();
        $user->delete();

        return response()->json([
            'message' => 'Pengguna berhasil dihapus.',
        ]);
    }
}
