import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

type Account = {
  id: string
  name: string
  type: string
  balance: number
}

type AccountCardProps = {
  account: Account
}

const typeLabels: Record<string, string> = {
  checking: '活期',
  savings: '储蓄',
  credit: '信用卡',
}

export function AccountCard({ account }: AccountCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-slate-500">
          {typeLabels[account.type] ?? account.type}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-lg font-semibold text-slate-900">{account.name}</p>
        <p className="text-2xl font-bold text-slate-900 mt-1">
          ¥{account.balance.toLocaleString()}
        </p>
      </CardContent>
    </Card>
  )
}
