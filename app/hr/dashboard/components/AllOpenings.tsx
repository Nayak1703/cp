"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Eye, Edit, Trash2 } from "lucide-react";
import JobFilters from "@/app/components/JobFilters";
import PostJobModal from "./PostJobModal";
import EditJobModal from "./EditJobModal";

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

interface AllOpeningsProps {
  canPostJob: boolean;
}

interface JobData {
  role: string;
  designation: string;
  experience: string;
  department: string;
  location: string;
  jobDescription: string;
}

interface JobUpdateData {
  jobDescription: string;
  jobStatus: string;
}

export default function AllOpenings({ canPostJob }: AllOpeningsProps) {
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPostModal, setShowPostModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    jobStatus: "",
    department: "",
    location: "",
    experience: "",
  });

  useEffect(() => {
    fetchJobs();
  }, [currentPage, filters]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
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
    } catch (error) {
      console.error("Error fetching jobs:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePostJob = async (jobData: JobData) => {
    try {
      const response = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(jobData),
      });

      if (response.ok) {
        setShowPostModal(false);
        fetchJobs(); // Refresh the job list
      } else {
        console.error("Failed to post job");
      }
    } catch (error) {
      console.error("Error posting job:", error);
    }
  };

  const handleEditJob = async (jobId: number, jobData: JobUpdateData) => {
    try {
      const response = await fetch(`/api/jobs/${jobId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(jobData),
      });

      if (response.ok) {
        setShowEditModal(false);
        fetchJobs(); // Refresh the job list
      } else {
        console.error("Failed to update job");
      }
    } catch (error) {
      console.error("Error updating job:", error);
    }
  };

  const handleDeleteJob = async (jobId: number) => {
    if (!confirm("Are you sure you want to delete this job?")) return;

    try {
      const response = await fetch(`/api/delete?job=${jobId}`, {
        method: "POST",
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setShowEditModal(false);
        fetchJobs(); // Refresh the job list
        console.log("Job deleted successfully:", data.message);
      } else {
        console.error("Failed to delete job:", data.error);
      }
    } catch (error) {
      console.error("Error deleting job:", error);
    }
  };

  const handleViewJob = (job: Job) => {
    router.push(`/hr/dashboard/job/${job.jobId}`);
  };

  const canEditDelete = (job: Job) => {
    // TODO: Check if current user has permission to edit/delete this job
    // For now, allow all HR users to edit/delete
    return true;
  };

  const canEdit = (job: Job) => {
    // Only allow editing if job is active
    return job.jobStatus === "ACTIVE";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <h2 className="text-xl sm:text-2xl font-bold text-white">
          All Openings
        </h2>
        {canPostJob && (
          <button
            onClick={() => setShowPostModal(true)}
            className="flex items-center justify-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors w-full sm:w-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Post Job</span>
          </button>
        )}
      </div>

      {/* Filters */}
      <JobFilters onFiltersChange={setFilters} />

      {/* Job List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {jobs.map((job) => (
            <div
              key={job.jobId}
              className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-4 sm:p-6 hover:border-slate-600/50 transition-colors"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1 min-w-0">
                  <h3 className="text-base sm:text-lg font-semibold text-white mb-1 truncate">
                    {job.role}
                  </h3>
                  <p className="text-slate-400 text-sm truncate">
                    {job.designation}
                  </p>
                </div>
                <span
                  className={`px-2 py-1 text-xs rounded-full ml-2 flex-shrink-0 ${
                    job.jobStatus === "ACTIVE"
                      ? "bg-green-500/20 text-green-400"
                      : "bg-red-500/20 text-red-400"
                  }`}
                >
                  {job.jobStatus}
                </span>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-slate-300">
                  <span className="font-medium text-xs sm:text-sm">
                    Experience:
                  </span>
                  <span className="ml-2 text-xs sm:text-sm truncate">
                    {job.experience}
                  </span>
                </div>
                <div className="flex items-center text-sm text-slate-300">
                  <span className="font-medium text-xs sm:text-sm">
                    Department:
                  </span>
                  <span className="ml-2 text-xs sm:text-sm truncate">
                    {job.department}
                  </span>
                </div>
                <div className="flex items-center text-sm text-slate-300">
                  <span className="font-medium text-xs sm:text-sm">
                    Location:
                  </span>
                  <span className="ml-2 text-xs sm:text-sm truncate">
                    {job.location}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-700/50">
                <div className="text-xs text-slate-400 truncate flex-1">
                  Posted by {job.hr.firstName} {job.hr.lastName}
                </div>
                <div className="flex items-center space-x-1 sm:space-x-2 ml-2">
                  <button
                    onClick={() => handleViewJob(job)}
                    className="p-1.5 sm:p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded transition-colors"
                  >
                    <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                  </button>
                  {canEditDelete(job) && (
                    <>
                      {canEdit(job) && (
                        <button
                          onClick={() => {
                            setSelectedJob(job);
                            setShowEditModal(true);
                          }}
                          className="p-1.5 sm:p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-900/20 rounded transition-colors"
                        >
                          <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteJob(job.jobId)}
                        className="p-1.5 sm:p-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded transition-colors"
                      >
                        <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
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

      {/* Modals */}
      {showPostModal && (
        <PostJobModal
          onClose={() => setShowPostModal(false)}
          onSubmit={handlePostJob}
        />
      )}

      {showEditModal && selectedJob && (
        <EditJobModal
          job={selectedJob}
          onClose={() => setShowEditModal(false)}
          onSubmit={handleEditJob}
        />
      )}
    </div>
  );
}
