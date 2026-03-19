import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

export async function POST(req: NextRequest) {
  const apiKey = process.env.REMOVE_BG_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'API key not configured', code: 'NO_API_KEY' }, { status: 500 })
  }

  let formData: FormData
  try {
    formData = await req.formData()
  } catch {
    return NextResponse.json({ error: 'Invalid request', code: 'INVALID_REQUEST' }, { status: 400 })
  }

  const image = formData.get('image') as File | null
  if (!image) {
    return NextResponse.json({ error: 'No image provided', code: 'NO_IMAGE' }, { status: 400 })
  }

  if (image.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: 'File too large (max 10MB)', code: 'FILE_TOO_LARGE' }, { status: 400 })
  }

  const body = new FormData()
  body.append('image_file', image)
  body.append('size', 'auto')

  const response = await fetch('https://api.remove.bg/v1.0/removebg', {
    method: 'POST',
    headers: { 'X-Api-Key': apiKey },
    body,
  })

  if (!response.ok) {
    const text = await response.text()
    if (response.status === 402) {
      return NextResponse.json({ error: 'API quota exceeded', code: 'API_QUOTA_EXCEEDED' }, { status: 402 })
    }
    if (response.status === 400) {
      return NextResponse.json({ error: 'Invalid image format', code: 'INVALID_FORMAT' }, { status: 400 })
    }
    console.error('Remove.bg error:', text)
    return NextResponse.json({ error: 'Processing failed', code: 'UNKNOWN' }, { status: 500 })
  }

  const resultBuffer = await response.arrayBuffer()
  return new NextResponse(resultBuffer, {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'no-store',
    },
  })
}
