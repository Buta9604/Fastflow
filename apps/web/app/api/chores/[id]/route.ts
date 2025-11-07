import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from 'api'
import { getCurrentUserId } from '@/lib/auth-helpers'

// Validation schemas
const updateChoreSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title too long').optional(),
  description: z.string().max(500, 'Description too long').optional().nullable(),
  frequency: z.enum(['ONCE', 'DAILY', 'WEEKLY', 'BIWEEKLY', 'MONTHLY']).optional(),
  points: z.number().int().min(0).max(100).optional(),
  dueDate: z.string().datetime().optional().nullable(),
})

/**
 * GET /api/chores/:id
 * Get a single chore with full details
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

    const chore = await prisma.chore.findFirst({
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
        assignments: {
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
            assignedDate: 'desc',
          },
        },
      },
    })

    if (!chore) {
      return NextResponse.json(
        { error: 'Chore not found or access denied' },
        { status: 404 }
      )
    }

    return NextResponse.json({ data: chore }, { status: 200 })
  } catch (error) {
    console.error('Error fetching chore:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/chores/:id
 * Update chore details
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

    // Check if chore exists and user has access
    const existingChore = await prisma.chore.findFirst({
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

    if (!existingChore) {
      return NextResponse.json(
        { error: 'Chore not found or access denied' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const validation = updateChoreSchema.safeParse(body)

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
    if (updateData.dueDate) {
      updateData.dueDate = new Date(updateData.dueDate) as any
    } else if (updateData.dueDate === null) {
      updateData.dueDate = null as any
    }

    const chore = await prisma.chore.update({
      where: {
        id: params.id,
      },
      data: updateData,
      include: {
        assignments: {
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
      { data: chore, message: 'Chore updated successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error updating chore:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/chores/:id
 * Delete a chore
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

    // Check if chore exists and user has access
    const chore = await prisma.chore.findFirst({
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

    if (!chore) {
      return NextResponse.json(
        { error: 'Chore not found or access denied' },
        { status: 404 }
      )
    }

    await prisma.chore.delete({
      where: {
        id: params.id,
      },
    })

    return NextResponse.json(
      { message: 'Chore deleted successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error deleting chore:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
