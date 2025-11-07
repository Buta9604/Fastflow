import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from 'api'
import { getCurrentUserId } from '@/lib/auth-helpers'

// Validation schemas
const acceptInviteSchema = z.object({
  token: z.string().min(1, 'Token is required'),
})

/**
 * POST /api/invites/accept
 * Accept an invite and join a group
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
    const validation = acceptInviteSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      )
    }

    const { token } = validation.data

    // Find the invite
    const invite = await prisma.invite.findUnique({
      where: {
        token,
      },
      include: {
        group: true,
      },
    })

    if (!invite) {
      return NextResponse.json(
        { error: 'Invalid invite token' },
        { status: 404 }
      )
    }

    // Check if invite is still valid
    if (invite.status !== 'PENDING') {
      return NextResponse.json(
        { error: `Invite has already been ${invite.status.toLowerCase()}` },
        { status: 400 }
      )
    }

    if (invite.expiresAt < new Date()) {
      // Update invite status to expired
      await prisma.invite.update({
        where: { id: invite.id },
        data: { status: 'EXPIRED' },
      })

      return NextResponse.json(
        { error: 'Invite has expired' },
        { status: 400 }
      )
    }

    // Get current user's email
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Verify invite email matches current user
    if (invite.email !== user.email) {
      return NextResponse.json(
        { error: 'This invite is for a different email address' },
        { status: 403 }
      )
    }

    // Check if user is already a member
    const existingMembership = await prisma.groupMember.findFirst({
      where: {
        groupId: invite.groupId,
        userId,
      },
    })

    if (existingMembership) {
      // Update invite status but don't error
      await prisma.invite.update({
        where: { id: invite.id },
        data: { status: 'ACCEPTED' },
      })

      return NextResponse.json(
        {
          data: {
            group: invite.group,
            membership: existingMembership,
          },
          message: 'You are already a member of this group',
        },
        { status: 200 }
      )
    }

    // Create membership and update invite in a transaction
    const [membership] = await prisma.$transaction([
      prisma.groupMember.create({
        data: {
          userId,
          groupId: invite.groupId,
          role: 'MEMBER',
        },
        include: {
          group: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatarUrl: true,
            },
          },
        },
      }),
      prisma.invite.update({
        where: { id: invite.id },
        data: {
          status: 'ACCEPTED',
          recipientId: userId,
        },
      }),
    ])

    return NextResponse.json(
      {
        data: {
          group: invite.group,
          membership,
        },
        message: `Successfully joined ${invite.group.name}`,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error accepting invite:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/invites/accept?token=xxx
 * Get invite details before accepting (for preview)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json(
        { error: 'token query parameter is required' },
        { status: 400 }
      )
    }

    const invite = await prisma.invite.findUnique({
      where: {
        token,
      },
      include: {
        group: {
          select: {
            id: true,
            name: true,
            description: true,
            imageUrl: true,
            _count: {
              select: {
                members: true,
              },
            },
          },
        },
        sender: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
      },
    })

    if (!invite) {
      return NextResponse.json(
        { error: 'Invalid invite token' },
        { status: 404 }
      )
    }

    // Check if invite is expired
    const isExpired = invite.expiresAt < new Date()
    const isValid = invite.status === 'PENDING' && !isExpired

    return NextResponse.json({
      data: {
        ...invite,
        isValid,
        isExpired,
      },
    }, { status: 200 })
  } catch (error) {
    console.error('Error fetching invite:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
