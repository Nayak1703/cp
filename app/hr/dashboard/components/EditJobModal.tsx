"use client";

import { useState, useEffect } from "react";
import { X, FileText, ToggleLeft, ToggleRight } from "lucide-react";

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

interface EditJobModalProps {
  job: Job;
  onClose: () => void;
  onSubmit: (jobId: number, data: any) => void;
}

export default function EditJobModal({
  job,
  onClose,
  onSubmit,
}: EditJobModalProps) {
  const [formData, setFormData] = useState({
    jobDescription: "",
    jobStatus: "ACTIVE",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setFormData({
      jobDescription: job.jobDescription,
      jobStatus: job.jobStatus,
    });
  }, [job]);

  const handleChange = (
    e: React.ChangeEvent<HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.jobDescription.trim()) {
      alert("Job description is required");
      return;
    }

    setLoading(true);
    try {
      await onSubmit(job.jobId, {
        jobDescription: formData.jobDescription,
        jobStatus: formData.jobStatus,
      });
    } finally {
      setLoading(false);
    }
  };

  const isInactive = job.jobStatus === "INACTIVE";

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800/90 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white">Edit Job</h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Job Info Display (Read-only) */}
        <div className="bg-slate-700/30 rounded-xl p-4 mb-6">
          <h4 className="text-lg font-semibold text-white mb-4">
            Job Information (Read-only)
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-slate-400">Role:</span>
              <p className="text-white font-medium">{job.role}</p>
            </div>
            <div>
              <span className="text-slate-400">Designation:</span>
              <p className="text-white font-medium">{job.designation}</p>
            </div>
            <div>
              <span className="text-slate-400">Experience:</span>
              <p className="text-white font-medium">{job.experience}</p>
            </div>
            <div>
              <span className="text-slate-400">Department:</span>
              <p className="text-white font-medium">{job.department}</p>
            </div>
            <div>
              <span className="text-slate-400">Location:</span>
              <p className="text-white font-medium">{job.location}</p>
            </div>
            <div>
              <span className="text-slate-400">Posted On:</span>
              <p className="text-white font-medium">
                {new Date(job.postedOn).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {isInactive ? (
          <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-xl p-4 mb-6">
            <div className="flex items-center space-x-2">
              <ToggleLeft className="w-5 h-5 text-yellow-400" />
              <span className="text-yellow-400 font-medium">
                Job is Inactive
              </span>
            </div>
            <p className="text-yellow-300 text-sm mt-2">
              This job is currently inactive. You can only delete it, not edit
              it.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Job Status *
              </label>
              <div className="relative">
                <ToggleRight className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <select
                  name="jobStatus"
                  value={formData.jobStatus}
                  onChange={handleChange}
                  className="w-full pl-10 pr-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:border-blue-500 appearance-none"
                  required
                >
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Job Description *
              </label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <textarea
                  name="jobDescription"
                  value={formData.jobDescription}
                  onChange={handleChange}
                  rows={6}
                  className="w-full pl-10 pr-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 resize-none"
                  placeholder="Enter job description..."
                  required
                />
              </div>
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors disabled:opacity-50 font-medium"
              >
                {loading ? "Updating..." : "Update Job"}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition-colors font-medium"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
