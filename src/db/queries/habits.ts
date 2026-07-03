import { db } from '@/db'
import { habits, habitEntries } from '@/db/schema'
import { eq, and } from 'drizzle-orm'
import type { InferSelectModel, InferInsertModel } from 'drizzle-orm'

export type Habit = InferSelectModel<typeof habits>
export type NewHabit = InferInsertModel<typeof habits>
export type HabitEntry = InferSelectModel<typeof habitEntries>
export type NewHabitEntry = InferInsertModel<typeof habitEntries>

/** 获取所有习惯 */
export function getAllHabits(): Habit[] {
  return db.select().from(habits).all()
}

/** 按 ID 获取单个习惯 */
export function getHabitById(id: string): Habit | undefined {
  return db.select().from(habits).where(eq(habits.id, id)).get()
}

/** 创建习惯 */
export function createHabit(data: Omit<NewHabit, 'id' | 'createdAt' | 'updatedAt'>): Habit {
  return db.insert(habits).values(data).returning().get()
}

/** 更新习惯 */
export function updateHabit(id: string, data: Partial<Omit<NewHabit, 'id' | 'createdAt' | 'updatedAt'>>): Habit | undefined {
  return db.update(habits).set(data).where(eq(habits.id, id)).returning().get()
}

/** 删除习惯 */
export function deleteHabit(id: string): boolean {
  const result = db.delete(habits).where(eq(habits.id, id)).run()
  return result.changes > 0
}

/** 记录习惯完成 */
export function markHabitEntry(habitId: string, date: string, completed: number = 1): HabitEntry {
  return db.insert(habitEntries).values({ habitId, date, completed }).returning().get()
}

/** 获取习惯在指定日期的记录 */
export function getHabitEntry(habitId: string, date: string): HabitEntry | undefined {
  return db.select().from(habitEntries)
    .where(and(eq(habitEntries.habitId, habitId), eq(habitEntries.date, date)))
    .get()
}

/** 获取习惯的所有记录 */
export function getHabitEntries(habitId: string): HabitEntry[] {
  return db.select().from(habitEntries)
    .where(eq(habitEntries.habitId, habitId))
    .all()
}
