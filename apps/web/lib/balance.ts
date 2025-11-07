/**
 * FlatFlow Balance Calculation Utility
 *
 * Calculates net balances, simplified settlements, and fairness scores
 * for group members based on expenses and chores.
 */

// ============================================
// TYPES
// ============================================

export interface User {
  id: string
  name: string
}

export interface ExpenseShare {
  userId: string
  amount: number
  isPaid: boolean
}

export interface Expense {
  id: string
  amount: number
  paidById: string
  shares: ExpenseShare[]
}

export interface ChoreAssignment {
  userId: string
  points: number
  isCompleted: boolean
}

export interface NetBalance {
  userId: string
  userName: string
  balance: number // Positive = owed money, Negative = owes money
}

export interface Settlement {
  from: string        // User ID who pays
  fromName: string    // User name
  to: string          // User ID who receives
  toName: string      // User name
  amount: number      // Amount to transfer
}

export interface FairnessScore {
  userId: string
  userName: string
  score: number       // 0-100, higher = more fair/contributing
  expenseContribution: number
  choreContribution: number
  totalContribution: number
}

// ============================================
// BALANCE CALCULATION
// ============================================

/**
 * Calculate net balance for each user
 * Returns positive for owed money, negative for owing money
 */
export function calculateNetBalances(
  users: User[],
  expenses: Expense[]
): NetBalance[] {
  // Initialize balances
  const balances = new Map<string, number>()
  users.forEach(user => balances.set(user.id, 0))

  // Process each expense
  expenses.forEach(expense => {
    // Payer gets credited the full amount
    const paidBalance = balances.get(expense.paidById) || 0
    balances.set(expense.paidById, paidBalance + expense.amount)

    // Each share holder gets debited their share
    expense.shares.forEach(share => {
      const shareBalance = balances.get(share.userId) || 0
      balances.set(share.userId, shareBalance - share.amount)
    })
  })

  // Convert to array with user names
  return users.map(user => ({
    userId: user.id,
    userName: user.name,
    balance: balances.get(user.id) || 0,
  }))
}

/**
 * Simplify settlements using greedy algorithm
 * Minimizes number of transactions needed to settle all debts
 */
export function simplifySettlements(
  users: User[],
  netBalances: NetBalance[]
): Settlement[] {
  const settlements: Settlement[] = []

  // Create working copy of balances
  const balances = new Map<string, number>()
  netBalances.forEach(nb => balances.set(nb.userId, nb.balance))

  // Create user lookup
  const userMap = new Map(users.map(u => [u.id, u]))

  // Continue until all balances are zero (or very close)
  while (true) {
    // Find person who owes the most (most negative balance)
    let maxDebtor: string | null = null
    let maxDebt = 0

    // Find person who is owed the most (most positive balance)
    let maxCreditor: string | null = null
    let maxCredit = 0

    balances.forEach((balance, userId) => {
      if (balance < -0.01 && Math.abs(balance) > maxDebt) {
        maxDebt = Math.abs(balance)
        maxDebtor = userId
      }
      if (balance > 0.01 && balance > maxCredit) {
        maxCredit = balance
        maxCreditor = userId
      }
    })

    // If no debts left, we're done
    if (!maxDebtor || !maxCreditor) {
      break
    }

    // Settle between them
    const settlementAmount = Math.min(maxDebt, maxCredit)

    settlements.push({
      from: maxDebtor,
      fromName: userMap.get(maxDebtor)?.name || 'Unknown',
      to: maxCreditor,
      toName: userMap.get(maxCreditor)?.name || 'Unknown',
      amount: Math.round(settlementAmount * 100) / 100, // Round to cents
    })

    // Update balances
    const debtorBalance = balances.get(maxDebtor) || 0
    const creditorBalance = balances.get(maxCreditor) || 0
    balances.set(maxDebtor, debtorBalance + settlementAmount)
    balances.set(maxCreditor, creditorBalance - settlementAmount)
  }

  return settlements
}

/**
 * Calculate net balances and simplified settlements in one call
 */
export function calculateBalanceAndSettlements(
  users: User[],
  expenses: Expense[]
): {
  balances: NetBalance[]
  settlements: Settlement[]
} {
  const balances = calculateNetBalances(users, expenses)
  const settlements = simplifySettlements(users, balances)

  return { balances, settlements }
}

