import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Container from '@/components/ui/Container'
import PageHeader from '@/components/ui/PageHeader'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import CtaDestinations from '@/components/CtaDestinations'
import DashboardProposalTable from '@/components/DashboardProposalTable'
import { Plus, Zap, BarChart2, Share2 } from 'lucide-react'

export default async function DashboardPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/sign-in')

  const proposals = await prisma.proposal.findMany({
    where: { userId: user.id },
    include: { versions: { orderBy: { createdAt: 'desc' }, take: 1 } },
    orderBy: { createdAt: 'desc' },
  })

  const serialized = proposals.map((p) => ({
    id: p.id,
    title: p.title,
    status: p.status,
    createdAt: p.createdAt.toISOString(),
    buyUrl: p.buyUrl ?? undefined,
    versions: p.versions.map((v) => ({ id: v.id })),
  }))

  return (
    <div className="min-h-screen bg-background py-12">
      <Container>
        <PageHeader
          title="Dashboard"
          subtitle="Tus propuestas y landings activas"
          actions={
            <Link href="/proposals/new">
              <Button>
                <Plus className="h-4 w-4" />
                Nueva propuesta
              </Button>
            </Link>
          }
        />

        <div className="mt-8">
          <CtaDestinations />
        </div>

        {serialized.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-dashed border-white/[0.10] bg-white/[0.02] px-6 py-16 flex flex-col items-center text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/10 mb-6">
              <Zap className="h-7 w-7 text-accent" />
            </div>
            <h2 className="text-xl font-semibold text-text-primary mb-2">
              Crea tu primera landing
            </h2>
            <p className="text-sm text-text-muted max-w-sm mb-8">
              Sube tu producto, agrega imágenes y en minutos tendrás una página lista para compartir y vender.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 mb-10 text-left">
              {[
                { icon: <Zap className="h-4 w-4 text-accent" />, label: 'Crea', desc: 'Describe tu producto y sube fotos' },
                { icon: <Share2 className="h-4 w-4 text-accent" />, label: 'Comparte', desc: 'Copia el link y pégalo en tus anuncios' },
                { icon: <BarChart2 className="h-4 w-4 text-accent" />, label: 'Analiza', desc: 'Ve cuántos visitan y hacen click en comprar' },
              ].map((step) => (
                <div key={step.label} className="flex items-start gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10 flex-shrink-0 mt-0.5">
                    {step.icon}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-text-primary">{step.label}</p>
                    <p className="text-xs text-text-muted">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <Link href="/proposals/new">
              <Button>
                <Plus className="h-4 w-4" />
                Crear mi primera landing
              </Button>
            </Link>
          </div>
        ) : (
          <Card className="mt-6">
            <DashboardProposalTable proposals={serialized} />
          </Card>
        )}
      </Container>
    </div>
  )
}
