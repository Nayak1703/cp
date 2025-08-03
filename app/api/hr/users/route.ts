import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check if current user exists in HR table
    const currentHR = await db.hrInfo.findUnique({
      where: { email: session.user.email },
    });

    if (!currentHR) {
      return NextResponse.json(
        { success: false, error: "HR user not found" },
        { status: 404 }
      );
    }

    // All HR users can view the list, but with different permissions

    // Fetch all HR users
    const users = await db.hrInfo.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        scope: true,
        designation: true,
        phoneNo: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      users,
    });
  } catch (error) {
    console.error("Error fetching HR users:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch HR users" },
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

    // Check if current user exists in HR table and has owner scope
    const currentHR = await db.hrInfo.findUnique({
      where: { email: session.user.email },
    });

    if (!currentHR) {
      return NextResponse.json(
        { success: false, error: "HR user not found" },
        { status: 404 }
      );
    }

    if (currentHR.scope !== "owner") {
      return NextResponse.json(
        { success: false, error: "Only owners can add HR users" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      firstName,
      lastName,
      email,
      password,
      phoneNo,
      designation,
      scope,
    } = body;

    // Validate required fields
    if (!firstName || !lastName || !email || !password || !designation || !scope) {
      return NextResponse.json(
        { success: false, error: "All required fields must be provided" },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingUser = await db.hrInfo.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: "Email already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create new HR user
    const newHR = await db.hrInfo.create({
      data: {
        firstName,
        lastName,
        email,
        password: hashedPassword,
        phoneNo: phoneNo || null,
        designation,
        scope,
      },
    });

    return NextResponse.json({
      success: true,
      message: "HR user created successfully",
      user: {
        id: newHR.id,
        firstName: newHR.firstName,
        lastName: newHR.lastName,
        email: newHR.email,
        scope: newHR.scope,
        designation: newHR.designation,
        phoneNo: newHR.phoneNo,
      },
    });
  } catch (error) {
    console.error("Error creating HR user:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create HR user" },
      { status: 500 }
    );
  }
}
