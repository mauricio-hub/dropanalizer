import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

async function getOwned(id: string, userId: string) {
  const dest = await prisma.ctaDestination.findUnique({ where: { id } })
  if (!dest || dest.userId !== userId) return null
  return dest
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const dest = await getOwned(params.id, user.id)
  if (!dest) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { name, value } = await req.json()
  if (!value || typeof value !== 'string' || value.trim().length === 0) {
    return NextResponse.json({ error: 'value is required' }, { status: 400 })
  }

  const updated = await prisma.ctaDestination.update({
    where: { id: params.id },
    data: { name: name?.trim() || null, value: value.trim() },
  })

  return NextResponse.json(updated)
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const dest = await getOwned(params.id, user.id)
  if (!dest) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  await prisma.ctaDestination.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
