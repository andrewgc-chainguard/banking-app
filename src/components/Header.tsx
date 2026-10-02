'use client'

export function Header() {
  return (
    <header className="bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-lg">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">FinanceHub</h1>
            <p className="text-blue-100">Your Personal Banking Dashboard</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-blue-100">Welcome back</p>
            <p className="text-lg font-semibold">John Smith</p>
          </div>
        </div>
      </div>
    </header>
  )
}
