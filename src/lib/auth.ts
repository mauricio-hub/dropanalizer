import { auth, currentUser } from '@clerk/nextjs'
import { prisma } from './prisma'

export async function getCurrentUser() {
  const { userId: clerkId } = auth()
  if (!clerkId) return null

  const clerkUser = await currentUser()
  if (!clerkUser) return null

  const email = clerkUser.emailAddresses[0]?.emailAddress ?? ''
  const name = [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(' ') || null

  return prisma.user.upsert({
    where: { clerkId },
    update: {},
    create: { clerkId, email, name },
  })
}
