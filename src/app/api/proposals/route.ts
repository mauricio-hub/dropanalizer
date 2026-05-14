import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { generateProposalContent } from '@/lib/openai'

export async function GET() {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const proposals = await prisma.proposal.findMany({
    where: { userId: user.id },
    include: { versions: { orderBy: { createdAt: 'desc' }, take: 1 } },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(proposals)
}

export async function POST(req: Request) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await req.json()
    const { title, brief, generateWithAI = true } = body

    if (!title || !brief) {
      return NextResponse.json(
        { error: 'title and brief are required' },
        { status: 400 }
      )
    }

    if (title.length < 5 || title.length > 200) {
      return NextResponse.json(
        { error: 'title must be between 5 and 200 characters' },
        { status: 400 }
      )
    }

    if (brief.length < 20 || brief.length > 5000) {
      return NextResponse.json(
        { error: 'brief must be between 20 and 5000 characters' },
        { status: 400 }
      )
    }

    const proposal = await prisma.proposal.create({
      data: {
        title,
        description: brief,
        type: 'service',
        status: 'draft',
        tenantId: user.id,
        userId: user.id,
      },
    })

    let versionContent = {
      scope: '',
      deliverables: [],
      timeline: [],
      pricing: { total: 0, currency: 'USD' },
    }
    let generatedAt = null

    if (generateWithAI) {
      try {
        versionContent = await generateProposalContent(brief)
        generatedAt = new Date()
      } catch (aiError) {
        console.error('AI generation failed, creating empty version:', aiError)
        return NextResponse.json(
          {
            error: 'Failed to generate proposal content with AI',
            details: aiError instanceof Error ? aiError.message : 'Unknown error',
          },
          { status: 500 }
        )
      }
    }

    const version = await prisma.version.create({
      data: {
        proposalId: proposal.id,
        version: 1,
        content: versionContent,
        generatedAt,
        isPublished: false,
      },
    })

    return NextResponse.json(
      {
        ...proposal,
        versions: [version],
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating proposal:', error)
    return NextResponse.json(
      { error: 'Failed to create proposal' },
      { status: 500 }
    )
  }
}
