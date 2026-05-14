import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { versionId, type, section } = body

    if (!versionId || !type) {
      return NextResponse.json(
        { error: 'versionId and type are required' },
        { status: 400 }
      )
    }

    // Verify version exists
    const version = await prisma.version.findUnique({
      where: { id: versionId },
      select: { id: true },
    })

    if (!version) {
      return NextResponse.json(
        { error: 'Version not found' },
        { status: 404 }
      )
    }

    // Create event
    const event = await prisma.event.create({
      data: {
        versionId,
        type,
        data: {
          section: section || null,
          userAgent: req.headers.get('user-agent'),
          timestamp: new Date().toISOString(),
        },
      },
    })

    return NextResponse.json(event, { status: 201 })
  } catch (error) {
    console.error('Tracking error:', error)
    return NextResponse.json(
      { error: 'Failed to track event' },
      { status: 500 }
    )
  }
}
