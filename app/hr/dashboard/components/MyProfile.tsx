"use client";

import { useState, useEffect } from "react";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  User,
  Mail,
  Phone,
  Briefcase,
  Shield,
  FileText,
  Key,
  Eye,
  EyeOff,
  Trash2,
} from "lucide-react";

interface UserData {
  firstName: string;
  lastName: string;
  email: string;
  scope: string;
  designation: string;
  phoneNo?: string;
}

interface MyProfileProps {
  userData: UserData | null;
}

export default function MyProfile({ userData }: MyProfileProps) {
  const router = useRouter();
  const [jobCount, setJobCount] = useState<number>(0);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    if (userData?.email) {
      fetchJobCount();
    }
  }, [userData?.email]);

  const fetchJobCount = async () => {
    try {
      const response = await fetch(`/api/jobs?hrEmail=${userData?.email}`);
      const data = await response.json();
      if (data.success) {
        setJobCount(data.totalCount || 0);
      }
    } catch (error) {
      console.error("Error fetching job count:", error);
    }
  };

  const handleDeleteProfile = async () => {
    if (
      !confirm(
        "Are you sure you want to delete your profile? This action cannot be undone and will delete all your posted jobs."
      )
    ) {
      return;
    }

    try {
      const response = await fetch("/api/hr/profile", {
        method: "DELETE",
      });

      const result = await response.json();

      if (response.ok && result.success) {
        // Sign out the user and clear session
        await signOut({ 
          callbackUrl: "/",
          redirect: true 
        });
      } else {
        alert(result.error || "Failed to delete profile");
      }
    } catch (error) {
      console.error("Error deleting profile:", error);
      alert("Failed to delete profile");
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.newPassword !== formData.confirmPassword) {
      setMessage("New passwords don't match");
      return;
    }

    if (formData.newPassword.length < 6) {
      setMessage("New password must be at least 6 characters");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setMessage("Password updated successfully!");
        setFormData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        setShowPasswordForm(false);
      } else {
        setMessage(result.error || "Failed to update password");
      }
    } catch (error) {
      setMessage("An error occurred while updating password");
    } finally {
      setLoading(false);
    }
  };

  if (!userData) {
    return (
      <div className="text-center py-12">
        <User className="w-12 h-12 text-slate-400 mx-auto mb-4" />
        <p className="text-slate-400">Profile information not available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">My Profile</h2>

      <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 sm:p-8">
        {/* Header Section */}
        <div className="flex items-center space-x-4 mb-8">
          <div className="p-4 bg-blue-500/20 rounded-2xl">
            <User className="w-8 h-8 text-blue-400" />
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-bold text-white">
              {userData.firstName} {userData.lastName}
            </h3>
            <p className="text-slate-400">{userData.designation}</p>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Left Column - User Information */}
          <div className="space-y-6">
            <div className="bg-slate-700/30 rounded-xl p-6">
              <h4 className="text-lg font-semibold text-white mb-4">
                Personal Information
              </h4>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-5 h-5 mt-0.5">
                    <Mail className="w-5 h-5 text-slate-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-400 mb-1">Email</p>
                    <p className="text-white break-all">{userData.email}</p>
                  </div>
                </div>

                {userData.phoneNo && (
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-5 h-5 mt-0.5">
                      <Phone className="w-5 h-5 text-slate-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-400 mb-1">Phone</p>
                      <p className="text-white">{userData.phoneNo}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-5 h-5 mt-0.5">
                    <Briefcase className="w-5 h-5 text-slate-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-400 mb-1">Designation</p>
                    <p className="text-white">{userData.designation}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-5 h-5 mt-0.5">
                    <Shield className="w-5 h-5 text-slate-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-400 mb-1">Scope</p>
                    <span className="inline-block px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm font-medium">
                      {userData.scope}
                    </span>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-5 h-5 mt-0.5">
                    <FileText className="w-5 h-5 text-slate-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-400 mb-1">Jobs Posted</p>
                    <p className="text-white font-semibold text-lg">
                      {jobCount}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Permissions and Password Reset */}
          <div className="space-y-6">
            {/* Permissions Section */}
            <div className="bg-slate-700/30 rounded-xl p-6">
              <h4 className="text-lg font-semibold text-white mb-4">
                Permissions
              </h4>
              <div className="space-y-3">
                {userData.scope === "owner" && (
                  <>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-green-400 rounded-full flex-shrink-0"></div>
                      <span className="text-slate-300">Manage HR users</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-green-400 rounded-full flex-shrink-0"></div>
                      <span className="text-slate-300">
                        Post and manage jobs
                      </span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-green-400 rounded-full flex-shrink-0"></div>
                      <span className="text-slate-300">
                        View all applications
                      </span>
                    </div>
                  </>
                )}
                {userData.scope === "admin" && (
                  <>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-green-400 rounded-full flex-shrink-0"></div>
                      <span className="text-slate-300">
                        Post and manage jobs
                      </span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-green-400 rounded-full flex-shrink-0"></div>
                      <span className="text-slate-300">
                        View all applications
                      </span>
                    </div>
                  </>
                )}
                {userData.scope === "moderator" && (
                  <>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-green-400 rounded-full flex-shrink-0"></div>
                      <span className="text-slate-300">
                        View all applications
                      </span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-yellow-400 rounded-full flex-shrink-0"></div>
                      <span className="text-slate-300">
                        Limited job management
                      </span>
                    </div>
                  </>
                )}
                {userData.scope === "participant" && (
                  <>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-green-400 rounded-full flex-shrink-0"></div>
                      <span className="text-slate-300">View applications</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-red-400 rounded-full flex-shrink-0"></div>
                      <span className="text-slate-300">Cannot post jobs</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Reset Password Section */}
            <div className="bg-slate-700/30 rounded-xl p-6">
              <div className="flex items-center space-x-3 mb-4">
                <Key className="w-5 h-5 text-slate-400" />
                <h4 className="text-lg font-semibold text-white">
                  Reset Password
                </h4>
              </div>

              {!showPasswordForm ? (
                <button
                  onClick={() => setShowPasswordForm(true)}
                  className="w-full px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors font-medium"
                >
                  Change Password
                </button>
              ) : (
                <form onSubmit={handleResetPassword} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Current Password
                    </label>
                    <input
                      type="password"
                      name="currentPassword"
                      value={formData.currentPassword}
                      onChange={handlePasswordChange}
                      className="w-full px-3 py-2 bg-slate-600/50 border border-slate-500/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                      placeholder="Enter current password"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        name="newPassword"
                        value={formData.newPassword}
                        onChange={handlePasswordChange}
                        className="w-full px-3 py-2 bg-slate-600/50 border border-slate-500/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 pr-10"
                        placeholder="Enter new password"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white"
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handlePasswordChange}
                      className="w-full px-3 py-2 bg-slate-600/50 border border-slate-500/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                      placeholder="Confirm new password"
                      required
                    />
                  </div>

                  {message && (
                    <div
                      className={`p-3 rounded-lg text-sm ${
                        message.includes("successfully")
                          ? "bg-green-500/20 text-green-400"
                          : "bg-red-500/20 text-red-400"
                      }`}
                    >
                      {message}
                    </div>
                  )}

                  <div className="flex space-x-3">
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors disabled:opacity-50 font-medium"
                    >
                      {loading ? "Updating..." : "Update Password"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowPasswordForm(false);
                        setFormData({
                          currentPassword: "",
                          newPassword: "",
                          confirmPassword: "",
                        });
                        setMessage("");
                      }}
                      className="px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition-colors font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Delete Profile Section */}
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-red-500/20 rounded-lg">
                  <Trash2 className="w-5 h-5 text-red-400" />
                </div>
                <h3 className="text-lg font-semibold text-white">Delete Profile</h3>
              </div>
              <p className="text-slate-400 text-sm mb-4">
                This action will permanently delete your profile and all associated data including posted jobs. This action cannot be undone.
              </p>
              <button
                onClick={handleDeleteProfile}
                className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors font-medium"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete Profile</span>
              </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
