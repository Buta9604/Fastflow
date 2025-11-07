'use client'

import { useState } from 'react'
import { z } from 'zod'
import {
  Modal,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalContent,
  ModalFooter,
  Button,
  Input,
  Select,
  useToast,
} from 'ui'

// Validation schema
const expenseSchema = z.object({
  description: z
    .string()
    .min(1, 'Description is required')
    .max(100, 'Description is too long'),
  amount: z
    .string()
    .refine((val) => !isNaN(parseFloat(val)), 'Amount must be a number')
    .refine((val) => parseFloat(val) > 0, 'Amount must be greater than 0')
    .refine(
      (val) => parseFloat(val) <= 1000000,
      'Amount is too large'
    ),
  paidById: z.string().min(1, 'Please select who paid'),
  category: z.string().min(1, 'Category is required'),
  date: z.string().min(1, 'Date is required'),
  splitType: z.enum(['EQUAL', 'SHARES', 'PERCENTAGE', 'EXACT']),
  receiptUrl: z.string().optional(),
})

type ExpenseFormData = z.infer<typeof expenseSchema>

interface FormErrors {
  description?: string
  amount?: string
  paidById?: string
  category?: string
  date?: string
  splitType?: string
}

interface Member {
  id: string
  name: string
}

interface AddExpenseModalProps {
  isOpen: boolean
  onClose: () => void
  groupId: string
  members: Member[]
  onExpenseAdded: (expense: any) => void
}

