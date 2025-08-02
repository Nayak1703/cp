import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Extract filter parameters
    const jobStatus = searchParams.get("jobStatus");
    const department = searchParams.get("department");
    const location = searchParams.get("location");
    const experience = searchParams.get("experience");

    // Build where clause
    const where: Record<string, string> = {};

    if (jobStatus) {
      where.jobStatus = jobStatus.toUpperCase();
    }

    if (department) {
      where.department = department.toUpperCase();
    }

    if (location) {
      where.location = location.toUpperCase();
    }

    if (experience) {
      // Map experience numbers to enum values
      const expMap: { [key: string]: string } = {
        "1": "LESS_THAN_2",
        "2": "TWO_TO_FIVE",
        "3": "FIVE_TO_EIGHT",
        "4": "EIGHT_TO_TWELVE",
        "5": "MORE_THAN_12",
      };
      where.experience = expMap[experience];
    }

    // Fetch jobs from database
    const jobs = await prisma.jobs.findMany({
      where,
      include: {
        hr: {
          select: {
            firstName: true,
            lastName: true,
            designation: true,
          },
        },
      },
      orderBy: {
        postedOn: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      jobs: jobs,
      count: jobs.length,
    });
  } catch (error) {
    console.error("Error fetching jobs:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch jobs" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Build where clause from POST body
    const where: Record<string, string> = {};

    if (body.jobStatus) {
      where.jobStatus = body.jobStatus.toUpperCase();
    }

    if (body.department) {
      where.department = body.department.toUpperCase();
    }

    if (body.location) {
      where.location = body.location.toUpperCase();
    }

    if (body.experience) {
      const expMap: { [key: string]: string } = {
        "1": "LESS_THAN_2",
        "2": "TWO_TO_FIVE",
        "3": "FIVE_TO_EIGHT",
        "4": "EIGHT_TO_TWELVE",
        "5": "MORE_THAN_12",
      };
      where.experience = expMap[body.experience];
    }

    const jobs = await prisma.jobs.findMany({
      where,
      include: {
        hr: {
          select: {
            firstName: true,
            lastName: true,
            designation: true,
          },
        },
      },
      orderBy: {
        postedOn: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      jobs: jobs,
      count: jobs.length,
    });
  } catch (error) {
    console.error("Error fetching jobs:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch jobs" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
