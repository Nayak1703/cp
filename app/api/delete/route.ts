import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get("job");

    if (!jobId) {
      return NextResponse.json(
        { success: false, error: "Job ID is required" },
        { status: 400 }
      );
    }

    const jobIdNum = parseInt(jobId);

    if (isNaN(jobIdNum)) {
      return NextResponse.json(
        { success: false, error: "Invalid job ID" },
        { status: 400 }
      );
    }

    // Get current HR user
    const currentHR = await db.hrInfo.findUnique({
      where: { email: session.user.email },
    });

    if (!currentHR) {
      return NextResponse.json(
        { success: false, error: "HR user not found" },
        { status: 404 }
      );
    }

    // Check if job exists
    const existingJob = await db.jobs.findUnique({
      where: { jobId: jobIdNum },
    });

    if (!existingJob) {
      return NextResponse.json(
        { success: false, error: "Job not found" },
        { status: 404 }
      );
    }

    // Check permissions: only job owner or admin/owner can delete
    if (
      existingJob.hrId !== currentHR.id &&
      !["owner", "admin"].includes(currentHR.scope)
    ) {
      return NextResponse.json(
        { success: false, error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    // Delete related records first (cascade delete)
    try {
      // Delete applications for this job
      const deletedApplications = await db.applications.deleteMany({
        where: { jobId: jobIdNum },
      });
      console.log(
        `Deleted ${deletedApplications.count} applications for job ${jobIdNum}`
      );

      // Delete saved jobs for this job
      const deletedSavedJobs = await db.savedJobs.deleteMany({
        where: { jobId: jobIdNum },
      });
      console.log(
        `Deleted ${deletedSavedJobs.count} saved jobs for job ${jobIdNum}`
      );

      // Finally delete the job
      await db.jobs.delete({
        where: { jobId: jobIdNum },
      });
      console.log(`Successfully deleted job ${jobIdNum}`);
    } catch (error) {
      console.error("Error during cascade deletion:", error);
      return NextResponse.json(
        { success: false, error: "Failed to delete job and related records" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Job and all related records deleted successfully",
      deletedJobId: jobIdNum,
      cascadeDeleted: true,
    });
  } catch (error) {
    console.error("Error deleting job:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete job" },
      { status: 500 }
    );
  }
}
