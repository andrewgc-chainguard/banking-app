'use client'

interface AccountCardProps {
  accountType: string
  balance: number
  isSelected?: boolean
  onClick?: () => void
}

export function AccountCard({ accountType, balance, isSelected, onClick }: AccountCardProps) {
  return (
    <div
      onClick={onClick}
      className={`p-6 rounded-lg cursor-pointer transition-all transform hover:scale-105 ${
        isSelected
          ? 'bg-blue-600 text-white shadow-lg scale-105'
          : 'bg-white text-slate-900 shadow-md border border-slate-200'
      }`}
    >
      <p className="text-sm font-semibold opacity-75 mb-2">{accountType}</p>
      <p className="text-3xl font-bold">
        ${balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </p>
    </div>
  )
}
