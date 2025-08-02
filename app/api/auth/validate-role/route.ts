// app/api/auth/validate-role/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const { email, selectedRole } = await request.json();

    if (selectedRole === "candidate") {
      const candidate = await db.candidateInfo.findUnique({
        where: { email },
      });

      if (candidate) {
        return NextResponse.json({ valid: true });
      } else {
        return NextResponse.json({
          valid: false,
          error: "CandidateNotFound",
        });
      }
    }

    if (selectedRole === "hr") {
      const hr = await db.hrInfo.findUnique({
        where: { email },
      });

      if (hr) {
        return NextResponse.json({ valid: true });
      } else {
        return NextResponse.json({
          valid: false,
          error: "HRNotFound",
        });
      }
    }

    return NextResponse.json({
      valid: false,
      error: "InvalidRole",
    });
  } catch (error) {
    return NextResponse.json({
      valid: false,
      error: "ServerError",
    });
  }
}
