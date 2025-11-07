import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from 'api'
import { getCurrentUserId } from '@/lib/auth-helpers'

// Validation schemas
const updateGroupSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long').optional(),
  description: z.string().max(500, 'Description too long').optional().nullable(),
  imageUrl: z.string().url('Invalid image URL').optional().nullable(),
  currency: z.string().length(3, 'Currency must be 3 characters').optional(),
})

/**
 * GET /api/groups/:id
 * Get a single group with full details
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

    const group = await prisma.group.findFirst({
      where: {
        id: params.id,
        members: {
          some: {
            userId,
          },
        },
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
        members: {
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
            joinedAt: 'asc',
          },
        },
        expenses: {
          take: 10,
          orderBy: {
            date: 'desc',
          },
          include: {
            paidBy: {
              select: {
                id: true,
                name: true,
                avatarUrl: true,
              },
            },
          },
        },
        chores: {
          take: 10,
          orderBy: {
            dueDate: 'asc',
          },
        },
        _count: {
          select: {
            expenses: true,
            chores: true,
            members: true,
          },
        },
      },
    })

    if (!group) {
      return NextResponse.json(
        { error: 'Group not found or access denied' },
        { status: 404 }
      )
    }

    return NextResponse.json({ data: group }, { status: 200 })
  } catch (error) {
    console.error('Error fetching group:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/groups/:id
 * Update group details (requires OWNER or ADMIN role)
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

    // Check if user has permission (owner or admin)
    const membership = await prisma.groupMember.findFirst({
      where: {
        groupId: params.id,
        userId,
        role: {
          in: ['OWNER', 'ADMIN'],
        },
      },
    })

    if (!membership) {
      return NextResponse.json(
        { error: 'Forbidden: Only owners and admins can update groups' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validation = updateGroupSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      )
    }

    const group = await prisma.group.update({
      where: {
        id: params.id,
      },
      data: validation.data,
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
        members: {
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
        },
      },
    })

    return NextResponse.json(
      { data: group, message: 'Group updated successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error updating group:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/groups/:id
 * Delete a group (requires OWNER role)
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

    // Check if user is the owner
    const membership = await prisma.groupMember.findFirst({
      where: {
        groupId: params.id,
        userId,
        role: 'OWNER',
      },
    })

    if (!membership) {
      return NextResponse.json(
        { error: 'Forbidden: Only the owner can delete a group' },
        { status: 403 }
      )
    }

    await prisma.group.delete({
      where: {
        id: params.id,
      },
    })

    return NextResponse.json(
      { message: 'Group deleted successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error deleting group:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
