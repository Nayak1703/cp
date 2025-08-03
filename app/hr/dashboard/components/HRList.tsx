"use client";

import { useState, useEffect } from "react";
import {
  User,
  Mail,
  Phone,
  Shield,
  Briefcase,
  Plus,
  Edit,
  Trash2,
} from "lucide-react";
import AddHRModal from "./AddHRModal";
import EditHRModal from "./EditHRModal";

interface HRUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  scope: string;
  designation: string;
  phoneNo?: string;
  createdAt: string;
}

interface CurrentUser {
  scope: string;
}

export default function HRList() {
  const [hrUsers, setHrUsers] = useState<HRUser[]>([]);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<HRUser | null>(null);

  useEffect(() => {
    fetchCurrentUser();
    fetchHRUsers();
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const response = await fetch("/api/auth/get-user-data");
      const result = await response.json();
      if (response.ok) {
        setCurrentUser(result.userData);
      }
    } catch (error) {
      console.error("Error fetching current user:", error);
    }
  };

  const fetchHRUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/hr/users");
      const data = await response.json();

      if (data.success) {
        setHrUsers(data.users);
      } else {
        setError(data.error || "Failed to fetch HR users");
      }
    } catch (error) {
      console.error("Error fetching HR users:", error);
      setError("Failed to fetch HR users");
    } finally {
      setLoading(false);
    }
  };

  const handleAddHR = async (hrData: any) => {
    try {
      const response = await fetch("/api/hr/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(hrData),
      });

      const result = await response.json();

      if (response.ok) {
        setShowAddModal(false);
        fetchHRUsers(); // Refresh the list
      } else {
        alert(result.error || "Failed to add HR user");
      }
    } catch (error) {
      console.error("Error adding HR user:", error);
      alert("Failed to add HR user");
    }
  };

  const handleEditHR = async (hrData: any) => {
    try {
      const response = await fetch(`/api/hr/users/${selectedUser?.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(hrData),
      });

      const result = await response.json();

      if (response.ok) {
        setShowEditModal(false);
        setSelectedUser(null);
        fetchHRUsers(); // Refresh the list
      } else {
        alert(result.error || "Failed to update HR user");
      }
    } catch (error) {
      console.error("Error updating HR user:", error);
      alert("Failed to update HR user");
    }
  };

  const handleDeleteHR = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this HR user?")) {
      return;
    }

    try {
      const response = await fetch(`/api/hr/users/${userId}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (response.ok) {
        fetchHRUsers(); // Refresh the list
      } else {
        alert(result.error || "Failed to delete HR user");
      }
    } catch (error) {
      console.error("Error deleting HR user:", error);
      alert("Failed to delete HR user");
    }
  };

  const canManageUser = (targetScope: string) => {
    if (!currentUser) return false;

    const scopeHierarchy: Record<string, string[]> = {
      owner: ["admin", "moderator", "participant"],
      admin: ["moderator", "participant"],
      moderator: ["participant"],
      participant: [],
    };

    return scopeHierarchy[currentUser.scope]?.includes(targetScope) || false;
  };

  const canAddHR = currentUser?.scope === "owner";

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">HR List</h2>
        {canAddHR && (
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add HR</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {hrUsers.map((user) => (
          <div
            key={user.id}
            className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <User className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    {user.firstName} {user.lastName}
                  </h3>
                  <p className="text-slate-400 text-sm">{user.designation}</p>
                </div>
              </div>

              {/* Action buttons */}
              {canManageUser(user.scope) && (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      setSelectedUser(user);
                      setShowEditModal(true);
                    }}
                    className="p-1.5 text-blue-400 hover:text-blue-300 hover:bg-blue-900/20 rounded transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteHR(user.id)}
                    className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-slate-400" />
                <span className="text-slate-300 text-sm">{user.email}</span>
              </div>

              {user.phoneNo && (
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-300 text-sm">{user.phoneNo}</span>
                </div>
              )}

              <div className="flex items-center space-x-2">
                <Shield className="w-4 h-4 text-slate-400" />
                <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs font-medium">
                  {user.scope}
                </span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-700/50 mt-4">
              <p className="text-xs text-slate-400">
                Joined: {new Date(user.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        ))}
      </div>

      {hrUsers.length === 0 && (
        <div className="text-center py-12">
          <User className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-400">No HR users found</p>
        </div>
      )}

      {/* Add HR Modal */}
      {showAddModal && (
        <AddHRModal
          onClose={() => setShowAddModal(false)}
          onSubmit={handleAddHR}
        />
      )}

      {/* Edit HR Modal */}
      {showEditModal && selectedUser && currentUser && (
        <EditHRModal
          user={selectedUser}
          currentUserScope={currentUser.scope}
          onClose={() => {
            setShowEditModal(false);
            setSelectedUser(null);
          }}
          onSubmit={handleEditHR}
        />
      )}
    </div>
  );
}
