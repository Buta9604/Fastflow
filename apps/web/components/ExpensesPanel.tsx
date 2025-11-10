'use client'

import { useState, useEffect } from 'react'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Button,
  Avatar,
} from 'ui'

export interface Expense {
  id: string
  description: string
  amount: number
  paidById: string
  paidBy: {
    id: string
    name: string
    avatarUrl?: string
  }
  date: string
  category?: string
  groupId: string
  createdAt: string
  updatedAt: string
}

interface ExpensesPanelProps {
  groupId: string
  onAddExpense: () => void
  optimisticExpenses?: Expense[]
}

export function ExpensesPanel({
  groupId,
  onAddExpense,
  optimisticExpenses = [],
}: ExpensesPanelProps) {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchExpenses()
  }, [groupId])

  const fetchExpenses = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/expenses?groupId=${groupId}&limit=10`)

      if (!response.ok) {
        throw new Error('Failed to fetch expenses')
      }

      const data = await response.json()
      setExpenses(data.data || [])
    } catch (err) {
      console.error('Error fetching expenses:', err)
      setError('Failed to load expenses')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteExpense = async (expenseId: string) => {
    if (!confirm('Are you sure you want to delete this expense?')) {
      return
    }

    try {
      const response = await fetch(`/api/expenses/${expenseId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete expense')
      }

      // Remove from local state
      setExpenses((prev) => prev.filter((e) => e.id !== expenseId))
    } catch (err) {
      console.error('Error deleting expense:', err)
      alert('Failed to delete expense')
    }
  }

  const formatCurrency = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date)
  }

  // Combine API expenses with optimistic ones (optimistic first)
  const displayExpenses = [...optimisticExpenses, ...expenses]

  return (
    <Card variant="default" data-testid="expenses-panel">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>Recent Expenses</CardTitle>
            <CardDescription>Latest group spending</CardDescription>
          </div>
          <Button
            size="sm"
            onClick={onAddExpense}
            data-testid="add-expense-button"
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
        {loading && expenses.length === 0 && (
          <div className="flex items-center justify-center py-8 text-neutral-600">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-500" />
          </div>
        )}

        {error && (
          <div className="rounded-md bg-red-50 p-4 text-sm text-red-600">
            {error}
          </div>
        )}

        {!loading && displayExpenses.length === 0 && (
          <div className="rounded-md bg-neutral-50 p-8 text-center">
            <p className="text-neutral-600">No expenses yet</p>
            <Button
              variant="ghost"
              size="sm"
              onClick={onAddExpense}
              className="mt-2"
            >
              Add your first expense
            </Button>
          </div>
        )}

        {displayExpenses.map((expense, index) => (
          <div
            key={expense.id}
            data-testid={`expense-item-${expense.id}`}
            className={`group flex items-start justify-between rounded-md border border-neutral-200 p-3 transition-all hover:border-accent-300 hover:bg-accent-50/50 ${
              index < optimisticExpenses.length ? 'opacity-60' : ''
            }`}
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h4
                  className="font-medium text-neutral-900"
                  data-testid={`expense-description-${expense.id}`}
                >
                  {expense.description}
                </h4>
                {expense.category && (
                  <span className="inline-flex items-center rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-600">
                    {expense.category}
                  </span>
                )}
              </div>
              <div className="mt-1 flex items-center gap-3 text-xs text-neutral-600">
                <span className="flex items-center gap-1">
                  <Avatar
                    fallback={expense.paidBy.name}
                    src={expense.paidBy.avatarUrl}
                    size="xs"
                  />
                  Paid by {expense.paidBy.name}
                </span>
                <span>•</span>
                <span>{formatDate(expense.date)}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span
                className="font-semibold text-neutral-900"
                data-testid={`expense-amount-${expense.id}`}
              >
                {formatCurrency(expense.amount)}
              </span>
              {index >= optimisticExpenses.length && (
                <button
                  onClick={() => handleDeleteExpense(expense.id)}
                  className="opacity-0 transition-opacity group-hover:opacity-100 rounded-sm p-1 text-neutral-400 hover:text-red-600"
                  aria-label="Delete expense"
                  data-testid={`delete-expense-${expense.id}`}
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
              )}
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
  )
}
