'use client'

import { useState } from 'react'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Button,
  Modal,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalContent,
  ModalFooter,
  Input,
  Select,
  Avatar,
  AvatarGroup,
} from 'ui'

// Mock data - replace with real data from API
const mockBalances = [
  { userId: '1', userName: 'Alice Smith', balance: 12500, isPositive: true },
  { userId: '2', userName: 'Bob Johnson', balance: -4500, isPositive: false },
  { userId: '3', userName: 'Charlie Brown', balance: -8000, isPositive: false },
  { userId: '4', userName: 'Diana Prince', balance: 0, isPositive: true },
]

const mockSettlements = [
  { from: 'Charlie Brown', to: 'Alice Smith', amount: 8000 },
  { from: 'Bob Johnson', to: 'Alice Smith', amount: 4500 },
]

const mockExpenses = [
  {
    id: '1',
    description: 'Grocery Shopping',
    amount: 15000,
    paidBy: 'Alice Smith',
    date: '2025-11-05',
    category: 'Food',
  },
  {
    id: '2',
    description: 'Internet Bill',
    amount: 8000,
    paidBy: 'Bob Johnson',
    date: '2025-11-03',
    category: 'Utilities',
  },
  {
    id: '3',
    description: 'House Cleaning',
    amount: 12000,
    paidBy: 'Alice Smith',
    date: '2025-11-01',
    category: 'Services',
  },
  {
    id: '4',
    description: 'Pizza Night',
    amount: 4500,
    paidBy: 'Charlie Brown',
    date: '2025-10-30',
    category: 'Food',
  },
]

const mockChores = [
  {
    id: '1',
    title: 'Take out trash',
    assignedTo: 'Bob Johnson',
    dueDate: '2025-11-08',
    status: 'pending',
    points: 10,
  },
  {
    id: '2',
    title: 'Clean kitchen',
    assignedTo: 'Alice Smith',
    dueDate: '2025-11-07',
    status: 'completed',
    points: 20,
  },
  {
    id: '3',
    title: 'Vacuum living room',
    assignedTo: 'Charlie Brown',
    dueDate: '2025-11-09',
    status: 'pending',
    points: 15,
  },
  {
    id: '4',
    title: 'Water plants',
    assignedTo: 'Diana Prince',
    dueDate: '2025-11-07',
    status: 'overdue',
    points: 5,
  },
]

const mockMembers = [
  { id: '1', name: 'Alice Smith', avatarUrl: '' },
  { id: '2', name: 'Bob Johnson', avatarUrl: '' },
  { id: '3', name: 'Charlie Brown', avatarUrl: '' },
  { id: '4', name: 'Diana Prince', avatarUrl: '' },
]

