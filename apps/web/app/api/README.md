# FlatFlow API Documentation

Complete REST API for FlatFlow flatmate management application.

## Authentication

All API routes require authentication via NextAuth session cookies. Unauthenticated requests return `401 Unauthorized`.

## Response Format

All responses follow this structure:

```typescript
// Success
{
  data: T,
  message?: string
}

// Error
{
  error: string,
  details?: Record<string, string[]> // Validation errors
}
```

## HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request / Validation Error
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

---

## Groups API

### List Groups
```
GET /api/groups
```

Returns all groups where the user is a member.

**Response:**
```json
{
  "data": [
    {
      "id": "clx...",
      "name": "Downtown Apartment",
      "description": "Our cozy apartment",
      "currency": "USD",
      "creator": { "id": "...", "name": "...", "email": "..." },
      "members": [...],
      "_count": { "expenses": 10, "chores": 5 }
    }
  ]
}
```

---

### Create Group
```
POST /api/groups
```

**Request Body:**
```json
{
  "name": "My New Group",
  "description": "Optional description",
  "imageUrl": "https://...",
  "currency": "USD"
}
```

**Validation:**
- `name`: Required, 1-100 chars
- `description`: Optional, max 500 chars
- `imageUrl`: Optional, valid URL
- `currency`: 3-letter currency code (default: USD)

**Response:** `201 Created`
```json
{
  "data": { /* group with creator as OWNER */ },
  "message": "Group created successfully"
}
```

---

### Get Single Group
```
GET /api/groups/:id
```

Returns group with members, recent expenses, and chores.

**Response:**
```json
{
  "data": {
    "id": "clx...",
    "name": "Downtown Apartment",
    "members": [
      {
        "id": "...",
        "role": "OWNER",
        "user": { "id": "...", "name": "...", "email": "..." }
      }
    ],
    "expenses": [ /* 10 most recent */ ],
    "chores": [ /* 10 upcoming */ ],
    "_count": { "expenses": 25, "chores": 8, "members": 3 }
  }
}
```

---

### Update Group
```
PATCH /api/groups/:id
```

**Requires:** OWNER or ADMIN role

**Request Body:** (all optional)
```json
{
  "name": "Updated Name",
  "description": "New description",
  "imageUrl": "https://...",
  "currency": "EUR"
}
```

**Response:** `200 OK`

---

### Delete Group
```
DELETE /api/groups/:id
```

**Requires:** OWNER role only

**Response:** `200 OK`
```json
{
  "message": "Group deleted successfully"
}
```

---

## Expenses API

### List Expenses
```
GET /api/expenses?groupId=xxx
```

**Query Params:**
- `groupId`: Required - Group ID to list expenses for

**Response:**
```json
{
  "data": [
    {
      "id": "clx...",
      "title": "Weekly Groceries",
      "amount": 12500,
      "currency": "USD",
      "category": "Groceries",
      "splitType": "EQUAL",
      "status": "PENDING",
      "paidBy": { "id": "...", "name": "..." },
      "shares": [
        {
          "userId": "...",
          "amount": 4167,
          "isPaid": true,
          "user": { "name": "..." }
        }
      ]
    }
  ]
}
```

---

### Create Expense
```
POST /api/expenses
```

**Request Body:**
```json
{
  "groupId": "clx...",
  "title": "Dinner Out",
  "description": "Team dinner at restaurant",
  "amount": 6000,
  "currency": "USD",
  "category": "Food",
  "date": "2024-04-15T19:00:00Z",
  "receiptUrl": "https://...",
  "splitType": "EQUAL",
  "shares": [
    {
      "userId": "user1",
      "amount": 2000
    },
    {
      "userId": "user2",
      "amount": 2000
    },
    {
      "userId": "user3",
      "amount": 2000
    }
  ]
}
```

**Split Types:**
- `EQUAL`: Split evenly (shares.amount calculated automatically)
- `PERCENTAGE`: Split by percentage (shares.percentage must sum to 100)
- `EXACT`: Exact amounts (shares.amount must sum to total)
- `SHARES`: Ratio-based (shares.shares defines ratio)

**Validation:**
- `title`: Required, 1-100 chars
- `amount`: Positive number (in cents)
- `splitType`: EQUAL | PERCENTAGE | EXACT | SHARES
- `shares`: Array of user shares

**Response:** `201 Created`

---

### Get Single Expense
```
GET /api/expenses/:id
```

Returns expense with all shares and payment history.

---

### Update Expense
```
PATCH /api/expenses/:id
```

**Requires:** Must be the payer

**Request Body:** (all optional)
```json
{
  "title": "Updated Title",
  "description": "New description",
  "amount": 15000,
  "category": "Entertainment",
  "status": "SETTLED"
}
```

**Response:** `200 OK`

---

### Delete Expense
```
DELETE /api/expenses/:id
```

**Requires:** Must be the payer

**Response:** `200 OK`

---

## Chores API

### List Chores
```
GET /api/chores?groupId=xxx
```

**Query Params:**
- `groupId`: Required - Group ID to list chores for

**Response:**
```json
{
  "data": [
    {
      "id": "clx...",
      "title": "Take Out Trash",
      "frequency": "WEEKLY",
      "points": 2,
      "dueDate": "2024-04-20T00:00:00Z",
      "assignments": [
        {
          "id": "...",
          "isCompleted": false,
          "assignedDate": "2024-04-15T00:00:00Z",
          "user": { "name": "..." }
        }
      ]
    }
  ]
}
```

