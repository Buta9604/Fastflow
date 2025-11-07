# FlatFlow

A modern full-stack monorepo powered by pnpm workspaces, Next.js 14+, Prisma, and TypeScript.

## Project Structure

```
Fastflow/
├── apps/
│   └── web/              # Next.js 14+ application (App Router)
├── packages/
│   ├── api/              # Shared API utilities and helpers
│   └── ui/               # Shared React components with Tailwind
└── prisma/               # Database schema and migrations
```

## Tech Stack

- **Framework**: Next.js 14+ with App Router
- **Language**: TypeScript
- **Package Manager**: pnpm with workspaces
- **Database**: SQLite with Prisma ORM
- **Styling**: Tailwind CSS
- **UI Components**: Custom component library

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm 8+

### Installation

1. Install dependencies:

```bash
pnpm install
```

2. Set up the database:

```bash
pnpm db:generate
pnpm db:push
```

3. Start the development server:

```bash
pnpm dev
```

The application will be available at `http://localhost:3000`.

## Available Scripts

- `pnpm dev` - Start the development server
- `pnpm build` - Build all packages and apps
- `pnpm start` - Start the production server
- `pnpm lint` - Lint all packages
- `pnpm type-check` - Type check all packages
- `pnpm test` - Run tests across all packages
- `pnpm db:generate` - Generate Prisma Client
- `pnpm db:push` - Push database schema changes
- `pnpm db:studio` - Open Prisma Studio
- `pnpm clean` - Clean all build artifacts and dependencies

## Workspace Packages

### apps/web

The main Next.js application using the App Router. Includes:
- TypeScript configuration
- Tailwind CSS setup
- Integration with shared packages

### packages/ui

Shared React component library with:
- Tailwind CSS configuration
- Reusable components (Button, etc.)
- TypeScript types

### packages/api

Shared API utilities including:
- Prisma client singleton
- API response helpers
- Validation middleware
- Error handling utilities

## Development

### Adding a New Package

1. Create a new directory under `packages/`
2. Add a `package.json` with a unique name
3. The package will automatically be available in the workspace

### Using Workspace Packages

Import workspace packages in your code:

```typescript
import { Button } from 'ui'
import { prisma, successResponse } from 'api'
```

### Database Migrations

```bash
# Push schema changes to database
pnpm db:push

# Generate Prisma Client after schema changes
pnpm db:generate

# Open Prisma Studio to view data
pnpm db:studio
```

## License

MIT