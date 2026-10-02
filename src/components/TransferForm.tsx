'use client'

import { useState } from 'react'

interface TransferFormProps {
  accounts: any[]
  onSuccess?: () => void
}

export function TransferForm({ accounts, onSuccess }: TransferFormProps) {
  const [fromAccountId, setFromAccountId] = useState<number | ''>(accounts[0]?.id || '')
  const [toAccountId, setToAccountId] = useState<number | ''>(accounts[1]?.id || '')
  const [amount, setAmount] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setMessage('')

    if (!fromAccountId || !toAccountId || !amount) {
      setError('All fields are required')
      return
    }

    if (fromAccountId === toAccountId) {
      setError('Transfer accounts must be different')
      return
    }

    const transferAmount = parseFloat(amount)
    if (transferAmount <= 0) {
      setError('Amount must be greater than 0')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromAccountId: parseInt(fromAccountId.toString()),
          toAccountId: parseInt(toAccountId.toString()),
          amount: transferAmount,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Transfer failed')
      }

      setMessage('Transfer completed successfully!')
      setAmount('')
      onSuccess?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold mb-4">Transfer Funds</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold mb-2">From Account</label>
          <select
            value={fromAccountId}
            onChange={(e) => setFromAccountId(parseInt(e.target.value))}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select account</option>
            {accounts.map((acc) => (
              <option key={acc.id} value={acc.id}>
                {acc.account_type} - ${parseFloat(acc.balance).toFixed(2)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">To Account</label>
          <select
            value={toAccountId}
            onChange={(e) => setToAccountId(parseInt(e.target.value))}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select account</option>
            {accounts.map((acc) => (
              <option key={acc.id} value={acc.id}>
                {acc.account_type}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">Amount</label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {error && <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>}
        {message && <div className="p-3 bg-green-50 text-green-700 rounded-lg text-sm">{message}</div>}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-slate-400 transition-colors"
        >
          {isLoading ? 'Processing...' : 'Transfer Funds'}
        </button>
      </form>
    </div>
  )
}
