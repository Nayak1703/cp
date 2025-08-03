"use client";

import { useState } from "react";
import { X, Briefcase } from "lucide-react";

interface WorkEntry {
  organization: string;
  role: string;
  designation: string;
  whatYouDo: string;
  from: string;
  till?: string;
}

interface WorkModalProps {
  onClose: () => void;
  onSubmit: (work: WorkEntry) => void;
}

export default function WorkModal({ onClose, onSubmit }: WorkModalProps) {
  const [formData, setFormData] = useState({
    organization: "",
    role: "",
    designation: "",
    whatYouDo: "",
    from: "",
    till: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (
      !formData.organization.trim() ||
      !formData.role.trim() ||
      !formData.designation.trim() ||
      !formData.whatYouDo.trim() ||
      !formData.from
    ) {
      alert("All fields except 'Till Date' are required");
      return;
    }

    const workEntry: WorkEntry = {
      organization: formData.organization,
      role: formData.role,
      designation: formData.designation,
      whatYouDo: formData.whatYouDo,
      from: formData.from,
      till: formData.till || undefined,
    };

    onSubmit(workEntry);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800/90 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Briefcase className="w-5 h-5 text-blue-400" />
            </div>
            <h3 className="text-xl font-bold text-white">
              Add Work Experience
            </h3>
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
              Organization *
            </label>
            <input
              type="text"
              name="organization"
              value={formData.organization}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:border-blue-500"
              placeholder="Enter organization name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Role *
            </label>
            <input
              type="text"
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:border-blue-500"
              placeholder="e.g., Software Engineer"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Designation *
            </label>
            <input
              type="text"
              name="designation"
              value={formData.designation}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:border-blue-500"
              placeholder="e.g., Senior Developer"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              What You Do *
            </label>
            <textarea
              name="whatYouDo"
              value={formData.whatYouDo}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:border-blue-500 resize-none"
              placeholder="Describe your responsibilities and achievements..."
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
                Till Date (Optional)
              </label>
              <input
                type="date"
                name="till"
                value={formData.till}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
            <p className="text-blue-400 text-sm">
              <strong>Note:</strong> You can add a maximum of 2 work experience
              entries.
            </p>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors font-medium"
            >
              Add Work Experience
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
