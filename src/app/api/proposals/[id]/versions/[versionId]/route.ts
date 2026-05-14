import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function PUT(
  req: Request,
  { params }: { params: { id: string; versionId: string } }
) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const proposal = await prisma.proposal.findFirst({
      where: { id: params.id, userId: user.id },
    })

    if (!proposal) {
      return NextResponse.json({ error: 'Proposal not found' }, { status: 404 })
    }

    const body = await req.json()
    const { content } = body

    if (!content) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 })
    }

    const version = await prisma.version.update({
      where: { id: params.versionId },
      data: { content },
    })

    return NextResponse.json(version)
  } catch (error) {
    console.error('Error updating version:', error)
    return NextResponse.json({ error: 'Failed to update version' }, { status: 500 })
  }
}
