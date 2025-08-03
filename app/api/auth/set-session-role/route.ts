// app/api/auth/set-session-role/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const { email, userType } = await request.json();

    // Use provided email or session email
    const userEmail = email || session?.user?.email;

    if (!userEmail) {
      return NextResponse.json({ error: "No email provided" }, { status: 401 });
    }

    const selectedRole = userType;

    if (!selectedRole || !["hr", "candidate"].includes(selectedRole)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    // Validate that the user exists in the selected role's table
    let userData;
    if (selectedRole === "hr") {
      userData = await db.hrInfo.findUnique({
        where: { email: userEmail },
      });
    } else {
      userData = await db.candidateInfo.findUnique({
        where: { email: userEmail },
      });
    }

    if (!userData) {
      return NextResponse.json(
        {
          error: "User not found in selected role",
          message: `No ${selectedRole} account found with this email.`,
        },
        { status: 404 }
      );
    }

    // Store the selected role in a cookie that will be used to update the session
    const response = NextResponse.json({
      success: true,
      userType: selectedRole,
      name: `${userData.firstName} ${userData.lastName}`,
      id: userData.id,
    });

    // Set a cookie with the selected role for the session callback to read
    response.cookies.set("selectedRole", selectedRole, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 5, // 5 minutes
    });

    return response;
  } catch (error) {
    console.error("Set session role error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
