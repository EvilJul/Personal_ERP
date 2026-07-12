import { sqliteTable, text, integer, real, unique, index } from 'drizzle-orm/sqlite-core'
import { sql } from 'drizzle-orm'
import { nanoid } from 'nanoid'

// ====== users ======
export const users = sqliteTable('users', {
  id: text('id').primaryKey().$defaultFn(() => nanoid()),
  actualServerUrl: text('actual_server_url'),
  actualPassword: text('actual_password'),
  actualBudgetId: text('actual_budget_id'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
})

// ====== goals ======
export const goals = sqliteTable('goals', {
  id: text('id').primaryKey().$defaultFn(() => nanoid()),
  title: text('title').notNull(),
  description: text('description'),
  currentValue: real('current_value').notNull().default(0),
  targetValue: real('target_value').notNull(),
  unit: text('unit'),
  deadline: text('deadline'),
  linkedModules: text('linked_modules'), // JSON array string
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
})

// ====== habits ======
export const habits = sqliteTable('habits', {
  id: text('id').primaryKey().$defaultFn(() => nanoid()),
  title: text('title').notNull(),
  description: text('description'),
  frequency: text('frequency').notNull().default('daily'),
  linkedGoalId: text('linked_goal_id').references(() => goals.id),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
})

// ====== habit_entries ======
export const habitEntries = sqliteTable('habit_entries', {
  id: text('id').primaryKey().$defaultFn(() => nanoid()),
  habitId: text('habit_id').notNull().references(() => habits.id),
  date: text('date').notNull(), // YYYY-MM-DD format
  completed: integer('completed').notNull().default(1),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
}, (table) => [
  unique('habit_entries_habit_id_date_unique').on(table.habitId, table.date),
])

// ====== connection_rules ======
export const connectionRules = sqliteTable('connection_rules', {
  id: text('id').primaryKey().$defaultFn(() => nanoid()),
  name: text('name').notNull(),
  description: text('description'),
  enabled: integer('enabled').notNull().default(1),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
})

// ====== rule_conditions ======
export const ruleConditions = sqliteTable('rule_conditions', {
  id: text('id').primaryKey().$defaultFn(() => nanoid()),
  ruleId: text('rule_id').notNull().references(() => connectionRules.id),
  module: text('module').notNull(),
  field: text('field').notNull(),
  operator: text('operator').notNull(),
  value: text('value').notNull(),
})

// ====== rule_actions ======
export const ruleActions = sqliteTable('rule_actions', {
  id: text('id').primaryKey().$defaultFn(() => nanoid()),
  ruleId: text('rule_id').notNull().references(() => connectionRules.id),
  type: text('type').notNull(),
  targetModule: text('target_module'),
  parameters: text('parameters'), // JSON string
})

// ====== insights ======
export const insights = sqliteTable('insights', {
  id: text('id').primaryKey().$defaultFn(() => nanoid()),
  ruleId: text('rule_id').references(() => connectionRules.id),
  message: text('message').notNull(),
  severity: text('severity').notNull().default('info'),
  data: text('data'), // JSON string
  read: integer('read').notNull().default(0),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
})

// ====== accounts ======
export const accounts = sqliteTable('accounts', {
  id: text('id').primaryKey().$defaultFn(() => nanoid()),
  name: text('name').notNull(),
  type: text('type').notNull(), // checking, savings, credit
  balance: real('balance').notNull().default(0),
  syncId: text('sync_id'), // Actual Budget 的 account ID
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
}, (table) => [
  unique('accounts_sync_id_unique').on(table.syncId),
])

// ====== badges ======
export const badges = sqliteTable('badges', {
  id: text('id').primaryKey().$defaultFn(() => nanoid()),
  name: text('name').notNull(),
  category: text('category').notNull(), // goal/habit/finance/special
  condition: text('condition').notNull(), // JSON condition
  icon: text('icon').notNull(), // emoji or SVG
  description: text('description'),
  rarity: text('rarity').notNull().default('common'), // common/rare/epic/legendary
  tier: integer('tier').notNull().default(1), // 1=铜, 2=银, 3=金, 4=钻石
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
})

// ====== user_badges ======
export const userBadges = sqliteTable('user_badges', {
  id: text('id').primaryKey().$defaultFn(() => nanoid()),
  userId: text('user_id').notNull().default('default'),
  badgeId: text('badge_id').notNull().references(() => badges.id),
  tier: integer('tier').notNull().default(1), // 当前等级 1-4
  unlockedAt: integer('unlocked_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
})

// ====== transactions ======
export const transactions = sqliteTable('transactions', {
  id: text('id').primaryKey().$defaultFn(() => nanoid()),
  accountId: text('account_id').notNull().references(() => accounts.id),
  amount: real('amount').notNull(),
  date: text('date').notNull(), // YYYY-MM-DD
  payee: text('payee'),
  category: text('category'),
  syncId: text('sync_id'), // Actual Budget 的 transaction ID
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
}, (table) => [
  unique('transactions_sync_id_unique').on(table.syncId),
  index('transaction_date_idx').on(table.date),
  index('transaction_account_idx').on(table.accountId),
])
