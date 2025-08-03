// app/hr/dashboard/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import HRDashboardContent from "./components/HRDashboardContent";

interface UserData {
  firstName: string;
  lastName: string;
  email: string;
  scope: string;
  designation: string;
  phoneNo?: string;
}

export default function HRDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadUserData = async () => {
      if (status === "loading") return;

      if (!session) {
        router.push("/login");
        return;
      }

      // If userType is already set and correct, load user data
      if (session.user.userType === "hr") {
        try {
          const response = await fetch("/api/auth/get-user-data");
          const result = await response.json();
          
          if (response.ok) {
            setUserData(result.userData);
            setLoading(false);
          } else {
            setError(result.message || "Failed to load user data");
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          setError("Failed to load user data");
        }
        return;
      }

      // If userType is set but wrong, redirect
      if (session.user.userType && session.user.userType !== "hr") {
        if (session.user.userType === "candidate") {
          router.push("/candidate/dashboard");
        } else {
          router.push("/login");
        }
        return;
      }

      // If userType is not set, validate if user exists in HR table
      try {
        const response = await fetch("/api/auth/validate-user-role", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ requestedRole: "hr" }),
        });

        const result = await response.json();

        if (response.ok && result.valid) {
          // User exists in HR table, set role and load data
          const setRoleResponse = await fetch("/api/auth/set-session-role", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ selectedRole: "hr" }),
          });

          if (setRoleResponse.ok) {
            setUserData(result.userData);
            setLoading(false);
          } else {
            setError("Failed to set user role");
          }
        } else {
          // User doesn't exist in HR table, check if they exist as candidate
          const candidateResponse = await fetch(
            "/api/auth/validate-user-role",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ requestedRole: "candidate" }),
            }
          );

          const candidateResult = await candidateResponse.json();

          if (candidateResponse.ok && candidateResult.valid) {
            router.push("/candidate/dashboard");
          } else {
            router.push("/login?error=NoAccountFound");
          }
        }
      } catch (error) {
        console.error("Error validating user role:", error);
        router.push("/login?error=DatabaseError");
      }
    };

    loadUserData();
  }, [session, status, router]);

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-white">Loading HR Dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  return <HRDashboardContent userData={userData} />;
}
