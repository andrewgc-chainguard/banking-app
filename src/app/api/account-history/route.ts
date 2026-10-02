import { NextRequest, NextResponse } from 'next/server'
import { getAccountHistory } from '@/lib/db'

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

    const history = await getAccountHistory(parseInt(accountId))

    return NextResponse.json(history)
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch account history' },
      { status: 500 }
    )
  }
}
