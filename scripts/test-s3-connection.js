const AWS = require("aws-sdk");
require("dotenv").config({ path: ".env.local" });

// Configure AWS
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || "us-east-1",
});

const s3 = new AWS.S3();

async function testS3Connection() {
  try {
    console.log("Testing AWS S3 connection...");
    console.log("Bucket:", process.env.AWS_S3_BUCKET);
    console.log("Region:", process.env.AWS_REGION || "us-east-1");

    // Test bucket access
    const bucketParams = {
      Bucket: process.env.AWS_S3_BUCKET,
    };

    const result = await s3.headBucket(bucketParams).promise();
    console.log("✅ Successfully connected to S3 bucket!");

    // List objects in the bucket
    const listParams = {
      Bucket: process.env.AWS_S3_BUCKET,
      MaxKeys: 10,
    };

    const objects = await s3.listObjectsV2(listParams).promise();
    console.log(`📁 Found ${objects.Contents?.length || 0} objects in bucket`);

    if (objects.Contents && objects.Contents.length > 0) {
      console.log("Recent objects:");
      objects.Contents.slice(0, 5).forEach((obj) => {
        console.log(`  - ${obj.Key} (${obj.Size} bytes)`);
      });
    }
  } catch (error) {
    console.error("❌ Error testing S3 connection:", error.message);

    if (error.code === "NoSuchBucket") {
      console.log("💡 The bucket does not exist. Please create it first.");
    } else if (error.code === "AccessDenied") {
      console.log(
        "💡 Access denied. Check your AWS credentials and permissions."
      );
    } else if (error.code === "InvalidAccessKeyId") {
      console.log("💡 Invalid access key. Check your AWS_ACCESS_KEY_ID.");
    } else if (error.code === "SignatureDoesNotMatch") {
      console.log("💡 Invalid secret key. Check your AWS_SECRET_ACCESS_KEY.");
    }
  }
}

// Run the test
testS3Connection();
