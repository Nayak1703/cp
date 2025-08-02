// app/candidate/dashboard/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function CandidateDashboard() {
  // Server-side authentication check
  const session = await getServerSession(authOptions);

  // No session - redirect to login
  if (!session) {
    redirect("/login");
  }

  // Wrong user type - redirect to appropriate dashboard
  if (session.user.userType !== "candidate") {
    if (session.user.userType === "hr") {
      redirect("/hr/dashboard");
    } else {
      redirect("/login");
    }
  }

  // User is authenticated candidate - show dashboard
  return (
    <div>
      <h1>Candidate Dashboard</h1>
      <p>Welcome, {session.user.name}!</p>
      {/* Your candidate dashboard content */}
    </div>
  );
}
