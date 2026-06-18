import { getHienTruongServiceStatus } from '@/lib/hien-truong/errors'

export async function GET() {
  const status = getHienTruongServiceStatus()
  return Response.json({ data: status, error: null })
}
