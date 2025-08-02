import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const { email, name, role } = await request.json();

    if (!email || !name || !role) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Split name into firstName and lastName
    const nameParts = name.trim().split(" ");
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ") || "";

    if (role === "candidate") {
      // Check if candidate already exists
      const existingCandidate = await db.candidateInfo.findUnique({
        where: { email },
      });

      if (existingCandidate) {
        return NextResponse.json(
          { success: false, error: "Candidate already exists" },
          { status: 409 }
        );
      }

      // Create new candidate account
      const candidate = await db.candidateInfo.create({
        data: {
          email,
          firstName,
          lastName,
          password: "google_oauth_user", // Placeholder password for OAuth users
        },
      });

      return NextResponse.json({
        success: true,
        user: {
          id: candidate.id,
          email: candidate.email,
          name: `${candidate.firstName} ${candidate.lastName}`,
          userType: "candidate",
        },
      });
    }

    if (role === "hr") {
      // Check if HR already exists
      const existingHR = await db.hrInfo.findUnique({
        where: { email },
      });

      if (existingHR) {
        return NextResponse.json(
          { success: false, error: "HR user already exists" },
          { status: 409 }
        );
      }

      // Create new HR account
      const hr = await db.hrInfo.create({
        data: {
          email,
          firstName,
          lastName,
          password: "google_oauth_user", // Placeholder password for OAuth users
          scope: "General",
          designation: "HR Manager",
        },
      });

      return NextResponse.json({
        success: true,
        user: {
          id: hr.id,
          email: hr.email,
          name: `${hr.firstName} ${hr.lastName}`,
          userType: "hr",
        },
      });
    }

    return NextResponse.json(
      { success: false, error: "Invalid role" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error creating Google user:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create user account" },
      { status: 500 }
    );
  }
}
