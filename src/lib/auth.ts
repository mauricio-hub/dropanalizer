import { auth, currentUser } from '@clerk/nextjs'
import { prisma } from './prisma'
import { ADMIN_EMAILS } from './permissions'

export async function getCurrentUser() {
  const { userId: clerkId } = auth()
  if (!clerkId) return null

  const clerkUser = await currentUser()
  if (!clerkUser) return null

  const email = clerkUser.emailAddresses[0]?.emailAddress ?? ''
  const name = [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(' ') || null
  const role = ADMIN_EMAILS.includes(email as typeof ADMIN_EMAILS[number]) ? 'ADMIN' as const : undefined

  return prisma.user.upsert({
    where: { clerkId },
    update: {
      ...(role ? { role } : {}),
    },
    create: {
      clerkId,
      email,
      name,
      ...(role ? { role } : {}),
    },
  })
}
