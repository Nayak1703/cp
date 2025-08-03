import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Check if email already exists in CandidateInfo table
    const existingCandidate = await db.candidateInfo.findUnique({
      where: { email },
    });

    // Check if email already exists in HrInfo table
    const existingHR = await db.hrInfo.findUnique({
      where: { email },
    });

    if (existingCandidate || existingHR) {
      return NextResponse.json(
        { exists: true, message: "This email is already taken." },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { exists: false, message: "Email is available" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Check email error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
