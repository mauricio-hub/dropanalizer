import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { generateProposalContent } from '@/lib/openai'

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
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
    const { basedOnVersionId, generateWithAI = false } = body

    // Get the base version
    const baseVersion = basedOnVersionId
      ? await prisma.version.findUnique({
          where: { id: basedOnVersionId },
        })
      : await prisma.version.findFirst({
          where: { proposalId: proposal.id },
          orderBy: { createdAt: 'desc' },
        })

    if (!baseVersion) {
      return NextResponse.json({ error: 'Base version not found' }, { status: 404 })
    }

    // Get the next version number
    const lastVersion = await prisma.version.findFirst({
      where: { proposalId: proposal.id },
      orderBy: { version: 'desc' },
      take: 1,
    })

    const nextVersionNumber = (lastVersion?.version ?? 0) + 1

    let content = baseVersion.content as any
    let generatedAt = null

    if (generateWithAI && proposal.description) {
      try {
        content = await generateProposalContent(proposal.description)
        generatedAt = new Date()
      } catch (error) {
        console.error('AI generation failed:', error)
        return NextResponse.json(
          { error: 'Failed to generate version with AI' },
          { status: 500 }
        )
      }
    }

    const newVersion = await prisma.version.create({
      data: {
        proposalId: proposal.id,
        version: nextVersionNumber,
        content,
        generatedAt,
        isPublished: false,
      },
    })

    return NextResponse.json(newVersion, { status: 201 })
  } catch (error) {
    console.error('Error creating version:', error)
    return NextResponse.json({ error: 'Failed to create version' }, { status: 500 })
  }
}
