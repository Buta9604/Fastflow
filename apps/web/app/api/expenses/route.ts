import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from 'api'
import { getCurrentUserId } from '@/lib/auth-helpers'

// Validation schemas
const createExpenseSchema = z.object({
  groupId: z.string().min(1, 'Group ID is required'),
  title: z.string().min(1, 'Title is required').max(100, 'Title too long'),
  description: z.string().max(500, 'Description too long').optional(),
  amount: z.number().positive('Amount must be positive'),
  currency: z.string().length(3, 'Currency must be 3 characters').default('USD'),
  category: z.string().max(50, 'Category too long').optional(),
  date: z.string().datetime().optional(),
  receiptUrl: z.string().url('Invalid receipt URL').optional(),
  splitType: z.enum(['EQUAL', 'PERCENTAGE', 'EXACT', 'SHARES']).default('EQUAL'),
  shares: z.array(
    z.object({
      userId: z.string(),
      amount: z.number().optional(),
      percentage: z.number().optional(),
      shares: z.number().int().optional(),
    })
  ),
})

/**
 * GET /api/expenses
 * List expenses for a group (query param: groupId)
 */
export async function GET(request: NextRequest) {
  try {
    const userId = await getCurrentUserId()

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const groupId = searchParams.get('groupId')

    if (!groupId) {
      return NextResponse.json(
        { error: 'groupId query parameter is required' },
        { status: 400 }
      )
    }

    // Verify user is a member of the group
    const membership = await prisma.groupMember.findFirst({
      where: {
        groupId,
        userId,
      },
    })

    if (!membership) {
      return NextResponse.json(
        { error: 'Forbidden: Not a member of this group' },
        { status: 403 }
      )
    }

    const expenses = await prisma.expense.findMany({
      where: {
        groupId,
      },
      include: {
        paidBy: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
        shares: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatarUrl: true,
              },
            },
          },
        },
        _count: {
          select: {
            payments: true,
          },
        },
      },
      orderBy: {
        date: 'desc',
      },
    })

    return NextResponse.json({ data: expenses }, { status: 200 })
  } catch (error) {
    console.error('Error fetching expenses:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/expenses
 * Create a new expense with shares
 */
export async function POST(request: NextRequest) {
  try {
    const userId = await getCurrentUserId()

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validation = createExpenseSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      )
    }

    const { groupId, title, description, amount, currency, category, date, receiptUrl, splitType, shares } = validation.data

    // Verify user is a member of the group
    const membership = await prisma.groupMember.findFirst({
      where: {
        groupId,
        userId,
      },
    })

    if (!membership) {
      return NextResponse.json(
        { error: 'Forbidden: Not a member of this group' },
        { status: 403 }
      )
    }

    // Validate shares sum to total amount (if EXACT or amounts provided)
    if (splitType === 'EXACT') {
      const totalShares = shares.reduce((sum, share) => sum + (share.amount || 0), 0)
      if (Math.abs(totalShares - amount) > 0.01) {
        return NextResponse.json(
          { error: 'Share amounts must sum to total expense amount' },
          { status: 400 }
        )
      }
    }

    // Validate percentages sum to 100 (if PERCENTAGE)
    if (splitType === 'PERCENTAGE') {
      const totalPercentage = shares.reduce((sum, share) => sum + (share.percentage || 0), 0)
      if (Math.abs(totalPercentage - 100) > 0.01) {
        return NextResponse.json(
          { error: 'Percentages must sum to 100' },
          { status: 400 }
        )
      }
    }

    // Create expense with shares
    const expense = await prisma.expense.create({
      data: {
        title,
        description,
        amount,
        currency,
        category,
        date: date ? new Date(date) : new Date(),
        receiptUrl,
        splitType,
        status: 'PENDING',
        groupId,
        paidById: userId,
        shares: {
          create: shares.map((share) => ({
            userId: share.userId,
            amount: share.amount || 0,
            percentage: share.percentage,
            shares: share.shares,
            isPaid: share.userId === userId, // Payer automatically marked as paid
          })),
        },
      },
      include: {
        paidBy: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
        shares: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatarUrl: true,
              },
            },
          },
        },
      },
    })

    return NextResponse.json(
      { data: expense, message: 'Expense created successfully' },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating expense:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
