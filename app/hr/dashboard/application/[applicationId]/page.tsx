"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  ArrowLeft,
  Download,
  User,
  MapPin,
  Briefcase,
  Calendar,
  FileText,
} from "lucide-react";

interface Application {
  applicationId: string;
  applicationStatus: string;
  appliedOn: string;
  candidate: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    age?: number;
    currentRole?: string;
    totalExperience?: string;
    location?: string;
    expectedCTC?: string;
    skills?: string;
    education?: string;
    work?: string;
    portfolioLink?: string;
    githubLink?: string;
    linkedinLink?: string;
    twitterLink?: string;
    resume?: string;
    readyToRelocate?: boolean;
  };
  job: {
    jobId: number;
    role: string;
    designation: string;
    department: string;
    location: string;
  };
}

export default function ApplicationDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const applicationId = params.applicationId as string;

  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [hrScope, setHrScope] = useState<string>("");

  useEffect(() => {
    fetchApplicationDetails();
    fetchHrScope();
  }, [applicationId]);

  const fetchApplicationDetails = async () => {
    try {
      const response = await fetch(`/api/applications/${applicationId}`);
      const data = await response.json();

      if (data.success) {
        setApplication(data.application);
      } else {
        console.error("Failed to fetch application:", data.error);
      }
    } catch (error) {
      console.error("Error fetching application details:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchHrScope = async () => {
    try {
      const response = await fetch("/api/auth/get-user-data");
      const data = await response.json();

      if (data.success && data.userData.scope) {
        setHrScope(data.userData.scope);
      }
    } catch (error) {
      console.error("Error fetching HR scope:", error);
    }
  };

  const handleStatusUpdate = async (newStatus: string) => {
    if (
      !confirm(`Are you sure you want to change the status to "${newStatus}"?`)
    ) {
      return;
    }

    setUpdatingStatus(true);
    try {
      const response = await fetch(
        `/api/applications/${applicationId}/status`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      const data = await response.json();

      if (data.success) {
        setApplication((prev) =>
          prev ? { ...prev, applicationStatus: newStatus } : null
        );
        alert("Application status updated successfully!");
      } else {
        alert(data.error || "Failed to update application status");
      }
    } catch (error) {
      console.error("Error updating application status:", error);
      alert("Failed to update application status");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "SHORTLISTED":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "REVIEWING":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "REJECTED":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      default:
        return "bg-slate-500/20 text-slate-400 border-slate-500/30";
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

  if (!application) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-400">Application not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <button
            onClick={() =>
              router.push(`/hr/dashboard/job/${application.job.jobId}`)
            }
            className="flex items-center space-x-2 text-slate-400 hover:text-white transition-colors text-sm sm:text-base w-fit"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>Back to Job</span>
          </button>
          <h1 className="text-xl sm:text-2xl font-bold text-white">
            Application Details
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <span
            className={`px-3 py-1 rounded-full text-sm border ${getStatusColor(
              application.applicationStatus
            )}`}
          >
            {getStatusLabel(application.applicationStatus)}
          </span>
        </div>
      </div>

      {/* Status Update Section */}
      {hrScope !== "participants" && (
        <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-4 sm:p-6">
          <h2 className="text-lg font-semibold text-white mb-4">
            Update Application Status
          </h2>
          <div className="flex flex-wrap gap-3">
            {["REVIEWING", "SHORTLISTED", "REJECTED"].map((status) => (
              <button
                key={status}
                onClick={() => handleStatusUpdate(status)}
                disabled={
                  updatingStatus || application.applicationStatus === status
                }
                className={`px-4 py-2 rounded-lg transition-colors text-sm font-medium ${
                  application.applicationStatus === status
                    ? "bg-blue-500 text-white"
                    : "bg-slate-700/50 text-slate-300 hover:bg-slate-600/50"
                } disabled:opacity-50`}
              >
                {updatingStatus ? "Updating..." : getStatusLabel(status)}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Job Information */}
      <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-4 sm:p-6">
        <h2 className="text-lg font-semibold text-white mb-4">
          Job Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <span className="text-slate-400 text-sm">Role:</span>
            <p className="text-white font-medium">{application.job.role}</p>
          </div>
          <div>
            <span className="text-slate-400 text-sm">Designation:</span>
            <p className="text-white font-medium">
              {application.job.designation}
            </p>
          </div>
          <div>
            <span className="text-slate-400 text-sm">Department:</span>
            <p className="text-white font-medium">
              {application.job.department}
            </p>
          </div>
          <div>
            <span className="text-slate-400 text-sm">Location:</span>
            <p className="text-white font-medium">{application.job.location}</p>
          </div>
          <div>
            <span className="text-slate-400 text-sm">Applied On:</span>
            <p className="text-white font-medium">
              {new Date(application.appliedOn).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      {/* Candidate Information */}
      <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-4 sm:p-6">
        <h2 className="text-lg font-semibold text-white mb-4">
          Candidate Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <span className="text-slate-400 text-sm">Name:</span>
            <p className="text-white font-medium">
              {application.candidate.firstName} {application.candidate.lastName}
            </p>
          </div>
          <div>
            <span className="text-slate-400 text-sm">Email:</span>
            <p className="text-white font-medium">
              {application.candidate.email}
            </p>
          </div>
          {application.candidate.age && (
            <div>
              <span className="text-slate-400 text-sm">Age:</span>
              <p className="text-white font-medium">
                {application.candidate.age} years
              </p>
            </div>
          )}
          {application.candidate.currentRole && (
            <div>
              <span className="text-slate-400 text-sm">Current Role:</span>
              <p className="text-white font-medium">
                {application.candidate.currentRole}
              </p>
            </div>
          )}
          {application.candidate.totalExperience && (
            <div>
              <span className="text-slate-400 text-sm">Experience:</span>
              <p className="text-white font-medium">
                {application.candidate.totalExperience}
              </p>
            </div>
          )}
          {application.candidate.location && (
            <div>
              <span className="text-slate-400 text-sm">Location:</span>
              <p className="text-white font-medium">
                {application.candidate.location}
              </p>
            </div>
          )}
          {application.candidate.expectedCTC && (
            <div>
              <span className="text-slate-400 text-sm">Expected CTC:</span>
              <p className="text-white font-medium">
                {application.candidate.expectedCTC}
              </p>
            </div>
          )}
          {application.candidate.readyToRelocate !== undefined && (
            <div>
              <span className="text-slate-400 text-sm">Ready to Relocate:</span>
              <p className="text-white font-medium">
                {application.candidate.readyToRelocate ? "Yes" : "No"}
              </p>
            </div>
          )}
        </div>

        {/* Skills */}
        {application.candidate.skills && (
          <div className="mt-6">
            <span className="text-slate-400 text-sm">Skills:</span>
            <p className="text-white mt-1">{application.candidate.skills}</p>
          </div>
        )}

        {/* Education */}
        {application.candidate.education && (
          <div className="mt-6">
            <span className="text-slate-400 text-sm">Education:</span>
            <div className="mt-3 space-y-4">
              {(() => {
                try {
                  const educationData = JSON.parse(
                    application.candidate.education
                  );
                  if (Array.isArray(educationData)) {
                    return educationData.map((edu, index) => (
                      <div
                        key={index}
                        className="bg-slate-700/30 rounded-lg p-4 border border-slate-600/50"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <span className="text-slate-400 text-xs">
                              Institution:
                            </span>
                            <p className="text-white font-medium text-sm">
                              {edu.institution}
                            </p>
                          </div>
                          <div>
                            <span className="text-slate-400 text-xs">
                              Program:
                            </span>
                            <p className="text-white font-medium text-sm">
                              {edu.program}
                            </p>
                          </div>
                          <div>
                            <span className="text-slate-400 text-xs">
                              Specialization:
                            </span>
                            <p className="text-white font-medium text-sm">
                              {edu.specialization}
                            </p>
                          </div>
                          <div>
                            <span className="text-slate-400 text-xs">
                              Duration:
                            </span>
                            <p className="text-white font-medium text-sm">
                              {new Date(edu.from).toLocaleDateString()} -{" "}
                              {new Date(edu.till).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ));
                  }
                  return (
                    <p className="text-white">Invalid education data format</p>
                  );
                } catch (error) {
                  return (
                    <p className="text-white">Error parsing education data</p>
                  );
                }
              })()}
            </div>
          </div>
        )}

        {/* Work Experience */}
        {application.candidate.work && (
          <div className="mt-6">
            <span className="text-slate-400 text-sm">Work Experience:</span>
            <div className="mt-3 space-y-4">
              {(() => {
                try {
                  const workData = JSON.parse(application.candidate.work);
                  if (Array.isArray(workData)) {
                    return workData.map((work, index) => (
                      <div
                        key={index}
                        className="bg-slate-700/30 rounded-lg p-4 border border-slate-600/50"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <span className="text-slate-400 text-xs">
                              Organization:
                            </span>
                            <p className="text-white font-medium text-sm">
                              {work.organization}
                            </p>
                          </div>
                          <div>
                            <span className="text-slate-400 text-xs">
                              Role:
                            </span>
                            <p className="text-white font-medium text-sm">
                              {work.role}
                            </p>
                          </div>
                          <div>
                            <span className="text-slate-400 text-xs">
                              Designation:
                            </span>
                            <p className="text-white font-medium text-sm">
                              {work.designation}
                            </p>
                          </div>
                          <div>
                            <span className="text-slate-400 text-xs">
                              Duration:
                            </span>
                            <p className="text-white font-medium text-sm">
                              {new Date(work.from).toLocaleDateString()} -{" "}
                              {work.till
                                ? new Date(work.till).toLocaleDateString()
                                : "Present"}
                            </p>
                          </div>
                        </div>
                        {work.whatYouDo && (
                          <div className="mt-3">
                            <span className="text-slate-400 text-xs">
                              Responsibilities:
                            </span>
                            <p className="text-white text-sm mt-1">
                              {work.whatYouDo}
                            </p>
                          </div>
                        )}
                      </div>
                    ));
                  }
                  return (
                    <p className="text-white">
                      Invalid work experience data format
                    </p>
                  );
                } catch (error) {
                  return (
                    <p className="text-white">
                      Error parsing work experience data
                    </p>
                  );
                }
              })()}
            </div>
          </div>
        )}

        {/* Social Links */}
        {(application.candidate.portfolioLink ||
          application.candidate.githubLink ||
          application.candidate.linkedinLink ||
          application.candidate.twitterLink) && (
          <div className="mt-6">
            <span className="text-slate-400 text-sm">Social Links:</span>
            <div className="flex flex-wrap gap-3 mt-2">
              {application.candidate.portfolioLink && (
                <a
                  href={application.candidate.portfolioLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 text-sm"
                >
                  Portfolio
                </a>
              )}
              {application.candidate.githubLink && (
                <a
                  href={application.candidate.githubLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 text-sm"
                >
                  GitHub
                </a>
              )}
              {application.candidate.linkedinLink && (
                <a
                  href={application.candidate.linkedinLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 text-sm"
                >
                  LinkedIn
                </a>
              )}
              {application.candidate.twitterLink && (
                <a
                  href={application.candidate.twitterLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 text-sm"
                >
                  Twitter
                </a>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Resume Section */}
      {application.candidate.resume && (
        <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-4 sm:p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Resume</h2>
          <div className="flex items-center gap-3">
            <FileText className="h-5 w-5 text-blue-400" />
            <span className="text-white">Resume uploaded</span>
            <a
              href={application.candidate.resume}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded transition-colors"
            >
              <Download className="h-4 w-4" />
              View Resume
            </a>
          </div>
        </div>
      )}

      {/* AI Reviewer Section (Placeholder) */}
      <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-4 sm:p-6">
        <h2 className="text-lg font-semibold text-white mb-4">AI Reviewer</h2>
        <div className="text-center py-8">
          <div className="p-6 bg-slate-700/30 rounded-lg border border-slate-600/50 max-w-md mx-auto">
            <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-blue-400 text-xl">🤖</span>
            </div>
            <h3 className="text-lg font-medium text-white mb-2">
              AI Review Coming Soon
            </h3>
            <p className="text-slate-400 text-sm">
              Our AI reviewer will analyze this application and provide insights
              to help with your decision.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
