import { randomUUID } from 'crypto'
import { presignedUploadUrl } from '@/lib/s3'

export async function POST(request: Request) {
  const { filename, contentType } = await request.json()

  if (!filename || !contentType) {
    return Response.json({ error: 'filename and contentType required' }, { status: 400 })
  }

  const ext = filename.split('.').pop() ?? 'mp4'
  const fileKey = `submissions/${randomUUID()}.${ext}`

  const uploadUrl = await presignedUploadUrl(fileKey, contentType)

  return Response.json({ uploadUrl, fileKey })
}
