# Balance Calculation Utility

Comprehensive utility for calculating balances, settlements, and fairness scores in FlatFlow.

## Overview

The balance utility provides three main capabilities:
1. **Balance Calculation** - Determine who owes/is owed money
2. **Settlement Simplification** - Minimize number of transactions needed
3. **Fairness Scoring** - Rate users 0-100 based on contributions

---

## Installation & Setup

The utility is already set up. To run tests:

```bash
cd apps/web

# Run all tests
pnpm test

# Run in watch mode
pnpm test:watch

# Run with coverage
pnpm test:coverage
```

---

## API Reference

### Types

```typescript
interface User {
  id: string
  name: string
}

interface ExpenseShare {
  userId: string
  amount: number  // in cents
  isPaid: boolean
}

interface Expense {
  id: string
  amount: number  // in cents
  paidById: string
  shares: ExpenseShare[]
}

interface ChoreAssignment {
  userId: string
  points: number
  isCompleted: boolean
}

interface NetBalance {
  userId: string
  userName: string
  balance: number  // Positive = owed, Negative = owes
}

interface Settlement {
  from: string      // User ID
  fromName: string
  to: string        // User ID
  toName: string
  amount: number    // in cents
}

interface FairnessScore {
  userId: string
  userName: string
  score: number              // 0-100
  expenseContribution: number
  choreContribution: number
  totalContribution: number
}
```

---

## Functions

### Balance Calculation

#### `calculateNetBalances(users, expenses)`

Calculate net balance for each user.

**Parameters:**
- `users: User[]` - List of users in the group
- `expenses: Expense[]` - List of all expenses

**Returns:** `NetBalance[]`

**Example:**
```typescript
import { calculateNetBalances } from '@/lib/balance'

const users = [
  { id: '1', name: 'Alice' },
  { id: '2', name: 'Bob' },
  { id: '3', name: 'Charlie' },
]

const expenses = [
  {
    id: 'exp1',
    amount: 12000, // $120
    paidById: '1',  // Alice paid
    shares: [
      { userId: '1', amount: 4000, isPaid: true },
      { userId: '2', amount: 4000, isPaid: false },
      { userId: '3', amount: 4000, isPaid: false },
    ],
  },
]

const balances = calculateNetBalances(users, expenses)
// [
//   { userId: '1', userName: 'Alice', balance: 8000 },   // +$80
//   { userId: '2', userName: 'Bob', balance: -4000 },    // -$40
//   { userId: '3', userName: 'Charlie', balance: -4000 } // -$40
// ]
```

---

#### `simplifySettlements(users, netBalances)`

Minimize number of transactions needed to settle all debts.

**Parameters:**
- `users: User[]` - List of users
- `netBalances: NetBalance[]` - Net balances from calculateNetBalances()

**Returns:** `Settlement[]`

**Algorithm:**
Uses a greedy algorithm to minimize transactions:
1. Find person who owes most (max negative balance)
2. Find person who is owed most (max positive balance)
3. Settle between them for min(debt, credit)
4. Repeat until all balanced

**Example:**
```typescript
const settlements = simplifySettlements(users, balances)
// [
//   { from: '2', fromName: 'Bob', to: '1', toName: 'Alice', amount: 4000 },
//   { from: '3', fromName: 'Charlie', to: '1', toName: 'Alice', amount: 4000 }
// ]
```

---

#### `calculateBalanceAndSettlements(users, expenses)`

Convenience function that combines both calculations.

**Parameters:**
- `users: User[]` - List of users
- `expenses: Expense[]` - List of expenses

**Returns:**
```typescript
{
  balances: NetBalance[]
  settlements: Settlement[]
}
```

**Example:**
```typescript
const { balances, settlements } = calculateBalanceAndSettlements(users, expenses)
```

---

### Fairness Scoring

#### `computeFairnessScore(users, expenses, choreAssignments)`

Calculate fairness score (0-100) for each user.

**Scoring Algorithm:**
- **Expense Contribution (50%)**: Ratio of paid vs owed
  - Paid more than owed = higher score
  - Paid less than owed = lower score
- **Chore Contribution (50%)**: Completion rate
  - High completion rate = higher score
  - Low completion rate = lower score

**Parameters:**
- `users: User[]` - List of users
- `expenses: Expense[]` - List of expenses
- `choreAssignments: ChoreAssignment[]` - Chore assignments with completion status

**Returns:** `FairnessScore[]`

