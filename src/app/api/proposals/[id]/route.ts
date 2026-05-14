import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const proposal = await prisma.proposal.findFirst({
      where: { id: params.id, userId: user.id },
      include: {
        versions: {
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    if (!proposal) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    return NextResponse.json(proposal)
  } catch (error) {
    console.error('Error fetching proposal:', error)
    return NextResponse.json({ error: 'Failed to fetch proposal' }, { status: 500 })
  }
}
