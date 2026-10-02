'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface BalanceHistory {
  created_at: string
  balance: string | number
}

interface BalanceChartProps {
  data: BalanceHistory[]
}

export function BalanceChart({ data }: BalanceChartProps) {
  const chartData = data
    .reverse()
    .map((item) => ({
      date: new Date(item.created_at).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      }),
      balance: parseFloat(item.balance.toString()),
    }))

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold mb-4">Balance Over Time</h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip
            formatter={(value: any) => `$${Number(value).toFixed(2)}`}
            labelFormatter={(label) => `Date: ${label}`}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="balance"
            stroke="#2563eb"
            strokeWidth={2}
            dot={{ fill: '#2563eb', r: 4 }}
            activeDot={{ r: 6 }}
            name="Account Balance"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
