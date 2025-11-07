import { getServerSession } from 'next-auth/next'
import { authOptions } from './auth'
import { prisma } from 'api'

/**
 * Get the current session in a Server Component
 * Usage: const session = await getCurrentSession()
 */
export async function getCurrentSession() {
  return await getServerSession(authOptions)
}

/**
 * Get the current user from the session
 * Returns the full user object from Prisma
 */
export async function getCurrentUser() {
  const session = await getCurrentSession()

  if (!session?.user?.email) {
    return null
  }

  const user = await prisma.user.findUnique({
    where: {
      email: session.user.email,
    },
    include: {
      groupMemberships: {
        include: {
          group: true,
        },
      },
    },
  })

  return user
}

/**
 * Require authentication - throws error if not authenticated
 * Use in Server Actions or API routes
 */
export async function requireAuth() {
  const session = await getCurrentSession()

  if (!session?.user) {
    throw new Error('Unauthorized')
  }

  return session
}

/**
 * Get user ID from session
 */
export async function getCurrentUserId() {
  const session = await getCurrentSession()
  return session?.user?.id || null
}
