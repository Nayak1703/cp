// app/api/auth/validate-role/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const { email, selectedRole } = await request.json();

    console.log("Validating role:", { email, selectedRole });

    if (selectedRole === "candidate") {
      const candidate = await db.candidateInfo.findUnique({
        where: { email },
      });

      if (candidate) {
        console.log("Candidate found:", candidate.email);
        return NextResponse.json({ valid: true });
      } else {
        console.log("Candidate not found for email:", email);

        // For Google OAuth users, create a new candidate account
        try {
          const newCandidate = await db.candidateInfo.create({
            data: {
              email,
              firstName: "Google", // Default values, user can update later
              lastName: "User",
              password: "google-oauth-user", // Placeholder password for OAuth users
            },
          });
          console.log(
            "Created new candidate for Google OAuth:",
            newCandidate.email
          );
          return NextResponse.json({ valid: true, created: true });
        } catch (error) {
          console.error("Error creating candidate:", error);
          return NextResponse.json({
            valid: false,
            error: "FailedToCreateCandidate",
          });
        }
      }
    }

    if (selectedRole === "hr") {
      const hr = await db.hrInfo.findUnique({
        where: { email },
      });

      if (hr) {
        console.log("HR found:", hr.email);
        return NextResponse.json({ valid: true });
      } else {
        console.log("HR not found for email:", email);

        // For Google OAuth users, create a new HR account
        try {
          const newHR = await db.hrInfo.create({
            data: {
              email,
              firstName: "Google", // Default values, user can update later
              lastName: "HR",
              password: "google-oauth-user", // Placeholder password for OAuth users
              scope: "general", // Default scope
              designation: "HR Manager", // Default designation
            },
          });
          console.log("Created new HR for Google OAuth:", newHR.email);
          return NextResponse.json({ valid: true, created: true });
        } catch (error) {
          console.error("Error creating HR:", error);
          return NextResponse.json({
            valid: false,
            error: "FailedToCreateHR",
          });
        }
      }
    }

    return NextResponse.json({
      valid: false,
      error: "InvalidRole",
    });
  } catch (_error) {
    console.error("Error validating role:", _error);
    return NextResponse.json({
      valid: false,
      error: "ServerError",
    });
  }
}
