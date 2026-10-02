import { NextRequest, NextResponse } from 'next/server'
import { getTransactions } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const accountId = searchParams.get('accountId')

    if (!accountId) {
      return NextResponse.json(
        { error: 'Account ID is required' },
        { status: 400 }
      )
    }

    const transactions = await getTransactions(parseInt(accountId))

    return NextResponse.json(transactions)
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch transactions' },
      { status: 500 }
    )
  }
}