**Example:**
```typescript
const choreAssignments = [
  { userId: '1', points: 3, isCompleted: true },
  { userId: '1', points: 2, isCompleted: true },
  { userId: '2', points: 3, isCompleted: false },
  { userId: '3', points: 2, isCompleted: true },
]

const scores = computeFairnessScore(users, expenses, choreAssignments)
// [
//   {
//     userId: '1',
//     userName: 'Alice',
//     score: 95,  // High score: paid + completed chores
//     expenseContribution: 100,
//     choreContribution: 100,
//     totalContribution: 130
//   },
//   {
//     userId: '2',
//     userName: 'Bob',
//     score: 25,  // Low score: didn't pay + no chores
//     expenseContribution: 0,
//     choreContribution: 0,
//     totalContribution: -40
//   },
//   ...
// ]
```

---

### Utility Functions

#### `getUserOutstandingDebts(userId, settlements)`

Get all settlements where user owes money.

```typescript
const debts = getUserOutstandingDebts('2', settlements)
// [{ from: '2', to: '1', amount: 4000 }]
```

#### `getUserAmountsOwed(userId, settlements)`

Get all settlements where user is owed money.

```typescript
const owed = getUserAmountsOwed('1', settlements)
// [{ from: '2', to: '1', amount: 4000 }, ...]
```

#### `calculateUserTotalDebt(userId, settlements)`

Calculate total debt for a user.

```typescript
const totalDebt = calculateUserTotalDebt('2', settlements)
// 4000 ($40)
```

#### `calculateUserTotalOwed(userId, settlements)`

Calculate total amount owed to a user.

```typescript
const totalOwed = calculateUserTotalOwed('1', settlements)
// 8000 ($80)
```

#### `formatCurrency(amount, currency)`

Format amount in cents to currency string.

```typescript
formatCurrency(12000, 'USD')
// "$120.00"
```

---

## Usage Examples

### Example 1: Simple Group Expense Split

```typescript
import {
  calculateBalanceAndSettlements,
  formatCurrency,
} from '@/lib/balance'

// Dinner split 3 ways
const users = [
  { id: 'alice', name: 'Alice' },
  { id: 'bob', name: 'Bob' },
  { id: 'charlie', name: 'Charlie' },
]

const expenses = [
  {
    id: 'dinner',
    amount: 9000, // $90
    paidById: 'alice',
    shares: [
      { userId: 'alice', amount: 3000, isPaid: true },
      { userId: 'bob', amount: 3000, isPaid: false },
      { userId: 'charlie', amount: 3000, isPaid: false },
    ],
  },
]

const { balances, settlements } = calculateBalanceAndSettlements(
  users,
  expenses
)

// Display balances
balances.forEach(b => {
  console.log(`${b.userName}: ${formatCurrency(b.balance)}`)
})
// Alice: $60.00
// Bob: -$30.00
// Charlie: -$30.00

// Display settlements
settlements.forEach(s => {
  console.log(
    `${s.fromName} pays ${s.toName} ${formatCurrency(s.amount)}`
  )
})
// Bob pays Alice $30.00
// Charlie pays Alice $30.00
```

---

### Example 2: Complex Multi-Expense Scenario

```typescript
// Multiple expenses with different payers
const expenses = [
  {
    id: 'groceries',
    amount: 15000, // Alice paid $150
    paidById: 'alice',
    shares: [
      { userId: 'alice', amount: 5000, isPaid: true },
      { userId: 'bob', amount: 5000, isPaid: false },
      { userId: 'charlie', amount: 5000, isPaid: false },
    ],
  },
  {
    id: 'utilities',
    amount: 12000, // Bob paid $120
    paidById: 'bob',
    shares: [
      { userId: 'alice', amount: 4000, isPaid: false },
      { userId: 'bob', amount: 4000, isPaid: true },
      { userId: 'charlie', amount: 4000, isPaid: false },
    ],
  },
]

const { balances, settlements } = calculateBalanceAndSettlements(
  users,
  expenses
)

// Algorithm automatically simplifies:
// Instead of:
//   - Alice pays Bob $40
//   - Bob pays Alice $100
//   - Charlie pays Alice $50
//   - Charlie pays Bob $40
//
// Simplified to:
//   - Charlie pays Alice $60
//   - Charlie pays Bob $30
```

---

### Example 3: Fairness Scoring

