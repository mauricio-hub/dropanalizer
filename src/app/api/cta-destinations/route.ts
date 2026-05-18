import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function GET() {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const destinations = await prisma.ctaDestination.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'asc' },
  })

  return NextResponse.json(destinations)
}

export async function POST(req: Request) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { type, name, value } = body

  if (!type || !['whatsapp', 'link'].includes(type)) {
    return NextResponse.json({ error: 'type must be "whatsapp" or "link"' }, { status: 400 })
  }

  if (!value || typeof value !== 'string' || value.trim().length === 0) {
    return NextResponse.json({ error: 'value is required' }, { status: 400 })
  }

  const destination = await prisma.ctaDestination.create({
    data: {
      userId: user.id,
      type,
      name: name?.trim() || null,
      value: value.trim(),
    },
  })

  return NextResponse.json(destination, { status: 201 })
}
