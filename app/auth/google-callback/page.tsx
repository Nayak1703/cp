// app/auth/google-callback/page.tsx
"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getSession } from "next-auth/react";

function GoogleCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedRole = searchParams.get("role") as "hr" | "candidate";

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const session = await getSession();

        console.log("session", session);
        console.log("selectedRole", selectedRole);

        if (!session?.user) {
          console.log("No session user found");
          router.push("/login?error=AuthenticationFailed");
          return;
        }

        // Validate role selection against actual user type in database
        if (!selectedRole) {
          router.push("/login?error=NoRoleSelected");
          return;
        }

        // Check if user exists in the selected role's database table
        const response = await fetch("/api/auth/validate-role", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: session.user.email,
            selectedRole,
          }),
        });

        const validation = await response.json();
        console.log("validation result", validation);

        if (!validation.valid) {
          console.log("Validation failed:", validation.error);
          // User doesn't exist in the selected role's database
          if (selectedRole === "candidate") {
            router.push("/login?error=NoCandidateAccount");
          } else {
            router.push("/login?error=NoHRAccount");
          }
          return;
        }

        // If a new user was created, refresh the session to get updated user data
        if (validation.created) {
          console.log("New user created, refreshing session");
          // Force a session refresh by redirecting to the same page
          // This will trigger the JWT callback to read the new user data
          window.location.reload();
          return;
        }

        // User exists in the selected role's database - redirect to appropriate dashboard
        console.log("Validation successful, redirecting to dashboard");

        // Redirect to appropriate dashboard
        if (selectedRole === "hr") {
          router.push("/hr/dashboard");
        } else {
          router.push("/candidate/dashboard");
        }
      } catch (error) {
        console.error("Callback error:", error);
        router.push("/login?error=CallbackError");
      }
    };

    handleCallback();
  }, [selectedRole, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-white">Completing Google sign in...</p>
      </div>
    </div>
  );
}

export default function GoogleCallback() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-white">Loading...</p>
          </div>
        </div>
      }
    >
      <GoogleCallbackContent />
    </Suspense>
  );
}
