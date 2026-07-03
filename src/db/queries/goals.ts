import { db } from '@/db'
import { goals } from '@/db/schema'
import { eq } from 'drizzle-orm'
import type { InferSelectModel, InferInsertModel } from 'drizzle-orm'

export type Goal = InferSelectModel<typeof goals>
export type NewGoal = InferInsertModel<typeof goals>

/** 获取所有目标 */
export function getAllGoals(): Goal[] {
  return db.select().from(goals).all()
}

/** 按 ID 获取单个目标 */
export function getGoalById(id: string): Goal | undefined {
  return db.select().from(goals).where(eq(goals.id, id)).get()
}

/** 创建目标 */
export function createGoal(data: Omit<NewGoal, 'id' | 'createdAt' | 'updatedAt'>): Goal {
  const result = db.insert(goals).values(data).returning().get()
  return result
}

/** 更新目标 */
export function updateGoal(id: string, data: Partial<Omit<NewGoal, 'id' | 'createdAt' | 'updatedAt'>>): Goal | undefined {
  const result = db.update(goals).set(data).where(eq(goals.id, id)).returning().get()
  return result
}

/** 删除目标 */
export function deleteGoal(id: string): boolean {
  const result = db.delete(goals).where(eq(goals.id, id)).run()
  return result.changes > 0
}
