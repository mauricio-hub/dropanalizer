import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const proposal = await prisma.proposal.findUnique({
      where: { id: params.id },
      include: {
        versions: {
          include: {
            events: {
              orderBy: { createdAt: 'desc' },
            },
          },
        },
      },
    })

    if (!proposal) {
      return NextResponse.json({ error: 'Proposal not found' }, { status: 404 })
    }

    // Verify ownership
    if (proposal.userId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Aggregate analytics from all versions
    let totalViews = 0
    let totalClicks = 0
    const eventsBySection: Record<string, number> = {}
    const timeBySection: Record<string, { total: number; count: number; average: number }> = {}
    const eventsByVersion: Record<string, { views: number; clicks: number; timeSpent: number }> = {}
    const allEvents: any[] = []

    for (const version of proposal.versions) {
      eventsByVersion[`v${version.version}`] = { views: 0, clicks: 0, timeSpent: 0 }

      for (const event of version.events) {
        allEvents.push({
          id: event.id,
          type: event.type,
          data: event.data,
          createdAt: event.createdAt,
          versionNumber: version.version,
        })

        if (event.type === 'view') {
          totalViews++
          eventsByVersion[`v${version.version}`].views++
        } else if (event.type === 'click') {
          totalClicks++
          eventsByVersion[`v${version.version}`].clicks++
          const section = (event.data as any)?.section
          if (section) {
            eventsBySection[section] = (eventsBySection[section] || 0) + 1
          }
        } else if (event.type === 'time_spent') {
          eventsByVersion[`v${version.version}`].timeSpent++
          const section = (event.data as any)?.section
          const duration = (event.data as any)?.duration || 0
          if (section && duration > 0) {
            if (!timeBySection[section]) {
              timeBySection[section] = { total: 0, count: 0, average: 0 }
            }
            timeBySection[section].total += duration
            timeBySection[section].count += 1
            timeBySection[section].average = timeBySection[section].total / timeBySection[section].count
          }
        }
      }
    }

    // Sort by most recent
    allEvents.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    // Buy intent = clicks on any CTA button
    const buyIntentSections = ['nav-cta', 'hero-cta', 'pricing-cta', 'final-cta-button']
    const buyIntentClicks = buyIntentSections.reduce(
      (sum, section) => sum + (eventsBySection[section] || 0),
      0
    )

    return NextResponse.json(
      {
        totalViews,
        totalClicks,
        buyIntentClicks,
        eventsBySection,
        timeBySection,
        eventsByVersion,
        events: allEvents.slice(0, 100),
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Analytics error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    )
  }
}
