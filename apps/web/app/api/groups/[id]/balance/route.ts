import { NextRequest, NextResponse } from 'next/server'
import { prisma } from 'api'
import { getCurrentUserId } from '@/lib/auth-helpers'
import {
  calculateNetBalances,
  simplifySettlements,
  computeFairnessScore,
  type User,
  type Expense,
  type ChoreAssignment,
} from '@/lib/balance'

// ============================================
// SIMPLE IN-MEMORY CACHE WITH TTL
// ============================================

interface CacheEntry {
  data: any
  timestamp: number
  etag: string
}

const balanceCache = new Map<string, CacheEntry>()
const CACHE_TTL_MS = 5 * 60 * 1000 // 5 minutes

/**
 * Generate ETag from group data modification timestamps
 */
function generateETag(groupId: string, lastModified: Date): string {
  return `"${groupId}-${lastModified.getTime()}"`
}

/**
 * Get cached balance if still valid
 */
function getCachedBalance(groupId: string, etag: string): CacheEntry | null {
  const cached = balanceCache.get(groupId)

  if (!cached) {
    return null
  }

  // Check if cache is still valid (TTL)
  const age = Date.now() - cached.timestamp
  if (age > CACHE_TTL_MS) {
    balanceCache.delete(groupId)
    return null
  }

  // Check if data hasn't changed (ETag match)
  if (cached.etag !== etag) {
    balanceCache.delete(groupId)
    return null
  }

  return cached
}

/**
 * Store balance calculation in cache
 */
function setCachedBalance(groupId: string, data: any, etag: string): void {
  balanceCache.set(groupId, {
    data,
    timestamp: Date.now(),
    etag,
  })

  // Simple cache cleanup: remove entries older than TTL
  if (balanceCache.size > 100) {
    const now = Date.now()
    for (const [key, entry] of balanceCache.entries()) {
      if (now - entry.timestamp > CACHE_TTL_MS) {
        balanceCache.delete(key)
      }
    }
  }
}

// ============================================
// API ROUTE HANDLER
// ============================================

/**
 * GET /api/groups/:id/balance
 *
 * Calculate and return balance information for a group:
 * - Net balances (who owes/is owed money)
 * - Simplified settlements (optimized payment plan)
 * - Fairness scores (contribution metrics)
 *
 * Features:
 * - Server-side memoization (5 min TTL)
 * - HTTP caching headers (ETag, Cache-Control)
 * - Efficient revalidation (304 Not Modified)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await getCurrentUserId()

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const groupId = params.id

    // Verify user is a member of this group
    const membership = await prisma.groupMember.findFirst({
      where: {
        groupId,
        userId,
      },
    })

    if (!membership) {
      return NextResponse.json(
        { error: 'Group not found or access denied' },
        { status: 404 }
      )
    }

    // Get the latest modification timestamp for cache validation
    const [latestExpense, latestChore] = await Promise.all([
      prisma.expense.findFirst({
        where: { groupId },
        orderBy: { updatedAt: 'desc' },
        select: { updatedAt: true },
      }),
      prisma.choreAssignment.findFirst({
        where: { chore: { groupId } },
        orderBy: { updatedAt: 'desc' },
        select: { updatedAt: true },
      }),
    ])

    // Calculate last modified time from latest expense or chore update
    const lastModified = new Date(
      Math.max(
        latestExpense?.updatedAt?.getTime() || 0,
        latestChore?.updatedAt?.getTime() || 0,
        membership.updatedAt.getTime()
      )
    )

    const etag = generateETag(groupId, lastModified)

    // Check client's If-None-Match header for conditional requests
    const clientETag = request.headers.get('if-none-match')
    if (clientETag === etag) {
      return new NextResponse(null, {
        status: 304, // Not Modified
        headers: {
          'ETag': etag,
          'Cache-Control': 'private, max-age=300', // 5 minutes
        },
      })
    }

    // Check server-side cache
    const cached = getCachedBalance(groupId, etag)
    if (cached) {
      return NextResponse.json(cached.data, {
        status: 200,
        headers: {
          'ETag': etag,
          'Cache-Control': 'private, max-age=300',
          'X-Cache': 'HIT',
        },
      })
    }

    // Fetch all required data for balance calculation
    const [group, expenses, chores] = await Promise.all([
      prisma.group.findUnique({
        where: { id: groupId },
        include: {
          members: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      }),
      prisma.expense.findMany({
        where: { groupId },
        include: {
          shares: {
            select: {
              userId: true,
              amount: true,
              isPaid: true,
            },
          },
        },
      }),
      prisma.choreAssignment.findMany({
        where: {
          chore: { groupId },
        },
        select: {
          userId: true,
          points: true,
          isCompleted: true,
        },
      }),
    ])

    if (!group) {
      return NextResponse.json(
        { error: 'Group not found' },
        { status: 404 }
      )
    }

    // Transform data to match balance utility types
    const users: User[] = group.members.map((m) => ({
      id: m.user.id,
      name: m.user.name,
    }))

    const transformedExpenses: Expense[] = expenses.map((e) => ({
      id: e.id,
      amount: e.amount,
      paidById: e.paidById,
      shares: e.shares,
    }))

    const choreAssignments: ChoreAssignment[] = chores

    // Calculate balances, settlements, and fairness scores
    const netBalances = calculateNetBalances(users, transformedExpenses)
    const settlements = simplifySettlements(users, netBalances)
    const fairnessScores = computeFairnessScore(
      users,
      transformedExpenses,
      choreAssignments
    )

    // Build response data
    const responseData = {
      data: {
        groupId,
        groupName: group.name,
        lastModified: lastModified.toISOString(),
        balances: netBalances,
        settlements,
        fairnessScores,
        summary: {
          totalExpenses: expenses.length,
          totalAmount: expenses.reduce((sum, e) => sum + e.amount, 0),
          totalChores: chores.length,
          completedChores: chores.filter((c) => c.isCompleted).length,
          members: users.length,
          settlementsNeeded: settlements.length,
        },
      },
    }

    // Cache the result
    setCachedBalance(groupId, responseData, etag)

    return NextResponse.json(responseData, {
      status: 200,
      headers: {
        'ETag': etag,
        'Cache-Control': 'private, max-age=300', // 5 minutes
        'X-Cache': 'MISS',
        'Last-Modified': lastModified.toUTCString(),
      },
    })
  } catch (error) {
    console.error('Error calculating group balance:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
