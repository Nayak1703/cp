import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check if user exists in Candidate table
    const candidate = await db.candidateInfo.findUnique({
      where: { email: session.user.email },
    });

    if (!candidate) {
      return NextResponse.json(
        { success: false, error: "Candidate not found" },
        { status: 404 }
      );
    }

    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get("jobId");

    if (!jobId) {
      return NextResponse.json(
        { success: false, error: "Job ID is required" },
        { status: 400 }
      );
    }

    // Check if application exists
    const application = await db.applications.findFirst({
      where: {
        jobId: parseInt(jobId),
        candidateId: candidate.id,
      },
    });

    return NextResponse.json({
      success: true,
      hasApplied: !!application,
    });
  } catch (error) {
    console.error("Error checking application status:", error);
    return NextResponse.json(
      { success: false, error: "Failed to check application status" },
      { status: 500 }
    );
  }
}
