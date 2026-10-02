'use client'

import { useState, useEffect } from 'react'
import { Header } from '@/components/Header'
import { AccountCard } from '@/components/AccountCard'
import { TransactionList } from '@/components/TransactionList'
import { BalanceChart } from '@/components/BalanceChart'
import { TransferForm } from '@/components/TransferForm'

interface Account {
  id: number
  account_type: string
  balance: string
}

interface Transaction {
  id: number
  type: string
  amount: number
  description: string
  created_at: string
}

interface BalanceHistory {
  created_at: string
  balance: string | number
}

export default function Home() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [selectedAccountId, setSelectedAccountId] = useState<number | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [balanceHistory, setBalanceHistory] = useState<BalanceHistory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setIsLoading(true)
      const accountsRes = await fetch('/api/accounts')
      if (!accountsRes.ok) throw new Error('Failed to fetch accounts')
      const accountsData = await accountsRes.json()

      setAccounts(accountsData)
      if (accountsData.length > 0) {
        setSelectedAccountId(accountsData[0].id)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (!selectedAccountId) return

    const fetchAccountData = async () => {
      try {
        const [transRes, historyRes] = await Promise.all([
          fetch(`/api/transactions?accountId=${selectedAccountId}`),
          fetch(`/api/account-history?accountId=${selectedAccountId}`),
        ])

        if (!transRes.ok || !historyRes.ok) {
          throw new Error('Failed to fetch account data')
        }

        setTransactions(await transRes.json())
        setBalanceHistory(await historyRes.json())
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      }
    }

    fetchAccountData()
  }, [selectedAccountId])

  const handleTransferSuccess = async () => {
    // Refresh all data after successful transfer
    await fetchData()
    if (selectedAccountId) {
      const [transRes, historyRes] = await Promise.all([
        fetch(`/api/transactions?accountId=${selectedAccountId}`),
        fetch(`/api/account-history?accountId=${selectedAccountId}`),
      ])
      if (transRes.ok && historyRes.ok) {
        setTransactions(await transRes.json())
        setBalanceHistory(await historyRes.json())
      }
    }
  }

  const selectedAccount = accounts.find((acc) => acc.id === selectedAccountId)

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-slate-600">Loading your account...</p>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-slate-100">
      <Header />

      <div className="max-w-6xl mx-auto px-4 py-8">
        {error && (
          <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* Accounts Section */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Your Accounts</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {accounts.map((account) => (
              <AccountCard
                key={account.id}
                accountType={account.account_type}
                balance={parseFloat(account.balance)}
                isSelected={selectedAccountId === account.id}
                onClick={() => setSelectedAccountId(account.id)}
              />
            ))}
          </div>
        </section>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Chart and Transactions */}
          <div className="lg:col-span-2 space-y-8">
            {balanceHistory.length > 0 && (
              <BalanceChart data={balanceHistory} />
            )}

            <TransactionList transactions={transactions} />
          </div>

          {/* Right Column - Transfer Form */}
          <div>
            <TransferForm accounts={accounts} onSuccess={handleTransferSuccess} />
          </div>
        </div>
      </div>
    </main>
  )
}
