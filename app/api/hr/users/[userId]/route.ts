import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function PUT(
  request: NextRequest,
  { params }: { params: { userId: string } }
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
    const currentHR = await db.hrInfo.findUnique({
      where: { email: session.user.email },
    });

    if (!currentHR) {
      return NextResponse.json(
        { success: false, error: "HR user not found" },
        { status: 404 }
      );
    }

    // Check if target user exists
    const targetUser = await db.hrInfo.findUnique({
      where: { id: params.userId },
    });

    if (!targetUser) {
      return NextResponse.json(
        { success: false, error: "Target user not found" },
        { status: 404 }
      );
    }

    // Check permissions based on scope hierarchy
    const canManageUser = (currentScope: string, targetScope: string) => {
      const scopeHierarchy = {
        owner: ["admin", "moderator", "participant"],
        admin: ["moderator", "participant"],
        moderator: ["participant"],
        participant: []
      };

      return scopeHierarchy[currentScope as keyof typeof scopeHierarchy]?.includes(targetScope) || false;
    };

    if (!canManageUser(currentHR.scope, targetUser.scope)) {
      return NextResponse.json(
        { success: false, error: "Insufficient permissions to manage this user" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      firstName,
      lastName,
      email,
      phoneNo,
      designation,
      scope,
    } = body;

    // Validate required fields
    if (!firstName || !lastName || !email || !designation || !scope) {
      return NextResponse.json(
        { success: false, error: "All required fields must be provided" },
        { status: 400 }
      );
    }

    // Check if email already exists (excluding current user)
    const existingUser = await db.hrInfo.findFirst({
      where: {
        email,
        id: { not: params.userId },
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: "Email already exists" },
        { status: 400 }
      );
    }

    // Check if new scope is within current user's permission
    if (!canManageUser(currentHR.scope, scope)) {
      return NextResponse.json(
        { success: false, error: "Cannot assign scope higher than your permission level" },
        { status: 403 }
      );
    }

    // Update HR user
    const updatedHR = await db.hrInfo.update({
      where: { id: params.userId },
      data: {
        firstName,
        lastName,
        email,
        phoneNo: phoneNo || null,
        designation,
        scope,
      },
    });

    return NextResponse.json({
      success: true,
      message: "HR user updated successfully",
      user: {
        id: updatedHR.id,
        firstName: updatedHR.firstName,
        lastName: updatedHR.lastName,
        email: updatedHR.email,
        scope: updatedHR.scope,
        designation: updatedHR.designation,
        phoneNo: updatedHR.phoneNo,
      },
    });
  } catch (error) {
    console.error("Error updating HR user:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update HR user" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { userId: string } }
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
    const currentHR = await db.hrInfo.findUnique({
      where: { email: session.user.email },
    });

    if (!currentHR) {
      return NextResponse.json(
        { success: false, error: "HR user not found" },
        { status: 404 }
      );
    }

    // Check if target user exists
    const targetUser = await db.hrInfo.findUnique({
      where: { id: params.userId },
    });

    if (!targetUser) {
      return NextResponse.json(
        { success: false, error: "Target user not found" },
        { status: 404 }
      );
    }

    // Prevent self-deletion
    if (targetUser.id === currentHR.id) {
      return NextResponse.json(
        { success: false, error: "Cannot delete your own account" },
        { status: 400 }
      );
    }

    // Check permissions based on scope hierarchy
    const canManageUser = (currentScope: string, targetScope: string) => {
      const scopeHierarchy = {
        owner: ["admin", "moderator", "participant"],
        admin: ["moderator", "participant"],
        moderator: ["participant"],
        participant: []
      };

      return scopeHierarchy[currentScope as keyof typeof scopeHierarchy]?.includes(targetScope) || false;
    };

    if (!canManageUser(currentHR.scope, targetUser.scope)) {
      return NextResponse.json(
        { success: false, error: "Insufficient permissions to delete this user" },
        { status: 403 }
      );
    }

    // Delete HR user
    await db.hrInfo.delete({
      where: { id: params.userId },
    });

    return NextResponse.json({
      success: true,
      message: "HR user deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting HR user:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete HR user" },
      { status: 500 }
    );
  }
} 