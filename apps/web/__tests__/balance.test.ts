/**
 * FlatFlow Balance Calculation Tests
 *
 * Tests for balance calculation, settlement simplification,
 * and fairness scoring algorithms.
 */

import {
  calculateNetBalances,
  simplifySettlements,
  calculateBalanceAndSettlements,
  computeFairnessScore,
  getUserOutstandingDebts,
  getUserAmountsOwed,
  calculateUserTotalDebt,
  calculateUserTotalOwed,
  type User,
  type Expense,
  type ChoreAssignment,
} from '../lib/balance'

// ============================================
// TEST DATA
// ============================================

const users: User[] = [
  { id: 'user1', name: 'Alice' },
  { id: 'user2', name: 'Bob' },
  { id: 'user3', name: 'Charlie' },
]

// ============================================
// SCENARIO 1: EQUAL SPLITS
// ============================================

describe('Balance Calculation - Equal Splits', () => {
  const expenses: Expense[] = [
    {
      id: 'exp1',
      amount: 12000, // $120
      paidById: 'user1',
      shares: [
        { userId: 'user1', amount: 4000, isPaid: true },
        { userId: 'user2', amount: 4000, isPaid: false },
        { userId: 'user3', amount: 4000, isPaid: false },
      ],
    },
  ]

  test('should calculate correct net balances for equal split', () => {
    const balances = calculateNetBalances(users, expenses)

    expect(balances).toHaveLength(3)

    // Alice paid $120, owes $40, net = +$80
    const alice = balances.find(b => b.userId === 'user1')
    expect(alice?.balance).toBe(8000)
    expect(alice?.userName).toBe('Alice')

    // Bob paid $0, owes $40, net = -$40
    const bob = balances.find(b => b.userId === 'user2')
    expect(bob?.balance).toBe(-4000)

    // Charlie paid $0, owes $40, net = -$40
    const charlie = balances.find(b => b.userId === 'user3')
    expect(charlie?.balance).toBe(-4000)
  })

  test('should create two settlements for equal split', () => {
    const balances = calculateNetBalances(users, expenses)
    const settlements = simplifySettlements(users, balances)

    expect(settlements).toHaveLength(2)

    // Bob pays Alice $40
    const settlement1 = settlements.find(s => s.from === 'user2' && s.to === 'user1')
    expect(settlement1?.amount).toBe(4000)
    expect(settlement1?.fromName).toBe('Bob')
    expect(settlement1?.toName).toBe('Alice')

    // Charlie pays Alice $40
    const settlement2 = settlements.find(s => s.from === 'user3' && s.to === 'user1')
    expect(settlement2?.amount).toBe(4000)
  })
})

// ============================================
// SCENARIO 2: UNEVEN SPLITS (PERCENTAGE)
// ============================================

describe('Balance Calculation - Uneven Splits', () => {
  const expenses: Expense[] = [
    {
      id: 'exp1',
      amount: 300000, // $3000 rent
      paidById: 'user1',
      shares: [
        { userId: 'user1', amount: 100000, isPaid: true }, // 33.33%
        { userId: 'user2', amount: 120000, isPaid: false }, // 40% (bigger room)
        { userId: 'user3', amount: 80000, isPaid: false }, // 26.67% (smaller room)
      ],
    },
  ]

  test('should calculate correct net balances for uneven split', () => {
    const balances = calculateNetBalances(users, expenses)

    // Alice paid $3000, owes $1000, net = +$2000
    const alice = balances.find(b => b.userId === 'user1')
    expect(alice?.balance).toBe(200000)

    // Bob paid $0, owes $1200, net = -$1200
    const bob = balances.find(b => b.userId === 'user2')
    expect(bob?.balance).toBe(-120000)

    // Charlie paid $0, owes $800, net = -$800
    const charlie = balances.find(b => b.userId === 'user3')
    expect(charlie?.balance).toBe(-80000)
  })

  test('should simplify settlements for uneven split', () => {
    const balances = calculateNetBalances(users, expenses)
    const settlements = simplifySettlements(users, balances)

    expect(settlements).toHaveLength(2)

    // Total settlements should equal total debt
    const totalSettlements = settlements.reduce((sum, s) => sum + s.amount, 0)
    expect(totalSettlements).toBe(200000) // $2000
  })
})

// ============================================
// SCENARIO 3: PARTIAL PAYMENTS & MULTIPLE EXPENSES
// ============================================

