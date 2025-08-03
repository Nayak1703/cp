import AWS from "aws-sdk";

// Configure AWS
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || "us-east-1",
});

const s3 = new AWS.S3();

// Helper function to delete file from S3
export const deleteFromS3 = async (key: string): Promise<void> => {
  try {
    await s3
      .deleteObject({
        Bucket: process.env.AWS_S3_BUCKET!,
        Key: key,
      })
      .promise();
  } catch (error) {
    console.error("Error deleting file from S3:", error);
    throw error;
  }
};

// Helper function to get S3 URL
export const getS3Url = (key: string): string => {
  return `https://${process.env.AWS_S3_BUCKET}.s3.${
    process.env.AWS_REGION || "us-east-1"
  }.amazonaws.com/${key}`;
};

// Helper function to upload file to S3
export const uploadFileToS3 = async (
  file: File,
  key: string,
  metadata?: Record<string, string>
): Promise<AWS.S3.ManagedUpload.SendData> => {
  try {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadParams: AWS.S3.PutObjectRequest = {
      Bucket: process.env.AWS_S3_BUCKET!,
      Key: key,
      Body: buffer,
      ContentType: file.type,
      Metadata: metadata || {},
    };

    return await s3.upload(uploadParams).promise();
  } catch (error) {
    console.error("Error uploading file to S3:", error);
    throw new Error("Failed to upload file to S3");
  }
};

// Helper function to validate file
export const validateResumeFile = (
  file: File
): { isValid: boolean; error?: string } => {
  // Check file type
  if (file.type !== "application/pdf") {
    return { isValid: false, error: "Only PDF files are allowed" };
  }

  // Check file size (200KB = 200 * 1024 bytes)
  if (file.size > 200 * 1024) {
    return { isValid: false, error: "File size must be less than 200KB" };
  }

  return { isValid: true };
};

// Helper function to generate unique S3 key for resumes using candidate ID
export const generateResumeKey = (
  originalName: string,
  candidateId: string
): string => {
  return `resumes/${candidateId}.pdf`;
};

// Helper function to extract key from S3 URL
export const extractKeyFromS3Url = (url: string): string | null => {
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split("/");
    // Remove the first empty element and bucket name
    const keyParts = pathParts.slice(2);
    return keyParts.join("/");
  } catch (error) {
    console.error("Error extracting key from S3 URL:", error);
    return null;
  }
};

// Helper function to generate resume key for a specific candidate
export const getCandidateResumeKey = (candidateId: string): string => {
  return `resumes/${candidateId}.pdf`;
};
