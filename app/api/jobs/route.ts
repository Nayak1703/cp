import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

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

    // Build where clause
    const where: any = {};
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
