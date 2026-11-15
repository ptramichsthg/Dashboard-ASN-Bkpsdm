<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureRole
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     * @param  string  ...$roles
     */
    public function handle(Request $request, Closure $next, ...$roles): Response
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        $userRole = strtolower(trim($user->role ?? 'user'));

        // Normalisasi parameter roles
        $allowedRoles = array_map(function ($r) {
            return strtolower(trim($r));
        }, $roles);

        // Jika super_admin, biasanya memiliki privilege penuh untuk mengakses role admin
        if ($userRole === 'super_admin' && in_array('admin', $allowedRoles)) {
            return $next($request);
        }

        if (!in_array($userRole, $allowedRoles)) {
            return response()->json([
                'message' => 'Akses ditolak. Peran Anda (' . $userRole . ') tidak memiliki izin untuk fitur ini.',
            ], 403);
        }

        return $next($request);
    }
}

