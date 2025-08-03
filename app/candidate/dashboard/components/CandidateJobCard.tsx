"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Calendar,
  MapPin,
  Briefcase,
  Clock,
  Eye,
  User,
  Bookmark,
  BookmarkCheck,
} from "lucide-react";
import { Job } from "@/src/types";
import { formatDate, getExperienceText } from "@/src/utils";

interface CandidateJobCardProps {
  job: Job;
  isSaved?: boolean;
  onSaveToggle?: (jobId: number, saved: boolean) => void;
  applicationStatus?: string;
}

export default function CandidateJobCard({
  job,
  isSaved = false,
  onSaveToggle,
  applicationStatus,
}: CandidateJobCardProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [saving, setSaving] = useState(false);

  const handleViewJob = () => {
    if (!session) {
      router.push("/login");
    } else {
      router.push(`/candidate/dashboard/job/${job.jobId}`);
    }
  };

  const handleSaveJob = async () => {
    if (!session) {
      router.push("/login");
      return;
    }

    if (job.jobStatus !== "ACTIVE") {
      alert("You can only save active jobs.");
      return;
    }

    setSaving(true);
    try {
      const response = await fetch("/api/saved-jobs", {
        method: isSaved ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId: job.jobId }),
      });

      const data = await response.json();

      if (response.ok) {
        if (onSaveToggle) {
          onSaveToggle(job.jobId, !isSaved);
        }
      } else {
        if (data.error === "limit_exceeded") {
          alert(
            "You can only save up to 20 jobs. Please remove some saved jobs first."
          );
        } else {
          alert(data.message || "Failed to save job");
        }
      }
    } catch (error) {
      console.error("Error saving job:", error);
      alert("Failed to save job");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all duration-200 group relative">
      {/* Save Button */}
      <button
        onClick={handleSaveJob}
        disabled={saving}
        className={`absolute top-4 right-4 p-2 rounded-lg transition-all duration-200 ${
          isSaved
            ? "bg-blue-500/20 text-blue-400 hover:bg-blue-500/30"
            : "bg-slate-700/30 text-slate-400 hover:bg-slate-600/50 hover:text-white"
        } disabled:opacity-50`}
      >
        {saving ? (
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
        ) : isSaved ? (
          <BookmarkCheck className="h-4 w-4" />
        ) : (
          <Bookmark className="h-4 w-4" />
        )}
      </button>

      {/* Job Status Badge */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-2">
          <Briefcase className="h-5 w-5 text-blue-400" />
          <span className="text-lg font-semibold text-white">{job.role}</span>
        </div>
        <div className="mr-10 flex flex-col gap-1 items-end">
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium ${
              job.jobStatus === "ACTIVE"
                ? "bg-green-500/20 text-green-400 border border-green-500/30"
                : "bg-red-500/20 text-red-400 border border-red-500/30"
            }`}
          >
            {job.jobStatus === "ACTIVE" ? "Active" : "Inactive"}
          </span>
          {applicationStatus && (
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium ${
                applicationStatus === "REVIEWING"
                  ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                  : applicationStatus === "SHORTLISTED"
                  ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                  : applicationStatus === "REJECTED"
                  ? "bg-red-500/20 text-red-400 border border-red-500/30"
                  : "bg-gray-500/20 text-gray-400 border border-gray-500/30"
              }`}
            >
              {applicationStatus === "REVIEWING"
                ? "Under Review"
                : applicationStatus === "SHORTLISTED"
                ? "Shortlisted"
                : applicationStatus === "REJECTED"
                ? "Rejected"
                : applicationStatus}
            </span>
          )}
        </div>
      </div>

      {/* Designation */}
      <p className="text-gray-300 mb-4">{job.designation}</p>

      {/* Job Details */}
      <div className="space-y-3 mb-6">
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Clock className="h-4 w-4" />
          <span>Experience: {getExperienceText(job.experience)}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Briefcase className="h-4 w-4" />
          <span>Department: {job.department}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <MapPin className="h-4 w-4" />
          <span>Location: {job.location}</span>
        </div>
      </div>

      {/* Posted by HR */}
      <div className="mb-4 p-3 bg-white/5 rounded-lg border border-white/10">
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-1">
          <User className="h-4 w-4" />
          <span>Posted by:</span>
        </div>
        <div className="text-white font-medium">
          {job.hr.firstName} {job.hr.lastName}
        </div>
        <div className="text-gray-400 text-sm">{job.hr.designation}</div>
      </div>

      {/* Job ID and Posted Date */}
      <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
        <span>Job ID: {job.jobId}</span>
        <div className="flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          <span>Posted: {formatDate(job.postedOn)}</span>
        </div>
      </div>

      {/* View Job Button */}
      <button
        onClick={handleViewJob}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium rounded-lg transition-all duration-200 group-hover:shadow-lg group-hover:shadow-blue-500/25"
      >
        <Eye className="h-4 w-4" />
        View Job
      </button>
    </div>
  );
}
