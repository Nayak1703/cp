// app/api/auth/get-user-data/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "No session found" }, { status: 401 });
    }

    if (!session.user.userType) {
      return NextResponse.json({ error: "No user type set" }, { status: 400 });
    }

    // Get user data based on the userType in session
    let userData;
    if (session.user.userType === "hr") {
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
          error: "User not found",
          message: "User data not found in database.",
        },
        { status: 404 }
      );
    }

    // Return user data based on role
    return NextResponse.json({
      userType: session.user.userType,
      name: `${userData.firstName} ${userData.lastName}`,
      id: userData.id,
      userData: {
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        // Add other relevant fields based on role
        ...(session.user.userType === "hr" && {
          scope: userData.scope,
          designation: userData.designation,
          phoneNo: userData.phoneNo,
        }),
        ...(session.user.userType === "candidate" && {
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
    console.error("Get user data error:", error);
    return NextResponse.json(
      {
        error: "Server error",
        message: "An error occurred while fetching user data.",
      },
      { status: 500 }
    );
  }
}
