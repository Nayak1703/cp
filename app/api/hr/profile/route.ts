import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function DELETE() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Find the HR user first
    const hr = await db.hrInfo.findUnique({
      where: { email: session.user.email },
    });

    if (!hr) {
      return NextResponse.json(
        { success: false, error: "HR user not found" },
        { status: 404 }
      );
    }

    // Delete related records first (cascade delete)
    // Delete jobs posted by this HR
    await db.jobs.deleteMany({
      where: { hrId: hr.id },
    });

    // Finally delete the HR user
    await db.hrInfo.delete({
      where: { email: session.user.email },
    });

    // Create response with success message
    const response = NextResponse.json({
      success: true,
      message: "Profile deleted successfully",
    });

    // Clear any session cookies if they exist
    response.cookies.set("next-auth.session-token", "", {
      expires: new Date(0),
      path: "/",
    });
    response.cookies.set("__Secure-next-auth.session-token", "", {
      expires: new Date(0),
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Error deleting HR profile:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete profile" },
      { status: 500 }
    );
  }
}
