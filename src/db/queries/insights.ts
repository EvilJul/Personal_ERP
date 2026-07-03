import { db } from '@/db'
import { insights } from '@/db/schema'
import { desc } from 'drizzle-orm'
import { z } from 'zod'
import type { InferSelectModel } from 'drizzle-orm'

export type Insight = InferSelectModel<typeof insights>

// 洞察 data 字段的 Zod 校验 schema
const InsightDataSchema = z.object({
  triggered: z.boolean().optional(),
  module: z.string().optional(),
  conditions: z
    .array(
      z.object({
        module: z.string(),
        field: z.string(),
        operator: z.string(),
        expected: z.string(),
        actual: z.number(),
      }),
    )
    .optional(),
  details: z.record(z.string(), z.unknown()).optional(),
})

export type InsightData = z.infer<typeof InsightDataSchema>

/**
 * 解析并校验洞察 data 字段
 * 解析失败时返回 null，不抛异常
 */
export function parseInsightData(data: string | null): InsightData | null {
  if (!data) return null
  try {
    return InsightDataSchema.parse(JSON.parse(data))
  } catch {
    return null
  }
}

/** 获取所有洞察，按创建时间倒序 */
export function getAllInsights(): Insight[] {
  return db.select().from(insights).orderBy(desc(insights.createdAt)).all()
}
