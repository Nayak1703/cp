// app/api/auth/validate-user-role/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "No session found" }, { status: 401 });
    }

    const { requestedRole } = await request.json();

    if (!requestedRole || !["hr", "candidate"].includes(requestedRole)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    // Check if user exists in the requested role's table
    let userData;
    if (requestedRole === "hr") {
      userData = await db.hrInfo.findUnique({
        where: { email: session.user.email },
      });
    } else {
      userData = await db.candidateInfo.findUnique({
        where: { email: session.user.email },
      });
    }

    if (!userData) {
      return NextResponse.json(
        {
          valid: false,
          error: "User not found in requested role",
          message: `No ${requestedRole} account found with this email.`,
        },
        { status: 404 }
      );
    }

    // User exists in the requested role's table
    return NextResponse.json({
      valid: true,
      userType: requestedRole,
      name: `${userData.firstName} ${userData.lastName}`,
      id: userData.id,
      userData: {
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        // Add other relevant fields based on role
        ...(requestedRole === "hr" && {
          scope: userData.scope,
          designation: userData.designation,
          phoneNo: userData.phoneNo,
        }),
        ...(requestedRole === "candidate" && {
          age: userData.age,
          currentRole: userData.currentRole,
          totalExperience: userData.totalExperience,
          location: userData.location,
          expectedCTC: userData.expectedCTC,
          skills: userData.skills,
          portfolioLink: userData.portfolioLink,
          githubLink: userData.githubLink,
          linkedinLink: userData.linkedinLink,
          twitterLink: userData.twitterLink,
          resume: userData.resume,
          readyToRelocate: userData.readyToRelocate,
        }),
      },
    });
  } catch (error) {
    console.error("Validate user role error:", error);
    return NextResponse.json(
      {
        error: "Server error",
        message: "An error occurred while validating your role.",
      },
      { status: 500 }
    );
  }
}