export function AddExpenseModal({
  isOpen,
  onClose,
  groupId,
  members,
  onExpenseAdded,
}: AddExpenseModalProps) {
  const { addToast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})

  const [formData, setFormData] = useState<ExpenseFormData>({
    description: '',
    amount: '',
    paidById: members[0]?.id || '',
    category: 'Food',
    date: new Date().toISOString().split('T')[0],
    splitType: 'EQUAL',
    receiptUrl: '',
  })

  const [receiptFile, setReceiptFile] = useState<File | null>(null)

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    // Clear error on change
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }))
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({
          ...prev,
          receiptUrl: 'File size must be less than 5MB',
        }))
        return
      }

      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf']
      if (!validTypes.includes(file.type)) {
        setErrors((prev) => ({
          ...prev,
          receiptUrl: 'File must be an image (JPG, PNG) or PDF',
        }))
        return
      }

      setReceiptFile(file)
      setErrors((prev) => ({ ...prev, receiptUrl: undefined }))
    }
  }

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true)
      setErrors({})

      // Validate form data
      const validatedData = expenseSchema.parse(formData)

      // Convert amount from dollars to cents
      const amountInCents = Math.round(parseFloat(validatedData.amount) * 100)

      // Upload receipt if present
      let receiptUrl = ''
      if (receiptFile) {
        // In a real app, upload to S3/Cloudinary/etc
        // For now, we'll skip the upload
        console.log('Receipt file ready to upload:', receiptFile.name)
        receiptUrl = `/uploads/receipts/${receiptFile.name}` // Mock URL
      }

      // Prepare expense payload
      const expensePayload = {
        groupId,
        description: validatedData.description,
        amount: amountInCents,
        paidById: validatedData.paidById,
        category: validatedData.category,
        date: new Date(validatedData.date).toISOString(),
        splitType: validatedData.splitType,
        receiptUrl: receiptUrl || undefined,
        // For EQUAL split, we'll let the backend calculate shares
        // For other split types, we'd need additional UI to collect share data
      }

      // Optimistic update - create temporary expense
      const optimisticExpense = {
        id: `temp-${Date.now()}`,
        ...expensePayload,
        paidBy: {
          id: validatedData.paidById,
          name: members.find((m) => m.id === validatedData.paidById)?.name || 'Unknown',
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      // Notify parent with optimistic data
      onExpenseAdded(optimisticExpense)

      // Make API call
      const response = await fetch('/api/expenses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(expensePayload),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create expense')
      }

      const result = await response.json()

      // Show success toast
      addToast('Expense added successfully!', 'success')

      // Reset form
      setFormData({
        description: '',
        amount: '',
        paidById: members[0]?.id || '',
        category: 'Food',
        date: new Date().toISOString().split('T')[0],
        splitType: 'EQUAL',
        receiptUrl: '',
      })
      setReceiptFile(null)

      // Close modal
      onClose()

      // Update with real data
      onExpenseAdded(result.data)
    } catch (err) {
      console.error('Error creating expense:', err)

      if (err instanceof z.ZodError) {
        // Handle validation errors
        const fieldErrors: FormErrors = {}
        err.errors.forEach((error) => {
          const field = error.path[0] as keyof FormErrors
          fieldErrors[field] = error.message
        })
        setErrors(fieldErrors)
        addToast('Please fix the form errors', 'error')
      } else {
        // Handle API errors
        addToast(
          err instanceof Error ? err.message : 'Failed to add expense',
          'error'
        )
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      setFormData({
        description: '',
        amount: '',
        paidById: members[0]?.id || '',
        category: 'Food',
        date: new Date().toISOString().split('T')[0],
        splitType: 'EQUAL',
        receiptUrl: '',
      })
      setReceiptFile(null)
      setErrors({})
      onClose()
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="lg"
      data-testid="add-expense-modal"
    >
      <ModalHeader>
        <ModalTitle>Add Expense</ModalTitle>
        <ModalDescription>
          Record a new expense for the group
        </ModalDescription>
      </ModalHeader>
      <ModalContent className="space-y-4">
        <Input
          name="description"
          label="Description"
          placeholder="What was this expense for?"
          value={formData.description}
          onChange={handleInputChange}
          error={errors.description}
          fullWidth
          required
          data-testid="expense-description-input"
        />

        <Input
          name="amount"
          label="Amount"
          type="number"
          step="0.01"
          placeholder="0.00"
          value={formData.amount}
          onChange={handleInputChange}
          error={errors.amount}
          helperText="Enter amount in dollars (e.g., 25.50)"
          fullWidth
          required
          data-testid="expense-amount-input"
        />

        <div className="grid gap-4 md:grid-cols-2">
          <Select
            name="paidById"
            label="Paid By"
            options={members.map((m) => ({ value: m.id, label: m.name }))}
            value={formData.paidById}
            onChange={handleInputChange}
            error={errors.paidById}
            fullWidth
            data-testid="expense-paid-by-select"
          />

          <Select
            name="category"
            label="Category"
            options={[
              { value: 'Food', label: 'Food & Groceries' },
              { value: 'Utilities', label: 'Utilities' },
              { value: 'Rent', label: 'Rent' },
              { value: 'Services', label: 'Services' },
              { value: 'Entertainment', label: 'Entertainment' },
              { value: 'Transportation', label: 'Transportation' },
              { value: 'Healthcare', label: 'Healthcare' },
              { value: 'Other', label: 'Other' },
            ]}
            value={formData.category}
            onChange={handleInputChange}
            error={errors.category}
            fullWidth
            data-testid="expense-category-select"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Input
            name="date"
            label="Date"
            type="date"
            value={formData.date}
            onChange={handleInputChange}
            error={errors.date}
            fullWidth
            required
            data-testid="expense-date-input"
          />

          <Select
            name="splitType"
            label="Split Type"
            options={[
              { value: 'EQUAL', label: 'Split Equally' },
              { value: 'SHARES', label: 'By Shares' },
              { value: 'PERCENTAGE', label: 'By Percentage' },
              { value: 'EXACT', label: 'Exact Amounts' },
            ]}
            value={formData.splitType}
            onChange={handleInputChange}
            error={errors.splitType}
            helperText="Equal split divides evenly among all members"
            fullWidth
            data-testid="expense-split-type-select"
          />
        </div>

        {/* Receipt Upload */}
        <div>
          <label className="mb-2 block text-sm font-medium text-neutral-900">
            Receipt (Optional)
          </label>
          <div className="flex items-center gap-2">
            <input
              type="file"
              accept="image/jpeg,image/png,image/jpg,application/pdf"
              onChange={handleFileChange}
              className="flex h-10 w-full rounded-input border border-neutral-300 bg-surface px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium"
              data-testid="expense-receipt-input"
            />
          </div>
          {receiptFile && (
            <p className="mt-1.5 text-sm text-green-600">
              ✓ {receiptFile.name} selected
            </p>
          )}
          {errors.receiptUrl && (
            <p className="mt-1.5 text-sm text-red-600">{errors.receiptUrl}</p>
          )}
          <p className="mt-1.5 text-sm text-neutral-600">
            Upload a receipt image or PDF (max 5MB)
          </p>
        </div>
      </ModalContent>
      <ModalFooter>
        <Button variant="ghost" onClick={handleClose} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting}
          data-testid="expense-submit-button"
        >
          {isSubmitting ? 'Adding...' : 'Add Expense'}
        </Button>
      </ModalFooter>
    </Modal>
  )
}
