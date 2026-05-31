import { pgTable, text, timestamp, varchar, decimal, date, boolean, jsonb, unique, index, primaryKey } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

// Better Auth tables
export const user = pgTable('user', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('emailVerified').notNull().default(false),
  name: text('name'),
  image: text('image'),
  createdAt: timestamp('createdAt', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updatedAt', { withTimezone: true }).notNull().defaultNow(),
})

export const session = pgTable('session', {
  id: text('id').primaryKey(),
  expiresAt: timestamp('expiresAt', { withTimezone: true }).notNull(),
  token: text('token').notNull().unique(),
  createdAt: timestamp('createdAt', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updatedAt', { withTimezone: true }).notNull().defaultNow(),
  ipAddress: text('ipAddress'),
  userAgent: text('userAgent'),
  userId: text('userId').notNull(),
})

export const account = pgTable('account', {
  id: text('id').primaryKey(),
  userId: text('userId').notNull(),
  type: text('type').notNull(),
  provider: text('provider').notNull(),
  providerAccountId: text('providerAccountId').notNull(),
  refreshToken: text('refreshToken'),
  accessToken: text('accessToken'),
  expiresAt: timestamp('expiresAt', { withTimezone: true }),
  password: text('password'),
  createdAt: timestamp('createdAt', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updatedAt', { withTimezone: true }).notNull().defaultNow(),
})

export const verification = pgTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expiresAt', { withTimezone: true }).notNull(),
  createdAt: timestamp('createdAt', { withTimezone: true }),
  updatedAt: timestamp('updatedAt', { withTimezone: true }),
})

// Application tables
export const categories = pgTable(
  'categories',
  {
    id: text('id').primaryKey().default(() => Math.random().toString(36).substring(2, 15)),
    userId: text('user_id').notNull(),
    name: varchar('name', { length: 100 }).notNull(),
    description: text('description'),
    icon: varchar('icon', { length: 50 }),
    color: varchar('color', { length: 7 }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    userIdIdx: index('idx_categories_user_id').on(table.userId),
    uniqueUserCategory: unique('categories_user_id_name_unique').on(table.userId, table.name),
  })
)

export const transactions = pgTable(
  'transactions',
  {
    id: text('id').primaryKey().default(() => Math.random().toString(36).substring(2, 15)),
    userId: text('user_id').notNull(),
    categoryId: text('category_id').notNull(),
    type: varchar('type', { length: 20 }).notNull(),
    amount: decimal('amount', { precision: 15, scale: 2 }).notNull(),
    description: text('description'),
    transactionDate: date('transaction_date').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    userIdIdx: index('idx_transactions_user_id').on(table.userId),
    categoryIdIdx: index('idx_transactions_category_id').on(table.categoryId),
    dateIdx: index('idx_transactions_date').on(table.transactionDate),
  })
)

export const budgets = pgTable(
  'budgets',
  {
    id: text('id').primaryKey().default(() => Math.random().toString(36).substring(2, 15)),
    userId: text('user_id').notNull(),
    month: varchar('month', { length: 7 }).notNull(),
    totalBudget: decimal('total_budget', { precision: 15, scale: 2 }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    userIdIdx: index('idx_budgets_user_id').on(table.userId),
    uniqueUserMonth: unique('budgets_user_id_month_unique').on(table.userId, table.month),
  })
)

export const budgetAllocations = pgTable(
  'budget_allocations',
  {
    id: text('id').primaryKey().default(() => Math.random().toString(36).substring(2, 15)),
    budgetId: text('budget_id').notNull(),
    categoryId: text('category_id').notNull(),
    allocationAmount: decimal('allocation_amount', { precision: 15, scale: 2 }),
    allocationPercentage: decimal('allocation_percentage', { precision: 5, scale: 2 }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    budgetIdIdx: index('idx_allocations_budget_id').on(table.budgetId),
    categoryIdIdx: index('idx_allocations_category_id').on(table.categoryId),
  })
)

export const familyGroups = pgTable(
  'family_groups',
  {
    id: text('id').primaryKey().default(() => Math.random().toString(36).substring(2, 15)),
    name: varchar('name', { length: 255 }).notNull(),
    ownerId: text('owner_id').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    ownerIdIdx: index('idx_family_groups_owner_id').on(table.ownerId),
  })
)

export const familyMembers = pgTable(
  'family_members',
  {
    id: text('id').primaryKey().default(() => Math.random().toString(36).substring(2, 15)),
    familyGroupId: text('family_group_id').notNull(),
    userId: text('user_id').notNull(),
    role: varchar('role', { length: 50 }).notNull().default('member'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    familyGroupIdIdx: index('idx_family_members_family_group_id').on(table.familyGroupId),
    userIdIdx: index('idx_family_members_user_id').on(table.userId),
  })
)

export const sharedTransactions = pgTable(
  'shared_transactions',
  {
    id: text('id').primaryKey().default(() => Math.random().toString(36).substring(2, 15)),
    familyGroupId: text('family_group_id').notNull(),
    categoryId: text('category_id').notNull(),
    type: varchar('type', { length: 20 }).notNull(),
    amount: decimal('amount', { precision: 15, scale: 2 }).notNull(),
    description: text('description'),
    transactionDate: date('transaction_date').notNull(),
    createdBy: text('created_by').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    familyGroupIdIdx: index('idx_shared_transactions_family_group_id').on(table.familyGroupId),
    dateIdx: index('idx_shared_transactions_date').on(table.transactionDate),
  })
)

export const sharedBudgets = pgTable(
  'shared_budgets',
  {
    id: text('id').primaryKey().default(() => Math.random().toString(36).substring(2, 15)),
    familyGroupId: text('family_group_id').notNull(),
    month: varchar('month', { length: 7 }).notNull(),
    totalBudget: decimal('total_budget', { precision: 15, scale: 2 }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    familyGroupIdIdx: index('idx_shared_budgets_family_group_id').on(table.familyGroupId),
    uniqueFamilyMonth: unique('shared_budgets_family_group_id_month_unique').on(table.familyGroupId, table.month),
  })
)

export const sharedBudgetAllocations = pgTable(
  'shared_budget_allocations',
  {
    id: text('id').primaryKey().default(() => Math.random().toString(36).substring(2, 15)),
    sharedBudgetId: text('shared_budget_id').notNull(),
    categoryId: text('category_id').notNull(),
    allocationAmount: decimal('allocation_amount', { precision: 15, scale: 2 }),
    allocationPercentage: decimal('allocation_percentage', { precision: 5, scale: 2 }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    sharedBudgetIdIdx: index('idx_shared_allocations_shared_budget_id').on(table.sharedBudgetId),
    categoryIdIdx: index('idx_shared_allocations_category_id').on(table.categoryId),
  })
)

export const auditLogs = pgTable(
  'audit_logs',
  {
    id: text('id').primaryKey().default(() => Math.random().toString(36).substring(2, 15)),
    userId: text('user_id').notNull(),
    action: varchar('action', { length: 100 }).notNull(),
    entityType: varchar('entity_type', { length: 50 }),
    entityId: text('entity_id'),
    oldValues: jsonb('old_values'),
    newValues: jsonb('new_values'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    userIdIdx: index('idx_audit_logs_user_id').on(table.userId),
  })
)
