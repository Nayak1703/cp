"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Briefcase, Users, User, LogOut } from "lucide-react";
import HeroSection from "@/app/components/HeroSection";
import AllOpenings from "./AllOpenings";
import HRList from "./HRList";
import MyProfile from "./MyProfile";

interface UserData {
  firstName: string;
  lastName: string;
  email: string;
  scope: string;
  designation: string;
  phoneNo?: string;
}

type TabType = "all-openings" | "hr-list" | "my-profile";

export default function HRDashboardContent({
  userData,
}: {
  userData: UserData | null;
}) {
  const [activeTab, setActiveTab] = useState<TabType>("all-openings");
  const router = useRouter();

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/" });
  };

  const canAddHR = userData?.scope === "owner";
  const canPostJob = !["moderator", "participant"].includes(
    userData?.scope || ""
  );

  const navItems = [
    {
      id: "all-openings" as TabType,
      label: "All Openings",
      icon: Briefcase,
      default: true,
    },
    {
      id: "hr-list" as TabType,
      label: "HR List",
      icon: Users,
      show: canAddHR,
    },
    {
      id: "my-profile" as TabType,
      label: "My Profile",
      icon: User,
    },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "all-openings":
        return <AllOpenings canPostJob={canPostJob} />;
      case "hr-list":
        return <HRList />;
      case "my-profile":
        return <MyProfile userData={userData} />;
      default:
        return <AllOpenings canPostJob={canPostJob} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Navigation */}
      <nav className="bg-slate-800/50 backdrop-blur-xl border-b border-slate-700/50 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo/Name - Right Side */}
            <div className="flex items-center">
              <h1 className="text-xl sm:text-2xl font-bold text-white">
                HR Dashboard
              </h1>
            </div>

            {/* Navigation Items - Left Side */}
            <div className="flex items-center space-x-4">
              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center space-x-2">
                <button
                  onClick={() => setActiveTab("all-openings")}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors text-sm ${
                    activeTab === "all-openings"
                      ? "bg-blue-500 text-white"
                      : "text-slate-300 hover:text-white hover:bg-slate-700/50"
                  }`}
                >
                  <Briefcase className="w-4 h-4" />
                  <span>Jobs</span>
                </button>

                <button
                  onClick={() => setActiveTab("hr-list")}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors text-sm ${
                    activeTab === "hr-list"
                      ? "bg-blue-500 text-white"
                      : "text-slate-300 hover:text-white hover:bg-slate-700/50"
                  }`}
                >
                  <Users className="w-4 h-4" />
                  <span>HR List</span>
                </button>

                <button
                  onClick={() => setActiveTab("my-profile")}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors text-sm ${
                    activeTab === "my-profile"
                      ? "bg-blue-500 text-white"
                      : "text-slate-300 hover:text-white hover:bg-slate-700/50"
                  }`}
                >
                  <User className="w-4 h-4" />
                  <span>My Profile</span>
                </button>

                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 px-3 py-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded transition-colors text-sm"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>

              {/* Mobile Hamburger Menu */}
              <div className="md:hidden">
                <button
                  onClick={() => setActiveTab("all-openings")}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors text-sm ${
                    activeTab === "all-openings"
                      ? "bg-blue-500 text-white"
                      : "text-slate-300 hover:text-white hover:bg-slate-700/50"
                  }`}
                >
                  <Briefcase className="w-4 h-4" />
                  <span>Jobs</span>
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Menu */}
          <div className="md:hidden mt-4">
            <div className="flex flex-wrap items-center gap-2">
              {canAddHR && (
                <button
                  onClick={() => setActiveTab("hr-list")}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors text-sm ${
                    activeTab === "hr-list"
                      ? "bg-blue-500 text-white"
                      : "text-slate-300 hover:text-white hover:bg-slate-700/50"
                  }`}
                >
                  <Users className="w-4 h-4" />
                  <span>HR List</span>
                </button>
              )}

              <button
                onClick={() => setActiveTab("my-profile")}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors text-sm ${
                  activeTab === "my-profile"
                    ? "bg-blue-500 text-white"
                    : "text-slate-300 hover:text-white hover:bg-slate-700/50"
                }`}
              >
                <User className="w-4 h-4" />
                <span>My Profile</span>
              </button>

              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-3 py-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded transition-colors text-sm"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <HeroSection />

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6 sm:py-8">
        {renderContent()}
      </div>
    </div>
  );
}
