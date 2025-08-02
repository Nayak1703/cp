// app/hr/dashboard/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function HRDashboard() {
  // Server-side authentication check
  const session = await getServerSession(authOptions);

  console.log("HR Dashboard - Session:", {
    user: session?.user,
    userType: session?.user?.userType,
    email: session?.user?.email,
    name: session?.user?.name,
  });

  // No session - redirect to login
  if (!session) {
    redirect("/login");
  }

  // Wrong user type - redirect to appropriate dashboard
  if (session.user.userType && session.user.userType !== "hr") {
    if (session.user.userType === "candidate") {
      redirect("/candidate/dashboard");
    } else {
      redirect("/login");
    }
  }

  // If userType is not set, redirect to login to select role
  if (!session.user.userType) {
    redirect("/login?error=RoleSelectionRequired");
  }

  // User is authenticated HR - show dashboard
  return (
    <div>
      <h1>HR Dashboard</h1>
      <p>Welcome, {session.user.name}!</p>
      {/* Your HR dashboard content */}
    </div>
  );
}
