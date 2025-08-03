import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    const { firstName, lastName, email, password, confirmPassword } =
      await request.json();

    // Validate required fields
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // Check if passwords match
    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: "Passwords do not match" },
        { status: 400 }
      );
    }

    // Check if email already exists in CandidateInfo table (double-check)
    const existingCandidate = await db.candidateInfo.findUnique({
      where: { email },
    });

    // Check if email already exists in HrInfo table (double-check)
    const existingHR = await db.hrInfo.findUnique({
      where: { email },
    });

    if (existingCandidate || existingHR) {
      return NextResponse.json(
        { error: "This email is already taken." },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create candidate record
    const candidate = await db.candidateInfo.create({
      data: {
        firstName,
        lastName,
        email,
        password: hashedPassword,
        // All other fields will be null initially as per requirements
      },
    });

    // Delete the used OTP
    await db.otp.deleteMany({
      where: { email },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Signup completed successfully!",
        candidateId: candidate.id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Complete signup error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
