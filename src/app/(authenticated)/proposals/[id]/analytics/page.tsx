'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { useLanguage } from '@/hooks/useLanguage'
import { getTranslation } from '@/lib/i18n'
import Container from '@/components/ui/Container'
import PageHeader from '@/components/ui/PageHeader'
import Card from '@/components/ui/Card'
import { Eye, MousePointer, TrendingUp, ShoppingCart, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import SmartRecommendations from '@/components/SmartRecommendations'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

interface Event {
  id: string
  type: string
  data: {
    section?: string
    userAgent?: string
    timestamp?: string
    duration?: number
  }
  createdAt: string
}

interface Analytics {
  hasPublishedVersion: boolean
  totalViews: number
  totalClicks: number
  totalTimeSpentEvents: number
  buyIntentClicks: number
  eventsBySection: Record<string, number>
  timeBySection: Record<string, { total: number; count: number; average: number }>
  eventsByVersion: Record<string, { views: number; clicks: number; timeSpent: number }>
  events: Event[]
}

interface ProposalInfo {
  id: string
  title: string
  createdAt: string
  versions: Array<{
    id: string
    version: number
    isPublished: boolean
    createdAt: string
  }>
}

export default function AnalyticsPage() {
  const params = useParams()
  const proposalId = params.id as string
  const { language } = useLanguage()
  const t = getTranslation(language)
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [proposalInfo, setProposalInfo] = useState<ProposalInfo | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        const [analyticsRes, proposalRes] = await Promise.all([
          fetch(`/api/proposals/${proposalId}/analytics`),
          fetch(`/api/proposals/${proposalId}`),
        ])

        if (analyticsRes.ok) {
          const analyticsData = await analyticsRes.json()
          setAnalytics(analyticsData)
        }

        if (proposalRes.ok) {
          const proposalData = await proposalRes.json()
          setProposalInfo(proposalData)
        }
      } catch (err) {
        console.error('Failed to load data:', err)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [proposalId])

  if (loading) {
    return (
      <div className="min-h-screen bg-background py-12 flex items-center justify-center">
        <p className="text-text-muted">{t.analytics.loadingAnalytics}</p>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="min-h-screen bg-background py-12 flex items-center justify-center">
        <p className="text-text-muted">{t.analytics.loadingAnalytics}</p>
      </div>
    )
  }

  // No published version yet — data would be meaningless
  if (!analytics.hasPublishedVersion) {
    return (
      <div className="min-h-screen bg-background py-12">
        <Container>
          <Link href="/analytics" className="inline-flex items-center gap-2 text-accent hover:text-accent-hover transition-colors mb-6 text-sm font-medium">
            <ArrowLeft className="h-4 w-4" />
            {t.analytics.backToAnalytics || 'Volver a Analítica'}
          </Link>
          {proposalInfo && (
            <h1 className="text-3xl font-bold text-text-primary mb-2">{proposalInfo.title}</h1>
          )}
          <div className="mt-12 flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/[0.10] py-20 text-center">
            <Eye className="h-10 w-10 text-text-muted mb-4" />
            <p className="text-sm font-medium text-text-primary mb-1">
              {language === 'es' ? 'Aún no hay datos' : 'No data yet'}
            </p>
            <p className="text-sm text-text-muted max-w-xs">
              {language === 'es'
                ? 'Publica una versión de esta página de venta para empezar a recopilar analytics.'
                : 'Publish a version of this sales page to start collecting analytics.'}
            </p>
          </div>
        </Container>
      </div>
    )
  }

  const sectionNames: Record<string, string> = {
    // Shared
    hero: 'Hero Section',
    pricing: 'Pricing',
    cta: 'Call to Action Button',
    'cta-section': 'CTA Section',
    'accept-proposal': 'Accept Proposal',
    'request-changes': 'Request Changes',
    // B2B Proposal
    scope: 'Project Scope',
    deliverables: 'Deliverables',
    timeline: 'Timeline',
    // Dropshipping Landing
    benefits: 'Benefits',
    gallery: 'Gallery',
    'social-proof': 'Social Proof',
    urgency: 'Urgency / Scarcity',
    faq: 'FAQ Section',
    // Extra tracking points
    'hero-cta': 'Hero CTA',
    'pricing-cta': 'Pricing CTA',
    'final-cta': 'Final CTA',
    'final-cta-button': 'Final CTA Button',
  }

  return (
    <div className="min-h-screen bg-background py-12">
      <Container>
        <Link href="/analytics" className="inline-flex items-center gap-2 text-accent hover:text-accent-hover transition-colors mb-6 text-sm font-medium">
          <ArrowLeft className="h-4 w-4" />
          {t.analytics.backToAnalytics || 'Volver a Analítica'}
        </Link>

        {proposalInfo && (
          <div className="mb-8">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-text-primary mb-2">
                  {proposalInfo.title}
                </h1>
                <p className="text-text-muted text-sm">
                  Created on {new Date(proposalInfo.createdAt).toLocaleDateString(language === 'es' ? 'es-ES' : 'en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            </div>

            {/* Version Selector */}
            <div className="flex items-center gap-4 flex-wrap">
              <div className="text-sm">
                <span className="text-text-muted">Versions: </span>
                {proposalInfo.versions.map((version) => (
                  <span
                    key={version.id}
                    className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ml-2 ${
                      version.isPublished
                        ? 'bg-accent/10 text-accent'
                        : 'bg-white/5 text-text-muted'
                    }`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${
                      version.isPublished ? 'bg-accent' : 'bg-white/30'
                    }`}></span>
                    v{version.version}
                    {version.isPublished && ' (Published)'}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        <PageHeader
          title={t.analytics.title}
          subtitle={t.analytics.subtitle}
        />

        {/* Smart Recommendations */}
        <div className="mt-8">
          <SmartRecommendations proposalId={proposalId} language={language as 'es' | 'en'} />
        </div>

        {/* Buy Intent — Hero Metric */}
        <div className="mt-8">
          <Card className="border-accent/30 bg-accent/5">
            <div className="p-6 md:p-8">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-sm font-semibold text-accent uppercase tracking-widest mb-1">Intención Real de Compra</p>
                  <p className="text-xs text-text-muted">Visitantes que hicieron click en &quot;Comprar Ahora&quot;</p>
                </div>
                <ShoppingCart className="h-5 w-5 text-accent mt-1" />
              </div>

              <div className="flex items-baseline gap-3 mb-4">
                <span className="text-5xl font-bold text-text-primary">{analytics.buyIntentClicks}</span>
                <span className="text-text-muted text-lg">de {analytics.totalViews} visitantes</span>
              </div>

              {/* Progress bar */}
              <div className="w-full h-2 bg-white/[0.06] rounded-full overflow-hidden mb-3">
                <div
                  className="h-full bg-accent rounded-full transition-all"
                  style={{ width: `${Math.min(analytics.totalViews > 0 ? (analytics.buyIntentClicks / analytics.totalViews) * 100 : 0, 100)}%` }}
                />
              </div>

              <div className="flex items-center justify-between">
                <p className="text-2xl font-bold text-accent">
                  {analytics.totalViews > 0
                    ? ((analytics.buyIntentClicks / analytics.totalViews) * 100).toFixed(1)
                    : '0.0'}%
                  <span className="text-sm font-normal text-text-muted ml-2">tasa de intención</span>
                </p>
                {analytics.totalViews > 0 && (
                  <p className="text-xs text-text-muted">
                    {analytics.buyIntentClicks / analytics.totalViews >= 0.03
                      ? '✓ Por encima del promedio (1–3%)'
                      : 'Promedio del sector: 1–3%'}
                  </p>
                )}
              </div>
            </div>
          </Card>
        </div>

        {/* Secondary Metrics */}
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-text-muted">{t.analytics.totalViews}</p>
                <Eye className="h-4 w-4 text-accent" />
              </div>
              <p className="text-4xl font-bold text-text-primary">{analytics.totalViews}</p>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-text-muted">{t.analytics.totalClicks}</p>
                <MousePointer className="h-4 w-4 text-accent" />
              </div>
              <p className="text-4xl font-bold text-text-primary">{analytics.totalClicks}</p>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-text-muted">{t.analytics.avgEngagement}</p>
                <TrendingUp className="h-4 w-4 text-accent" />
              </div>
              <p className="text-4xl font-bold text-text-primary">
                {analytics.totalViews > 0
                  ? Math.round((analytics.totalClicks / analytics.totalViews) * 100)
                  : 0}
                %
              </p>
            </div>
          </Card>
        </div>

        {/* Version Comparison - Bar Chart */}
        {Object.keys(analytics.eventsByVersion).length > 0 && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold text-text-primary mb-6">{t.analytics.performanceByVersion}</h2>
            <Card>
              <div className="p-6">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={Object.entries(analytics.eventsByVersion).map(([version, data]) => ({
                      name: version,
                      Views: data.views,
                      Clicks: data.clicks,
                      'Time Tracked': data.timeSpent,
                    }))}
                    margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis
                      dataKey="name"
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
                    <Bar dataKey="Views" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="Clicks" fill="#22c55e" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="Time Tracked" fill="#f59e0b" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>
        )}

        {/* Clicks by Section - Bar Chart */}
        {Object.keys(analytics.eventsBySection).length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-text-primary mb-6">{t.analytics.clicksBySection}</h2>
            <Card>
              <div className="p-6">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={Object.entries(analytics.eventsBySection)
                      .sort(([, a], [, b]) => b - a)
                      .map(([section, count]) => ({
                        name: sectionNames[section as keyof typeof sectionNames] || section,
                        clicks: count,
                      }))}
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
                        border: '1px solid rgba(34,197,94,0.3)',
                        borderRadius: '8px',
                      }}
                      cursor={{ fill: 'rgba(34,197,94,0.1)' }}
                    />
                    <Bar dataKey="clicks" fill="#22c55e" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>
        )}

        {/* Time Spent by Section - Bar Chart */}
        {Object.keys(analytics.timeBySection).length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-text-primary mb-6">{t.analytics.averageTimePerSection}</h2>
            <Card>
              <div className="p-6">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={Object.entries(analytics.timeBySection)
                      .sort(([, a], [, b]) => b.average - a.average)
                      .map(([section, data]) => ({
                        name: sectionNames[section as keyof typeof sectionNames] || section,
                        time: parseFloat(data.average.toFixed(1)),
                        views: data.count,
                      }))}
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
                    <YAxis tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12 }} label={{ value: 'Seconds', angle: -90, position: 'insideLeft' }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(0,0,0,0.8)',
                        border: '1px solid rgba(245,158,11,0.3)',
                        borderRadius: '8px',
                      }}
                      cursor={{ fill: 'rgba(245,158,11,0.1)' }}
                      formatter={(value: any) => [`${value}s`, 'Avg Time']}
                    />
                    <Bar dataKey="time" fill="#f59e0b" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>
        )}

        {/* Engagement Distribution Pie Chart */}
        {analytics.totalViews > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-text-primary mb-6">{t.analytics.engagementDistribution}</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <div className="p-6 flex flex-col items-center">
                  <h3 className="text-lg font-semibold text-text-primary mb-4">{t.analytics.viewsVsClicks}</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Views', value: analytics.totalViews },
                          { name: 'Clicks', value: analytics.totalClicks },
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${value}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        <Cell fill="#3b82f6" />
                        <Cell fill="#22c55e" />
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'rgba(0,0,0,0.8)',
                          border: '1px solid rgba(255,255,255,0.2)',
                          borderRadius: '8px',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              <Card>
                <div className="p-6 flex flex-col items-center">
                  <h3 className="text-lg font-semibold text-text-primary mb-4">{t.analytics.eventTypes}</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Views', value: analytics.totalViews },
                          { name: 'Clicks', value: analytics.totalClicks },
                          { name: 'Time Tracked', value: analytics.totalTimeSpentEvents },
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${value}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        <Cell fill="#3b82f6" />
                        <Cell fill="#22c55e" />
                        <Cell fill="#f59e0b" />
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'rgba(0,0,0,0.8)',
                          border: '1px solid rgba(255,255,255,0.2)',
                          borderRadius: '8px',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* Events Over Time - Line Chart */}
        {analytics.events.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-text-primary mb-6">{t.analytics.eventsOverTime}</h2>
            <Card>
              <div className="p-6">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart
                    data={(() => {
                      // Key by "YYYY-MM-DD HH:mm" so same clock time on different days don't merge
                      const grouped: Record<string, { views: number; clicks: number; timeSpent: number }> = {}

                      ;[...analytics.events].reverse().forEach((event) => {
                        const date = new Date(event.createdAt)
                        const key = `${date.toLocaleDateString('en-CA')} ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}`

                        if (!grouped[key]) grouped[key] = { views: 0, clicks: 0, timeSpent: 0 }

                        if (event.type === 'view') grouped[key].views++
                        else if (event.type === 'click') grouped[key].clicks++
                        else if (event.type === 'time_spent') grouped[key].timeSpent++
                      })

                      return Object.entries(grouped)
                        .slice(-24)
                        .map(([time, data]) => ({ time, ...data }))
                    })()}
                    margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis
                      dataKey="time"
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
                    />
                    <Legend />
                    <Line type="monotone" dataKey="views" stroke="#3b82f6" strokeWidth={2} dot={false} name="Views" />
                    <Line type="monotone" dataKey="clicks" stroke="#22c55e" strokeWidth={2} dot={false} name="Clicks" />
                    <Line type="monotone" dataKey="timeSpent" stroke="#f59e0b" strokeWidth={2} dot={false} name="Time Tracked" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>
        )}

        {/* Recent Events Timeline */}
        {analytics.events.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-text-primary mb-6">{t.analytics.recentEvents}</h2>
            <Card>
              <div className="p-6">
                <div className="space-y-4 max-h-[600px] overflow-y-auto">
                  {analytics.events.map((event) => {
                    const eventLabel = event.type === 'view' ? t.analytics.pageView :
                                      event.type === 'click' ? t.analytics.sectionClick :
                                      event.type === 'time_spent' ? t.analytics.timeSpent : event.type
                    const eventColor = event.type === 'view' ? 'bg-blue-500/20 text-blue-400' :
                                      event.type === 'click' ? 'bg-accent/10 text-accent' :
                                      event.type === 'time_spent' ? 'bg-amber-500/20 text-amber-400' : ''

                    return (
                      <div
                        key={event.id}
                        className="flex items-start gap-4 pb-4 border-b border-white/[0.06] last:pb-0 last:border-0"
                      >
                        <div className="flex-shrink-0 w-2 h-2 rounded-full bg-accent mt-2" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${eventColor}`}>
                              {eventLabel}
                            </span>
                            {event.data.section && (
                              <span className="text-xs text-text-muted">
                                {sectionNames[event.data.section as keyof typeof sectionNames] || event.data.section}
                              </span>
                            )}
                            {event.data.duration && (
                              <span className="text-xs text-text-muted">
                                {event.data.duration}s
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-text-muted">
                            {new Date(event.createdAt).toLocaleString(language === 'es' ? 'es-ES' : 'en-US')}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </Card>
          </div>
        )}
      </Container>
    </div>
  )
}
