import Link from 'next/link'
import { auth, currentUser } from '@clerk/nextjs'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Container from '@/components/ui/Container'
import PageHeader from '@/components/ui/PageHeader'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { FileText, Plus, ExternalLink } from 'lucide-react'

export default async function DashboardPage() {
  const { userId: clerkId } = auth()
  if (!clerkId) redirect('/sign-in')

  const clerkUser = await currentUser()
  if (!clerkUser) redirect('/sign-in')

  const email = clerkUser.emailAddresses[0]?.emailAddress ?? ''
  const name = [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(' ') || null

  const user = await prisma.user.upsert({
    where: { clerkId },
    update: {},
    create: { clerkId, email, name },
  })

  const proposals = await prisma.proposal.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="min-h-screen bg-background py-12">
      <Container>
        <PageHeader
          title="My Proposals"
          subtitle="Manage and send your commercial proposals."
          actions={
            <Link href="/proposals/new">
              <Button>
                <Plus className="h-4 w-4" />
                New Proposal
              </Button>
            </Link>
          }
        />

        {proposals.length === 0 ? (
          <div className="mt-12 flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/[0.10] py-20 text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-accent">
              <FileText className="h-6 w-6" />
            </div>
            <p className="text-sm font-medium text-text-primary">No proposals yet</p>
            <p className="mt-1 text-sm text-text-muted">Create your first proposal to get started.</p>
            <Link href="/proposals/new" className="mt-6">
              <Button>
                <Plus className="h-4 w-4" />
                New Proposal
              </Button>
            </Link>
          </div>
        ) : (
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {proposals.map((p) => (
              <Card key={p.id} hover>
                <div className="p-5">
                  <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10 text-accent">
                    <FileText className="h-4 w-4" />
                  </div>
                  <h3 className="text-sm font-semibold text-text-primary line-clamp-1">{p.title}</h3>
                  {p.description && (
                    <p className="mt-1 text-xs text-text-muted line-clamp-2">{p.description}</p>
                  )}
                  <div className="mt-4 flex items-center justify-between">
                    <p className="text-xs text-text-muted">
                      {new Date(p.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </p>
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/proposals/${p.id}`}
                        className="text-xs text-text-secondary hover:text-text-primary transition-colors"
                      >
                        Details
                      </Link>
                      <Link
                        href={`/p/${p.id}`}
                        target="_blank"
                        className="flex items-center gap-1 text-xs text-accent hover:text-accent-hover transition-colors"
                      >
                        <ExternalLink className="h-3 w-3" />
                        View
                      </Link>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </Container>
    </div>
  )
}
