import { WebhookEvent } from '@clerk/nextjs/server'
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  const payload = await req.json() as WebhookEvent

  if (payload.type === 'user.created') {
    const { id: clerkId, email_addresses, first_name, last_name } = payload.data
    const email = email_addresses[0]?.email_address

    if (!email) {
      return NextResponse.json({ error: 'No email found' }, { status: 400 })
    }

    const name = [first_name, last_name].filter(Boolean).join(' ') || null

    await prisma.user.create({
      data: { clerkId, email, name },
    })
  }

  return NextResponse.json({ received: true })
}
