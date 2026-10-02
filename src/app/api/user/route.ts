import { NextRequest, NextResponse } from 'next/server'
import { getUser, getAccounts } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const user = await getUser(1) // Demo user ID
    const accounts = await getAccounts(1)

    return NextResponse.json({
      user,
      accounts,
      totalBalance: accounts.reduce((sum, acc) => sum + parseFloat(acc.balance), 0),
    })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user data' },
      { status: 500 }
    )
  }
}
