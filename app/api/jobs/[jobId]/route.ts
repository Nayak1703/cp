import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const { jobId: jobIdParam } = await params;
    const jobId = parseInt(jobIdParam);

    if (isNaN(jobId)) {
      return NextResponse.json(
        { success: false, error: "Invalid job ID" },
        { status: 400 }
      );
    }

    // Fetch specific job by ID
    const job = await db.jobs.findUnique({
      where: {
        jobId: jobId,
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

    if (!job) {
      return NextResponse.json(
        { success: false, error: "Job not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      job: job,
    });
  } catch (error) {
    console.error("Error fetching job:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch job" },
      { status: 500 }
    );
  }
}
