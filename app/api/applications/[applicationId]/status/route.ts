import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ applicationId: string }> }
) {
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

    const { applicationId } = await context.params;
    const body = await request.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json(
        { success: false, error: "Status is required" },
        { status: 400 }
      );
    }

    // Validate status
    const validStatuses = ["REVIEWING", "SHORTLISTED", "REJECTED"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, error: "Invalid status" },
        { status: 400 }
      );
    }

    // Update application status
    const updatedApplication = await db.applications.update({
      where: { applicationId },
      data: { applicationStatus: status },
      include: {
        candidate: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        job: {
          select: {
            role: true,
            designation: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      application: updatedApplication,
      message: `Application status updated to ${status}`,
    });
  } catch (error) {
    console.error("Error updating application status:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update application status" },
      { status: 500 }
    );
  }
}
