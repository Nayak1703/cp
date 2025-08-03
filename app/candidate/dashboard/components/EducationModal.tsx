"use client";

import { useState } from "react";
import { X, GraduationCap } from "lucide-react";

interface EducationEntry {
  institution: string;
  program: string;
  specialization: string;
  from: string;
  till: string;
}

interface EducationModalProps {
  onClose: () => void;
  onSubmit: (education: EducationEntry) => void;
}

export default function EducationModal({
  onClose,
  onSubmit,
}: EducationModalProps) {
  const [formData, setFormData] = useState({
    institution: "",
    program: "",
    specialization: "",
    from: "",
    till: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (
      !formData.institution.trim() ||
      !formData.program.trim() ||
      !formData.specialization.trim() ||
      !formData.from ||
      !formData.till
    ) {
      alert("All fields are required");
      return;
    }

    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800/90 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <GraduationCap className="w-5 h-5 text-blue-400" />
            </div>
            <h3 className="text-xl font-bold text-white">Add Education</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Institution *
            </label>
            <input
              type="text"
              name="institution"
              value={formData.institution}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:border-blue-500"
              placeholder="Enter institution name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Program *
            </label>
            <input
              type="text"
              name="program"
              value={formData.program}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:border-blue-500"
              placeholder="e.g., Bachelor of Science"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Specialization *
            </label>
            <input
              type="text"
              name="specialization"
              value={formData.specialization}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:border-blue-500"
              placeholder="e.g., Computer Science"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                From Date *
              </label>
              <input
                type="date"
                name="from"
                value={formData.from}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Till Date *
              </label>
              <input
                type="date"
                name="till"
                value={formData.till}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:border-blue-500"
                required
              />
            </div>
          </div>

          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
            <p className="text-blue-400 text-sm">
              <strong>Note:</strong> You can add a maximum of 2 education
              entries.
            </p>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors font-medium"
            >
              Add Education
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
      </div>
    </div>
  );
}
