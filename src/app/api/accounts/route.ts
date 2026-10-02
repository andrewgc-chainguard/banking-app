import { NextRequest, NextResponse } from 'next/server'
import { getAccounts } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const accounts = await getAccounts(1) // Demo user ID

    return NextResponse.json(accounts)
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch accounts' },
      { status: 500 }
    )
  }
}
