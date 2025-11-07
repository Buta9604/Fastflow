import { PrismaClient, SplitType, ExpenseStatus, ChoreFrequency, GroupRole } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Clean existing data (optional - comment out if you want to preserve existing data)
  console.log('🧹 Cleaning existing data...')
  await prisma.payment.deleteMany()
  await prisma.choreAssignment.deleteMany()
  await prisma.chore.deleteMany()
  await prisma.expenseShare.deleteMany()
  await prisma.expense.deleteMany()
  await prisma.invite.deleteMany()
  await prisma.groupMember.deleteMany()
  await prisma.group.deleteMany()
  await prisma.user.deleteMany()

  // Create 3 users
  console.log('👤 Creating users...')
  const user1 = await prisma.user.create({
    data: {
      email: 'demo@flatflow.com',
      name: 'Demo User',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Demo',
    },
  })

  const user2 = await prisma.user.create({
    data: {
      email: 'alice@flatflow.com',
      name: 'Alice Johnson',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice',
    },
  })

  const user3 = await prisma.user.create({
    data: {
      email: 'bob@flatflow.com',
      name: 'Bob Smith',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob',
    },
  })

  console.log(`✅ Created 3 users: ${user1.name}, ${user2.name}, ${user3.name}`)

  // Create 1 group
  console.log('🏠 Creating group...')
  const group = await prisma.group.create({
    data: {
      name: 'Downtown Apartment',
      description: 'Our cozy 3-bedroom apartment in the city center',
      currency: 'USD',
      creatorId: user1.id,
    },
  })

  console.log(`✅ Created group: ${group.name}`)

  // Add 3 members to the group
  console.log('👥 Adding group members...')
  const member1 = await prisma.groupMember.create({
    data: {
      userId: user1.id,
      groupId: group.id,
      role: GroupRole.OWNER,
    },
  })

  const member2 = await prisma.groupMember.create({
    data: {
      userId: user2.id,
      groupId: group.id,
      role: GroupRole.ADMIN,
    },
  })

  const member3 = await prisma.groupMember.create({
    data: {
      userId: user3.id,
      groupId: group.id,
      role: GroupRole.MEMBER,
    },
  })

  console.log(`✅ Added 3 members to ${group.name}`)

  // Create 4 expenses
  console.log('💰 Creating expenses...')

  // Expense 1: Groceries (Equal split)
  const expense1 = await prisma.expense.create({
    data: {
      title: 'Weekly Groceries',
      description: 'Costco run - milk, eggs, bread, fruits',
      amount: 12500, // $125.00
      currency: 'USD',
      category: 'Groceries',
      splitType: SplitType.EQUAL,
      status: ExpenseStatus.PARTIAL,
      groupId: group.id,
      paidById: user1.id,
      shares: {
        create: [
          {
            userId: user1.id,
            amount: 4167, // $41.67
            isPaid: true, // Payer is automatically paid
          },
          {
            userId: user2.id,
            amount: 4167, // $41.67
            isPaid: true,
          },
          {
            userId: user3.id,
            amount: 4166, // $41.66 (rounding)
            isPaid: false,
          },
        ],
      },
    },
  })

  // Expense 2: Utilities (Equal split, all paid)
  const expense2 = await prisma.expense.create({
    data: {
      title: 'Electric Bill - March',
      description: 'Monthly electricity bill',
      amount: 15000, // $150.00
      currency: 'USD',
      category: 'Utilities',
      splitType: SplitType.EQUAL,
      status: ExpenseStatus.SETTLED,
      groupId: group.id,
      paidById: user2.id,
      shares: {
        create: [
          {
            userId: user1.id,
            amount: 5000, // $50.00
            isPaid: true,
          },
          {
            userId: user2.id,
            amount: 5000, // $50.00
            isPaid: true,
          },
          {
            userId: user3.id,
            amount: 5000, // $50.00
            isPaid: true,
          },
        ],
      },
    },
  })

  // Expense 3: Rent (Percentage split - one person has larger room)
  const expense3 = await prisma.expense.create({
    data: {
      title: 'Monthly Rent - April',
      description: 'Rent split based on room sizes',
      amount: 300000, // $3,000.00
      currency: 'USD',
      category: 'Rent',
      splitType: SplitType.PERCENTAGE,
      status: ExpenseStatus.PENDING,
      groupId: group.id,
      paidById: user1.id,
      shares: {
        create: [
          {
            userId: user1.id,
            amount: 100000, // $1,000.00
            percentage: 33.33,
            isPaid: true,
          },
          {
            userId: user2.id,
            amount: 120000, // $1,200.00 (larger room)
            percentage: 40.0,
            isPaid: false,
          },
          {
            userId: user3.id,
            amount: 80000, // $800.00 (smaller room)
            percentage: 26.67,
            isPaid: false,
          },
        ],
      },
    },
  })

  // Expense 4: Internet (Shares split)
  const expense4 = await prisma.expense.create({
    data: {
      title: 'Internet & Streaming',
      description: 'WiFi + Netflix + Spotify family plan',
      amount: 8000, // $80.00
      currency: 'USD',
      category: 'Utilities',
      splitType: SplitType.SHARES,
      status: ExpenseStatus.PARTIAL,
      groupId: group.id,
      paidById: user3.id,
      shares: {
        create: [
          {
            userId: user1.id,
            amount: 2667, // 1 share
            shares: 1,
            isPaid: false,
          },
          {
            userId: user2.id,
            amount: 2667, // 1 share
            shares: 1,
            isPaid: true,
          },
          {
            userId: user3.id,
            amount: 2666, // 1 share
            shares: 1,
            isPaid: true,
          },
        ],
      },
    },
  })

  console.log(`✅ Created 4 expenses`)

  // Create some payments
  console.log('💸 Creating payments...')

  const payment1 = await prisma.payment.create({
    data: {
      amount: 4167,
      currency: 'USD',
      status: 'COMPLETED',
      method: 'Venmo',
      notes: 'Groceries share',
      expenseId: expense1.id,
      fromUserId: user2.id,
      toUserId: user1.id,
      paidAt: new Date(),
    },
  })

  const payment2 = await prisma.payment.create({
    data: {
      amount: 5000,
      currency: 'USD',
      status: 'COMPLETED',
      method: 'Cash',
      notes: 'Electric bill share',
      expenseId: expense2.id,
      fromUserId: user1.id,
      toUserId: user2.id,
      paidAt: new Date(),
    },
  })

  console.log(`✅ Created 2 payments`)

  // Create 3 chores
  console.log('🧹 Creating chores...')

  const chore1 = await prisma.chore.create({
    data: {
      title: 'Take Out Trash',
      description: 'Take trash and recycling to the bins outside',
      frequency: ChoreFrequency.WEEKLY,
      points: 2,
      groupId: group.id,
      assignments: {
        create: [
          {
            userId: user1.id,
            assignedDate: new Date('2024-04-01'),
            isCompleted: true,
            completedAt: new Date('2024-04-01T20:00:00Z'),
          },
          {
            userId: user2.id,
            assignedDate: new Date('2024-04-08'),
            isCompleted: true,
            completedAt: new Date('2024-04-08T19:30:00Z'),
          },
          {
            userId: user3.id,
            assignedDate: new Date('2024-04-15'),
            isCompleted: false,
          },
        ],
      },
    },
  })

  const chore2 = await prisma.chore.create({
    data: {
      title: 'Clean Kitchen',
      description: 'Wipe counters, clean sink, mop floor',
      frequency: ChoreFrequency.WEEKLY,
      points: 3,
      groupId: group.id,
      assignments: {
        create: [
          {
            userId: user2.id,
            assignedDate: new Date('2024-04-05'),
            isCompleted: true,
            completedAt: new Date('2024-04-05T15:00:00Z'),
            notes: 'Deep cleaned the oven too!',
          },
          {
            userId: user1.id,
            assignedDate: new Date('2024-04-12'),
            isCompleted: false,
          },
        ],
      },
    },
  })

  const chore3 = await prisma.chore.create({
    data: {
      title: 'Clean Bathroom',
      description: 'Scrub toilet, clean shower, restock supplies',
      frequency: ChoreFrequency.BIWEEKLY,
      points: 4,
      groupId: group.id,
      assignments: {
        create: [
          {
            userId: user3.id,
            assignedDate: new Date('2024-04-01'),
            isCompleted: true,
            completedAt: new Date('2024-04-01T14:00:00Z'),
          },
          {
            userId: user1.id,
            assignedDate: new Date('2024-04-15'),
            isCompleted: false,
          },
        ],
      },
    },
  })

  console.log(`✅ Created 3 chores with assignments`)

  // Summary
  console.log('\n🎉 Seed completed successfully!\n')
  console.log('📊 Summary:')
  console.log(`   - 3 Users (${user1.email}, ${user2.email}, ${user3.email})`)
  console.log(`   - 1 Group (${group.name})`)
  console.log(`   - 3 Group Members`)
  console.log(`   - 4 Expenses ($${(expense1.amount + expense2.amount + expense3.amount + expense4.amount) / 100} total)`)
  console.log(`   - 2 Payments`)
  console.log(`   - 3 Chores with multiple assignments`)
  console.log('\n🚀 You can now run your app and explore the demo data!')
  console.log('   Run: pnpm dev\n')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Error seeding database:', e)
    await prisma.$disconnect()
    process.exit(1)
  })