describe('Balance Calculation - Partial Payments', () => {
  const expenses: Expense[] = [
    {
      id: 'exp1',
      amount: 12000, // $120 groceries
      paidById: 'user1',
      shares: [
        { userId: 'user1', amount: 4000, isPaid: true },
        { userId: 'user2', amount: 4000, isPaid: true }, // Already paid
        { userId: 'user3', amount: 4000, isPaid: false },
      ],
    },
    {
      id: 'exp2',
      amount: 15000, // $150 utilities
      paidById: 'user2',
      shares: [
        { userId: 'user1', amount: 5000, isPaid: false },
        { userId: 'user2', amount: 5000, isPaid: true },
        { userId: 'user3', amount: 5000, isPaid: false },
      ],
    },
  ]

  test('should handle multiple expenses correctly', () => {
    const balances = calculateNetBalances(users, expenses)

    // Alice paid $120, owes $90, net = +$30
    const alice = balances.find(b => b.userId === 'user1')
    expect(alice?.balance).toBe(3000)

    // Bob paid $150, owes $90, net = +$60
    const bob = balances.find(b => b.userId === 'user2')
    expect(bob?.balance).toBe(6000)

    // Charlie paid $0, owes $90, net = -$90
    const charlie = balances.find(b => b.userId === 'user3')
    expect(charlie?.balance).toBe(-9000)
  })

  test('should minimize settlements with multiple creditors', () => {
    const balances = calculateNetBalances(users, expenses)
    const settlements = simplifySettlements(users, balances)

    // Should only need 2 settlements (Charlie pays both)
    expect(settlements).toHaveLength(2)

    // Charlie should pay Bob and Alice
    const charliePayments = settlements.filter(s => s.from === 'user3')
    expect(charliePayments).toHaveLength(2)

    // Total should equal Charlie's debt
    const totalPaid = charliePayments.reduce((sum, s) => sum + s.amount, 0)
    expect(totalPaid).toBe(9000)
  })

  test('should calculate individual user debts correctly', () => {
    const { settlements } = calculateBalanceAndSettlements(users, expenses)

    const charlieDebts = getUserOutstandingDebts('user3', settlements)
    expect(charlieDebts).toHaveLength(2)

    const charlieTotalDebt = calculateUserTotalDebt('user3', settlements)
    expect(charlieTotalDebt).toBe(9000)

    const bobOwed = getUserAmountsOwed('user2', settlements)
    expect(bobOwed.length).toBeGreaterThan(0)
  })
})

// ============================================
// SCENARIO 4: COMPLEX SCENARIO WITH CIRCULAR DEBTS
// ============================================

describe('Balance Calculation - Complex Circular Debts', () => {
  const expenses: Expense[] = [
    {
      id: 'exp1',
      amount: 6000, // Alice pays $60
      paidById: 'user1',
      shares: [
        { userId: 'user1', amount: 2000, isPaid: true },
        { userId: 'user2', amount: 2000, isPaid: false },
        { userId: 'user3', amount: 2000, isPaid: false },
      ],
    },
    {
      id: 'exp2',
      amount: 9000, // Bob pays $90
      paidById: 'user2',
      shares: [
        { userId: 'user1', amount: 3000, isPaid: false },
        { userId: 'user2', amount: 3000, isPaid: true },
        { userId: 'user3', amount: 3000, isPaid: false },
      ],
    },
    {
      id: 'exp3',
      amount: 12000, // Charlie pays $120
      paidById: 'user3',
      shares: [
        { userId: 'user1', amount: 4000, isPaid: false },
        { userId: 'user2', amount: 4000, isPaid: false },
        { userId: 'user3', amount: 4000, isPaid: true },
      ],
    },
  ]

  test('should calculate net balances with circular debts', () => {
    const balances = calculateNetBalances(users, expenses)

    // Alice paid $60, owes $90, net = -$30
    const alice = balances.find(b => b.userId === 'user1')
    expect(alice?.balance).toBe(-3000)

    // Bob paid $90, owes $90, net = $0
    const bob = balances.find(b => b.userId === 'user2')
    expect(bob?.balance).toBe(0)

    // Charlie paid $120, owes $90, net = +$30
    const charlie = balances.find(b => b.userId === 'user3')
    expect(charlie?.balance).toBe(3000)
  })

  test('should simplify to single settlement', () => {
    const balances = calculateNetBalances(users, expenses)
    const settlements = simplifySettlements(users, balances)

    // Should only need 1 settlement (Alice pays Charlie)
    expect(settlements).toHaveLength(1)

    const settlement = settlements[0]
    expect(settlement.from).toBe('user1')
    expect(settlement.to).toBe('user3')
    expect(settlement.amount).toBe(3000)
  })
})

