"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Briefcase, Bookmark, FileText, Loader2 } from "lucide-react";
import HeroSection from "@/app/components/HeroSection";
import JobFilters from "@/app/components/JobFilters";
import CandidateJobCard from "./CandidateJobCard";
import { Job, JobFilters as JobFiltersType } from "@/src/types";

type TabType = "all" | "applied" | "saved";

interface Application {
  applicationId: string;
  jobId: number;
  applicationStatus: string;
  appliedOn: string;
  job: Job;
}

interface SavedJob {
  id: string;
  jobId: number;
  savedOn: string;
  job: Job;
}

export default function CandidateDashboardContent() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<TabType>("all");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<JobFiltersType>({
    jobStatus: "",
    department: "",
    location: "",
    experience: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [savedJobIds, setSavedJobIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (session?.user?.id) {
      if (activeTab === "all") {
        fetchData();
      } else {
        // For applied and saved tabs, just fetch the data once
        if (activeTab === "applied" && applications.length === 0) {
          fetchAppliedJobs();
        } else if (activeTab === "saved" && savedJobs.length === 0) {
          fetchSavedJobs();
        }
      }
    }
  }, [session, activeTab, currentPage]);

  // Separate effect for filters to avoid unnecessary API calls
  useEffect(() => {
    if (session?.user?.id && activeTab === "all") {
      fetchData();
    }
  }, [filters]);

  // Fetch saved jobs count and applications count on initial load
  useEffect(() => {
    if (session?.user?.id) {
      fetchSavedJobsCount();
      fetchApplicationsCount();
    }
  }, [session]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === "all") {
        await fetchAllJobs();
      } else if (activeTab === "applied") {
        await fetchAppliedJobs();
      } else if (activeTab === "saved") {
        await fetchSavedJobs();
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllJobs = async () => {
    const params = new URLSearchParams({
      page: currentPage.toString(),
      limit: "6",
      ...filters,
    });

    const response = await fetch(`/api/jobs?${params}`);
    const data = await response.json();

    if (data.success) {
      setJobs(data.jobs);
      setTotalPages(data.totalPages);
    }
  };

  const fetchAppliedJobs = async () => {
    const response = await fetch("/api/applications/my-applications");
    const data = await response.json();

    if (data.success) {
      setApplications(data.applications);
    }
  };

  const fetchSavedJobs = async () => {
    const response = await fetch("/api/saved-jobs");
    const data = await response.json();

    if (data.success) {
      setSavedJobs(data.savedJobs);
      setSavedJobIds(new Set(data.savedJobs.map((sj: SavedJob) => sj.jobId)));
    }
  };

  const fetchSavedJobsCount = async () => {
    const response = await fetch("/api/saved-jobs");
    const data = await response.json();

    if (data.success) {
      setSavedJobs(data.savedJobs);
      setSavedJobIds(new Set(data.savedJobs.map((sj: SavedJob) => sj.jobId)));
    }
  };

  const fetchApplicationsCount = async () => {
    const response = await fetch("/api/applications/my-applications");
    const data = await response.json();

    if (data.success) {
      setApplications(data.applications);
    }
  };

  const handleSaveToggle = (jobId: number, saved: boolean) => {
    if (saved) {
      setSavedJobIds((prev) => new Set([...prev, jobId]));
      // Update saved jobs count
      setSavedJobs((prev) => [
        ...prev,
        {
          id: "",
          jobId,
          savedOn: new Date().toISOString(),
          job: jobs.find((j) => j.jobId === jobId)!,
        },
      ]);
    } else {
      setSavedJobIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(jobId);
        return newSet;
      });
      // Update saved jobs count
      setSavedJobs((prev) => prev.filter((sj) => sj.jobId !== jobId));
    }
  };

  const getTabData = () => {
    let data: Job[] = [];

    switch (activeTab) {
      case "all":
        data = jobs;
        break;
      case "applied":
        data = applications.map((app) => app.job);
        break;
      case "saved":
        data = savedJobs.map((saved) => saved.job);
        break;
      default:
        return [];
    }

    // Apply filters to all tabs
    return data.filter((job) => {
      if (filters.jobStatus && job.jobStatus !== filters.jobStatus)
        return false;
      if (filters.department && job.department !== filters.department)
        return false;
      if (filters.location && job.location !== filters.location) return false;
      if (filters.experience && job.experience !== filters.experience)
        return false;
      return true;
    });
  };

  const getTabCount = () => {
    return getTabData().length;
  };

  const renderEmptyState = () => {
    const messages = {
      all: "No jobs found matching your criteria.",
      applied: "You have not applied to any job",
      saved: "You have not saved any job",
    };

    return (
      <div className="text-center py-16">
        <div className="p-6 bg-white/5 rounded-2xl border border-white/10 max-w-md mx-auto">
          <Briefcase className="h-16 w-16 text-gray-500 mx-auto mb-6" />
          <h3 className="text-2xl font-semibold text-white mb-4">
            {activeTab === "all" ? "No Jobs Found" : "No Jobs Yet"}
          </h3>
          <p className="text-gray-400 text-lg">{messages[activeTab]}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <HeroSection />

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center gap-4 mb-8">
          {[
            { id: "all" as TabType, label: "All Jobs", icon: Briefcase },
            { id: "applied" as TabType, label: "Applied Jobs", icon: FileText },
            { id: "saved" as TabType, label: "Saved Jobs", icon: Bookmark },
          ].map((tab) => {
            const Icon = tab.icon;
            const count =
              tab.id === "all"
                ? jobs.length
                : tab.id === "applied"
                ? applications.length
                : savedJobs.length;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                  activeTab === tab.id
                    ? "bg-blue-500 text-white shadow-lg"
                    : "text-slate-400 hover:text-white hover:bg-slate-700/50"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="font-medium">{tab.label}</span>
                <span className="px-2 py-1 bg-slate-700/50 rounded-full text-xs">
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Filters - Show for all tabs */}
        <JobFilters onFiltersChange={setFilters} />

        {/* Jobs Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="flex items-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
              <span className="text-white text-lg">Loading jobs...</span>
            </div>
          </div>
        ) : getTabData().length === 0 ? (
          renderEmptyState()
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {getTabData().map((job) => {
                // Find application status for this job
                const application = applications.find(
                  (app) => app.jobId === job.jobId
                );
                return (
                  <CandidateJobCard
                    key={job.jobId}
                    job={job}
                    isSaved={savedJobIds.has(job.jobId)}
                    onSaveToggle={handleSaveToggle}
                    applicationStatus={application?.applicationStatus}
                  />
                );
              })}
            </div>

            {/* Pagination - Only for All Jobs tab */}
            {activeTab === "all" && totalPages > 1 && (
              <div className="flex items-center justify-center space-x-2 mt-8">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-2 text-slate-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  Previous
                </button>
                <span className="text-slate-300 text-sm">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() =>
                    setCurrentPage(Math.min(totalPages, currentPage + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 text-slate-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
