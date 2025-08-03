"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Edit, Trash2, Users, Filter } from "lucide-react";
import { EXPERIENCE_LABELS } from "@/src/constants";

interface Job {
  jobId: number;
  role: string;
  designation: string;
  jobStatus: string;
  experience: string;
  department: string;
  location: string;
  jobDescription: string;
  postedOn: string;
  hr: {
    firstName: string;
    lastName: string;
    designation: string;
  };
}

interface Application {
  applicationId: string;
  candidate: {
    firstName: string;
    lastName: string;
    currentRole?: string;
    location?: string;
    totalExperience?: string;
  };
  applicationStatus: string;
  appliedOn: string;
}

type ApplicationTab = "all" | "reviewing" | "shortlisted" | "rejected";

export default function JobDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params.jobId as string;

  const [job, setJob] = useState<Job | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [totalApplications, setTotalApplications] = useState(0);
  const [applicationCounts, setApplicationCounts] = useState({
    all: 0,
    reviewing: 0,
    shortlisted: 0,
    rejected: 0,
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<ApplicationTab>("all");
  const [filters, setFilters] = useState({
    location: "",
    experience: "",
  });

  useEffect(() => {
    fetchJobDetails();
    fetchApplications();
    fetchTotalApplications();
    fetchApplicationCounts();
  }, [jobId, activeTab, filters]);

  const fetchJobDetails = async () => {
    try {
      const response = await fetch(`/api/jobs/${jobId}`);
      const data = await response.json();

      if (data.success) {
        setJob(data.job);
      }
    } catch (error) {
      console.error("Error fetching job details:", error);
    }
  };

  const fetchApplications = async () => {
    try {
      const params = new URLSearchParams({
        jobId,
        status: activeTab === "all" ? "" : activeTab,
        ...filters,
      });

      const response = await fetch(`/api/applications?${params}`);
      const data = await response.json();

      if (data.success) {
        setApplications(data.applications);
      }
    } catch (error) {
      console.error("Error fetching applications:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTotalApplications = async () => {
    try {
      const params = new URLSearchParams({
        jobId,
      });

      const response = await fetch(`/api/applications?${params}`);
      const data = await response.json();

      if (data.success) {
        setTotalApplications(data.count);
      }
    } catch (error) {
      console.error("Error fetching total applications:", error);
    }
  };

  const fetchApplicationCounts = async () => {
    try {
      const counts = {
        all: 0,
        reviewing: 0,
        shortlisted: 0,
        rejected: 0,
      };

      // Fetch counts for each status
      const statuses = ["", "REVIEWING", "SHORTLISTED", "REJECTED"];
      const statusKeys = ["all", "reviewing", "shortlisted", "rejected"];

      for (let i = 0; i < statuses.length; i++) {
        const params = new URLSearchParams({
          jobId,
          status: statuses[i],
        });

        const response = await fetch(`/api/applications?${params}`);
        const data = await response.json();

        if (data.success) {
          counts[statusKeys[i] as keyof typeof counts] = data.count;
        }
      }

      setApplicationCounts(counts);
    } catch (error) {
      console.error("Error fetching application counts:", error);
    }
  };

  const handleDeleteJob = async () => {
    if (
      !confirm(
        "Are you sure you want to delete this job? This will also delete all applications and saved jobs associated with this job."
      )
    )
      return;

    try {
      const response = await fetch(`/api/delete?job=${jobId}`, {
        method: "POST",
      });

      const data = await response.json();

      if (response.ok && data.success) {
        alert(data.message);
        router.push("/hr/dashboard");
        console.log("Job deleted successfully:", data.message);
      } else {
        alert(data.error || "Failed to delete job");
        console.error("Failed to delete job:", data.error);
      }
    } catch (error) {
      console.error("Error deleting job:", error);
    }
  };

  const canEditDelete = () => {
    // TODO: Check if current user has permission to edit/delete this job
    return true;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "SHORTLISTED":
        return "bg-green-500/20 text-green-400";
      case "REVIEWING":
        return "bg-yellow-500/20 text-yellow-400";
      case "REJECTED":
        return "bg-red-500/20 text-red-400";
      default:
        return "bg-slate-500/20 text-slate-400";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "SHORTLISTED":
        return "Shortlisted";
      case "REVIEWING":
        return "Under Review";
      case "REJECTED":
        return "Rejected";
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-400">Job not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <button
            onClick={() => router.push("/hr/dashboard")}
            className="flex items-center space-x-2 text-slate-400 hover:text-white transition-colors text-sm sm:text-base w-fit"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>Back to Dashboard</span>
          </button>
          <h1 className="text-xl sm:text-2xl font-bold text-white">
            {job.role}
          </h1>
        </div>
        {canEditDelete() && (
          <div className="flex items-center gap-3">
            <button
              onClick={handleDeleteJob}
              className="flex items-center space-x-2 px-3 sm:px-4 py-2 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-lg transition-colors text-sm"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete</span>
            </button>
          </div>
        )}
      </div>

      {/* Job Details */}
      <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-4 sm:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h2 className="text-lg sm:text-xl font-semibold text-white mb-4">
              Job Information
            </h2>
            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
              <div>
                <span className="text-slate-400 text-xs sm:text-sm">Role:</span>
                <p className="text-white font-medium text-sm sm:text-base mt-1">
                  {job.role}
                </p>
              </div>
              <div>
                <span className="text-slate-400 text-xs sm:text-sm">
                  Designation:
                </span>
                <p className="text-white font-medium text-sm sm:text-base mt-1">
                  {job.designation}
                </p>
              </div>
              <div>
                <span className="text-slate-400 text-xs sm:text-sm">
                  Experience:
                </span>
                <p className="text-white font-medium text-sm sm:text-base mt-1">
                  {EXPERIENCE_LABELS[
                    job.experience as keyof typeof EXPERIENCE_LABELS
                  ] || job.experience}
                </p>
              </div>
              <div>
                <span className="text-slate-400 text-xs sm:text-sm">
                  Department:
                </span>
                <p className="text-white font-medium text-sm sm:text-base mt-1">
                  {job.department}
                </p>
              </div>
              <div>
                <span className="text-slate-400 text-xs sm:text-sm">
                  Location:
                </span>
                <p className="text-white font-medium text-sm sm:text-base mt-1">
                  {job.location}
                </p>
              </div>
              <div>
                <span className="text-slate-400 text-xs sm:text-sm">
                  Status:
                </span>
                <div className="mt-1">
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      job.jobStatus === "ACTIVE"
                        ? "bg-green-500/20 text-green-400"
                        : "bg-red-500/20 text-red-400"
                    }`}
                  >
                    {job.jobStatus}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-white mb-3">
              Job Description
            </h3>
            <div className="bg-slate-700/30 rounded-lg p-3 sm:p-4">
              <p className="text-slate-300 whitespace-pre-wrap text-sm sm:text-base leading-relaxed">
                {job.jobDescription}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Applications Section */}
      <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-4 sm:p-6">
        {/* Applications Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h2 className="text-lg sm:text-xl font-semibold text-white">
            Applications
          </h2>
          <div className="flex items-center space-x-2">
            <Users className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />
            <span className="text-slate-400 text-sm sm:text-base">
              {totalApplications} applications
            </span>
          </div>
        </div>

        {/* Application Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {[
            {
              id: "all" as ApplicationTab,
              label: "All Applications",
              count: applicationCounts.all,
            },
            {
              id: "reviewing" as ApplicationTab,
              label: "Under Review",
              count: applicationCounts.reviewing,
            },
            {
              id: "shortlisted" as ApplicationTab,
              label: "Shortlisted",
              count: applicationCounts.shortlisted,
            },
            {
              id: "rejected" as ApplicationTab,
              label: "Rejected",
              count: applicationCounts.rejected,
            },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 sm:px-4 py-2 rounded-lg transition-colors text-sm flex items-center gap-2 ${
                activeTab === tab.id
                  ? "bg-blue-500 text-white"
                  : "text-slate-400 hover:text-white hover:bg-slate-700/50"
              }`}
            >
              <span>{tab.label}</span>
              <span className="px-2 py-1 bg-white/20 rounded-full text-xs font-medium">
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <span className="text-slate-400 text-sm">Filter by:</span>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <select
              value={filters.location}
              onChange={(e) =>
                setFilters({ ...filters, location: e.target.value })
              }
              className="px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded text-white text-sm focus:outline-none focus:border-blue-500 min-w-[140px]"
            >
              <option value="">All Locations</option>
              <option value="MUMBAI">Mumbai</option>
              <option value="DELHI">Delhi</option>
              <option value="BANGALORE">Bangalore</option>
              <option value="HYDERABAD">Hyderabad</option>
              <option value="BHUBANESWAR">Bhubaneswar</option>
            </select>
            <select
              value={filters.experience}
              onChange={(e) =>
                setFilters({ ...filters, experience: e.target.value })
              }
              className="px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded text-white text-sm focus:outline-none focus:border-blue-500 min-w-[140px]"
            >
              <option value="">All Experience</option>
              <option value="LESS_THAN_2">Less than 2 years</option>
              <option value="TWO_TO_FIVE">2-5 years</option>
              <option value="FIVE_TO_EIGHT">5-8 years</option>
              <option value="EIGHT_TO_TWELVE">8-12 years</option>
              <option value="MORE_THAN_12">12+ years</option>
            </select>
          </div>
        </div>

        {/* Applications List */}
        <div className="space-y-4">
          {applications.map((application) => (
            <div
              key={application.applicationId}
              className="bg-slate-700/30 border border-slate-600/50 rounded-lg p-4"
            >
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex items-start sm:items-center gap-4 flex-1">
                  <div className="p-2 bg-blue-500/20 rounded-lg flex-shrink-0">
                    <Users className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-white font-medium text-sm sm:text-base mb-2">
                      {application.candidate.firstName}{" "}
                      {application.candidate.lastName}
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-xs sm:text-sm text-slate-400">
                      {application.candidate.currentRole && (
                        <span>Role: {application.candidate.currentRole}</span>
                      )}
                      {application.candidate.location && (
                        <span>Location: {application.candidate.location}</span>
                      )}
                      {application.candidate.totalExperience && (
                        <span>
                          Experience: {application.candidate.totalExperience}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                  <span
                    className={`px-2 sm:px-3 py-1 rounded-full text-xs text-center ${getStatusColor(
                      application.applicationStatus
                    )}`}
                  >
                    {getStatusLabel(application.applicationStatus)}
                  </span>
                  <span className="text-xs text-slate-400 text-center sm:text-left">
                    {new Date(application.appliedOn).toLocaleDateString()}
                  </span>
                  <button
                    onClick={() =>
                      router.push(
                        `/hr/dashboard/application/${application.applicationId}`
                      )
                    }
                    className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-xs rounded transition-colors"
                  >
                    View Application
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {applications.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-400">No applications found</p>
          </div>
        )}
      </div>
    </div>
  );
}
