import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  uploadFileToS3,
  validateResumeFile,
  generateResumeKey,
  deleteFromS3,
  getCandidateResumeKey,
} from "@/lib/s3-upload";

export async function POST(request: NextRequest) {
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

    const formData = await request.formData();
    const file = formData.get("resume") as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file provided" },
        { status: 400 }
      );
    }

    // Validate file
    const validation = validateResumeFile(file);
    if (!validation.isValid) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 }
      );
    }

    // Generate unique S3 key using candidate ID
    const key = generateResumeKey(file.name, candidate.id);

    // If candidate already has a resume, delete the old one
    if (candidate.resume) {
      try {
        const oldKey = getCandidateResumeKey(candidate.id);
        await deleteFromS3(oldKey);
      } catch (error) {
        console.error("Error deleting old resume:", error);
        // Continue with upload even if deletion fails
      }
    }

    // Upload to S3
    const uploadResult = await uploadFileToS3(file, key, {
      originalName: file.name,
      uploadedBy: session.user.email,
      candidateId: candidate.id.toString(),
    });

    // Update candidate profile with S3 URL
    await db.candidateInfo.update({
      where: { email: session.user.email },
      data: { resume: uploadResult.Location },
    });

    return NextResponse.json({
      success: true,
      message: "Resume uploaded successfully",
      resumeUrl: uploadResult.Location,
    });
  } catch (error) {
    console.error("Error uploading resume:", error);
    return NextResponse.json(
      { success: false, error: "Failed to upload resume" },
      { status: 500 }
    );
  }
}
