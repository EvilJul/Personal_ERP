import { db } from '@/db'
import { insights } from '@/db/schema'
import { desc } from 'drizzle-orm'
import type { InferSelectModel } from 'drizzle-orm'

export type Insight = InferSelectModel<typeof insights>

/** 获取所有洞察，按创建时间倒序 */
export function getAllInsights(): Insight[] {
  return db.select().from(insights).orderBy(desc(insights.createdAt)).all()
}