// ============================================
// FAIRNESS SCORING TESTS
// ============================================

describe('Fairness Scoring', () => {
  const expenses: Expense[] = [
    {
      id: 'exp1',
      amount: 12000,
      paidById: 'user1',
      shares: [
        { userId: 'user1', amount: 4000, isPaid: true },
        { userId: 'user2', amount: 4000, isPaid: false },
        { userId: 'user3', amount: 4000, isPaid: true },
      ],
    },
  ]

  const choreAssignments: ChoreAssignment[] = [
    { userId: 'user1', points: 3, isCompleted: true },
    { userId: 'user1', points: 2, isCompleted: true },
    { userId: 'user2', points: 3, isCompleted: false },
    { userId: 'user2', points: 2, isCompleted: false },
    { userId: 'user3', points: 3, isCompleted: true },
    { userId: 'user3', points: 2, isCompleted: false },
  ]

  test('should calculate fairness scores based on expenses and chores', () => {
    const scores = computeFairnessScore(users, expenses, choreAssignments)

    expect(scores).toHaveLength(3)

    // Alice: paid her share, completed all chores = high score
    const alice = scores.find(s => s.userId === 'user1')
    expect(alice?.score).toBeGreaterThan(80)
    expect(alice?.expenseContribution).toBeGreaterThan(0)
    expect(alice?.choreContribution).toBeGreaterThan(0)

    // Bob: didn't pay, didn't complete chores = low score
    const bob = scores.find(s => s.userId === 'user2')
    expect(bob?.score).toBeLessThan(40)

    // Charlie: paid share, completed some chores = medium score
    const charlie = scores.find(s => s.userId === 'user3')
    expect(charlie?.score).toBeGreaterThan(bob?.score || 0)
    expect(charlie?.score).toBeLessThan(alice?.score || 100)
  })

  test('should handle no chores gracefully', () => {
    const scores = computeFairnessScore(users, expenses, [])

    expect(scores).toHaveLength(3)

    // Should still calculate scores based on expense contribution
    scores.forEach(score => {
      expect(score.score).toBeGreaterThanOrEqual(0)
      expect(score.score).toBeLessThanOrEqual(100)
    })
  })

  test('should handle no expenses gracefully', () => {
    const scores = computeFairnessScore(users, [], choreAssignments)

    expect(scores).toHaveLength(3)

    // Should calculate based on chores only
    const alice = scores.find(s => s.userId === 'user1')
    expect(alice?.choreContribution).toBeGreaterThan(0)
  })

  test('should normalize scores to 0-100 range', () => {
    const scores = computeFairnessScore(users, expenses, choreAssignments)

    scores.forEach(score => {
      expect(score.score).toBeGreaterThanOrEqual(0)
      expect(score.score).toBeLessThanOrEqual(100)
      expect(Number.isInteger(score.score)).toBe(true)
    })
  })
})

// ============================================
// SCENARIO 5: EDGE CASES
// ============================================

describe('Edge Cases', () => {
  test('should handle no expenses', () => {
    const balances = calculateNetBalances(users, [])

    balances.forEach(balance => {
      expect(balance.balance).toBe(0)
    })
  })

  test('should handle single user', () => {
    const singleUser = [{ id: 'user1', name: 'Alice' }]
    const expenses: Expense[] = [
      {
        id: 'exp1',
        amount: 5000,
        paidById: 'user1',
        shares: [{ userId: 'user1', amount: 5000, isPaid: true }],
      },
    ]

    const balances = calculateNetBalances(singleUser, expenses)
    expect(balances[0].balance).toBe(0) // Paid what they owe
  })

  test('should handle zero amount expenses', () => {
    const expenses: Expense[] = [
      {
        id: 'exp1',
        amount: 0,
        paidById: 'user1',
        shares: [
          { userId: 'user1', amount: 0, isPaid: true },
          { userId: 'user2', amount: 0, isPaid: true },
        ],
      },
    ]

    const balances = calculateNetBalances(users, expenses)
    balances.forEach(balance => {
      expect(balance.balance).toBe(0)
    })
  })

  test('should handle rounding correctly', () => {
    const expenses: Expense[] = [
      {
        id: 'exp1',
        amount: 100, // $1.00
        paidById: 'user1',
        shares: [
          { userId: 'user1', amount: 33, isPaid: true },
          { userId: 'user2', amount: 33, isPaid: false },
          { userId: 'user3', amount: 34, isPaid: false }, // Rounding
        ],
      },
    ]

    const { settlements } = calculateBalanceAndSettlements(users, expenses)

    settlements.forEach(settlement => {
      // Should be rounded to cents
      expect(settlement.amount % 1).toBe(0)
    })
  })
})

