import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from 'api'
import { getCurrentUserId } from '@/lib/auth-helpers'

// Validation schemas
const createChoreSchema = z.object({
  groupId: z.string().min(1, 'Group ID is required'),
  title: z.string().min(1, 'Title is required').max(100, 'Title too long'),
  description: z.string().max(500, 'Description too long').optional(),
  frequency: z.enum(['ONCE', 'DAILY', 'WEEKLY', 'BIWEEKLY', 'MONTHLY']).default('ONCE'),
  points: z.number().int().min(0).max(100).default(1),
  dueDate: z.string().datetime().optional(),
  assignedUserIds: z.array(z.string()).optional(),
})

/**
 * GET /api/chores
 * List chores for a group (query param: groupId)
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

    const chores = await prisma.chore.findMany({
      where: {
        groupId,
      },
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
          orderBy: {
            assignedDate: 'desc',
          },
        },
      },
      orderBy: {
        dueDate: 'asc',
      },
    })

    return NextResponse.json({ data: chores }, { status: 200 })
  } catch (error) {
    console.error('Error fetching chores:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/chores
 * Create a new chore with optional assignments
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
    const validation = createChoreSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      )
    }

    const { groupId, title, description, frequency, points, dueDate, assignedUserIds } = validation.data

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

    // Verify all assigned users are members of the group
    if (assignedUserIds && assignedUserIds.length > 0) {
      const memberCount = await prisma.groupMember.count({
        where: {
          groupId,
          userId: {
            in: assignedUserIds,
          },
        },
      })

      if (memberCount !== assignedUserIds.length) {
        return NextResponse.json(
          { error: 'Some assigned users are not members of this group' },
          { status: 400 }
        )
      }
    }

    // Create chore with assignments
    const chore = await prisma.chore.create({
      data: {
        title,
        description,
        frequency,
        points,
        dueDate: dueDate ? new Date(dueDate) : null,
        groupId,
        assignments: assignedUserIds
          ? {
              create: assignedUserIds.map((assignedUserId) => ({
                userId: assignedUserId,
                isCompleted: false,
              })),
            }
          : undefined,
      },
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
      { data: chore, message: 'Chore created successfully' },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating chore:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
