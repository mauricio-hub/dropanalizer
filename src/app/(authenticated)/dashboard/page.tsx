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
import { Plus } from 'lucide-react'

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

        <Card className="mt-6">
          <DashboardProposalTable proposals={serialized} />
        </Card>
      </Container>
    </div>
  )
}
