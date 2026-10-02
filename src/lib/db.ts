import { Pool, QueryResult } from 'pg'

// ---------------------------------------------------------------------------
// Real DB implementation
// ---------------------------------------------------------------------------

let pool: Pool | undefined

function getPool(): Pool {
  if (!pool) {
    pool = new Pool({ connectionString: process.env.DATABASE_URL })
  }
  return pool
}

export async function query<T = any>(text: string, params?: any[]): Promise<QueryResult<T>> {
  const client = await getPool().connect()
  try {
    return await client.query<T>(text, params)
  } finally {
    client.release()
  }
}

async function dbGetUser(userId: number = 1) {
  const result = await query('SELECT * FROM users WHERE id = $1', [userId])
  return result.rows[0]
}

async function dbGetAccounts(userId: number = 1) {
  const result = await query(
    'SELECT * FROM accounts WHERE user_id = $1 ORDER BY created_at',
    [userId]
  )
  return result.rows
}

async function dbGetTransactions(accountId: number, limit: number = 20) {
  const result = await query(
    'SELECT * FROM transactions WHERE account_id = $1 ORDER BY created_at DESC LIMIT $2',
    [accountId, limit]
  )
  return result.rows
}

async function dbGetAccountHistory(accountId: number) {
  const result = await query(
    'SELECT * FROM account_history WHERE account_id = $1 ORDER BY created_at DESC',
    [accountId]
  )
  return result.rows
}

