import { getAllGoals } from '@/db/queries/goals'
import { GoalsPageClient } from './goals-client'

export const dynamic = 'force-dynamic'

export default async function GoalsPage() {
  const goals = getAllGoals()
  return <GoalsPageClient goals={goals} />
}
