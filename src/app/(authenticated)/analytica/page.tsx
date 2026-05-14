'use client'

import { useEffect, useState } from 'react'
import { useLanguage } from '@/hooks/useLanguage'
import { getTranslation } from '@/lib/i18n'
import Container from '@/components/ui/Container'
import PageHeader from '@/components/ui/PageHeader'
import Card from '@/components/ui/Card'
import { Eye, MousePointer, TrendingUp } from 'lucide-react'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import Link from 'next/link'

interface ProposalAnalytics {
  id: string
  title: string
  status: string
  totalViews: number
  totalClicks: number
  engagementRate: number
  createdAt: string
}

export default function AnalyticsPage() {
  const { language } = useLanguage()
  const t = getTranslation(language)
  const [proposals, setProposals] = useState<ProposalAnalytics[]>([])
  const [loading, setLoading] = useState(true)
  const [totalViews, setTotalViews] = useState(0)
  const [totalClicks, setTotalClicks] = useState(0)

  useEffect(() => {
    async function loadProposalsAnalytics() {
      try {
        const res = await fetch('/api/analytics')
        if (res.ok) {
          const data = await res.json()
          setProposals(data.proposals)
          setTotalViews(data.totalViews)
          setTotalClicks(data.totalClicks)
        }
      } catch (err) {
        console.error('Failed to load analytics:', err)
      } finally {
        setLoading(false)
      }
    }

    loadProposalsAnalytics()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-background py-12 flex items-center justify-center">
        <p className="text-text-muted">Loading analytics...</p>
      </div>
    )
  }

  // Prepare data for timeline chart
  const timelineData = proposals.map(p => ({
    name: p.title.substring(0, 15) + (p.title.length > 15 ? '...' : ''),
    views: p.totalViews,
    clicks: p.totalClicks,
  }))

  const topProposals = [...proposals]
    .sort((a, b) => b.totalViews - a.totalViews)
    .slice(0, 5)

  return (
    <div className="min-h-screen bg-background py-12">
      <Container>
        <PageHeader
          title="Analytics"
          subtitle="Overview of all your proposals and their performance"
        />

        {/* Global Metrics */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-text-muted">Total Views</p>
                <Eye className="h-4 w-4 text-accent" />
              </div>
              <p className="text-4xl font-bold text-text-primary">{totalViews}</p>
              <p className="text-xs text-text-muted mt-2">Across all proposals</p>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-text-muted">Total Clicks</p>
                <MousePointer className="h-4 w-4 text-accent" />
              </div>
              <p className="text-4xl font-bold text-text-primary">{totalClicks}</p>
              <p className="text-xs text-text-muted mt-2">All user interactions</p>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-text-muted">Avg Engagement</p>
                <TrendingUp className="h-4 w-4 text-accent" />
              </div>
              <p className="text-4xl font-bold text-text-primary">
                {proposals.length > 0
                  ? Math.round(
                      proposals.reduce((sum, p) => sum + p.engagementRate, 0) /
                        proposals.length
                    )
                  : 0}
                %
              </p>
              <p className="text-xs text-text-muted mt-2">Per proposal</p>
            </div>
          </Card>
        </div>

        {/* Proposals Comparison Chart */}
        {proposals.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-text-primary mb-6">Proposals Performance</h2>
            <Card>
              <div className="p-6">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={timelineData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis
                      dataKey="name"
                      angle={-45}
                      textAnchor="end"
                      height={100}
                      tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12 }}
                    />
                    <YAxis tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(0,0,0,0.8)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        borderRadius: '8px',
                      }}
                      cursor={{ fill: 'rgba(255,255,255,0.1)' }}
                    />
                    <Legend />
                    <Bar dataKey="views" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="clicks" fill="#22c55e" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>
        )}

        {/* Top Proposals */}
        {topProposals.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-text-primary mb-6">Top Performing Proposals</h2>
            <Card>
              <div className="p-6 space-y-4">
                {topProposals.map((proposal, idx) => (
                  <Link href={`/proposals/${proposal.id}/analytics`} key={proposal.id}>
                    <div className="flex items-center justify-between pb-4 border-b border-white/[0.06] last:pb-0 last:border-0 cursor-pointer hover:bg-white/[0.02] px-2 py-2 rounded transition-colors">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-accent/10 text-accent text-xs font-semibold">
                            {idx + 1}
                          </span>
                          <p className="text-text-secondary font-medium">{proposal.title}</p>
                        </div>
                        <p className="text-xs text-text-muted ml-9">
                          {new Date(proposal.createdAt).toLocaleDateString(language === 'es' ? 'es-ES' : 'en-US')}
                        </p>
                      </div>
                      <div className="flex items-center gap-6 text-right">
                        <div>
                          <p className="text-sm font-semibold text-text-primary">{proposal.totalViews}</p>
                          <p className="text-xs text-text-muted">views</p>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-text-primary">{proposal.totalClicks}</p>
                          <p className="text-xs text-text-muted">clicks</p>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-accent">{proposal.engagementRate}%</p>
                          <p className="text-xs text-text-muted">engagement</p>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* All Proposals Table */}
        {proposals.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-text-primary mb-6">All Proposals</h2>
            <Card>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/[0.06]">
                      <th className="px-6 py-4 text-left text-xs font-semibold text-text-muted uppercase">
                        Proposal
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-text-muted uppercase">
                        Status
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-semibold text-text-muted uppercase">
                        Views
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-semibold text-text-muted uppercase">
                        Clicks
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-semibold text-text-muted uppercase">
                        Engagement
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-semibold text-text-muted uppercase">
                        Created
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-semibold text-text-muted uppercase">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {proposals.map((proposal) => (
                      <tr key={proposal.id} className="border-b border-white/[0.06] hover:bg-white/[0.02] transition-colors">
                        <td className="px-6 py-4 text-sm text-text-secondary">{proposal.title}</td>
                        <td className="px-6 py-4 text-sm">
                          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${
                            proposal.status === 'published'
                              ? 'bg-accent/10 text-accent'
                              : 'bg-white/5 text-text-muted'
                          }`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${
                              proposal.status === 'published' ? 'bg-accent' : 'bg-white/30'
                            }`}></span>
                            {proposal.status === 'published' ? 'Published' : 'Draft'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-text-primary font-semibold text-center">{proposal.totalViews}</td>
                        <td className="px-6 py-4 text-sm text-text-primary font-semibold text-center">{proposal.totalClicks}</td>
                        <td className="px-6 py-4 text-sm text-accent font-semibold text-center">{proposal.engagementRate}%</td>
                        <td className="px-6 py-4 text-sm text-text-muted text-center">
                          {new Date(proposal.createdAt).toLocaleDateString(language === 'es' ? 'es-ES' : 'en-US')}
                        </td>
                        <td className="px-6 py-4 text-sm text-center">
                          <Link href={`/proposals/${proposal.id}/analytics`} className="text-accent hover:text-accent-hover transition-colors">
                            View
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {proposals.length === 0 && (
          <div className="mt-12 flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/[0.10] py-20 text-center">
            <p className="text-sm font-medium text-text-primary">No proposals yet</p>
            <p className="mt-1 text-sm text-text-muted">Create a proposal to start tracking analytics</p>
          </div>
        )}
      </Container>
    </div>
  )
}
