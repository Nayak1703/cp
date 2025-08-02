"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import {
  Building2,
  LogIn,
  UserPlus,
  User,
  LogOut,
  LayoutDashboard,
} from "lucide-react";

export default function NavBar() {
  const { data: session, status } = useSession();

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" });
  };

  return (
    <nav className="bg-white/10 backdrop-blur-xl border-b border-white/20 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <Building2 className="h-8 w-8 text-blue-500" />
            <span className="text-xl font-bold text-white">CareerPortal</span>
          </div>

          {/* Navigation Items */}
          <div className="flex items-center space-x-3">
            {status === "loading" ? (
              // Loading state
              <div className="flex items-center space-x-2 px-4 py-2 text-white">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400"></div>
                <span className="hidden sm:inline">Loading...</span>
              </div>
            ) : session?.user ? (
              // Authenticated user
              <>
                <div className="flex items-center space-x-2 px-4 py-2 text-white">
                  <User className="h-5 w-5 text-blue-400" />
                  <span className="hidden sm:inline text-sm">
                    Welcome, {session.user.name}
                  </span>
                </div>
                <Link
                  href={
                    session.user.userType === "hr"
                      ? "/hr/dashboard"
                      : "/candidate/dashboard"
                  }
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  <LayoutDashboard className="h-5 w-5" />
                  <span className="hidden sm:inline">Dashboard</span>
                </Link>
                <button
                  onClick={handleSignOut}
                  className="flex items-center space-x-2 px-4 py-2 text-white hover:text-red-300 transition-colors"
                >
                  <LogOut className="h-5 w-5" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </>
            ) : (
              // Unauthenticated user
              <>
                <Link
                  href="/login"
                  className="flex items-center space-x-2 px-4 py-2 text-white hover:text-blue-300 transition-colors"
                >
                  <LogIn className="h-5 w-5" />
                  <span className="hidden sm:inline">Login</span>
                </Link>
                <Link
                  href="/signup"
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  <UserPlus className="h-5 w-5" />
                  <span className="hidden sm:inline">Sign Up</span>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
