import AWS from "aws-sdk";
import multer from "multer";
import multerS3 from "multer-s3";

// Configure AWS
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || "us-east-1",
});

const s3 = new AWS.S3();

// Configure multer for S3 upload
export const uploadToS3 = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.AWS_S3_BUCKET!,
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    key: function (req, file, cb) {
      // Generate unique filename with timestamp and original name
      const timestamp = Date.now().toString();
      const originalName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, "_");
      cb(null, `resumes/${timestamp}-${originalName}`);
    },
  }),
  limits: {
    fileSize: 200 * 1024, // 200KB limit
  },
  fileFilter: (req, file, cb) => {
    // Only allow PDF files
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed"));
    }
  },
});

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

// Helper function to generate unique S3 key for resumes
export const generateResumeKey = (originalName: string): string => {
  const timestamp = Date.now().toString();
  const sanitizedName = originalName.replace(/[^a-zA-Z0-9.-]/g, "_");
  return `resumes/${timestamp}-${sanitizedName}`;
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
