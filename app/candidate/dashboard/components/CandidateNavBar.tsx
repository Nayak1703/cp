"use client";

import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Building2, User, LogOut } from "lucide-react";

export default function CandidateNavBar() {
  const router = useRouter();

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/" });
  };

  const handleProfile = () => {
    router.push("/candidate/dashboard/profile");
  };

  return (
    <nav className="bg-slate-800/50 backdrop-blur-xl border-b border-slate-700/50 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo/Name - Left Side */}
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Building2 className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Career Portal</h1>
              <p className="text-xs text-slate-400">Candidate Dashboard</p>
            </div>
          </div>

          {/* Navigation Items - Right Side */}
          <div className="flex items-center space-x-4">
            <button
              onClick={handleProfile}
              className="flex items-center space-x-2 px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors"
            >
              <User className="h-4 w-4" />
              <span className="text-sm font-medium">My Profile</span>
            </button>

            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-3 py-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span className="text-sm font-medium">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