export default function DashboardPage() {
  // Modal states
  const [addExpenseModalOpen, setAddExpenseModalOpen] = useState(false)
  const [addChoreModalOpen, setAddChoreModalOpen] = useState(false)
  const [viewBalanceModalOpen, setViewBalanceModalOpen] = useState(false)

  // Form states
  const [expenseForm, setExpenseForm] = useState({
    description: '',
    amount: '',
    category: 'Food',
    paidBy: '1',
  })

  const [choreForm, setChoreForm] = useState({
    title: '',
    assignedTo: '1',
    dueDate: '',
    points: '10',
  })

  // Handlers
  const handleAddExpense = () => {
    console.log('💰 Adding expense:', expenseForm)
    setExpenseForm({ description: '', amount: '', category: 'Food', paidBy: '1' })
    setAddExpenseModalOpen(false)
  }

  const handleAddChore = () => {
    console.log('✅ Adding chore:', choreForm)
    setChoreForm({ title: '', assignedTo: '1', dueDate: '', points: '10' })
    setAddChoreModalOpen(false)
  }

  const handleToggleChore = (choreId: string) => {
    console.log('🔄 Toggling chore completion:', choreId)
  }

  const handleDeleteExpense = (expenseId: string) => {
    console.log('🗑️ Deleting expense:', expenseId)
  }

  const handleDeleteChore = (choreId: string) => {
    console.log('🗑️ Deleting chore:', choreId)
  }

  const formatCurrency = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
    }).format(date)
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-neutral-900">Dashboard</h1>
        <p className="mt-2 text-neutral-600">
          Overview of your group's expenses, chores, and balances
        </p>
      </div>

      {/* Balance Summary Card */}
      <Card variant="elevated" padding="lg">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle>Balance Summary</CardTitle>
              <CardDescription>
                Current balances and suggested settlements
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setViewBalanceModalOpen(true)}
            >
              View Details
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            {/* Balances */}
            <div>
              <h3 className="mb-3 text-sm font-semibold text-neutral-700">
                Member Balances
              </h3>
              <div className="space-y-2">
                {mockBalances.map((balance) => (
                  <div
                    key={balance.userId}
                    className="flex items-center justify-between rounded-md bg-neutral-50 px-3 py-2"
                  >
                    <div className="flex items-center gap-2">
                      <Avatar fallback={balance.userName} size="xs" />
                      <span className="text-sm font-medium text-neutral-900">
                        {balance.userName}
                      </span>
                    </div>
                    <span
                      className={`text-sm font-semibold ${
                        balance.isPositive
                          ? 'text-green-600'
                          : balance.balance === 0
                          ? 'text-neutral-500'
                          : 'text-red-600'
                      }`}
                    >
                      {balance.isPositive && balance.balance > 0 ? '+' : ''}
                      {formatCurrency(balance.balance)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Settlements */}
            <div>
              <h3 className="mb-3 text-sm font-semibold text-neutral-700">
                Suggested Settlements
              </h3>
              {mockSettlements.length > 0 ? (
                <div className="space-y-2">
                  {mockSettlements.map((settlement, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 rounded-md border border-accent-200 bg-accent-50 px-3 py-2"
                    >
                      <div className="flex-1 text-sm">
                        <span className="font-medium text-neutral-900">
                          {settlement.from}
                        </span>
                        <span className="text-neutral-600"> pays </span>
                        <span className="font-medium text-neutral-900">
                          {settlement.to}
                        </span>
                      </div>
                      <span className="font-semibold text-accent-700">
                        {formatCurrency(settlement.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-md bg-green-50 px-3 py-4 text-center text-sm text-green-700">
                  ✨ All settled up!
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Grid Layout for Expenses and Chores */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Expenses Panel */}
        <Card variant="default">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle>Recent Expenses</CardTitle>
                <CardDescription>Latest group spending</CardDescription>
              </div>
              <Button
                size="sm"
                onClick={() => setAddExpenseModalOpen(true)}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Add Expense
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {mockExpenses.map((expense) => (
              <div
                key={expense.id}
                className="group flex items-start justify-between rounded-md border border-neutral-200 p-3 transition-all hover:border-accent-300 hover:bg-accent-50/50"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-neutral-900">
                      {expense.description}
                    </h4>
                    <span className="inline-flex items-center rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-600">
                      {expense.category}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center gap-3 text-xs text-neutral-600">
                    <span>Paid by {expense.paidBy}</span>
                    <span>•</span>
                    <span>{formatDate(expense.date)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-neutral-900">
                    {formatCurrency(expense.amount)}
                  </span>
                  <button
                    onClick={() => handleDeleteExpense(expense.id)}
                    className="opacity-0 transition-opacity group-hover:opacity-100 rounded-sm p-1 text-neutral-400 hover:text-red-600"
                    aria-label="Delete expense"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M3 6h18" />
                      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </CardContent>
          <CardFooter>
            <Button variant="ghost" size="sm" className="w-full">
              View All Expenses
            </Button>
          </CardFooter>
        </Card>

        {/* Chore Board */}
        <Card variant="default">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle>Chore Board</CardTitle>
                <CardDescription>Tasks and assignments</CardDescription>
              </div>
              <Button
                size="sm"
                onClick={() => setAddChoreModalOpen(true)}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Add Chore
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {mockChores.map((chore) => (
              <div
                key={chore.id}
                className={`group flex items-start gap-3 rounded-md border p-3 transition-all ${
                  chore.status === 'completed'
                    ? 'border-green-200 bg-green-50'
                    : chore.status === 'overdue'
                    ? 'border-red-200 bg-red-50'
                    : 'border-neutral-200 hover:border-accent-300 hover:bg-accent-50/50'
                }`}
              >
                {/* Checkbox */}
                <button
                  onClick={() => handleToggleChore(chore.id)}
                  className={`mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded border-2 transition-all ${
                    chore.status === 'completed'
                      ? 'border-green-500 bg-green-500'
                      : 'border-neutral-300 hover:border-accent-500'
                  }`}
                  aria-label={
                    chore.status === 'completed'
                      ? 'Mark as incomplete'
                      : 'Mark as complete'
                  }
                >
                  {chore.status === 'completed' && (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="white"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </button>

                {/* Chore Details */}
                <div className="flex-1 min-w-0">
                  <h4
                    className={`font-medium ${
                      chore.status === 'completed'
                        ? 'text-neutral-500 line-through'
                        : 'text-neutral-900'
                    }`}
                  >
                    {chore.title}
                  </h4>
                  <div className="mt-1 flex items-center gap-3 text-xs text-neutral-600">
                    <span className="flex items-center gap-1">
                      <Avatar fallback={chore.assignedTo} size="xs" />
                      {chore.assignedTo}
                    </span>
                    <span>•</span>
                    <span
                      className={
                        chore.status === 'overdue' ? 'text-red-600 font-medium' : ''
                      }
                    >
                      Due {formatDate(chore.dueDate)}
                    </span>
                    <span>•</span>
                    <span>{chore.points} pts</span>
                  </div>
                </div>

                {/* Delete Button */}
                <button
                  onClick={() => handleDeleteChore(chore.id)}
                  className="opacity-0 transition-opacity group-hover:opacity-100 rounded-sm p-1 text-neutral-400 hover:text-red-600"
                  aria-label="Delete chore"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M3 6h18" />
                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                  </svg>
                </button>
              </div>
            ))}
          </CardContent>
          <CardFooter>
            <Button variant="ghost" size="sm" className="w-full">
              View All Chores
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Add Expense Modal */}
      <Modal
        isOpen={addExpenseModalOpen}
        onClose={() => setAddExpenseModalOpen(false)}
        size="md"
      >
        <ModalHeader>
          <ModalTitle>Add Expense</ModalTitle>
          <ModalDescription>
            Record a new expense for the group
          </ModalDescription>
        </ModalHeader>
        <ModalContent className="space-y-4">
          <Input
            label="Description"
            placeholder="What was this expense for?"
            value={expenseForm.description}
            onChange={(e) =>
              setExpenseForm({ ...expenseForm, description: e.target.value })
            }
            fullWidth
            required
          />

          <Input
            label="Amount"
            type="number"
            placeholder="0.00"
            value={expenseForm.amount}
            onChange={(e) =>
              setExpenseForm({ ...expenseForm, amount: e.target.value })
            }
            helperText="Enter amount in dollars"
            fullWidth
            required
          />

          <Select
            label="Category"
            options={[
              { value: 'Food', label: 'Food & Groceries' },
              { value: 'Utilities', label: 'Utilities' },
              { value: 'Rent', label: 'Rent' },
              { value: 'Services', label: 'Services' },
              { value: 'Entertainment', label: 'Entertainment' },
              { value: 'Other', label: 'Other' },
            ]}
            value={expenseForm.category}
            onChange={(e) =>
              setExpenseForm({ ...expenseForm, category: e.target.value })
            }
            fullWidth
          />

          <Select
            label="Paid By"
            options={mockMembers.map((m) => ({ value: m.id, label: m.name }))}
            value={expenseForm.paidBy}
            onChange={(e) =>
              setExpenseForm({ ...expenseForm, paidBy: e.target.value })
            }
            fullWidth
          />
        </ModalContent>
        <ModalFooter>
          <Button
            variant="ghost"
            onClick={() => setAddExpenseModalOpen(false)}
          >
            Cancel
          </Button>
          <Button onClick={handleAddExpense}>Add Expense</Button>
        </ModalFooter>
      </Modal>

      {/* Add Chore Modal */}
      <Modal
        isOpen={addChoreModalOpen}
        onClose={() => setAddChoreModalOpen(false)}
        size="md"
      >
        <ModalHeader>
          <ModalTitle>Add Chore</ModalTitle>
          <ModalDescription>
            Create a new task for the group
          </ModalDescription>
        </ModalHeader>
        <ModalContent className="space-y-4">
          <Input
            label="Chore Title"
            placeholder="What needs to be done?"
            value={choreForm.title}
            onChange={(e) =>
              setChoreForm({ ...choreForm, title: e.target.value })
            }
            fullWidth
            required
          />

          <Select
            label="Assign To"
            options={mockMembers.map((m) => ({ value: m.id, label: m.name }))}
            value={choreForm.assignedTo}
            onChange={(e) =>
              setChoreForm({ ...choreForm, assignedTo: e.target.value })
            }
            fullWidth
          />

          <Input
            label="Due Date"
            type="date"
            value={choreForm.dueDate}
            onChange={(e) =>
              setChoreForm({ ...choreForm, dueDate: e.target.value })
            }
            fullWidth
            required
          />

          <Input
            label="Points"
            type="number"
            placeholder="10"
            value={choreForm.points}
            onChange={(e) =>
              setChoreForm({ ...choreForm, points: e.target.value })
            }
            helperText="Points reflect the effort required"
            fullWidth
          />
        </ModalContent>
        <ModalFooter>
          <Button
            variant="ghost"
            onClick={() => setAddChoreModalOpen(false)}
          >
            Cancel
          </Button>
          <Button onClick={handleAddChore}>Create Chore</Button>
        </ModalFooter>
      </Modal>

      {/* Balance Details Modal */}
      <Modal
        isOpen={viewBalanceModalOpen}
        onClose={() => setViewBalanceModalOpen(false)}
        size="lg"
      >
        <ModalHeader>
          <ModalTitle>Balance Details</ModalTitle>
          <ModalDescription>
            Complete breakdown of group balances and settlements
          </ModalDescription>
        </ModalHeader>
        <ModalContent className="space-y-6">
          <div>
            <h3 className="mb-3 text-sm font-semibold text-neutral-700">
              Individual Balances
            </h3>
            <div className="space-y-2">
              {mockBalances.map((balance) => (
                <div
                  key={balance.userId}
                  className="flex items-center justify-between rounded-md border border-neutral-200 px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <Avatar fallback={balance.userName} size="sm" />
                    <span className="font-medium text-neutral-900">
                      {balance.userName}
                    </span>
                  </div>
                  <span
                    className={`text-lg font-semibold ${
                      balance.isPositive
                        ? 'text-green-600'
                        : balance.balance === 0
                        ? 'text-neutral-500'
                        : 'text-red-600'
                    }`}
                  >
                    {balance.isPositive && balance.balance > 0 ? '+' : ''}
                    {formatCurrency(balance.balance)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold text-neutral-700">
              Settlement Plan
            </h3>
            {mockSettlements.length > 0 ? (
              <div className="space-y-2">
                {mockSettlements.map((settlement, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between rounded-md border-2 border-accent-200 bg-accent-50 px-4 py-3"
                  >
                    <div className="flex items-center gap-2 text-sm">
                      <Avatar fallback={settlement.from} size="xs" />
                      <span className="font-medium text-neutral-900">
                        {settlement.from}
                      </span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-accent-500"
                      >
                        <line x1="5" y1="12" x2="19" y2="12" />
                        <polyline points="12 5 19 12 12 19" />
                      </svg>
                      <Avatar fallback={settlement.to} size="xs" />
                      <span className="font-medium text-neutral-900">
                        {settlement.to}
                      </span>
                    </div>
                    <span className="text-lg font-semibold text-accent-700">
                      {formatCurrency(settlement.amount)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-md bg-green-50 px-4 py-6 text-center text-sm text-green-700">
                ✨ Everyone is settled up!
              </div>
            )}
          </div>
        </ModalContent>
        <ModalFooter>
          <Button onClick={() => setViewBalanceModalOpen(false)}>
            Close
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  )
}