---

### Create Chore
```
POST /api/chores
```

**Request Body:**
```json
{
  "groupId": "clx...",
  "title": "Clean Kitchen",
  "description": "Wipe counters, clean sink, mop floor",
  "frequency": "WEEKLY",
  "points": 3,
  "dueDate": "2024-04-20T00:00:00Z",
  "assignedUserIds": ["user1", "user2"]
}
```

**Frequencies:**
- `ONCE` - One-time chore
- `DAILY` - Repeats daily
- `WEEKLY` - Repeats weekly
- `BIWEEKLY` - Every two weeks
- `MONTHLY` - Repeats monthly

**Validation:**
- `title`: Required, 1-100 chars
- `description`: Optional, max 500 chars
- `frequency`: ONCE | DAILY | WEEKLY | BIWEEKLY | MONTHLY
- `points`: 0-100 (default: 1)
- `assignedUserIds`: Array of user IDs (must be group members)

**Response:** `201 Created`

---

### Get Single Chore
```
GET /api/chores/:id
```

---

### Update Chore
```
PATCH /api/chores/:id
```

**Request Body:** (all optional)
```json
{
  "title": "Updated Chore",
  "description": "New instructions",
  "frequency": "BIWEEKLY",
  "points": 5,
  "dueDate": "2024-05-01T00:00:00Z"
}
```

**Response:** `200 OK`

---

### Delete Chore
```
DELETE /api/chores/:id
```

**Response:** `200 OK`

---

### Toggle Chore Completion
```
POST /api/chores/:id/complete
```

Marks a chore assignment as complete or incomplete.

**Request Body:**
```json
{
  "assignmentId": "clx...",
  "notes": "Optional completion notes"
}
```

**Response:**
```json
{
  "data": {
    "id": "...",
    "isCompleted": true,
    "completedAt": "2024-04-15T14:30:00Z",
    "notes": "Completed early!"
  },
  "message": "Chore marked as completed"
}
```

---

## Invites API

### Create Invite
```
POST /api/invites
```

**Requires:** OWNER or ADMIN role

**Request Body:**
```json
{
  "groupId": "clx...",
  "email": "friend@example.com",
  "expiresInDays": 7
}
```

**Validation:**
- `groupId`: Required
- `email`: Valid email address
- `expiresInDays`: 1-30 days (default: 7)

**Response:** `201 Created`
```json
{
  "data": {
    "id": "...",
    "email": "friend@example.com",
    "token": "abc123...",
    "status": "PENDING",
    "expiresAt": "2024-04-22T00:00:00Z",
    "group": { "name": "Downtown Apartment" },
    "inviteUrl": "http://localhost:3000/invite/abc123..."
  },
  "message": "Invite created successfully"
}
```

---

### List Invites
```
GET /api/invites?groupId=xxx
```

Returns all invites for a group.

---

### Preview Invite
```
GET /api/invites/accept?token=xxx
```

Get invite details before accepting (doesn't require auth).

**Response:**
```json
{
  "data": {
    "id": "...",
    "email": "friend@example.com",
    "status": "PENDING",
    "expiresAt": "2024-04-22T00:00:00Z",
    "isValid": true,
    "isExpired": false,
    "group": {
      "name": "Downtown Apartment",
      "description": "...",
      "_count": { "members": 3 }
    },
    "sender": { "name": "Demo User" }
  }
}
```

---

### Accept Invite
```
POST /api/invites/accept
```

**Request Body:**
```json
{
  "token": "abc123..."
}
```

**Validation:**
- Token must be valid and not expired
- Current user's email must match invite email
- User must not already be a member

**Response:** `200 OK`
```json
{
  "data": {
    "group": { "id": "...", "name": "..." },
    "membership": {
      "id": "...",
      "role": "MEMBER",
      "joinedAt": "2024-04-15T14:30:00Z"
    }
  },
  "message": "Successfully joined Downtown Apartment"
}
```

---

## Usage Examples

### Create a Group and Add Expense

```typescript
// 1. Create group
const groupRes = await fetch('/api/groups', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'My Apartment',
    currency: 'USD',
  }),
})
const { data: group } = await groupRes.json()

// 2. Create expense
const expenseRes = await fetch('/api/expenses', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    groupId: group.id,
    title: 'Rent',
    amount: 300000, // $3000.00
    splitType: 'EQUAL',
    shares: [
      { userId: 'user1', amount: 100000 },
      { userId: 'user2', amount: 100000 },
      { userId: 'user3', amount: 100000 },
    ],
  }),
})
```

### Invite and Accept

```typescript
// 1. Create invite (as owner/admin)
const inviteRes = await fetch('/api/invites', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    groupId: 'clx...',
    email: 'friend@example.com',
    expiresInDays: 7,
  }),
})
const { data: invite } = await inviteRes.json()

// 2. Share invite.inviteUrl with friend

// 3. Friend accepts invite
const acceptRes = await fetch('/api/invites/accept', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    token: invite.token,
  }),
})
```

---

## Error Handling

All routes return consistent error responses:

```json
{
  "error": "Validation failed",
  "details": {
    "name": ["Name is required"],
    "email": ["Invalid email address"]
  }
}
```

Common errors:
- `401`: Not authenticated - redirect to sign in
- `403`: Not authorized - insufficient permissions
- `404`: Resource not found - check ID
- `400`: Validation error - check request body
