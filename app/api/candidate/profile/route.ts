import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
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

    return NextResponse.json({
      success: true,
      profile: candidate,
    });
  } catch (error) {
    console.error("Error fetching candidate profile:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      firstName,
      lastName,
      age,
      currentRole,
      totalExperience,
      location,
      expectedCTC,
      skills,
      education,
      work,
      portfolioLink,
      githubLink,
      linkedinLink,
      twitterLink,
      readyToRelocate,
    } = body;

    // Validate required fields
    if (!firstName || !lastName) {
      return NextResponse.json(
        { success: false, error: "First name and last name are required" },
        { status: 400 }
      );
    }

    // Update candidate profile
    const updatedCandidate = await db.candidateInfo.update({
      where: { email: session.user.email },
      data: {
        firstName,
        lastName,
        age: age ? parseInt(age) : null,
        currentRole,
        totalExperience,
        location,
        expectedCTC: expectedCTC ? expectedCTC.toString() : null,
        skills,
        education,
        work,
        portfolioLink,
        githubLink,
        linkedinLink,
        twitterLink,
        readyToRelocate: readyToRelocate || false,
      },
    });

    return NextResponse.json({
      success: true,
      profile: updatedCandidate,
      message: "Profile updated successfully",
    });
  } catch (error) {
    console.error("Error updating candidate profile:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update profile" },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Find the candidate first
    const candidate = await db.candidateInfo.findUnique({
      where: { email: session.user.email },
    });

    if (!candidate) {
      return NextResponse.json(
        { success: false, error: "Candidate not found" },
        { status: 404 }
      );
    }

    // Delete related records first (cascade delete)
    // Delete applications
    await db.applications.deleteMany({
      where: { candidateId: candidate.id },
    });

    // Delete saved jobs
    await db.savedJobs.deleteMany({
      where: { candidateId: candidate.id },
    });

    // Finally delete the candidate
    await db.candidateInfo.delete({
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
    console.error("Error deleting candidate profile:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete profile" },
      { status: 500 }
    );
  }
}
