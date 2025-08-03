"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FileText, Edit, Trash2, Plus, ArrowLeft } from "lucide-react";
import { LOCATIONS } from "@/src/constants";
import EducationModal from "./EducationModal";
import WorkModal from "./WorkModal";

interface CandidateInfo {
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
  createdAt: string;
  updatedAt: string;
}

interface EducationEntry {
  institution: string;
  program: string;
  specialization: string;
  from: string;
  till: string;
}

interface WorkEntry {
  organization: string;
  role: string;
  designation: string;
  whatYouDo: string;
  from: string;
  till?: string;
}

export default function CandidateProfile() {
  const { data: session } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<CandidateInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [showEducationModal, setShowEducationModal] = useState(false);
  const [showWorkModal, setShowWorkModal] = useState(false);
  const [educationInfo, setEducationInfo] = useState<EducationEntry[]>([]);
  const [workInfo, setWorkInfo] = useState<WorkEntry[]>([]);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    age: "",
    currentRole: "",
    totalExperience: "",
    location: "",
    expectedCTC: "",
    skills: "",
    portfolioLink: "",
    githubLink: "",
    linkedinLink: "",
    twitterLink: "",
    readyToRelocate: false,
  });
  const [resumeUploading, setResumeUploading] = useState(false);

  useEffect(() => {
    if (session?.user?.email) {
      fetchProfile();
    }
  }, [session]);

  const fetchProfile = async () => {
    try {
      const response = await fetch("/api/candidate/profile");
      const data = await response.json();

      if (data.success) {
        setProfile(data.profile);
        setFormData({
          firstName: data.profile.firstName || "",
          lastName: data.profile.lastName || "",
          age: data.profile.age?.toString() || "",
          currentRole: data.profile.currentRole || "",
          totalExperience: data.profile.totalExperience || "",
          location: data.profile.location || "",
          expectedCTC: data.profile.expectedCTC || "",
          skills: data.profile.skills || "",
          portfolioLink: data.profile.portfolioLink || "",
          githubLink: data.profile.githubLink || "",
          linkedinLink: data.profile.linkedinLink || "",
          twitterLink: data.profile.twitterLink || "",
          readyToRelocate: data.profile.readyToRelocate || false,
        });

        // Parse education and work data
        if (data.profile.education) {
          try {
            const parsed = JSON.parse(data.profile.education);
            setEducationInfo(Array.isArray(parsed) ? parsed : []);
          } catch (e) {
            setEducationInfo([]);
          }
        }

        if (data.profile.work) {
          try {
            const parsed = JSON.parse(data.profile.work);
            setWorkInfo(Array.isArray(parsed) ? parsed : []);
          } catch (e) {
            setWorkInfo([]);
          }
        }
      }
    } catch (_e) {
      console.error("Error fetching profile:", _e);
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const response = await fetch("/api/candidate/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setEditing(false);
        fetchProfile(); // Refresh profile data
      } else {
        alert("Failed to update profile");
      }
    } catch (_e) {
      console.error("Error updating profile:", _e);
      alert("Failed to update profile");
    }
  };

  const handleDeleteProfile = async () => {
    if (
      !confirm(
        "Are you sure you want to delete your profile? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      const response = await fetch("/api/candidate/profile", {
        method: "DELETE",
      });

      if (response.ok) {
        router.push("/");
      }
    } catch (_e) {
      console.error("Error deleting profile:", _e);
      alert("Failed to delete profile");
    }
  };

  const handleEducationSubmit = (education: EducationEntry) => {
    if (educationInfo.length < 2) {
      setEducationInfo([...educationInfo, education]);
      setShowEducationModal(false);
    }
  };

  const handleWorkSubmit = (work: WorkEntry) => {
    if (workInfo.length < 2) {
      setWorkInfo([...workInfo, work]);
      setShowWorkModal(false);
    }
  };

  const removeEducation = (index: number) => {
    setEducationInfo(educationInfo.filter((_, i) => i !== index));
  };

  const removeWork = (index: number) => {
    setWorkInfo(workInfo.filter((_, i) => i !== index));
  };

  const handleResumeUpload = async (file: File) => {
    // Check file size (200KB = 200 * 1024 bytes)
    if (file.size > 200 * 1024) {
      alert("Resume file size must be less than 200KB");
      return;
    }

    // Check file type
    if (file.type !== "application/pdf") {
      alert("Only PDF files are allowed");
      return;
    }

    setResumeUploading(true);
    try {
      const formData = new FormData();
      formData.append("resume", file);

      const response = await fetch("/api/candidate/upload-resume", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok && data.success) {
        fetchProfile(); // Refresh profile to show new resume
        alert("Resume uploaded successfully!");
      } else {
        alert(data.error || "Failed to upload resume");
      }
    } catch (_e) {
      console.error("Error uploading resume:", _e);
      alert("Failed to upload resume");
    } finally {
      setResumeUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleResumeUpload(file);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-400">Profile not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.push("/candidate/dashboard")}
            className="flex items-center space-x-2 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Dashboard</span>
          </button>
          <h1 className="text-2xl font-bold text-white">My Profile</h1>
        </div>
        <div className="flex space-x-3">
          {!editing ? (
            <>
              <button
                onClick={() => setEditing(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
              >
                <Edit className="w-4 h-4" />
                <span>Edit Profile</span>
              </button>
              <button
                onClick={handleDeleteProfile}
                className="flex items-center space-x-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete Profile</span>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleSave}
                className="flex items-center space-x-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
              >
                <span>Save Changes</span>
              </button>
              <button
                onClick={() => setEditing(false)}
                className="flex items-center space-x-2 px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition-colors"
              >
                <span>Cancel</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Profile Form */}
      <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 space-y-6">
        {/* Basic Information */}
        <div>
          <h2 className="text-xl font-semibold text-white mb-4">
            Basic Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                First Name *
              </label>
              {editing ? (
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) =>
                    setFormData({ ...formData, firstName: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  required
                />
              ) : (
                <p className="text-white">
                  {profile.firstName || "Not provided"}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Last Name *
              </label>
              {editing ? (
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) =>
                    setFormData({ ...formData, lastName: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  required
                />
              ) : (
                <p className="text-white">
                  {profile.lastName || "Not provided"}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Email
              </label>
              <p className="text-white">{profile.email}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Age
              </label>
              {editing ? (
                <input
                  type="number"
                  value={formData.age}
                  onChange={(e) =>
                    setFormData({ ...formData, age: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  min="18"
                  max="100"
                />
              ) : (
                <p className="text-white">{profile.age || "Not provided"}</p>
              )}
            </div>
          </div>
        </div>

        {/* Professional Information */}
        <div>
          <h2 className="text-xl font-semibold text-white mb-4">
            Professional Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Current Role
              </label>
              {editing ? (
                <input
                  type="text"
                  value={formData.currentRole}
                  onChange={(e) =>
                    setFormData({ ...formData, currentRole: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:border-blue-500"
                />
              ) : (
                <p className="text-white">
                  {profile.currentRole || "Not provided"}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Total Experience
              </label>
              {editing ? (
                <input
                  type="text"
                  value={formData.totalExperience}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      totalExperience: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:border-blue-500"
                />
              ) : (
                <p className="text-white">
                  {profile.totalExperience || "Not provided"}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Location
              </label>
              {editing ? (
                <select
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="">Select Location</option>
                  {LOCATIONS.map((location) => (
                    <option key={location} value={location}>
                      {location}
                    </option>
                  ))}
                </select>
              ) : (
                <p className="text-white">
                  {profile.location || "Not provided"}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Expected CTC
              </label>
              {editing ? (
                <input
                  type="number"
                  value={formData.expectedCTC}
                  onChange={(e) =>
                    setFormData({ ...formData, expectedCTC: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  placeholder="Enter expected salary"
                />
              ) : (
                <p className="text-white">
                  {profile.expectedCTC || "Not provided"}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Skills */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Skills
          </label>
          {editing ? (
            <textarea
              value={formData.skills}
              onChange={(e) =>
                setFormData({ ...formData, skills: e.target.value })
              }
              rows={3}
              className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:border-blue-500 resize-none"
              placeholder="Enter your skills..."
            />
          ) : (
            <p className="text-white">{profile.skills || "Not provided"}</p>
          )}
        </div>

        {/* Education Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white">Education</h2>
            {editing && educationInfo.length < 2 && (
              <button
                onClick={() => setShowEducationModal(true)}
                className="flex items-center space-x-2 px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors text-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Add Education</span>
              </button>
            )}
          </div>
          {educationInfo.length === 0 ? (
            <p className="text-slate-400">No education information added</p>
          ) : (
            <div className="space-y-3">
              {educationInfo.map((edu, index) => (
                <div key={index} className="bg-slate-700/30 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-white font-medium">
                        {edu.institution}
                      </h3>
                      <p className="text-slate-300">{edu.program}</p>
                      <p className="text-slate-400 text-sm">
                        {edu.specialization}
                      </p>
                      <p className="text-slate-400 text-sm">
                        {edu.from} - {edu.till}
                      </p>
                    </div>
                    {editing && (
                      <button
                        onClick={() => removeEducation(index)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Work Experience Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white">
              Work Experience
            </h2>
            {editing && workInfo.length < 2 && (
              <button
                onClick={() => setShowWorkModal(true)}
                className="flex items-center space-x-2 px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors text-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Add Work Experience</span>
              </button>
            )}
          </div>
          {workInfo.length === 0 ? (
            <p className="text-slate-400">No work experience added</p>
          ) : (
            <div className="space-y-3">
              {workInfo.map((work, index) => (
                <div key={index} className="bg-slate-700/30 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-white font-medium">
                        {work.organization}
                      </h3>
                      <p className="text-slate-300">{work.role}</p>
                      <p className="text-slate-400 text-sm">
                        {work.designation}
                      </p>
                      <p className="text-slate-400 text-sm">{work.whatYouDo}</p>
                      <p className="text-slate-400 text-sm">
                        {work.from} - {work.till || "Present"}
                      </p>
                    </div>
                    {editing && (
                      <button
                        onClick={() => removeWork(index)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Links */}
        <div>
          <h2 className="text-xl font-semibold text-white mb-4">Links</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Portfolio Link
              </label>
              {editing ? (
                <input
                  type="url"
                  value={formData.portfolioLink}
                  onChange={(e) =>
                    setFormData({ ...formData, portfolioLink: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:border-blue-500"
                />
              ) : (
                <p className="text-white">
                  {profile.portfolioLink || "Not provided"}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                GitHub Link
              </label>
              {editing ? (
                <input
                  type="url"
                  value={formData.githubLink}
                  onChange={(e) =>
                    setFormData({ ...formData, githubLink: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:border-blue-500"
                />
              ) : (
                <p className="text-white">
                  {profile.githubLink || "Not provided"}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                LinkedIn Link
              </label>
              {editing ? (
                <input
                  type="url"
                  value={formData.linkedinLink}
                  onChange={(e) =>
                    setFormData({ ...formData, linkedinLink: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:border-blue-500"
                />
              ) : (
                <p className="text-white">
                  {profile.linkedinLink || "Not provided"}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Twitter Link
              </label>
              {editing ? (
                <input
                  type="url"
                  value={formData.twitterLink}
                  onChange={(e) =>
                    setFormData({ ...formData, twitterLink: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:border-blue-500"
                />
              ) : (
                <p className="text-white">
                  {profile.twitterLink || "Not provided"}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Resume Upload */}
        <div>
          <h2 className="text-xl font-semibold text-white mb-4">Resume</h2>
          <div className="space-y-4">
            {profile.resume ? (
              <div className="bg-slate-700/30 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <FileText className="w-5 h-5 text-blue-400" />
                    <div>
                      <p className="text-white font-medium">Current Resume</p>
                      <p className="text-slate-400 text-sm">PDF uploaded</p>
                    </div>
                  </div>
                  <a
                    href={profile.resume}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 text-sm"
                  >
                    View Resume
                  </a>
                </div>
              </div>
            ) : (
              <p className="text-slate-400">No resume uploaded</p>
            )}

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-300">
                Upload Resume (PDF only, max 200KB)
              </label>
              <div className="flex items-center space-x-3">
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  disabled={resumeUploading}
                  className="block w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-500 file:text-white hover:file:bg-blue-600 file:cursor-pointer disabled:opacity-50"
                />
                {resumeUploading && (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                    <span className="text-sm text-slate-400">Uploading...</span>
                  </div>
                )}
              </div>
              <p className="text-xs text-slate-500">
                Accepted format: PDF only. Maximum size: 200KB
              </p>
            </div>
          </div>
        </div>

        {/* Ready to Relocate */}
        <div>
          <label className="flex items-center space-x-2">
            {editing ? (
              <input
                type="checkbox"
                checked={formData.readyToRelocate}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    readyToRelocate: e.target.checked,
                  })
                }
                className="rounded border-slate-600 text-blue-500 focus:ring-blue-500"
              />
            ) : (
              <input
                type="checkbox"
                checked={profile.readyToRelocate || false}
                disabled
                className="rounded border-slate-600 text-blue-500 focus:ring-blue-500"
              />
            )}
            <span className="text-sm font-medium text-slate-300">
              Ready to Relocate
            </span>
          </label>
        </div>
      </div>

      {/* Modals */}
      {showEducationModal && (
        <EducationModal
          onClose={() => setShowEducationModal(false)}
          onSubmit={handleEducationSubmit}
        />
      )}

      {showWorkModal && (
        <WorkModal
          onClose={() => setShowWorkModal(false)}
          onSubmit={handleWorkSubmit}
        />
      )}
    </div>
  );
}
