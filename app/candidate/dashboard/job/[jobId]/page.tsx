"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Briefcase,
  MapPin,
  Clock,
  User,
  Calendar,
} from "lucide-react";
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

export default function CandidateJobDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params.jobId as string;

  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasApplied, setHasApplied] = useState(false);
  const [applying, setApplying] = useState(false);
  const [profileComplete, setProfileComplete] = useState(true);

  useEffect(() => {
    fetchJobDetails();
    checkApplicationStatus();
    checkProfileCompleteness();
  }, [jobId]);

  const fetchJobDetails = async () => {
    try {
      const response = await fetch(`/api/jobs/${jobId}`);
      const data = await response.json();

      if (data.success) {
        setJob(data.job);
      }
    } catch (error) {
      console.error("Error fetching job details:", error);
    } finally {
      setLoading(false);
    }
  };

  const checkApplicationStatus = async () => {
    try {
      const response = await fetch(`/api/applications/check?jobId=${jobId}`);
      const data = await response.json();

      if (data.success) {
        setHasApplied(data.hasApplied);
      }
    } catch (error) {
      console.error("Error checking application status:", error);
    }
  };

  const checkProfileCompleteness = async () => {
    try {
      const response = await fetch("/api/candidate/profile");
      const data = await response.json();

      if (data.success && data.profile) {
        const requiredFields = [
          "firstName",
          "lastName",
          "email",
          "age",
          "currentRole",
          "totalExperience",
          "location",
          "expectedCTC",
          "skills",
          "resume",
        ];

        const missingFields = requiredFields.filter((field) => {
          const value = data.profile[field];
          return !value || (typeof value === "string" && value.trim() === "");
        });

        setProfileComplete(missingFields.length === 0);
      }
    } catch (error) {
      console.error("Error checking profile completeness:", error);
    }
  };

  const handleApply = async () => {
    if (!job || hasApplied) return;

    setApplying(true);
    try {
      const response = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId: job.jobId }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setHasApplied(true);
        alert("Application submitted successfully!");
        router.push("/candidate/dashboard");
      } else {
        if (data.error === "Profile incomplete") {
          const shouldGoToProfile = confirm(
            `${data.message}\n\nWould you like to go to your profile page to complete it?`
          );
          if (shouldGoToProfile) {
            router.push("/candidate/dashboard/profile");
          }
        } else {
          alert(
            data.message || "Failed to submit application. Please try again."
          );
        }
      }
    } catch (error) {
      console.error("Error applying for job:", error);
      alert("Failed to submit application. Please try again.");
    } finally {
      setApplying(false);
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

  if (job.jobStatus === "INACTIVE") {
    return (
      <div className="text-center py-12">
        <p className="text-slate-400">This job is no longer active</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <button
            onClick={() => router.push("/candidate/dashboard")}
            className="flex items-center space-x-2 text-slate-400 hover:text-white transition-colors text-sm sm:text-base w-fit"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>Back to Dashboard</span>
          </button>
          <h1 className="text-xl sm:text-2xl font-bold text-white">
            {job.role}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          {hasApplied ? (
            <div className="px-4 py-2 bg-green-500/20 text-green-400 rounded-lg text-sm">
              Applied
            </div>
          ) : !profileComplete ? (
            <button
              onClick={() => router.push("/candidate/dashboard/profile")}
              className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors text-sm"
            >
              Complete Profile to Apply
            </button>
          ) : (
            <button
              onClick={handleApply}
              disabled={applying}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors text-sm disabled:opacity-50"
            >
              {applying ? "Applying..." : "Apply Now"}
            </button>
          )}
        </div>
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

        {/* Posted by HR */}
        <div className="mt-6 p-4 bg-slate-700/30 rounded-lg border border-slate-600/50">
          <div className="flex items-center gap-2 text-sm text-slate-400 mb-2">
            <User className="h-4 w-4" />
            <span>Posted by:</span>
          </div>
          <div className="text-white font-medium">
            {job.hr.firstName} {job.hr.lastName}
          </div>
          <div className="text-slate-400 text-sm">{job.hr.designation}</div>
        </div>

        {/* Job ID and Posted Date */}
        <div className="flex items-center justify-between text-xs text-slate-500 mt-4">
          <span>Job ID: {job.jobId}</span>
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>Posted: {new Date(job.postedOn).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      {/* Profile Completion Notice */}
      {!profileComplete && !hasApplied && (
        <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <div className="w-6 h-6 bg-orange-500/20 rounded-full flex items-center justify-center">
                <span className="text-orange-400 text-sm font-semibold">!</span>
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-orange-400 font-medium mb-1">
                Profile Incomplete
              </h3>
              <p className="text-orange-300 text-sm mb-3">
                You need to complete your profile before applying for this job.
                Please fill in all required information including your personal
                details, experience, skills, and upload your resume.
              </p>
              <button
                onClick={() => router.push("/candidate/dashboard/profile")}
                className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors text-sm"
              >
                Complete Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