// ============================================
// FAIRNESS SCORING
// ============================================

/**
 * Compute fairness score for each user (0-100)
 * Higher score = more fair/contributing member
 *
 * Scoring factors:
 * - Expense contribution (50%): How much they've paid vs their share
 * - Chore contribution (50%): Chore completion rate and points earned
 */
export function computeFairnessScore(
  users: User[],
  expenses: Expense[],
  choreAssignments: ChoreAssignment[]
): FairnessScore[] {
  // Calculate expense contributions
  const expenseContributions = new Map<string, { paid: number; owed: number }>()
  users.forEach(user => expenseContributions.set(user.id, { paid: 0, owed: 0 }))

  expenses.forEach(expense => {
    // Track what user paid
    const paidData = expenseContributions.get(expense.paidById)
    if (paidData) {
      paidData.paid += expense.amount
    }

    // Track what user owes
    expense.shares.forEach(share => {
      const owedData = expenseContributions.get(share.userId)
      if (owedData) {
        owedData.owed += share.amount
      }
    })
  })

  // Calculate chore contributions
  const choreContributions = new Map<string, { completed: number; total: number; points: number }>()
  users.forEach(user => choreContributions.set(user.id, { completed: 0, total: 0, points: 0 }))

  choreAssignments.forEach(assignment => {
    const data = choreContributions.get(assignment.userId)
    if (data) {
      data.total += 1
      if (assignment.isCompleted) {
        data.completed += 1
        data.points += assignment.points
      }
    }
  })

  // Calculate total expected values
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0)
  const totalChorePoints = choreAssignments.reduce((sum, c) => sum + c.points, 0)

  // Calculate fairness scores
  return users.map(user => {
    const expenseData = expenseContributions.get(user.id) || { paid: 0, owed: 0 }
    const choreData = choreContributions.get(user.id) || { completed: 0, total: 0, points: 0 }

    // Expense contribution score (0-50)
    // If paid more than owed = good, if paid less than owed = bad
    let expenseScore = 50
    if (expenseData.owed > 0) {
      const paymentRatio = expenseData.paid / expenseData.owed
      // Clamp between 0 and 100, then scale to 50
      expenseScore = Math.min(Math.max(paymentRatio * 50, 0), 50)
    } else if (totalExpenses > 0 && expenseData.paid > 0) {
      // If no debt but paid something, give full credit
      expenseScore = 50
    }

    // Chore contribution score (0-50)
    let choreScore = 25 // Default middle score if no chores
    if (choreData.total > 0) {
      const completionRate = choreData.completed / choreData.total
      choreScore = completionRate * 50
    } else if (totalChorePoints === 0) {
      // If no chores in group at all, neutral score
      choreScore = 25
    } else {
      // Has no chores assigned while others do = slightly lower
      choreScore = 20
    }

    // Total contribution (weighted sum)
    const totalContribution = (expenseData.paid - expenseData.owed) + (choreData.points * 10)

    return {
      userId: user.id,
      userName: user.name,
      score: Math.round(Math.min(Math.max(expenseScore + choreScore, 0), 100)),
      expenseContribution: Math.round(expenseScore * 2), // Scale back to 0-100
      choreContribution: Math.round(choreScore * 2), // Scale back to 0-100
      totalContribution: Math.round(totalContribution),
    }
  })
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Format currency amount (cents to dollars)
 */
export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount / 100)
}

/**
 * Get outstanding debts for a specific user
 */
export function getUserOutstandingDebts(
  userId: string,
  settlements: Settlement[]
): Settlement[] {
  return settlements.filter(s => s.from === userId)
}

/**
 * Get amounts owed to a specific user
 */
export function getUserAmountsOwed(
  userId: string,
  settlements: Settlement[]
): Settlement[] {
  return settlements.filter(s => s.to === userId)
}

/**
 * Calculate total debt for a user
 */
export function calculateUserTotalDebt(
  userId: string,
  settlements: Settlement[]
): number {
  return settlements
    .filter(s => s.from === userId)
    .reduce((sum, s) => sum + s.amount, 0)
}

/**
 * Calculate total owed to a user
 */
export function calculateUserTotalOwed(
  userId: string,
  settlements: Settlement[]
): number {
  return settlements
    .filter(s => s.to === userId)
    .reduce((sum, s) => sum + s.amount, 0)
}