// ============================================
// UTILITY FUNCTIONS TESTS
// ============================================

describe('Utility Functions', () => {
  const expenses: Expense[] = [
    {
      id: 'exp1',
      amount: 12000,
      paidById: 'user1',
      shares: [
        { userId: 'user1', amount: 4000, isPaid: true },
        { userId: 'user2', amount: 4000, isPaid: false },
        { userId: 'user3', amount: 4000, isPaid: false },
      ],
    },
  ]

  test('should get outstanding debts for user', () => {
    const { settlements } = calculateBalanceAndSettlements(users, expenses)

    const bobDebts = getUserOutstandingDebts('user2', settlements)
    expect(bobDebts.length).toBeGreaterThan(0)
    expect(bobDebts[0].from).toBe('user2')
  })

  test('should get amounts owed to user', () => {
    const { settlements } = calculateBalanceAndSettlements(users, expenses)

    const aliceOwed = getUserAmountsOwed('user1', settlements)
    expect(aliceOwed.length).toBeGreaterThan(0)
    expect(aliceOwed.every(s => s.to === 'user1')).toBe(true)
  })

  test('should calculate total debt for user', () => {
    const { settlements } = calculateBalanceAndSettlements(users, expenses)

    const bobTotalDebt = calculateUserTotalDebt('user2', settlements)
    expect(bobTotalDebt).toBeGreaterThan(0)
  })

  test('should calculate total owed to user', () => {
    const { settlements } = calculateBalanceAndSettlements(users, expenses)

    const aliceTotalOwed = calculateUserTotalOwed('user1', settlements)
    expect(aliceTotalOwed).toBe(8000) // $80
  })
})

// ============================================
// INTEGRATION TEST
// ============================================

describe('Integration - Full Balance Workflow', () => {
  const expenses: Expense[] = [
    {
      id: 'exp1',
      amount: 15000,
      paidById: 'user1',
      shares: [
        { userId: 'user1', amount: 5000, isPaid: true },
        { userId: 'user2', amount: 5000, isPaid: false },
        { userId: 'user3', amount: 5000, isPaid: false },
      ],
    },
    {
      id: 'exp2',
      amount: 12000,
      paidById: 'user2',
      shares: [
        { userId: 'user1', amount: 4000, isPaid: false },
        { userId: 'user2', amount: 4000, isPaid: true },
        { userId: 'user3', amount: 4000, isPaid: false },
      ],
    },
  ]

  const choreAssignments: ChoreAssignment[] = [
    { userId: 'user1', points: 5, isCompleted: true },
    { userId: 'user2', points: 5, isCompleted: true },
    { userId: 'user3', points: 5, isCompleted: false },
  ]

  test('should calculate complete balance summary', () => {
    const { balances, settlements } = calculateBalanceAndSettlements(users, expenses)
    const scores = computeFairnessScore(users, expenses, choreAssignments)

    // Should have data for all users
    expect(balances).toHaveLength(3)
    expect(settlements.length).toBeGreaterThan(0)
    expect(scores).toHaveLength(3)

    // Settlements should balance out
    const totalDebt = balances
      .filter(b => b.balance < 0)
      .reduce((sum, b) => sum + Math.abs(b.balance), 0)

    const totalOwed = balances
      .filter(b => b.balance > 0)
      .reduce((sum, b) => sum + b.balance, 0)

    expect(Math.abs(totalDebt - totalOwed)).toBeLessThan(1) // Within 1 cent

    // All scores should be valid
    scores.forEach(score => {
      expect(score.score).toBeGreaterThanOrEqual(0)
      expect(score.score).toBeLessThanOrEqual(100)
    })
  })
})
