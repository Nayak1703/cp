# AWS S3 Setup for Resume Uploads

This guide explains how to configure AWS S3 for resume upload functionality in the career portal.

## Prerequisites

1. AWS Account
2. S3 Bucket created
3. IAM User with S3 permissions

## Environment Variables

Add the following environment variables to your `.env.local` file:

```env
# AWS S3 Configuration
AWS_ACCESS_KEY_ID="your-aws-access-key-id"
AWS_SECRET_ACCESS_KEY="your-aws-secret-access-key"
AWS_REGION="us-east-1"
AWS_S3_BUCKET="your-s3-bucket-name"
```

## AWS S3 Bucket Setup

1. **Create S3 Bucket:**

   - Go to AWS S3 Console
   - Click "Create bucket"
   - Choose a unique bucket name
   - Select your preferred region
   - Keep default settings for now

2. **Configure CORS (Cross-Origin Resource Sharing):**
   - Select your bucket
   - Go to "Permissions" tab
   - Click "CORS configuration"
   - Add the following CORS policy:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "POST", "PUT", "DELETE"],
    "AllowedOrigins": ["http://localhost:3000", "https://yourdomain.com"],
    "ExposeHeaders": []
  }
]
```

3. **Bucket Policy (Optional - for public read access):**
   If you want resumes to be publicly accessible, add this bucket policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::your-bucket-name/*"
    }
  ]
}
```

## IAM User Setup

1. **Create IAM User:**

   - Go to AWS IAM Console
   - Click "Users" → "Add user"
   - Give it a name (e.g., "career-portal-s3")
   - Select "Programmatic access"

2. **Attach Policy:**
   - Create a custom policy or use existing S3 policies
   - Minimum required permissions:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["s3:PutObject", "s3:GetObject", "s3:DeleteObject"],
      "Resource": "arn:aws:s3:::your-bucket-name/*"
    }
  ]
}
```

3. **Get Access Keys:**
   - After creating the user, download the CSV file with access keys
   - Use these keys in your environment variables

## Features

The S3 upload implementation includes:

- **File Validation:** Only PDF files allowed, max 200KB
- **Unique Naming:** Timestamp + original filename
- **Metadata:** Stores original filename, uploader email, and candidate ID
- **Error Handling:** Comprehensive error handling and logging
- **Security:** Proper authentication and authorization checks

## File Structure

Uploaded resumes are stored in the S3 bucket with the following structure:

```
resumes/
├── 1703123456789-resume_john_doe.pdf
├── 1703123456790-resume_jane_smith.pdf
└── ...
```

## Testing

1. Start your development server: `npm run dev`
2. Go to candidate dashboard
3. Try uploading a PDF resume
4. Check your S3 bucket to verify the file was uploaded
5. Verify the resume URL is updated in the database

## Troubleshooting

- **Access Denied:** Check IAM permissions and bucket policy
- **CORS Errors:** Verify CORS configuration in S3 bucket
- **File Not Uploading:** Check environment variables and AWS credentials
- **Large Files:** Ensure file size is under 200KB limit
