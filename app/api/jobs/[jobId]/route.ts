import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { Experience, Department, Location } from "@prisma/client";

export async function GET(
  request: NextRequest,
  { params }: { params: { jobId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const jobId = parseInt(params.jobId);

    if (isNaN(jobId)) {
      return NextResponse.json(
        { success: false, error: "Invalid job ID" },
        { status: 400 }
      );
    }

    const job = await db.jobs.findUnique({
      where: { jobId },
      include: {
        hr: {
          select: {
            firstName: true,
            lastName: true,
            designation: true,
          },
        },
      },
    });

    if (!job) {
      return NextResponse.json(
        { success: false, error: "Job not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      job,
    });
  } catch (error) {
    console.error("Error fetching job:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch job" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { jobId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const jobId = parseInt(params.jobId);

    if (isNaN(jobId)) {
      return NextResponse.json(
        { success: false, error: "Invalid job ID" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const {
      role,
      designation,
      experience,
      department,
      location,
      jobDescription,
      jobStatus,
    } = body;

    // Check if job exists and user has permission to edit it
    const existingJob = await db.jobs.findUnique({
      where: { jobId },
      include: { hr: true },
    });

    if (!existingJob) {
      return NextResponse.json(
        { success: false, error: "Job not found" },
        { status: 404 }
      );
    }

    // Check if current user is the job owner or has admin/owner scope
    const currentHR = await db.hrInfo.findUnique({
      where: { email: session.user.email },
    });

    if (!currentHR) {
      return NextResponse.json(
        { success: false, error: "HR user not found" },
        { status: 404 }
      );
    }

    // Only allow edit if user is job owner or has owner/admin scope
    if (
      existingJob.hrId !== currentHR.id &&
      !["owner", "admin"].includes(currentHR.scope)
    ) {
      return NextResponse.json(
        { success: false, error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    // Update job
    const updatedJob = await db.jobs.update({
      where: { jobId },
      data: {
        role: role || existingJob.role,
        designation: designation || existingJob.designation,
        experience: experience
          ? (experience as Experience)
          : existingJob.experience,
        department: department
          ? (department as Department)
          : existingJob.department,
        location: location ? (location as Location) : existingJob.location,
        jobDescription: jobDescription || existingJob.jobDescription,
        jobStatus: jobStatus || existingJob.jobStatus,
      },
      include: {
        hr: {
          select: {
            firstName: true,
            lastName: true,
            designation: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      job: updatedJob,
    });
  } catch (error) {
    console.error("Error updating job:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update job" },
      { status: 500 }
    );
  }
}
