import { sqliteTable, text, integer, real, unique } from 'drizzle-orm/sqlite-core'
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
