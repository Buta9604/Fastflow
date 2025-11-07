# FlatFlow Setup Guide

Complete step-by-step guide to set up FlatFlow locally.

## Prerequisites

Before you begin, ensure you have:

- **Node.js** 18.0.0 or higher ([Download](https://nodejs.org/))
- **pnpm** 8.0.0 or higher
- **Git** for version control

### Install pnpm

```bash
npm install -g pnpm@8.15.0
# or
curl -fsSL https://get.pnpm.io/install.sh | sh -
```

Verify installation:
```bash
node --version   # Should be v18.0.0+
pnpm --version   # Should be 8.0.0+
```

---

## Quick Start

```bash
# 1. Clone repository
git clone <repository-url>
cd Fastflow

# 2. Install all dependencies
pnpm install

# 3. Set up environment variables
cp .env.example .env
# Edit .env with your SMTP credentials (see below)

# 4. Set up database
pnpm db:generate
pnpm db:push
pnpm db:seed

# 5. Start development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Detailed Setup

### Step 1: Install Dependencies

```bash
pnpm install
```

This installs all dependencies across all workspaces:
- Root workspace
- apps/web (Next.js app)
- packages/ui (Component library)
- packages/api (API utilities)

**Expected output:**
```
Progress: resolved 500, reused 450, downloaded 50
Packages: +500
```

---

### Step 2: Configure Environment Variables

```bash
cp .env.example .env
```

Edit `.env` file:

```bash
# Database
DATABASE_URL="file:./dev.db"

# Next.js
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="<generate-this>"  # See below

# SMTP Configuration
SMTP_HOST="sandbox.smtp.mailtrap.io"
SMTP_PORT="2525"
SMTP_USER="<your-mailtrap-user>"
SMTP_PASSWORD="<your-mailtrap-password>"
SMTP_FROM="noreply@flatflow.com"
```

#### Generate NEXTAUTH_SECRET

```bash
openssl rand -base64 32
```

Copy output and paste into `.env`:
```bash
NEXTAUTH_SECRET="your-generated-secret-here"
```

#### SMTP Setup (Development)

**Option 1: Mailtrap (Recommended for Development)**

1. Sign up at [https://mailtrap.io](https://mailtrap.io) (free)
2. Go to Email Testing → Inboxes → My Inbox
3. Click "Show Credentials"
4. Copy credentials to `.env`:

```bash
SMTP_HOST="sandbox.smtp.mailtrap.io"
SMTP_PORT="2525"
SMTP_USER="your-username-from-mailtrap"
SMTP_PASSWORD="your-password-from-mailtrap"
SMTP_FROM="noreply@flatflow.com"
```

**Option 2: Gmail (For Testing)**

1. Enable 2-Factor Authentication on your Google account
2. Generate App Password:
   - Go to Google Account → Security
   - 2-Step Verification → App passwords
   - Generate password for "Mail"
3. Configure `.env`:

```bash
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="your-16-char-app-password"
SMTP_FROM="your-email@gmail.com"
```

---

### Step 3: Set Up Database

#### Generate Prisma Client

```bash
pnpm db:generate
```

This generates TypeScript types from your Prisma schema.

**Expected output:**
```
✔ Generated Prisma Client
```

#### Push Schema to Database

```bash
pnpm db:push
```

This creates the SQLite database and all tables.

**Expected output:**
```
✔ Database schema synchronized
✔ Generated Prisma Client
```

#### Seed Database with Demo Data

```bash
pnpm db:seed
```

This creates:
- 3 demo users (demo@flatflow.com, alice@flatflow.com, bob@flatflow.com)
- 1 group ("Downtown Apartment")
- 3 group members
- 4 sample expenses
- 3 chores with assignments
- 2 payments

**Expected output:**
```
🌱 Starting database seed...
👤 Creating users...
✅ Created 3 users
🏠 Creating group...
✅ Created group: Downtown Apartment
👥 Adding group members...
✅ Added 3 members
💰 Creating expenses...
✅ Created 4 expenses
🧹 Creating chores...
✅ Created 3 chores
🎉 Seed completed successfully!
```

---

### Step 4: Start Development Server

```bash
pnpm dev
```

**Expected output:**
```
> web@1.0.0 dev
> next dev

  ▲ Next.js 14.1.0
  - Local:        http://localhost:3000
  - Ready in 2.1s
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Verify Installation

### 1. Check Home Page

Navigate to [http://localhost:3000](http://localhost:3000)

You should see:
- "Welcome to FlatFlow" heading
- Theme switcher (3 color dots)
- Button examples in different variants

### 2. Test Authentication

1. Scroll to find or add `<SignInCard />` component to page
2. Enter your email
3. Click "Send magic link"
4. Check Mailtrap inbox for email
5. Click the link in email
6. You should be signed in

### 3. Open Prisma Studio

```bash
pnpm db:studio
```

Opens at [http://localhost:5555](http://localhost:5555)

You should see:
- Tables: User, Group, Expense, Chore, etc.
- 3 users in database
- 1 group with 3 members
- 4 expenses
- 3 chores

### 4. Test API Endpoints

Using curl or Postman:

```bash
# List groups (requires authentication)
curl http://localhost:3000/api/groups \
  -H "Cookie: next-auth.session-token=your-token"

# Expected: 200 OK with groups array
```

---

## Development Commands

### Core Commands

```bash
pnpm dev              # Start development server
pnpm build            # Build for production
pnpm start            # Start production server
pnpm lint             # Lint all packages
pnpm type-check       # TypeScript type checking
pnpm format           # Format code with Prettier
```

### Database Commands

```bash
pnpm db:generate      # Generate Prisma Client
pnpm db:push          # Push schema to database
pnpm db:seed          # Seed database with demo data
pnpm db:reset         # Drop + recreate + seed database
pnpm db:studio        # Open Prisma Studio (GUI)
```

### Workspace Commands

```bash
# Run in specific package
pnpm --filter web dev
pnpm --filter api type-check
pnpm --filter ui lint

# Run in all packages
pnpm -r build
pnpm -r test
pnpm -r clean
```

---

## Project Structure Tour

After setup, your project structure:

```
Fastflow/
├── node_modules/           # Dependencies (gitignored)
├── apps/
│   └── web/
│       ├── .next/         # Next.js build (gitignored)
│       ├── node_modules/  # App dependencies
│       └── ...
├── packages/
│   ├── api/
│   │   └── node_modules/
│   └── ui/
│       └── node_modules/
├── prisma/
│   ├── dev.db            # SQLite database (gitignored)
│   ├── schema.prisma     # Database schema
│   └── seed.ts           # Seed script
├── .env                  # Environment variables (gitignored)
├── .env.example          # Template
└── pnpm-lock.yaml        # Dependency lock file
```

---

## Troubleshooting

### Issue: "Module not found"

```bash
# Clear everything and reinstall
rm -rf node_modules apps/*/node_modules packages/*/node_modules
rm -rf .next apps/*/.next
pnpm install
```

### Issue: "Prisma Client not generated"

```bash
pnpm db:generate
```

### Issue: "Database file doesn't exist"

```bash
pnpm db:push
pnpm db:seed
```

### Issue: "Port 3000 already in use"

```bash
# Find process using port 3000
lsof -ti:3000 | xargs kill -9

# Or use different port
PORT=3001 pnpm dev
```

### Issue: "Authentication not working"

1. Check NEXTAUTH_SECRET is set in `.env`
2. Verify SMTP credentials are correct
3. Check Mailtrap inbox for emails
4. Ensure NEXTAUTH_URL matches your domain

### Issue: "Type errors"

```bash
# Regenerate Prisma Client
pnpm db:generate

# Check for errors
pnpm type-check

# Clear Next.js cache
rm -rf apps/web/.next
pnpm dev
```

---

## Next Steps

### 1. Explore the Application

- View groups at `/api/groups`
- Create expenses via API
- Manage chores
- Try theme switching

### 2. Read Documentation

- [ARCHITECTURE.md](./ARCHITECTURE.md) - System architecture
- [apps/web/app/api/README.md](./apps/web/app/api/README.md) - API docs
- [apps/web/lib/README-AUTH.md](./apps/web/lib/README-AUTH.md) - Auth guide

### 3. Modify the Application

Try making changes:

```typescript
// apps/web/app/page.tsx
// Change the welcome message
<h1>Welcome to My FlatFlow App</h1>

// packages/ui/src/Button.tsx
// Modify button styles
primary: 'bg-blue-600 text-white ...'
```

Save and see live updates (Hot Module Replacement).

### 4. Create Your First Feature

Example: Add a new API endpoint

```typescript
// apps/web/app/api/hello/route.ts
import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({ message: 'Hello World!' })
}
```

Test: `curl http://localhost:3000/api/hello`

---

## Production Setup

### 1. Update Environment Variables

```bash
# Use production database
DATABASE_URL="postgresql://user:pass@host/db"

# Use production URL
NEXTAUTH_URL="https://yourdomain.com"

# Generate secure secret
NEXTAUTH_SECRET="<new-secret>"

# Use production SMTP (SendGrid, etc.)
SMTP_HOST="smtp.sendgrid.net"
SMTP_USER="apikey"
SMTP_PASSWORD="<sendgrid-api-key>"
```

### 2. Run Migrations

```bash
# Create migration
pnpm exec prisma migrate dev --name init

# Apply in production
pnpm exec prisma migrate deploy
```

### 3. Build

```bash
pnpm install --frozen-lockfile
pnpm db:generate
pnpm build
```

### 4. Deploy

See [ARCHITECTURE.md](./ARCHITECTURE.md#deployment) for deployment guides.

---

## Getting Help

### Documentation

- **Architecture**: [ARCHITECTURE.md](./ARCHITECTURE.md)
- **API Reference**: [apps/web/app/api/README.md](./apps/web/app/api/README.md)
- **Auth Guide**: [apps/web/lib/README-AUTH.md](./apps/web/lib/README-AUTH.md)

### Community

- GitHub Issues
- Discord (if available)
- Stack Overflow (tag: flatflow)

### Support

- Email: support@flatflow.com
- Documentation: [docs.flatflow.com](https://docs.flatflow.com)

---

## Success Checklist

- [ ] pnpm installed (v8.0.0+)
- [ ] Dependencies installed (`pnpm install`)
- [ ] `.env` configured with SMTP
- [ ] Database created (`pnpm db:push`)
- [ ] Database seeded (`pnpm db:seed`)
- [ ] Dev server running (`pnpm dev`)
- [ ] Homepage loads at localhost:3000
- [ ] Authentication working
- [ ] Prisma Studio accessible
- [ ] API endpoints responding

---

**You're all set! Happy coding! 🚀**
