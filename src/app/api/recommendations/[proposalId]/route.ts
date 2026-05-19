import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { generateSignals } from '@/lib/recommendations'

export async function GET(
  req: Request,
  { params }: { params: { proposalId: string } }
) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const proposal = await prisma.proposal.findUnique({
      where: { id: params.proposalId },
      include: {
        versions: {
          where: { isPublished: true },
          include: { events: true },
        },
      },
    })

    if (!proposal) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    if (proposal.userId !== user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const url = new URL(req.url)
    const language = (url.searchParams.get('lang') ?? 'es') as 'es' | 'en'

    // Aggregate metrics from all published versions
    let totalViews = 0
    let buyIntentClicks = 0
    let totalClicks = 0
    let benefitsClicks = 0
    let totalTimeSeconds = 0
    let timeEventCount = 0

    const buyIntentSections = ['nav-cta', 'hero-cta', 'pricing-cta', 'final-cta-button']

    for (const version of proposal.versions) {
      for (const event of version.events) {
        const data = event.data as Record<string, unknown>
        if (event.type === 'view') {
          totalViews++
        } else if (event.type === 'click') {
          totalClicks++
          const section = data?.section as string | undefined
          if (section && buyIntentSections.includes(section)) buyIntentClicks++
          if (section === 'benefits') benefitsClicks++
        } else if (event.type === 'time_spent') {
          const duration = (data?.duration as number) || 0
          if (duration > 0) {
            totalTimeSeconds += duration
            timeEventCount++
          }
        }
      }
    }

    buyIntentClicks = Math.min(buyIntentClicks, totalViews)
    const avgTimeOnPage = timeEventCount > 0 ? totalTimeSeconds / timeEventCount : 0

    const signals = generateSignals({
      totalViews,
      buyIntentClicks,
      totalClicks,
      avgTimeOnPage,
      benefitsClicks,
      createdAt: proposal.createdAt,
      language,
    })

    return NextResponse.json({ signals }, { status: 200 })
  } catch (error) {
    console.error('Recommendations error:', error)
    return NextResponse.json({ error: 'Failed to generate recommendations' }, { status: 500 })
  }
}
