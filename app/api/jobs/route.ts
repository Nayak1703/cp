import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { Experience, Department, Location } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Pagination
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "6", 10);
    const skip = (page - 1) * limit;

    // Extract filter parameters
    const jobStatus = searchParams.get("jobStatus");
    const department = searchParams.get("department");
    const location = searchParams.get("location");
    const experience = searchParams.get("experience");
    const hrEmail = searchParams.get("hrEmail");

    // Build where clause
    const where: Record<string, string | { id: string }> = {};
    if (jobStatus) where.jobStatus = jobStatus.toUpperCase();
    if (department) where.department = department.toUpperCase();
    if (location) where.location = location.toUpperCase();
    if (experience) {
      const expMap: { [key: string]: string } = {
        "1": "LESS_THAN_2",
        "2": "TWO_TO_FIVE",
        "3": "FIVE_TO_EIGHT",
        "4": "EIGHT_TO_TWELVE",
        "5": "MORE_THAN_12",
      };
      where.experience = expMap[experience];
    }

    // If hrEmail is provided, filter by HR user
    if (hrEmail) {
      const hrUser = await db.hrInfo.findUnique({
        where: { email: hrEmail },
      });
      if (hrUser) {
        where.hrId = hrUser.id;
      }
    }

    // Count total jobs for pagination
    const totalCount = await db.jobs.count({ where });

    // Fetch jobs with pagination
    const jobs = await db.jobs.findMany({
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
      orderBy: { postedOn: "desc" },
      skip,
      take: limit,
    });

    return NextResponse.json({
      success: true,
      jobs,
      count: jobs.length,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
    });
  } catch (error) {
    console.error("Error fetching jobs:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch jobs" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check if user exists in HR table
    const hrUser = await db.hrInfo.findUnique({
      where: { email: session.user.email },
    });

    if (!hrUser) {
      return NextResponse.json(
        { success: false, error: "HR user not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const {
      role,
      designation,
      experience,
      department,
      location,
      jobDescription,
    } = body;

    // Validate required fields
    if (
      !role ||
      !designation ||
      !experience ||
      !department ||
      !location ||
      !jobDescription
    ) {
      return NextResponse.json(
        { success: false, error: "All fields are required" },
        { status: 400 }
      );
    }

    // Create new job
    const newJob = await db.jobs.create({
      data: {
        role,
        designation,
        experience: experience as Experience,
        department: department as Department,
        location: location as Location,
        jobDescription,
        hrId: hrUser.id,
        jobStatus: "ACTIVE",
      },
      include: {
        hr: {
          select: {
            firstName: true,
            lastName: true,
            designation: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      job: newJob,
    });
  } catch (error) {
    console.error("Error creating job:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create job" },
      { status: 500 }
    );
  }
}
