"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import NavBar from "./components/NavBar";
import HeroSection from "./components/HeroSection";
import JobsSection from "./components/JobsSection";

export default function Home() {
  const router = useRouter();
  const { data: session, status } = useSession();

  // Handle session-based redirects
  useEffect(() => {
    if (status === "loading") return; // Still loading session

    if (session?.user?.userType) {
      // User is authenticated with userType, redirect to appropriate dashboard
      if (session.user.userType === "hr") {
        router.push("/hr/dashboard");
      } else if (session.user.userType === "candidate") {
        router.push("/candidate/dashboard");
      }
    }
    // If no userType, don't redirect - let them stay on the homepage
    // They can manually go to login if needed
  }, [session, status, router]);

  // Show loading state while checking session
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  // If user is authenticated with userType, show loading while redirecting
  if (session?.user?.userType) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-white text-lg">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <NavBar />
      <HeroSection />
      <JobsSection />
    </div>
  );
}
