# Authentication Guide

This app uses NextAuth with email magic links for passwordless authentication.

## Usage Examples

### In Server Components

```tsx
import { getCurrentSession, getCurrentUser } from '@/lib/auth-helpers'

export default async function DashboardPage() {
  const session = await getCurrentSession()

  if (!session) {
    redirect('/') // Redirect to sign in
  }

  const user = await getCurrentUser() // Full user with relations

  return (
    <div>
      <h1>Welcome, {user?.name}</h1>
      <p>Groups: {user?.groupMemberships.length}</p>
    </div>
  )
}
```

### In Client Components

```tsx
'use client'

import { useSession } from 'next-auth/react'
import { SignInCard } from 'ui'

export default function ProfilePage() {
  const { data: session, status } = useSession()

  if (status === 'loading') {
    return <div>Loading...</div>
  }

  if (!session) {
    return <SignInCard />
  }

  return (
    <div>
      <h1>Profile</h1>
      <p>Email: {session.user.email}</p>
      <p>Name: {session.user.name}</p>
    </div>
  )
}
```

### In Server Actions

```tsx
'use server'

import { requireAuth, getCurrentUserId } from '@/lib/auth-helpers'
import { prisma } from 'api'

export async function createGroup(formData: FormData) {
  // Throws error if not authenticated
  await requireAuth()

  const userId = await getCurrentUserId()

  const group = await prisma.group.create({
    data: {
      name: formData.get('name') as string,
      creatorId: userId!,
    },
  })

  return group
}
```

### In API Routes

```tsx
import { getCurrentSession } from '@/lib/auth-helpers'
import { NextResponse } from 'next/server'

export async function GET() {
  const session = await getCurrentSession()

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Your logic here
  return NextResponse.json({ data: 'success' })
}
```

## SMTP Setup

### For Development (Mailtrap)

1. Sign up at https://mailtrap.io
2. Get your credentials from the inbox settings
3. Update `.env`:

```bash
SMTP_HOST="sandbox.smtp.mailtrap.io"
SMTP_PORT="2525"
SMTP_USER="your-username"
SMTP_PASSWORD="your-password"
SMTP_FROM="noreply@flatflow.com"
```

### For Production (SendGrid)

1. Sign up at https://sendgrid.com
2. Create an API key
3. Update `.env`:

```bash
SMTP_HOST="smtp.sendgrid.net"
SMTP_PORT="587"
SMTP_USER="apikey"
SMTP_PASSWORD="your-sendgrid-api-key"
SMTP_FROM="noreply@yourdomain.com"
```

### Generate NEXTAUTH_SECRET

```bash
openssl rand -base64 32
```

Add to `.env`:
```bash
NEXTAUTH_SECRET="your-generated-secret"
```

## Database Migration

After adding NextAuth models to Prisma schema:

```bash
pnpm db:push
# or
pnpm exec prisma migrate dev --name add-nextauth
```
