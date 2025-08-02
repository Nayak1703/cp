// app/auth/google-callback/page.tsx
"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getSession } from "next-auth/react";

export default function GoogleCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedRole = searchParams.get("role") as "hr" | "candidate";

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const session = await getSession();

        if (!session?.user) {
          router.push("/login?error=AuthenticationFailed");
          return;
        }

        // Validate role selection against actual user type in database
        if (!selectedRole) {
          router.push("/login?error=NoRoleSelected");
          return;
        }

        // Check if selected role matches user's actual role in database
        const response = await fetch("/api/auth/validate-role", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: session.user.email,
            selectedRole,
          }),
        });

        const validation = await response.json();

        if (!validation.valid) {
          router.push(`/login?error=${validation.error}`);
          return;
        }

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
