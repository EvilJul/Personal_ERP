import { db } from '@/db'
import { badges, userBadges } from '@/db/schema'
import { eq, and } from 'drizzle-orm'

/**
 * 获取所有徽章定义
 */
export function getAllBadges() {
  return db.select().from(badges).all()
}

/**
 * 获取用户的已解锁徽章列表
 */
export function getUserBadges(userId: string = 'default') {
  return db.select().from(userBadges)
    .where(eq(userBadges.userId, userId))
    .all()
}

/**
 * 解锁徽章或升级徽章等级
 * 如果徽章已解锁且新等级更高，则更新等级
 * 如果徽章已解锁且新等级不更高，则返回已有记录
 * 如果徽章未解锁，则新增解锁记录
 */
export function unlockBadge(badgeId: string, tier: number, userId: string = 'default') {
  // 检查是否已解锁
  const existing = db.select().from(userBadges)
    .where(and(
      eq(userBadges.userId, userId),
      eq(userBadges.badgeId, badgeId),
    ))
    .get()

  if (existing) {
    // 仅当新等级更高时更新
    if (tier > existing.tier) {
      return db.update(userBadges)
        .set({ tier, updatedAt: new Date() })
        .where(eq(userBadges.id, existing.id))
        .returning()
        .get()
    }
    return existing
  }

  // 新解锁
  return db.insert(userBadges)
    .values({ userId, badgeId, tier })
    .returning()
    .get()
}

/**
 * 获取徽章详情及其用户解锁状态
 */
export function getBadgeWithUserStatus(badgeId: string, userId: string = 'default') {
  const badge = db.select().from(badges).where(eq(badges.id, badgeId)).get()
  if (!badge) return null

  const userBadge = db.select().from(userBadges)
    .where(and(
      eq(userBadges.userId, userId),
      eq(userBadges.badgeId, badgeId),
    ))
    .get()

  return {
    ...badge,
    unlocked: !!userBadge,
    currentTier: userBadge?.tier || 0,
    unlockedAt: userBadge?.unlockedAt,
  }
}

/**
 * 获取所有徽章及其用户解锁状态
 */
export function getAllBadgesWithUserStatus(userId: string = 'default') {
  const allBadges = db.select().from(badges).all()
  const userBadgeList = db.select().from(userBadges)
    .where(eq(userBadges.userId, userId))
    .all()

  const userBadgeMap = new Map(userBadgeList.map(ub => [ub.badgeId, ub]))

  return allBadges.map(badge => {
    const userBadge = userBadgeMap.get(badge.id)
    return {
      ...badge,
      unlocked: !!userBadge,
      currentTier: userBadge?.tier || 0,
      unlockedAt: userBadge?.unlockedAt,
    }
  })
}
