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

    // Fetch saved jobs with job details
    const savedJobs = await (db as any).SavedJobs.findMany({
      where: { candidateId: candidate.id },
      include: {
        job: {
          include: {
            hr: {
              select: {
                firstName: true,
                lastName: true,
                designation: true,
              },
            },
          },
        },
      },
      orderBy: { savedOn: "desc" },
    });

    return NextResponse.json({
      success: true,
      savedJobs,
      count: savedJobs.length,
    });
  } catch (error) {
    console.error("Error fetching saved jobs:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch saved jobs" },
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
        { success: false, error: "You can only save active jobs" },
        { status: 400 }
      );
    }

    // Check if already saved
    const existingSavedJob = await db.savedJobs.findFirst({
      where: {
        jobId: parseInt(jobId),
        candidateId: candidate.id,
      },
    });

    if (existingSavedJob) {
      return NextResponse.json(
        { success: false, error: "Job already saved" },
        { status: 400 }
      );
    }

    // Check saved jobs limit (20)
    const savedJobsCount = await db.savedJobs.count({
      where: { candidateId: candidate.id },
    });

    if (savedJobsCount >= 20) {
      return NextResponse.json(
        {
          success: false,
          error: "limit_exceeded",
          message:
            "You can only save up to 20 jobs. Please remove some saved jobs first.",
        },
        { status: 400 }
      );
    }

    // Save the job
    const savedJob = await db.savedJobs.create({
      data: {
        jobId: parseInt(jobId),
        candidateId: candidate.id,
      },
      include: {
        job: {
          include: {
            hr: {
              select: {
                firstName: true,
                lastName: true,
                designation: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      savedJob,
      message: "Job saved successfully",
    });
  } catch (error) {
    console.error("Error saving job:", error);
    return NextResponse.json(
      { success: false, error: "Failed to save job" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
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

    const body = await request.json();
    const { jobId } = body;

    if (!jobId) {
      return NextResponse.json(
        { success: false, error: "Job ID is required" },
        { status: 400 }
      );
    }

    // Delete the saved job
    const deletedJob = await db.savedJobs.deleteMany({
      where: {
        jobId: parseInt(jobId),
        candidateId: candidate.id,
      },
    });

    if (deletedJob.count === 0) {
      return NextResponse.json(
        { success: false, error: "Saved job not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Job removed from saved jobs",
    });
  } catch (error) {
    console.error("Error removing saved job:", error);
    return NextResponse.json(
      { success: false, error: "Failed to remove saved job" },
      { status: 500 }
    );
  }
}
