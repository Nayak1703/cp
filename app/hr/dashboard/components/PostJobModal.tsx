"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  EXPERIENCE_LEVELS,
  EXPERIENCE_LABELS,
  DEPARTMENTS,
  LOCATIONS,
} from "@/src/constants";

const jobSchema = z.object({
  role: z.string().min(1, "Role is required"),
  designation: z.string().min(1, "Designation is required"),
  experience: z.string().min(1, "Experience is required"),
  department: z.string().min(1, "Department is required"),
  location: z.string().min(1, "Location is required"),
  jobDescription: z
    .string()
    .min(10, "Job description must be at least 10 characters"),
});

type JobFormData = z.infer<typeof jobSchema>;

interface PostJobModalProps {
  onClose: () => void;
  onSubmit: (data: JobFormData) => void;
}

export default function PostJobModal({ onClose, onSubmit }: PostJobModalProps) {
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<JobFormData>({
    resolver: zodResolver(jobSchema),
  });

  const handleFormSubmit = async (data: JobFormData) => {
    setLoading(true);
    try {
      await onSubmit(data);
      reset();
    } catch (error) {
      console.error("Error submitting job:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800/90 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-4 sm:p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-white">
            Post New Job
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors p-1"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit(handleFormSubmit)}
          className="space-y-4 sm:space-y-6"
        >
          {/* Role */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Role *
            </label>
            <input
              type="text"
              {...register("role")}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-colors text-sm sm:text-base"
              placeholder="e.g., Senior Software Engineer"
            />
            {errors.role && (
              <p className="mt-1 text-xs sm:text-sm text-red-400">
                {errors.role.message}
              </p>
            )}
          </div>

          {/* Designation */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Designation *
            </label>
            <input
              type="text"
              {...register("designation")}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-colors text-sm sm:text-base"
              placeholder="e.g., Full Stack Developer"
            />
            {errors.designation && (
              <p className="mt-1 text-xs sm:text-sm text-red-400">
                {errors.designation.message}
              </p>
            )}
          </div>

          {/* Experience */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Experience *
            </label>
            <select
              {...register("experience")}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors text-sm sm:text-base"
            >
              <option value="">Select Experience Level</option>
              {Object.entries(EXPERIENCE_LABELS).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
            {errors.experience && (
              <p className="mt-1 text-xs sm:text-sm text-red-400">
                {errors.experience.message}
              </p>
            )}
          </div>

          {/* Department */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Department *
            </label>
            <select
              {...register("department")}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors text-sm sm:text-base"
            >
              <option value="">Select Department</option>
              {DEPARTMENTS.map((dept) => (
                <option key={dept} value={dept}>
                  {dept.replace("_", " ")}
                </option>
              ))}
            </select>
            {errors.department && (
              <p className="mt-1 text-xs sm:text-sm text-red-400">
                {errors.department.message}
              </p>
            )}
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Location *
            </label>
            <select
              {...register("location")}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors text-sm sm:text-base"
            >
              <option value="">Select Location</option>
              {LOCATIONS.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
            {errors.location && (
              <p className="mt-1 text-xs sm:text-sm text-red-400">
                {errors.location.message}
              </p>
            )}
          </div>

          {/* Job Description */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Job Description *
            </label>
            <textarea
              {...register("jobDescription")}
              rows={4}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-colors resize-none text-sm sm:text-base"
              placeholder="Describe the job responsibilities, requirements, and qualifications..."
            />
            {errors.jobDescription && (
              <p className="mt-1 text-xs sm:text-sm text-red-400">
                {errors.jobDescription.message}
              </p>
            )}
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end space-y-2 sm:space-y-0 sm:space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-4 sm:px-6 py-2 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors text-sm sm:text-base"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-4 sm:px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
            >
              {loading ? "Posting..." : "Post Job"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
