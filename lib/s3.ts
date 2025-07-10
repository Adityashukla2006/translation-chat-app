import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

export const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function uploadToS3(fileBuffer: Buffer, fileName: string, mimeType: string) {
  const bucketName = process.env.S3_BUCKET_NAME!;
  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: fileName,
    Body: fileBuffer,
    ContentType: mimeType,
  });

  await s3.send(command);

  return `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
}