async function dbTransfer(
  fromAccountId: number,
  toAccountId: number,
  amount: number,
  description: string
) {
  const client = await getPool().connect()
  try {
    await client.query('BEGIN')
    await client.query(
      'UPDATE accounts SET balance = balance - $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [amount, fromAccountId]
    )
    await client.query(
      'UPDATE accounts SET balance = balance + $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [amount, toAccountId]
    )
    await client.query(
      'INSERT INTO transactions (account_id, type, amount, description) VALUES ($1, $2, $3, $4)',
      [fromAccountId, 'transfer', amount, `Transfer to ${description}`]
    )
    await client.query(
      'INSERT INTO transactions (account_id, type, amount, description) VALUES ($1, $2, $3, $4)',
      [toAccountId, 'transfer', amount, `Transfer from ${description}`]
    )
    await client.query('COMMIT')
    return true
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

// ---------------------------------------------------------------------------
// Mock DB implementation (USE_MOCK_DB=true)
// ---------------------------------------------------------------------------

function daysAgo(n: number) {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d
}

const mockUser = { id: 1, name: 'John Smith', email: 'john@example.com', created_at: new Date() }

const mockAccounts = [
  { id: 1, user_id: 1, account_type: 'Checking', balance: 8512.72, created_at: new Date(), updated_at: new Date() },
  { id: 2, user_id: 1, account_type: 'Savings',  balance: 11506.04, created_at: new Date(), updated_at: new Date() },
]

let txId = 100
const mockTransactions = [
  // Checking (account_id: 1)
  { id: txId++, account_id: 1, type: 'deposit',    amount: 2000.00, description: 'Direct deposit - salary',  created_at: daysAgo(29) },
  { id: txId++, account_id: 1, type: 'withdrawal', amount:  150.00, description: 'ATM withdrawal',            created_at: daysAgo(27) },
  { id: txId++, account_id: 1, type: 'purchase',   amount:   89.99, description: 'Amazon purchase',           created_at: daysAgo(25) },
  { id: txId++, account_id: 1, type: 'withdrawal', amount:   50.00, description: 'Gas station',               created_at: daysAgo(23) },
  { id: txId++, account_id: 1, type: 'purchase',   amount:  245.50, description: 'Restaurant',                created_at: daysAgo(21) },
  { id: txId++, account_id: 1, type: 'purchase',   amount:   12.99, description: 'Netflix subscription',      created_at: daysAgo(19) },
  { id: txId++, account_id: 1, type: 'deposit',    amount:  500.00, description: 'Freelance project',         created_at: daysAgo(17) },
  { id: txId++, account_id: 1, type: 'withdrawal', amount:  200.00, description: 'Cash withdrawal',           created_at: daysAgo(15) },
  { id: txId++, account_id: 1, type: 'purchase',   amount: 1200.00, description: 'Furniture purchase',        created_at: daysAgo(13) },
  { id: txId++, account_id: 1, type: 'deposit',    amount:  100.00, description: 'Birthday gift',             created_at: daysAgo(11) },
  { id: txId++, account_id: 1, type: 'purchase',   amount:   65.00, description: 'Grocery store',             created_at: daysAgo(9)  },
  { id: txId++, account_id: 1, type: 'purchase',   amount:   45.50, description: 'Gas station',               created_at: daysAgo(7)  },
  { id: txId++, account_id: 1, type: 'withdrawal', amount:   75.00, description: 'ATM withdrawal',            created_at: daysAgo(5)  },
  { id: txId++, account_id: 1, type: 'purchase',   amount:  999.99, description: 'Electronics',               created_at: daysAgo(3)  },
  { id: txId++, account_id: 1, type: 'deposit',    amount:  300.00, description: 'Refund',                    created_at: daysAgo(1)  },
  // Savings (account_id: 2)
  { id: txId++, account_id: 2, type: 'deposit',    amount: 5000.00, description: 'Initial savings',           created_at: daysAgo(30) },
  { id: txId++, account_id: 2, type: 'deposit',    amount:  500.00, description: 'Monthly savings',           created_at: daysAgo(25) },
  { id: txId++, account_id: 2, type: 'deposit',    amount:  500.00, description: 'Monthly savings',           created_at: daysAgo(20) },
  { id: txId++, account_id: 2, type: 'deposit',    amount:  500.00, description: 'Monthly savings',           created_at: daysAgo(15) },
  { id: txId++, account_id: 2, type: 'deposit',    amount:  500.00, description: 'Monthly savings',           created_at: daysAgo(10) },
  { id: txId++, account_id: 2, type: 'deposit',    amount:  500.00, description: 'Monthly savings',           created_at: daysAgo(5)  },
  { id: txId++, account_id: 2, type: 'deposit',    amount: 2500.00, description: 'Year-end bonus',            created_at: daysAgo(4)  },
  { id: txId++, account_id: 2, type: 'withdrawal', amount: 1000.00, description: 'Emergency withdrawal',      created_at: daysAgo(3)  },
  { id: txId++, account_id: 2, type: 'deposit',    amount:  500.00, description: 'Monthly savings',           created_at: daysAgo(2)  },
]

let histId = 200
const mockAccountHistory = [
  // Checking
  { id: histId++, account_id: 1, balance:  7200.00, created_at: daysAgo(30) },
  { id: histId++, account_id: 1, balance:  7450.00, created_at: daysAgo(28) },
  { id: histId++, account_id: 1, balance:  7295.00, created_at: daysAgo(26) },
  { id: histId++, account_id: 1, balance:  7355.00, created_at: daysAgo(24) },
  { id: histId++, account_id: 1, balance:  7105.00, created_at: daysAgo(22) },
  { id: histId++, account_id: 1, balance:  7405.00, created_at: daysAgo(20) },
  { id: histId++, account_id: 1, balance:  7092.01, created_at: daysAgo(18) },
  { id: histId++, account_id: 1, balance:  7592.01, created_at: daysAgo(16) },
  { id: histId++, account_id: 1, balance:  7355.00, created_at: daysAgo(14) },
  { id: histId++, account_id: 1, balance:  7610.00, created_at: daysAgo(12) },
  { id: histId++, account_id: 1, balance:  8010.00, created_at: daysAgo(10) },
  { id: histId++, account_id: 1, balance:  7810.00, created_at: daysAgo(8)  },
  { id: histId++, account_id: 1, balance:  7865.00, created_at: daysAgo(6)  },
  { id: histId++, account_id: 1, balance:  8165.00, created_at: daysAgo(4)  },
  { id: histId++, account_id: 1, balance:  8500.00, created_at: daysAgo(2)  },
  // Savings
  { id: histId++, account_id: 2, balance:  9000.00, created_at: daysAgo(30) },
  { id: histId++, account_id: 2, balance:  9500.00, created_at: daysAgo(28) },
  { id: histId++, account_id: 2, balance: 10000.00, created_at: daysAgo(26) },
  { id: histId++, account_id: 2, balance: 10500.00, created_at: daysAgo(24) },
  { id: histId++, account_id: 2, balance: 11000.00, created_at: daysAgo(22) },
  { id: histId++, account_id: 2, balance: 10500.00, created_at: daysAgo(20) },
  { id: histId++, account_id: 2, balance: 11000.00, created_at: daysAgo(18) },
  { id: histId++, account_id: 2, balance: 11500.00, created_at: daysAgo(16) },
  { id: histId++, account_id: 2, balance: 11500.00, created_at: daysAgo(14) },
  { id: histId++, account_id: 2, balance: 11500.00, created_at: daysAgo(12) },
  { id: histId++, account_id: 2, balance: 11500.00, created_at: daysAgo(10) },
  { id: histId++, account_id: 2, balance: 11500.00, created_at: daysAgo(8)  },
  { id: histId++, account_id: 2, balance: 11500.00, created_at: daysAgo(6)  },
  { id: histId++, account_id: 2, balance: 11500.00, created_at: daysAgo(4)  },
  { id: histId++, account_id: 2, balance: 11500.00, created_at: daysAgo(2)  },
]

async function mockGetUser(_userId: number = 1) {
  return { ...mockUser }
}

async function mockGetAccounts(_userId: number = 1) {
  return mockAccounts.map(a => ({ ...a }))
}

async function mockGetTransactions(accountId: number, limit: number = 20) {
  return mockTransactions
    .filter(t => t.account_id === accountId)
    .sort((a, b) => b.created_at.getTime() - a.created_at.getTime())
    .slice(0, limit)
    .map(t => ({ ...t }))
}

async function mockGetAccountHistory(accountId: number) {
  return mockAccountHistory
    .filter(h => h.account_id === accountId)
    .sort((a, b) => b.created_at.getTime() - a.created_at.getTime())
    .map(h => ({ ...h }))
}

async function mockTransfer(
  fromAccountId: number,
  toAccountId: number,
  amount: number,
  description: string
) {
  const from = mockAccounts.find(a => a.id === fromAccountId)
  const to   = mockAccounts.find(a => a.id === toAccountId)
  if (!from || !to) throw new Error('Account not found')
  if (from.balance < amount) throw new Error('Insufficient funds')

  from.balance -= amount
  from.updated_at = new Date()
  to.balance += amount
  to.updated_at = new Date()

  const now = new Date()
  mockTransactions.push(
    { id: txId++, account_id: fromAccountId, type: 'transfer', amount, description: `Transfer to ${description}`,   created_at: now },
    { id: txId++, account_id: toAccountId,   type: 'transfer', amount, description: `Transfer from ${description}`, created_at: now },
  )
  return true
}

// ---------------------------------------------------------------------------
// Exports — switch on USE_MOCK_DB
// ---------------------------------------------------------------------------

const useMock = process.env.USE_MOCK_DB === 'true'

export const getUser           = useMock ? mockGetUser           : dbGetUser
export const getAccounts       = useMock ? mockGetAccounts       : dbGetAccounts
export const getTransactions   = useMock ? mockGetTransactions   : dbGetTransactions
export const getAccountHistory = useMock ? mockGetAccountHistory : dbGetAccountHistory
export const transfer          = useMock ? mockTransfer          : dbTransfer
