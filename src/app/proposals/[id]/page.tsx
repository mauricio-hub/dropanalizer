import Link from 'next/link'
import { auth, currentUser } from '@clerk/nextjs'
import { redirect, notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Container from '@/components/ui/Container'
import PageHeader from '@/components/ui/PageHeader'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { ExternalLink } from 'lucide-react'

export default async function ProposalDetailPage({ params }: { params: { id: string } }) {
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

  const proposal = await prisma.proposal.findFirst({
    where: { id: params.id, userId: user.id },
  })

  if (!proposal) notFound()

  return (
    <div className="min-h-screen bg-background py-12">
      <Container className="max-w-3xl">
        <PageHeader
          title={proposal.title}
          subtitle={`Created ${new Date(proposal.createdAt).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
          })}`}
          actions={
            <Link href={`/p/${proposal.id}`} target="_blank">
              <Button variant="secondary">
                <ExternalLink className="h-4 w-4" />
                View proposal
              </Button>
            </Link>
          }
        />

        {proposal.description && (
          <Card className="mt-6 p-6">
            <p className="text-xs font-semibold uppercase tracking-widest text-accent mb-3">Brief</p>
            <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-wrap">
              {proposal.description}
            </p>
          </Card>
        )}
      </Container>
    </div>
  )
}
