import { HabitEditClient } from './habit-edit-client'

/** 静态导出需要至少一个预渲染路径 */
export function generateStaticParams() {
  return [{ slug: ['_'] }]
}

export default function HabitEditPage() {
  return <HabitEditClient />
}
