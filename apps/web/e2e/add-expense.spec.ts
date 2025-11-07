import { test, expect } from '@playwright/test'

test.describe('Add Expense Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to dashboard page
    await page.goto('/dashboard')

    // Wait for the page to load
    await page.waitForLoadState('networkidle')
  })

  test('should open modal, fill form, submit, and display new expense', async ({ page }) => {
    // Step 1: Find and click the "Add Expense" button
    const addExpenseButton = page.getByTestId('add-expense-button')
    await expect(addExpenseButton).toBeVisible()
    await addExpenseButton.click()

    // Step 2: Verify modal is open
    const modal = page.getByTestId('add-expense-modal')
    await expect(modal).toBeVisible()

    // Step 3: Fill out the form
    const testExpense = {
      description: 'Test Grocery Shopping',
      amount: '125.50',
      paidBy: '1', // Alice Smith
      category: 'Food',
      date: '2025-11-07',
      splitType: 'EQUAL',
    }

    // Fill description
    const descriptionInput = page.getByTestId('expense-description-input')
    await expect(descriptionInput).toBeVisible()
    await descriptionInput.fill(testExpense.description)

    // Fill amount
    const amountInput = page.getByTestId('expense-amount-input')
    await expect(amountInput).toBeVisible()
    await amountInput.fill(testExpense.amount)

    // Select paid by
    const paidBySelect = page.getByTestId('expense-paid-by-select')
    await expect(paidBySelect).toBeVisible()
    await paidBySelect.selectOption(testExpense.paidBy)

    // Select category
    const categorySelect = page.getByTestId('expense-category-select')
    await expect(categorySelect).toBeVisible()
    await categorySelect.selectOption(testExpense.category)

    // Fill date
    const dateInput = page.getByTestId('expense-date-input')
    await expect(dateInput).toBeVisible()
    await dateInput.fill(testExpense.date)

    // Select split type
    const splitTypeSelect = page.getByTestId('expense-split-type-select')
    await expect(splitTypeSelect).toBeVisible()
    await splitTypeSelect.selectOption(testExpense.splitType)

    // Step 4: Submit the form
    const submitButton = page.getByTestId('expense-submit-button')
    await expect(submitButton).toBeVisible()
    await expect(submitButton).toBeEnabled()
    await submitButton.click()

    // Step 5: Wait for modal to close
    await expect(modal).not.toBeVisible({ timeout: 5000 })

    // Step 6: Verify the new expense appears in the list
    // The expense should appear with the description we entered
    const expensesPanel = page.getByTestId('expenses-panel')
    await expect(expensesPanel).toBeVisible()

    // Look for the expense by description
    // Since we're using optimistic updates, it should appear immediately
    const expenseDescription = page.getByText(testExpense.description)
    await expect(expenseDescription).toBeVisible({ timeout: 3000 })

    // Verify the amount is displayed correctly ($125.50)
    const expectedAmount = '$125.50'
    await expect(page.getByText(expectedAmount)).toBeVisible()

    // Step 7: Verify success toast notification appears
    await expect(page.getByText('Expense added successfully!')).toBeVisible({
      timeout: 5000,
    })
  })

  test('should show validation errors for invalid form data', async ({ page }) => {
    // Click Add Expense button
    await page.getByTestId('add-expense-button').click()

    // Verify modal is open
    const modal = page.getByTestId('add-expense-modal')
    await expect(modal).toBeVisible()

    // Try to submit without filling any fields
    const submitButton = page.getByTestId('expense-submit-button')
    await submitButton.click()

    // Should show validation errors
    await expect(page.getByText('Description is required')).toBeVisible()

    // Fill description but invalid amount
    await page.getByTestId('expense-description-input').fill('Test Expense')
    await page.getByTestId('expense-amount-input').fill('-10')
    await submitButton.click()

    // Should show amount validation error
    await expect(page.getByText(/Amount must be greater than 0/i)).toBeVisible()
  })

  test('should handle receipt file upload', async ({ page }) => {
    // Click Add Expense button
    await page.getByTestId('add-expense-button').click()

    const modal = page.getByTestId('add-expense-modal')
    await expect(modal).toBeVisible()

    // Fill required fields
    await page.getByTestId('expense-description-input').fill('Lunch Receipt')
    await page.getByTestId('expense-amount-input').fill('25.00')
    await page.getByTestId('expense-date-input').fill('2025-11-07')

    // Upload a file
    const fileInput = page.getByTestId('expense-receipt-input')

    // Create a test file
    const buffer = Buffer.from('test receipt content')
    await fileInput.setInputFiles({
      name: 'receipt.jpg',
      mimeType: 'image/jpeg',
      buffer,
    })

    // Verify file name is displayed
    await expect(page.getByText('receipt.jpg selected')).toBeVisible()

    // Submit should work with the file
    const submitButton = page.getByTestId('expense-submit-button')
    await submitButton.click()

    // Modal should close successfully
    await expect(modal).not.toBeVisible({ timeout: 5000 })
  })

  test('should cancel and close modal without saving', async ({ page }) => {
    // Click Add Expense button
    await page.getByTestId('add-expense-button').click()

    const modal = page.getByTestId('add-expense-modal')
    await expect(modal).toBeVisible()

    // Fill some data
    await page.getByTestId('expense-description-input').fill('Test Expense')
    await page.getByTestId('expense-amount-input').fill('50.00')

    // Click cancel
    await page.getByRole('button', { name: /cancel/i }).click()

    // Modal should close
    await expect(modal).not.toBeVisible()

    // Expense should not appear in list
    await expect(page.getByText('Test Expense')).not.toBeVisible()
  })

  test('should display existing expenses from API', async ({ page }) => {
    // Wait for expenses panel to load
    const expensesPanel = page.getByTestId('expenses-panel')
    await expect(expensesPanel).toBeVisible()

    // Should show expenses (assuming API returns data)
    // This test depends on your API having test data
    // In a real scenario, you'd mock the API or seed test data

    // Check for expenses panel content
    await expect(expensesPanel).toContainText('Recent Expenses')
    await expect(expensesPanel).toContainText('Latest group spending')
  })

  test('should handle API errors gracefully', async ({ page }) => {
    // Mock API to return error
    await page.route('**/api/expenses', async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Internal server error' }),
        })
      } else {
        await route.continue()
      }
    })

    // Click Add Expense button
    await page.getByTestId('add-expense-button').click()

    const modal = page.getByTestId('add-expense-modal')
    await expect(modal).toBeVisible()

    // Fill form
    await page.getByTestId('expense-description-input').fill('Test Expense')
    await page.getByTestId('expense-amount-input').fill('50.00')
    await page.getByTestId('expense-date-input').fill('2025-11-07')

    // Submit
    await page.getByTestId('expense-submit-button').click()

    // Should show error toast
    await expect(page.getByText(/Internal server error|Failed to add expense/i)).toBeVisible({
      timeout: 5000,
    })

    // Modal should stay open on error
    await expect(modal).toBeVisible()
  })

  test('should show optimistic update while API is processing', async ({ page }) => {
    // Mock API with delay to test optimistic update
    await page.route('**/api/expenses', async (route) => {
      if (route.request().method() === 'POST') {
        // Delay response to simulate slow API
        await new Promise((resolve) => setTimeout(resolve, 2000))
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: {
              id: 'real-id-123',
              description: 'Test Expense',
              amount: 5000,
              paidById: '1',
              paidBy: { id: '1', name: 'Alice Smith' },
              date: '2025-11-07',
              category: 'Food',
              groupId: 'group1',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          }),
        })
      } else {
        await route.continue()
      }
    })

    // Add expense
    await page.getByTestId('add-expense-button').click()
    await page.getByTestId('expense-description-input').fill('Test Expense')
    await page.getByTestId('expense-amount-input').fill('50.00')
    await page.getByTestId('expense-date-input').fill('2025-11-07')
    await page.getByTestId('expense-submit-button').click()

    // Should immediately show optimistic expense (faded)
    const expenseItem = page.getByText('Test Expense')
    await expect(expenseItem).toBeVisible({ timeout: 1000 })

    // Wait for real API response
    await page.waitForTimeout(2500)

    // Should show success toast
    await expect(page.getByText('Expense added successfully!')).toBeVisible()
  })
})
