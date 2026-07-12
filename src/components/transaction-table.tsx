import { Badge } from '@/components/ui/badge'

type Transaction = {
  id: string
  accountId: string
  amount: number
  date: string
  payee: string | null
  category: string | null
}

type TransactionTableProps = {
  transactions: Transaction[]
}

export function TransactionTable({ transactions }: TransactionTableProps) {
  if (transactions.length === 0) {
    return (
      <p className="text-sm text-slate-500 py-8 text-center">暂无交易记录</p>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200">
            <th className="text-left py-3 px-4 font-medium text-slate-500">日期</th>
            <th className="text-right py-3 px-4 font-medium text-slate-500">金额</th>
            <th className="text-left py-3 px-4 font-medium text-slate-500">收款方</th>
            <th className="text-left py-3 px-4 font-medium text-slate-500">类别</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map(txn => (
            <tr key={txn.id} className="border-b border-slate-100 hover:bg-slate-50">
              <td className="py-3 px-4 text-slate-900">{txn.date}</td>
              <td className={`py-3 px-4 text-right font-medium ${txn.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {txn.amount >= 0 ? '+' : ''}¥{Math.abs(txn.amount).toLocaleString()}
              </td>
              <td className="py-3 px-4 text-slate-700">{txn.payee ?? '-'}</td>
              <td className="py-3 px-4">
                {txn.category ? (
                  <Badge variant="secondary">{txn.category}</Badge>
                ) : '-'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
