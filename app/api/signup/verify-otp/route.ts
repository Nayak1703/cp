import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const { email, otp } = await request.json();

    if (!email || !otp) {
      return NextResponse.json(
        { error: "Email and OTP are required" },
        { status: 400 }
      );
    }

    // Find OTP record for this email
    const otpRecord = await db.otp.findFirst({
      where: {
        email,
        otp,
      },
    });

    if (!otpRecord) {
      return NextResponse.json(
        { success: false, message: "OTP incorrect." },
        { status: 400 }
      );
    }

    // Check if OTP is expired (older than 30 minutes)
    const now = new Date();
    if (now > otpRecord.expiresAt) {
      // Delete expired OTP
      await db.otp.delete({
        where: { id: otpRecord.id },
      });

      return NextResponse.json(
        {
          success: false,
          message: "OTP has expired. Please request a new one.",
        },
        { status: 400 }
      );
    }

    // OTP is valid! Clean up expired OTPs from database
    await db.otp.deleteMany({
      where: {
        expiresAt: {
          lt: now,
        },
      },
    });

    return NextResponse.json(
      { success: true, message: "OTP verified successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Verify OTP error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
