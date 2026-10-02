import { NextRequest, NextResponse } from 'next/server'
import { transfer } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const { fromAccountId, toAccountId, amount } = await req.json()

    if (!fromAccountId || !toAccountId || !amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid transfer parameters' },
        { status: 400 }
      )
    }

    await transfer(fromAccountId, toAccountId, amount, 'Bank Transfer')

    return NextResponse.json({
      success: true,
      message: 'Transfer completed successfully',
    })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Failed to process transfer' },
      { status: 500 }
    )
  }
}
