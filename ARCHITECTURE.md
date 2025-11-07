# FlatFlow Architecture Documentation

## 📋 Table of Contents
1. [Overview](#overview)
2. [Project Structure](#project-structure)
3. [Technology Stack](#technology-stack)
4. [Data Flow](#data-flow)
5. [Authentication](#authentication)
6. [API Architecture](#api-architecture)
7. [Database Schema](#database-schema)
8. [Design System](#design-system)
9. [Development Workflow](#development-workflow)
10. [Deployment](#deployment)

---

## Overview

FlatFlow is a modern full-stack flatmate management application built as a monorepo using pnpm workspaces. It enables roommates to:
- Track shared expenses with flexible split types
- Manage household chores and assignments
- Invite members to groups
- Handle payments and settlements

### Key Features
- 🏠 **Group Management** - Create and manage flatmate groups
- 💰 **Expense Tracking** - EQUAL, PERCENTAGE, EXACT, SHARES split types
- 🧹 **Chore Management** - Assign and track household tasks
- 👥 **Invite System** - Secure token-based group invitations
- 🔐 **Passwordless Auth** - Email magic link authentication
- 🎨 **Theming** - Three accent themes (Sage, Lavender, Sand)
- 📱 **Responsive** - Mobile-first design

---

## Project Structure

```
Fastflow/
├── apps/
│   └── web/                    # Next.js 14+ application
│       ├── app/
│       │   ├── api/           # API routes
│       │   │   ├── groups/    # Groups CRUD
│       │   │   ├── expenses/  # Expenses CRUD
│       │   │   ├── chores/    # Chores CRUD + completion
│       │   │   ├── invites/   # Invite creation & acceptance
│       │   │   └── auth/      # NextAuth handlers
│       │   ├── layout.tsx     # Root layout with providers
│       │   ├── page.tsx       # Home page
│       │   └── globals.css    # Global styles
│       ├── components/        # React components
│       ├── lib/              # Utilities & helpers
│       │   ├── auth.ts       # NextAuth configuration
│       │   └── auth-helpers.ts # Session utilities
│       └── types/            # TypeScript definitions
│
├── packages/
│   ├── api/                  # Shared API utilities
│   │   └── src/
│   │       ├── db.ts        # Prisma client singleton
│   │       ├── response.ts  # API response helpers
│   │       ├── middleware.ts # Validation & error handling
│   │       └── index.ts     # Exports
│   │
│   └── ui/                   # Shared component library
│       ├── src/
│       │   ├── Button.tsx
│       │   ├── SignInCard.tsx
│       │   ├── ThemeProvider.tsx
│       │   ├── ThemeSwitcher.tsx
│       │   └── index.ts
│       └── styles/
│           └── design-tokens.css
│
├── prisma/
│   ├── schema.prisma        # Database schema
│   └── seed.ts              # Seed data script
│
├── package.json             # Root workspace config
├── pnpm-workspace.yaml      # pnpm workspace definition
├── .env                     # Environment variables
└── README.md               # Project documentation
```

---

## Technology Stack

### Frontend
- **Framework:** Next.js 14+ (App Router)
- **Language:** TypeScript 5.3+
- **Styling:** Tailwind CSS 3.4+ with CSS Variables
- **UI Components:** Custom component library with theme system
- **State Management:** React Server Components + Client Components

### Backend
- **Runtime:** Node.js 18+
- **API:** Next.js Route Handlers (App Router)
- **Validation:** Zod 3.22+
- **Authentication:** NextAuth 4.24+ with Prisma Adapter

### Database
- **ORM:** Prisma 5.8+
- **Database:** SQLite (dev), easily migrateable to PostgreSQL/MySQL
- **Schema:** 12 models with relations and indexes

### Development
- **Package Manager:** pnpm 8+
- **Monorepo:** pnpm workspaces
- **Linting:** ESLint with Next.js config
- **Type Checking:** TypeScript strict mode

---

## Data Flow

### Request Flow
```
Client Request
    ↓
Next.js Middleware (optional)
    ↓
Route Handler (/app/api/*)
    ↓
Auth Check (getCurrentUserId)
    ↓
Zod Validation
    ↓
Authorization Check (role/membership)
    ↓
Prisma Database Query
    ↓
Response Formatting
    ↓
Client Response
```

### Server Component Flow
```
Server Component
    ↓
getCurrentSession()
    ↓
Prisma Query (direct)
    ↓
Render with Data
```

---

## Authentication

### NextAuth Implementation

**Provider:** Email (Magic Link)
- Passwordless authentication
- Secure token generation
- Database session strategy
- 30-day session expiration

**Session Strategy:**
```typescript
{
  strategy: 'database',
  maxAge: 30 * 24 * 60 * 60, // 30 days
  updateAge: 24 * 60 * 60,   // 24 hours
}
```

**Models:**
- `Account` - OAuth providers (extensible)
- `Session` - User sessions with tokens
- `VerificationToken` - Magic link tokens

### Usage Patterns

**Server Components:**
```typescript
import { getCurrentUser } from '@/lib/auth-helpers'

const user = await getCurrentUser() // Full user with relations
```

**Client Components:**
```typescript
import { useSession } from 'next-auth/react'

const { data: session } = useSession()
```

**API Routes:**
```typescript
import { getCurrentUserId } from '@/lib/auth-helpers'

const userId = await getCurrentUserId()
if (!userId) return 401
```

---

## API Architecture

### Design Principles
1. **RESTful** - Standard HTTP methods (GET, POST, PATCH, DELETE)
2. **Resource-based** - URLs represent resources (/api/groups/:id)
3. **Stateless** - Each request contains all necessary information
4. **Consistent Errors** - Standardized error response format
5. **Validation** - Zod schemas for all inputs

### Response Format
```typescript
// Success
{
  data: T,
  message?: string
}

// Error
{
  error: string,
  details?: Record<string, string[]>
}
```

### HTTP Status Codes
- `200` OK - Successful GET/PATCH/DELETE
- `201` Created - Successful POST
- `400` Bad Request - Validation error
- `401` Unauthorized - Not authenticated
- `403` Forbidden - Insufficient permissions
- `404` Not Found - Resource doesn't exist
- `500` Internal Server Error - Unexpected error

### Endpoints

**Groups:**
- `GET /api/groups` - List groups
- `POST /api/groups` - Create group
- `GET /api/groups/:id` - Get single group
- `PATCH /api/groups/:id` - Update group
- `DELETE /api/groups/:id` - Delete group

**Expenses:**
- `GET /api/expenses?groupId=xxx` - List expenses
- `POST /api/expenses` - Create expense
- `GET /api/expenses/:id` - Get single expense
- `PATCH /api/expenses/:id` - Update expense
- `DELETE /api/expenses/:id` - Delete expense

**Chores:**
- `GET /api/chores?groupId=xxx` - List chores
- `POST /api/chores` - Create chore
- `GET /api/chores/:id` - Get single chore
- `PATCH /api/chores/:id` - Update chore
- `DELETE /api/chores/:id` - Delete chore
- `POST /api/chores/:id/complete` - Toggle completion

**Invites:**
- `POST /api/invites` - Create invite
- `GET /api/invites?groupId=xxx` - List invites
- `GET /api/invites/accept?token=xxx` - Preview invite
- `POST /api/invites/accept` - Accept invite

---

## Database Schema

### Core Models

**User** - Application users
- Authentication via NextAuth
- Relations: groups, expenses, chores, payments

**Group** - Flatmate groups
- Creator with OWNER role
- Currency configuration
- Relations: members, expenses, chores

**GroupMember** - Group membership (join table)
- Roles: OWNER, ADMIN, MEMBER
- Unique constraint: (userId, groupId)

**Expense** - Shared expenses
- Split types: EQUAL, PERCENTAGE, EXACT, SHARES
- Status: PENDING, SETTLED, PARTIAL, CANCELLED
- Payer relation

**ExpenseShare** - Individual expense shares
- Amount owed per user
- Payment tracking (isPaid)
- Unique constraint: (expenseId, userId)

**Chore** - Household tasks
- Frequency: ONCE, DAILY, WEEKLY, BIWEEKLY, MONTHLY
- Points system for gamification

**ChoreAssignment** - Chore assignments to users
- Completion tracking
- Notes field for updates

**Invite** - Group invitations
- Secure token (32-byte hex)
- Status: PENDING, ACCEPTED, DECLINED, EXPIRED
- Expiration timestamp

**Payment** - Settlement records
- Links to expenses
- Status tracking
- Method field (Cash, Venmo, etc.)

### Indexes
All foreign keys are indexed for performance. Additional indexes on:
- Frequently queried fields (status, date, isPaid)
- Unique lookups (email, token, sessionToken)

---

## Design System

### CSS Variables Approach
All design tokens defined as CSS variables in `packages/ui/styles/design-tokens.css`.

**Benefits:**
- Runtime theme switching
- No CSS rebuilds
- Easy customization
- Better performance

### Theme Structure
```css
:root {
  --color-neutral-50: 250 250 249;
  --color-accent-500: var(--accent-sage-500);
  --spacing-4: 1rem;
  --radius-button: var(--radius-lg);
  --font-sans: var(--font-inter);
}

[data-accent="lavender"] {
  --color-accent-500: var(--accent-lavender-500);
}
```

### Tailwind Integration
```javascript
theme: {
  extend: {
    colors: {
      accent: {
        500: 'rgb(var(--color-accent-500) / <alpha-value>)',
      }
    }
  }
}
```

### Themes
- **Sage** - Calm, natural green (default)
- **Lavender** - Soft, elegant purple
- **Sand** - Warm, earthy beige

---

## Development Workflow

### Setup
```bash
# Install dependencies
pnpm install

# Set up environment
cp .env.example .env
# Configure SMTP credentials

# Generate Prisma Client
pnpm db:generate

# Push schema to database
pnpm db:push

# Seed database
pnpm db:seed

# Start development server
pnpm dev
```

### Common Commands
```bash
# Development
pnpm dev              # Start Next.js dev server
pnpm lint             # Lint all packages
pnpm type-check       # TypeScript type checking

# Database
pnpm db:generate      # Generate Prisma Client
pnpm db:push          # Push schema changes
pnpm db:seed          # Seed database
pnpm db:reset         # Reset and reseed
pnpm db:studio        # Open Prisma Studio

# Build
pnpm build            # Build all packages
pnpm start            # Start production server
```

### Workspace Commands
```bash
# Run in specific package
pnpm --filter web dev
pnpm --filter api type-check

# Run in all packages
pnpm -r lint
pnpm -r test
```

---

## Deployment

### Environment Variables Required

**Database:**
```
DATABASE_URL="file:./dev.db"  # SQLite for dev
# DATABASE_URL="postgresql://..." # PostgreSQL for production
```

**NextAuth:**
```
NEXTAUTH_URL="https://yourdomain.com"
NEXTAUTH_SECRET="your-secret-key"  # Generate with: openssl rand -base64 32
```

**SMTP:**
```
SMTP_HOST="smtp.sendgrid.net"
SMTP_PORT="587"
SMTP_USER="apikey"
SMTP_PASSWORD="your-sendgrid-api-key"
SMTP_FROM="noreply@yourdomain.com"
```

### Build Process
```bash
# 1. Install dependencies
pnpm install --frozen-lockfile

# 2. Generate Prisma Client
pnpm db:generate

# 3. Run database migrations
pnpm exec prisma migrate deploy

# 4. Build application
pnpm build

# 5. Start production server
pnpm start
```

### Recommended Platforms
- **Vercel** - Optimal for Next.js (zero-config)
- **Railway** - Easy database + app deployment
- **Fly.io** - Full control with Docker
- **AWS** - Enterprise-grade infrastructure

### Database Migration
To migrate from SQLite to PostgreSQL:
```bash
# 1. Update DATABASE_URL in .env
DATABASE_URL="postgresql://..."

# 2. Push schema
pnpm db:push

# 3. Migrate data (if needed)
# Use prisma db push or custom migration scripts
```

---

## Security Considerations

### Authentication
- ✅ Database sessions (more secure than JWT)
- ✅ Email verification required
- ✅ Secure token generation (32-byte hex)
- ✅ Invite expiration

### Authorization
- ✅ Role-based access control
- ✅ Membership verification on all operations
- ✅ Resource ownership checks
- ✅ Server-side validation only

### Data Validation
- ✅ Zod schemas for all inputs
- ✅ Type-safe database queries
- ✅ SQL injection prevention (Prisma ORM)
- ✅ XSS prevention (React escaping)

### Best Practices
- Never trust client input
- Always validate on server
- Use parameterized queries (Prisma)
- Implement rate limiting (future)
- Add CSRF protection (future)

---

## Performance Optimizations

### Database
- ✅ Indexes on foreign keys
- ✅ Indexes on frequently queried fields
- ✅ Efficient query patterns with includes
- ✅ Connection pooling (Prisma)

### Frontend
- ✅ Server Components by default
- ✅ Client Components only when needed
- ✅ CSS Variables (no runtime CSS)
- ✅ Code splitting (Next.js automatic)

### API
- ✅ Efficient Prisma queries
- ✅ Proper HTTP status codes
- ✅ Error handling without exposing internals
- ✅ Consistent response format

---

## Future Enhancements

### Planned Features
- [ ] Real-time updates (WebSockets/SSE)
- [ ] Push notifications
- [ ] File upload for receipts
- [ ] Budget tracking
- [ ] Expense categories customization
- [ ] Recurring expenses
- [ ] Payment integrations (Venmo, PayPal)
- [ ] Mobile app (React Native)

### Technical Improvements
- [ ] Rate limiting
- [ ] Request caching
- [ ] Background jobs (cron)
- [ ] Email queue
- [ ] Observability (logging, monitoring)
- [ ] E2E tests (Playwright)
- [ ] Unit tests (Jest)
- [ ] CI/CD pipeline

---

## Troubleshooting

### Common Issues

**1. "Module not found" errors**
```bash
# Clear node_modules and reinstall
pnpm clean
pnpm install
```

**2. "Prisma Client not generated"**
```bash
pnpm db:generate
```

**3. "Database doesn't exist"**
```bash
pnpm db:push
pnpm db:seed
```

**4. "NextAuth error"**
- Check NEXTAUTH_SECRET is set
- Verify NEXTAUTH_URL matches your domain
- Check SMTP credentials are correct

**5. Type errors**
```bash
pnpm type-check
# Fix TypeScript errors shown
```

---

## Contributing

### Code Style
- Use TypeScript strict mode
- Follow ESLint rules
- Use Prettier for formatting
- Write meaningful commit messages

### Pull Request Process
1. Create feature branch
2. Make changes
3. Run tests and type checking
4. Update documentation
5. Submit PR with description

---

## License

MIT License - See LICENSE file for details

---

## Support

For issues or questions:
- GitHub Issues: [Repository URL]
- Documentation: `/apps/web/app/api/README.md`
- Email: support@flatflow.com
