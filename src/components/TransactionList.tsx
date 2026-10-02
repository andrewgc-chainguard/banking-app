'use client'

interface Transaction {
  id: number
  type: string
  amount: number
  description: string
  created_at: string
}

interface TransactionListProps {
  transactions: Transaction[]
}

export function TransactionList({ transactions }: TransactionListProps) {
  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'deposit':
        return '↓'
      case 'withdrawal':
        return '↑'
      case 'purchase':
        return '💳'
      case 'transfer':
        return '↔️'
      default:
        return '•'
    }
  }

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'deposit':
        return 'text-green-600'
      case 'withdrawal':
      case 'purchase':
      case 'transfer':
        return 'text-red-600'
      default:
        return 'text-slate-600'
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold mb-4">Recent Transactions</h2>
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {transactions.length === 0 ? (
          <p className="text-slate-500 text-center py-8">No transactions found</p>
        ) : (
          transactions.map((transaction) => (
            <div
              key={transaction.id}
              className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 border border-slate-100"
            >
              <div className="flex items-center gap-3 flex-1">
                <span className="text-xl">{getTransactionIcon(transaction.type)}</span>
                <div>
                  <p className="font-semibold text-slate-900">{transaction.description}</p>
                  <p className="text-sm text-slate-500">
                    {new Date(transaction.created_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              </div>
              <p className={`font-bold text-lg ${getTransactionColor(transaction.type)}`}>
                {transaction.type === 'deposit' ? '+' : '-'}$
                {transaction.amount.toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
