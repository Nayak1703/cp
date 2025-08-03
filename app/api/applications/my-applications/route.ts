import { NextResponse } from "next/server";
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

    // Fetch applications with job details
    const applications = await db.applications.findMany({
      where: { candidateId: candidate.id },
      include: {
        job: {
          include: {
            hr: {
              select: {
                firstName: true,
                lastName: true,
                designation: true,
              },
            },
          },
        },
      },
      orderBy: { appliedOn: "desc" },
    });

    return NextResponse.json({
      success: true,
      applications,
      count: applications.length,
    });
  } catch (error) {
    console.error("Error fetching applications:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch applications" },
      { status: 500 }
    );
  }
}
