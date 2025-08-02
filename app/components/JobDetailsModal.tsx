"use client";

import { useState, useEffect } from "react";
import {
  X,
  Calendar,
  MapPin,
  Briefcase,
  Clock,
  User,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { Job } from "@/src/types";
import { formatDate, getExperienceText } from "@/src/utils";

interface JobDetailsModalProps {
  jobId: number | null;
  onClose: () => void;
}

export default function JobDetailsModal({
  jobId,
  onClose,
}: JobDetailsModalProps) {
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (jobId) {
      fetchJobDetails(jobId);
    }
  }, [jobId]);

  const fetchJobDetails = async (id: number) => {
    try {
      setLoading(true);
      setError("");
      const response = await fetch(`/api/jobs/${id}`);
      const data = await response.json();

      if (data.success) {
        setJob(data.job);
      } else {
        setError("Failed to fetch job details");
      }
    } catch (err) {
      setError("Failed to fetch job details");
    } finally {
      setLoading(false);
    }
  };

  if (!jobId) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-800 border border-white/10 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="text-2xl font-bold text-white">Job Details</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="h-6 w-6 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="flex items-center gap-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
                <span className="text-white text-lg">
                  Loading job details...
                </span>
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-16">
              <AlertCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
              <p className="text-red-400 text-lg">{error}</p>
            </div>
          ) : job ? (
            <div className="space-y-6">
              {/* Job Header */}
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h1 className="text-3xl font-bold text-white mb-2">
                      {job.role}
                    </h1>
                    <p className="text-xl text-gray-300">{job.designation}</p>
                  </div>
                  <span
                    className={`px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 ${
                      job.jobStatus === "ACTIVE"
                        ? "bg-green-500/20 text-green-400 border border-green-500/30"
                        : "bg-red-500/20 text-red-400 border border-red-500/30"
                    }`}
                  >
                    {job.jobStatus === "ACTIVE" ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <AlertCircle className="h-4 w-4" />
                    )}
                    {job.jobStatus === "ACTIVE" ? "Active" : "Inactive"}
                  </span>
                </div>

                {/* Job ID and Posted Date */}
                <div className="flex items-center justify-between text-sm text-gray-400">
                  <span>Job ID: {job.jobId}</span>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>Posted: {formatDate(job.postedOn)}</span>
                  </div>
                </div>
              </div>

              {/* Job Requirements */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-4 bg-white/5 rounded-lg border border-white/10">
                  <Clock className="h-5 w-5 text-blue-400" />
                  <div>
                    <p className="text-gray-400 text-sm">Required Experience</p>
                    <p className="text-white font-medium">
                      {getExperienceText(job.experience)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-white/5 rounded-lg border border-white/10">
                  <Briefcase className="h-5 w-5 text-blue-400" />
                  <div>
                    <p className="text-gray-400 text-sm">Department</p>
                    <p className="text-white font-medium">{job.department}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-white/5 rounded-lg border border-white/10">
                  <MapPin className="h-5 w-5 text-blue-400" />
                  <div>
                    <p className="text-gray-400 text-sm">Location</p>
                    <p className="text-white font-medium">{job.location}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-white/5 rounded-lg border border-white/10">
                  <User className="h-5 w-5 text-blue-400" />
                  <div>
                    <p className="text-gray-400 text-sm">Posted by</p>
                    <p className="text-white font-medium">
                      {job.hr.firstName} {job.hr.lastName}
                    </p>
                    <p className="text-gray-400 text-sm">
                      {job.hr.designation}
                    </p>
                  </div>
                </div>
              </div>

              {/* Job Description */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-white">
                  Job Description
                </h3>
                <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                  <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                    {job.jobDescription}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4">
                <Link
                  href="/login"
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium rounded-lg transition-all duration-200"
                >
                  <CheckCircle className="h-4 w-4" />
                  Apply Now
                </Link>
                <button
                  onClick={onClose}
                  className="px-6 py-3 border border-white/20 text-white hover:bg-white/10 rounded-lg transition-colors duration-200"
                >
                  Close
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
