"use client";

import { Calendar, MapPin, Briefcase, Clock, Eye, User } from "lucide-react";
import Link from "next/link";
import { Job } from "@/src/types";
import { formatDate, getExperienceText } from "@/src/utils";

interface JobCardProps {
  job: Job;
}

export default function JobCard({ job }: JobCardProps) {
  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all duration-200 group">
      {/* Job Status Badge */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-2">
          <Briefcase className="h-5 w-5 text-blue-400" />
          <span className="text-lg font-semibold text-white">{job.role}</span>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${
            job.jobStatus === "ACTIVE"
              ? "bg-green-500/20 text-green-400 border border-green-500/30"
              : "bg-red-500/20 text-red-400 border border-red-500/30"
          }`}
        >
          {job.jobStatus === "ACTIVE" ? "Active" : "Inactive"}
        </span>
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
        onClick={() => {
          const url = new URL(window.location.href);
          url.searchParams.set("jobId", job.jobId.toString());
          window.history.pushState({}, "", url.toString());
          // Trigger a custom event to notify the parent component
          window.dispatchEvent(
            new CustomEvent("jobSelected", { detail: job.jobId })
          );
        }}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium rounded-lg transition-all duration-200 group-hover:shadow-lg group-hover:shadow-blue-500/25"
      >
        <Eye className="h-4 w-4" />
        View Job
      </button>
    </div>
  );
}
