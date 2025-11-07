import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from 'api'
import { getCurrentUserId } from '@/lib/auth-helpers'

// Validation schemas
const updateExpenseSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title too long').optional(),
  description: z.string().max(500, 'Description too long').optional().nullable(),
  amount: z.number().positive('Amount must be positive').optional(),
  category: z.string().max(50, 'Category too long').optional().nullable(),
  date: z.string().datetime().optional(),
  receiptUrl: z.string().url('Invalid receipt URL').optional().nullable(),
  status: z.enum(['PENDING', 'SETTLED', 'PARTIAL', 'CANCELLED']).optional(),
})

/**
 * GET /api/expenses/:id
 * Get a single expense with full details
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

    const expense = await prisma.expense.findFirst({
      where: {
        id: params.id,
        group: {
          members: {
            some: {
              userId,
            },
          },
        },
      },
      include: {
        group: {
          select: {
            id: true,
            name: true,
          },
        },
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
                email: true,
                avatarUrl: true,
              },
            },
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
        payments: {
          include: {
            fromUser: {
              select: {
                id: true,
                name: true,
                avatarUrl: true,
              },
            },
            toUser: {
              select: {
                id: true,
                name: true,
                avatarUrl: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    })

    if (!expense) {
      return NextResponse.json(
        { error: 'Expense not found or access denied' },
        { status: 404 }
      )
    }

    return NextResponse.json({ data: expense }, { status: 200 })
  } catch (error) {
    console.error('Error fetching expense:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/expenses/:id
 * Update expense details
 */
export async function PATCH(
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

    // Check if expense exists and user has access
    const existingExpense = await prisma.expense.findFirst({
      where: {
        id: params.id,
        group: {
          members: {
            some: {
              userId,
            },
          },
        },
      },
    })

    if (!existingExpense) {
      return NextResponse.json(
        { error: 'Expense not found or access denied' },
        { status: 404 }
      )
    }

    // Only the payer can update the expense
    if (existingExpense.paidById !== userId) {
      return NextResponse.json(
        { error: 'Forbidden: Only the payer can update this expense' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validation = updateExpenseSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      )
    }

    const updateData = { ...validation.data }
    if (updateData.date) {
      updateData.date = new Date(updateData.date) as any
    }

    const expense = await prisma.expense.update({
      where: {
        id: params.id,
      },
      data: updateData,
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
      { data: expense, message: 'Expense updated successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error updating expense:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/expenses/:id
 * Delete an expense
 */
export async function DELETE(
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

    // Check if expense exists and user is the payer
    const expense = await prisma.expense.findFirst({
      where: {
        id: params.id,
        paidById: userId,
      },
    })

    if (!expense) {
      return NextResponse.json(
        { error: 'Expense not found or you are not authorized to delete it' },
        { status: 404 }
      )
    }

    await prisma.expense.delete({
      where: {
        id: params.id,
      },
    })

    return NextResponse.json(
      { message: 'Expense deleted successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error deleting expense:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
