import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const proposals = await prisma.proposal.findMany({
      where: { userId: user.id },
      include: {
        versions: {
          include: {
            events: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    let globalTotalViews = 0
    let globalTotalClicks = 0

    const proposalAnalytics = proposals.map((proposal) => {
      let totalViews = 0
      let totalClicks = 0

      for (const version of proposal.versions) {
        for (const event of version.events) {
          if (event.type === 'view') {
            totalViews++
            globalTotalViews++
          } else if (event.type === 'click') {
            totalClicks++
            globalTotalClicks++
          }
        }
      }

      const engagementRate = totalViews > 0 ? Math.round((totalClicks / totalViews) * 100) : 0

      return {
        id: proposal.id,
        title: proposal.title,
        status: proposal.status,
        totalViews,
        totalClicks,
        engagementRate,
        createdAt: proposal.createdAt,
      }
    })

    return NextResponse.json(
      {
        proposals: proposalAnalytics,
        totalViews: globalTotalViews,
        totalClicks: globalTotalClicks,
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
