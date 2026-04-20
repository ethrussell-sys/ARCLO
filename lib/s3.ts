import { S3Client, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})

const TWENTY_FOUR_HOURS = 60 * 60 * 24
const ONE_HOUR = 60 * 60

export async function presignedDownloadUrl(fileKey: string): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME!,
    Key: fileKey,
  })
  return getSignedUrl(s3, command, { expiresIn: TWENTY_FOUR_HOURS })
}

export async function presignedUploadUrl(fileKey: string, contentType: string): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME!,
    Key: fileKey,
    ContentType: contentType,
  })
  return getSignedUrl(s3, command, { expiresIn: ONE_HOUR })
}
