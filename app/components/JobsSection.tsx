"use client";

import { useState, useEffect } from "react";
import { Briefcase, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { JobFilters as JobFiltersType } from "@/src/types";
import JobFilters from "./JobFilters";
import JobCard from "./JobCard";

const JOBS_PER_PAGE = 6;

export default function JobsSection() {
  const [filters, setFilters] = useState<JobFiltersType>({
    jobStatus: "",
    department: "",
    location: "",
    experience: "",
  });
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchJobs = async (page = 1, filtersObj = filters) => {
    try {
      setLoading(true);
      setError("");
      const params = new URLSearchParams({
        ...filtersObj,
        page: String(page),
        limit: String(JOBS_PER_PAGE),
      });
      const response = await fetch(`/api/jobs?${params.toString()}`);
      const data = await response.json();
      if (data.success) {
        console.log("data.jobs", data.jobs);
        setJobs(data.jobs);
        setTotalPages(data.totalPages || 1);
        setTotalCount(data.totalCount || 0);
        setCurrentPage(data.currentPage || 1);
      } else {
        setError("Failed to fetch jobs");
      }
    } catch (err) {
      setError("Failed to fetch jobs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs(1, filters);
    // eslint-disable-next-line
  }, [filters]);

  useEffect(() => {
    fetchJobs(currentPage, filters);
    // eslint-disable-next-line
  }, [currentPage]);

  const handleFiltersChange = (newFilters: JobFiltersType) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page on filter change
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {/* Section Header */}
      <div className="text-center mb-16">
        <div className="flex items-center justify-center gap-4 mb-6">
          <div className="p-3 bg-blue-500/20 rounded-2xl">
            <Briefcase className="h-8 w-8 text-blue-400" />
          </div>
          <h2 className="text-4xl font-bold text-white">Available Positions</h2>
        </div>
        <p className="text-gray-400 max-w-3xl mx-auto text-lg">
          Discover exciting career opportunities with TechCorp Solutions. Filter
          and find the perfect role that matches your skills and aspirations.
        </p>
      </div>

      {/* Filters */}
      <JobFilters onFiltersChange={handleFiltersChange} />

      {/* Jobs Grid */}
      <div className="space-y-8">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="flex items-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
              <span className="text-white text-lg">Loading jobs...</span>
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <p className="text-red-400 text-lg">{error}</p>
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-16">
            <div className="p-6 bg-white/5 rounded-2xl border border-white/10 max-w-md mx-auto">
              <Briefcase className="h-16 w-16 text-gray-500 mx-auto mb-6" />
              <h3 className="text-2xl font-semibold text-white mb-4">
                No Job Openings Available
              </h3>
              <p className="text-gray-400 text-lg">
                Check back later for new opportunities or try adjusting your
                filters.
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {jobs.map((job) => (
                <JobCard key={job.jobId} job={job} />
              ))}
            </div>
            {/* Optimized Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex flex-col items-center mt-12 gap-4">
                {/* Page Info */}
                <div className="text-center">
                  <p className="text-gray-400 text-sm">
                    Page {currentPage} of {totalPages}
                  </p>
                </div>

                {/* Pagination Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 rounded-lg bg-slate-700 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-600 transition-colors duration-200 flex items-center gap-2"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </button>

                  {/* Smart Page Numbers */}
                  {(() => {
                    const pages = [];
                    const maxVisiblePages = 7;

                    if (totalPages <= maxVisiblePages) {
                      // Show all pages if total is small
                      for (let i = 1; i <= totalPages; i++) {
                        pages.push(i);
                      }
                    } else {
                      // Smart pagination with ellipsis
                      if (currentPage <= 4) {
                        // Near start: show 1,2,3,4,5,...,last
                        for (let i = 1; i <= 5; i++) {
                          pages.push(i);
                        }
                        pages.push("...");
                        pages.push(totalPages);
                      } else if (currentPage >= totalPages - 3) {
                        // Near end: show 1,...,last-4,last-3,last-2,last-1,last
                        pages.push(1);
                        pages.push("...");
                        for (let i = totalPages - 4; i <= totalPages; i++) {
                          pages.push(i);
                        }
                      } else {
                        // Middle: show 1,...,current-1,current,current+1,...,last
                        pages.push(1);
                        pages.push("...");
                        for (
                          let i = currentPage - 1;
                          i <= currentPage + 1;
                          i++
                        ) {
                          pages.push(i);
                        }
                        pages.push("...");
                        pages.push(totalPages);
                      }
                    }

                    return pages.map((page, idx) => (
                      <button
                        key={idx}
                        onClick={() =>
                          typeof page === "number" && setCurrentPage(page)
                        }
                        disabled={typeof page !== "number"}
                        className={`px-3 py-2 rounded-lg font-medium transition-all duration-200 min-w-[40px] ${
                          currentPage === page
                            ? "bg-blue-600 text-white shadow-lg"
                            : typeof page === "number"
                            ? "bg-slate-700 text-white hover:bg-slate-600 hover:scale-105"
                            : "bg-transparent text-gray-500 cursor-default"
                        }`}
                      >
                        {page}
                      </button>
                    ));
                  })()}

                  <button
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 rounded-lg bg-slate-700 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-600 transition-colors duration-200 flex items-center gap-2"
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Results Count */}
      {!loading && !error && jobs.length > 0 && (
        <div className="text-center mt-8">
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-white/5 rounded-full border border-white/10">
            <span className="text-gray-400">
              Showing {jobs.length} job{jobs.length !== 1 ? "s" : ""} (Total:{" "}
              {totalCount})
              {Object.values(filters).some((f) => f) &&
                " matching your filters"}
            </span>
          </div>
        </div>
      )}
    </section>
  );
}
