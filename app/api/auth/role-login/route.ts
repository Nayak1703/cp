import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    const { email, password, userType } = await request.json();

    if (!email || !password || !userType) {
      return NextResponse.json(
        {
          error: "missing_fields",
          message: "Email, password, and user type are required",
        },
        { status: 400 }
      );
    }

    if (!["candidate", "hr"].includes(userType)) {
      return NextResponse.json(
        { error: "invalid_role", message: "Invalid user type" },
        { status: 400 }
      );
    }

    // Check the selected table first
    if (userType === "candidate") {
      const candidate = await db.candidateInfo.findUnique({
        where: { email },
      });

      if (candidate) {
        // Found in candidate table - validate password
        if (candidate.password === "google-oauth") {
          return NextResponse.json(
            {
              error: "google_oauth",
              message:
                "This account was created with Google. Please sign in with Google.",
            },
            { status: 400 }
          );
        }

        const isPasswordValid = await bcrypt.compare(
          password,
          candidate.password
        );

        if (!isPasswordValid) {
          return NextResponse.json(
            {
              error: "invalid_credentials",
              message: "Invalid email or password",
            },
            { status: 401 }
          );
        }

        // Success - candidate login
        return NextResponse.json(
          {
            success: true,
            userType: "candidate",
            message: "Login successful",
          },
          { status: 200 }
        );
      }

      // Email not found in either table
      return NextResponse.json(
        {
          error: "not_found",
          message:
            "No candidate account found with this email. Please check your email or sign up.",
        },
        { status: 404 }
      );
    }

    // userType === 'hr'
    if (userType === "hr") {
      const hr = await db.hrInfo.findUnique({
        where: { email },
      });

      if (hr) {
        // Found in HR table - validate password
        if (hr.password === "google-oauth") {
          return NextResponse.json(
            {
              error: "google_oauth",
              message:
                "This HR account uses Google OAuth. Please contact your administrator.",
            },
            { status: 400 }
          );
        }

        const isPasswordValid = await bcrypt.compare(password, hr.password);

        if (!isPasswordValid) {
          return NextResponse.json(
            {
              error: "invalid_credentials",
              message: "Invalid email or password",
            },
            { status: 401 }
          );
        }

        // Success - HR login
        return NextResponse.json(
          {
            success: true,
            userType: "hr",
            message: "HR login successful",
          },
          { status: 200 }
        );
      }

      // Email not found in either table
      return NextResponse.json(
        {
          error: "not_found",
          message:
            "No HR account found with this email. Please contact your administrator.",
        },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error("Role-based login error:", error);
    return NextResponse.json(
      { error: "server_error", message: "Internal server error" },
      { status: 500 }
    );
  }
}
