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

    // Check if user exists in HR table
    const hrUser = await db.hrInfo.findUnique({
      where: { email: session.user.email },
    });

    if (!hrUser) {
      return NextResponse.json(
        { success: false, error: "HR user not found" },
        { status: 404 }
      );
    }

    const { searchParams } = new URL(request.url);

    // Extract filter parameters
    const jobId = searchParams.get("jobId");
    const status = searchParams.get("status");
    const location = searchParams.get("location");
    const experience = searchParams.get("experience");

    if (!jobId) {
      return NextResponse.json(
        { success: false, error: "Job ID is required" },
        { status: 400 }
      );
    }

    // Build where clause
    const where: {
      jobId: number;
      applicationStatus?: "REVIEWING" | "SHORTLISTED" | "REJECTED";
    } = {
      jobId: parseInt(jobId),
    };

    if (status) {
      // Map tab names to database enum values
      const statusMap: Record<
        string,
        "REVIEWING" | "SHORTLISTED" | "REJECTED"
      > = {
        reviewing: "REVIEWING",
        shortlisted: "SHORTLISTED",
        rejected: "REJECTED",
      };
      where.applicationStatus =
        statusMap[status] ||
        (status.toUpperCase() as "REVIEWING" | "SHORTLISTED" | "REJECTED");
    }

    // Fetch applications with candidate information
    const applications = await db.applications.findMany({
      where,
      include: {
        candidate: {
          select: {
            firstName: true,
            lastName: true,
            currentRole: true,
            location: true,
            totalExperience: true,
          },
        },
      },
      orderBy: { appliedOn: "desc" },
    });

    // Filter by location and experience if provided
    let filteredApplications = applications;

    if (location) {
      filteredApplications = filteredApplications.filter(
        (app) => app.candidate.location === location
      );
    }

    if (experience) {
      filteredApplications = filteredApplications.filter(
        (app) => app.candidate.totalExperience === experience
      );
    }

    return NextResponse.json({
      success: true,
      applications: filteredApplications,
      count: filteredApplications.length,
    });
  } catch (error) {
    console.error("Error fetching applications:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch applications" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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

    // Validate candidate profile completeness
    const requiredFields = [
      "firstName",
      "lastName",
      "email",
      "age",
      "currentRole",
      "totalExperience",
      "location",
      "expectedCTC",
      "skills",
      "resume",
    ];

    const missingFields = requiredFields.filter((field) => {
      const value = candidate[field as keyof typeof candidate];
      return !value || (typeof value === "string" && value.trim() === "");
    });

    if (missingFields.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Profile incomplete",
          missingFields,
          message: `Please complete your profile by filling in: ${missingFields.join(
            ", "
          )}. You can update your profile from the dashboard.`,
        },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { jobId } = body;

    if (!jobId) {
      return NextResponse.json(
        { success: false, error: "Job ID is required" },
        { status: 400 }
      );
    }

    // Check if job exists and is active
    const job = await db.jobs.findUnique({
      where: { jobId: parseInt(jobId) },
    });

    if (!job) {
      return NextResponse.json(
        { success: false, error: "Job not found" },
        { status: 404 }
      );
    }

    if (job.jobStatus !== "ACTIVE") {
      return NextResponse.json(
        { success: false, error: "Job is not active" },
        { status: 400 }
      );
    }

    // Check if already applied
    const existingApplication = await db.applications.findFirst({
      where: {
        jobId: parseInt(jobId),
        candidateId: candidate.id,
      },
    });

    if (existingApplication) {
      return NextResponse.json(
        { success: false, error: "Already applied for this job" },
        { status: 400 }
      );
    }

    // Create application with status "REVIEWING" (not "all" as mentioned in requirements)
    const application = await db.applications.create({
      data: {
        jobId: parseInt(jobId),
        candidateId: candidate.id,
        applicationStatus: "REVIEWING",
      },
    });

    return NextResponse.json({
      success: true,
      application,
      message: "Application submitted successfully",
    });
  } catch (error) {
    console.error("Error submitting application:", error);
    return NextResponse.json(
      { success: false, error: "Failed to submit application" },
      { status: 500 }
    );
  }
}
