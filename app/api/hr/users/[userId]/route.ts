import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ userId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check if current user exists in HR table
    const currentUser = await db.hrInfo.findUnique({
      where: { email: session.user.email },
    });

    if (!currentUser) {
      return NextResponse.json(
        { success: false, error: "HR user not found" },
        { status: 404 }
      );
    }

    const { userId } = await context.params;

    // Check if user has permission to view this user
    if (currentUser.scope === "participant") {
      return NextResponse.json(
        { success: false, error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    // Get the target user
    const targetUser = await db.hrInfo.findUnique({
      where: { id: userId },
    });

    if (!targetUser) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    // Check if current user has permission to view this user based on scope hierarchy
    const scopeHierarchy: Record<string, string[]> = {
      owner: ["admin", "moderator", "participant"],
      admin: ["moderator", "participant"],
      moderator: ["participant"],
      participant: [],
    };

    const canView =
      scopeHierarchy[currentUser.scope]?.includes(targetUser.scope) ||
      currentUser.id === targetUser.id;

    if (!canView) {
      return NextResponse.json(
        { success: false, error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    // Remove sensitive information
    const { password, ...userData } = targetUser;

    return NextResponse.json({
      success: true,
      user: userData,
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch user" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ userId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check if current user exists in HR table
    const currentUser = await db.hrInfo.findUnique({
      where: { email: session.user.email },
    });

    if (!currentUser) {
      return NextResponse.json(
        { success: false, error: "HR user not found" },
        { status: 404 }
      );
    }

    const { userId } = await context.params;
    const body = await request.json();
    const { firstName, lastName, email, phoneNo, designation, scope } = body;

    // Validate required fields
    if (!firstName || !lastName || !email || !designation || !scope) {
      return NextResponse.json(
        { success: false, error: "All required fields must be provided" },
        { status: 400 }
      );
    }

    // Check if user has permission to edit this user
    if (currentUser.scope === "participant") {
      return NextResponse.json(
        { success: false, error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    // Get the target user
    const targetUser = await db.hrInfo.findUnique({
      where: { id: userId },
    });

    if (!targetUser) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    // Check if current user has permission to edit this user based on scope hierarchy
    const scopeHierarchy: Record<string, string[]> = {
      owner: ["admin", "moderator", "participant"],
      admin: ["moderator", "participant"],
      moderator: ["participant"],
      participant: [],
    };

    const canEdit =
      scopeHierarchy[currentUser.scope]?.includes(targetUser.scope) ||
      currentUser.id === targetUser.id;

    if (!canEdit) {
      return NextResponse.json(
        { success: false, error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    // Check if email is already taken by another user
    if (email !== targetUser.email) {
      const existingUser = await db.hrInfo.findFirst({
        where: {
          email,
          id: { not: userId },
        },
      });

      if (existingUser) {
        return NextResponse.json(
          { success: false, error: "Email already exists" },
          { status: 400 }
        );
      }
    }

    // Update user
    const updatedUser = await db.hrInfo.update({
      where: { id: userId },
      data: {
        firstName,
        lastName,
        email,
        phoneNo: phoneNo || null,
        designation,
        scope,
      },
    });

    // Remove sensitive information
    const { password, ...userData } = updatedUser;

    return NextResponse.json({
      success: true,
      user: userData,
      message: "User updated successfully",
    });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update user" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ userId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check if current user exists in HR table
    const currentUser = await db.hrInfo.findUnique({
      where: { email: session.user.email },
    });

    if (!currentUser) {
      return NextResponse.json(
        { success: false, error: "HR user not found" },
        { status: 404 }
      );
    }

    const { userId } = await context.params;

    // Check if user has permission to delete users
    if (currentUser.scope === "participant") {
      return NextResponse.json(
        { success: false, error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    // Get the target user
    const targetUser = await db.hrInfo.findUnique({
      where: { id: userId },
    });

    if (!targetUser) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    // Check if current user has permission to delete this user based on scope hierarchy
    const scopeHierarchy: Record<string, string[]> = {
      owner: ["admin", "moderator", "participant"],
      admin: ["moderator", "participant"],
      moderator: ["participant"],
      participant: [],
    };

    const canDelete = scopeHierarchy[currentUser.scope]?.includes(
      targetUser.scope
    );

    if (!canDelete) {
      return NextResponse.json(
        { success: false, error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    // Prevent self-deletion
    if (currentUser.id === targetUser.id) {
      return NextResponse.json(
        { success: false, error: "Cannot delete your own account" },
        { status: 400 }
      );
    }

    // Delete user
    await db.hrInfo.delete({
      where: { id: userId },
    });

    return NextResponse.json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete user" },
      { status: 500 }
    );
  }
}