```typescript
import { computeFairnessScore } from '@/lib/balance'

const expenses = [
  {
    id: 'rent',
    amount: 300000, // $3000
    paidById: 'alice',
    shares: [
      { userId: 'alice', amount: 100000, isPaid: true },
      { userId: 'bob', amount: 100000, isPaid: false },
      { userId: 'charlie', amount: 100000, isPaid: true },
    ],
  },
]

const chores = [
  { userId: 'alice', points: 5, isCompleted: true },
  { userId: 'alice', points: 3, isCompleted: true },
  { userId: 'bob', points: 5, isCompleted: false },
  { userId: 'bob', points: 3, isCompleted: false },
  { userId: 'charlie', points: 5, isCompleted: true },
  { userId: 'charlie', points: 3, isCompleted: false },
]

const scores = computeFairnessScore(users, expenses, chores)

scores.forEach(s => {
  console.log(`${s.userName}: ${s.score}/100`)
  console.log(`  Expense: ${s.expenseContribution}/100`)
  console.log(`  Chores: ${s.choreContribution}/100`)
})

// Alice: 100/100
//   Expense: 100/100 (paid her share)
//   Chores: 100/100 (completed all chores)
//
// Bob: 25/100
//   Expense: 0/100 (didn't pay)
//   Chores: 0/100 (didn't complete chores)
//
// Charlie: 75/100
//   Expense: 100/100 (paid her share)
//   Chores: 50/100 (completed 1 of 2 chores)
```

---

### Example 4: API Integration

```typescript
// In an API route
import { prisma } from 'api'
import { calculateBalanceAndSettlements } from '@/lib/balance'

export async function GET(
  request: NextRequest,
  { params }: { params: { groupId: string } }
) {
  // Fetch group data
  const group = await prisma.group.findUnique({
    where: { id: params.groupId },
    include: {
      members: {
        include: { user: true },
      },
      expenses: {
        include: { shares: true },
      },
    },
  })

  if (!group) {
    return NextResponse.json({ error: 'Group not found' }, { status: 404 })
  }

  // Transform to balance utility format
  const users = group.members.map(m => ({
    id: m.user.id,
    name: m.user.name,
  }))

  const expenses = group.expenses.map(e => ({
    id: e.id,
    amount: e.amount,
    paidById: e.paidById,
    shares: e.shares,
  }))

  // Calculate balances
  const { balances, settlements } = calculateBalanceAndSettlements(
    users,
    expenses
  )

  return NextResponse.json({
    data: {
      balances,
      settlements,
      totalOutstanding: balances
        .filter(b => b.balance < 0)
        .reduce((sum, b) => sum + Math.abs(b.balance), 0),
    },
  })
}
```

---

## Testing

The utility includes comprehensive tests covering:

### Test Scenarios

1. **Equal Splits** - Simple 3-way equal split
2. **Uneven Splits** - Percentage-based rent split
3. **Partial Payments** - Multiple expenses with some paid
4. **Circular Debts** - Complex multi-payer scenarios
5. **Fairness Scoring** - Expense + chore contributions
6. **Edge Cases** - Empty data, single user, rounding
7. **Integration** - Full workflow validation

### Running Tests

```bash
# Run all tests
pnpm test

# Run specific test file
pnpm test balance

# Run with coverage
pnpm test:coverage

# Watch mode for development
pnpm test:watch
```

### Test Coverage

72 test cases covering:
- ✅ Balance calculation accuracy
- ✅ Settlement minimization
- ✅ Fairness score computation
- ✅ Edge case handling
- ✅ Rounding and precision
- ✅ Empty data scenarios
- ✅ Integration workflows

---

## Performance

### Time Complexity

- `calculateNetBalances()`: **O(n × m)** where n = users, m = expenses
- `simplifySettlements()`: **O(n²)** worst case with greedy algorithm
- `computeFairnessScore()`: **O(n × m + n × c)** where c = chore assignments

### Space Complexity

- **O(n)** for balance storage
- **O(k)** for settlements where k ≤ n-1 (minimized transactions)

### Optimizations

- Rounding to cents prevents floating-point errors
- Greedy algorithm minimizes settlement count
- Early termination when balances reach zero

---

## Future Enhancements

Potential improvements:

1. **Currency Conversion** - Multi-currency support
2. **Historical Tracking** - Balance changes over time
3. **Payment Reminders** - Auto-generate payment requests
4. **Debt Consolidation** - Advanced optimization algorithms
5. **Weighted Chores** - Different point values per chore
6. **Recurring Expenses** - Automatic expense generation
7. **Export/Import** - CSV/JSON data exchange

---

## Troubleshooting

### Issue: Balances don't sum to zero

**Cause:** Floating-point precision errors

**Solution:** All amounts stored in cents (integers), rounded when displayed

---

### Issue: Too many settlements

**Cause:** Not using simplifySettlements()

**Solution:** Always use `calculateBalanceAndSettlements()` or call `simplifySettlements()` after calculating balances

---

### Issue: Fairness scores seem wrong

**Cause:** Not including all data (expenses or chores)

**Solution:** Ensure all expenses and chore assignments are included in computation

---

## Support

For issues or questions:
- See tests: `apps/web/__tests__/balance.test.ts`
- Architecture docs: `ARCHITECTURE.md`
- API docs: `apps/web/app/api/README.md`
