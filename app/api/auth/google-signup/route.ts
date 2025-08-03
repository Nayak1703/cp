import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: "No session found" },
        { status: 401 }
      );
    }

    // Check if user already exists
    const [candidate, hr] = await Promise.all([
      db.candidateInfo.findUnique({
        where: { email: session.user.email },
      }),
      db.hrInfo.findUnique({
        where: { email: session.user.email },
      }),
    ]);

    if (candidate || hr) {
      return NextResponse.json(
        { success: false, error: "User already exists" },
        { status: 400 }
      );
    }

    // Extract name from Google OAuth
    let firstName = "Google";
    let lastName = "User";

    if (session.user.name) {
      const nameParts = session.user.name.split(" ");
      firstName = nameParts[0] || "Google";
      lastName = nameParts.slice(1).join(" ") || "User";
    }

    // Create new candidate account
    const newCandidate = await db.candidateInfo.create({
      data: {
        email: session.user.email,
        firstName,
        lastName,
        password: "google-oauth-user",
      },
    });

    console.log("Google OAuth Signup - Created candidate:", newCandidate.id);

    return NextResponse.json({
      success: true,
      message: "Candidate account created successfully",
      redirectUrl: "/login",
    });
  } catch (error) {
    console.error("Google OAuth signup error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create account" },
      { status: 500 }
    );
  }
}
