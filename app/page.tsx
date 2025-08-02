"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import NavBar from "./components/NavBar";
import HeroSection from "./components/HeroSection";
import JobsSection from "./components/JobsSection";
import JobDetailsModal from "./components/JobDetailsModal";

export default function Home() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null);

  useEffect(() => {
    const jobId = searchParams.get("jobId");
    if (jobId) {
      const id = parseInt(jobId);
      if (!isNaN(id)) {
        setSelectedJobId(id);
      }
    }
  }, [searchParams]);

  // Listen for job selection events from JobCard components
  useEffect(() => {
    const handleJobSelected = (event: CustomEvent) => {
      setSelectedJobId(event.detail);
    };

    window.addEventListener("jobSelected", handleJobSelected as EventListener);

    return () => {
      window.removeEventListener(
        "jobSelected",
        handleJobSelected as EventListener
      );
    };
  }, []);

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

  const handleCloseModal = () => {
    setSelectedJobId(null);
    // Remove jobId from URL
    const newUrl = new URL(window.location.href);
    newUrl.searchParams.delete("jobId");
    router.replace(newUrl.pathname);
  };

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

      {/* Job Details Modal */}
      <JobDetailsModal jobId={selectedJobId} onClose={handleCloseModal} />
    </div>
  );
}
