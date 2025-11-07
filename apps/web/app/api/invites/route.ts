import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from 'api'
import { getCurrentUserId } from '@/lib/auth-helpers'
import { randomBytes } from 'crypto'

// Validation schemas
const createInviteSchema = z.object({
  groupId: z.string().min(1, 'Group ID is required'),
  email: z.string().email('Invalid email address'),
  expiresInDays: z.number().int().min(1).max(30).default(7),
})

/**
 * POST /api/invites
 * Create a new invite token for a group
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
    const validation = createInviteSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      )
    }

    const { groupId, email, expiresInDays } = validation.data

    // Verify user has permission to invite (owner or admin)
    const membership = await prisma.groupMember.findFirst({
      where: {
        groupId,
        userId,
        role: {
          in: ['OWNER', 'ADMIN'],
        },
      },
    })

    if (!membership) {
      return NextResponse.json(
        { error: 'Forbidden: Only owners and admins can send invites' },
        { status: 403 }
      )
    }

    // Check if user is already a member
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      const existingMembership = await prisma.groupMember.findFirst({
        where: {
          groupId,
          userId: existingUser.id,
        },
      })

      if (existingMembership) {
        return NextResponse.json(
          { error: 'User is already a member of this group' },
          { status: 400 }
        )
      }
    }

    // Check for pending invite
    const pendingInvite = await prisma.invite.findFirst({
      where: {
        groupId,
        email,
        status: 'PENDING',
        expiresAt: {
          gt: new Date(),
        },
      },
    })

    if (pendingInvite) {
      return NextResponse.json(
        { error: 'An active invite already exists for this email' },
        { status: 400 }
      )
    }

    // Generate secure token
    const token = randomBytes(32).toString('hex')
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + expiresInDays)

    // Create invite
    const invite = await prisma.invite.create({
      data: {
        email,
        token,
        status: 'PENDING',
        expiresAt,
        groupId,
        senderId: userId,
        recipientId: existingUser?.id,
      },
      include: {
        group: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    // In production, you would send an email here
    // await sendInviteEmail(email, invite.token, invite.group.name)

    return NextResponse.json(
      {
        data: {
          ...invite,
          inviteUrl: `${process.env.NEXT_PUBLIC_APP_URL}/invite/${token}`,
        },
        message: 'Invite created successfully',
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating invite:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/invites
 * List invites for a group (query param: groupId)
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

    // Verify user has access to this group
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

    const invites = await prisma.invite.findMany({
      where: {
        groupId,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
        recipient: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json({ data: invites }, { status: 200 })
  } catch (error) {
    console.error('Error fetching invites:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
