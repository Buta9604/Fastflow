import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from 'api'
import { getCurrentUserId } from '@/lib/auth-helpers'

// Validation schemas
const completeChoreSchema = z.object({
  assignmentId: z.string().min(1, 'Assignment ID is required'),
  notes: z.string().max(500, 'Notes too long').optional(),
})

/**
 * POST /api/chores/:id/complete
 * Toggle completion status of a chore assignment
 */
export async function POST(
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

    const body = await request.json()
    const validation = completeChoreSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      )
    }

    const { assignmentId, notes } = validation.data

    // Check if assignment exists and belongs to this chore
    const assignment = await prisma.choreAssignment.findFirst({
      where: {
        id: assignmentId,
        choreId: params.id,
      },
      include: {
        chore: {
          include: {
            group: {
              include: {
                members: {
                  where: {
                    userId,
                  },
                },
              },
            },
          },
        },
      },
    })

    if (!assignment) {
      return NextResponse.json(
        { error: 'Assignment not found' },
        { status: 404 }
      )
    }

    // Verify user is a member of the group
    if (assignment.chore.group.members.length === 0) {
      return NextResponse.json(
        { error: 'Forbidden: Not a member of this group' },
        { status: 403 }
      )
    }

    // Toggle completion status
    const updatedAssignment = await prisma.choreAssignment.update({
      where: {
        id: assignmentId,
      },
      data: {
        isCompleted: !assignment.isCompleted,
        completedAt: !assignment.isCompleted ? new Date() : null,
        notes: notes || assignment.notes,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
        chore: true,
      },
    })

    return NextResponse.json(
      {
        data: updatedAssignment,
        message: updatedAssignment.isCompleted
          ? 'Chore marked as completed'
          : 'Chore marked as incomplete',
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error toggling chore completion:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
