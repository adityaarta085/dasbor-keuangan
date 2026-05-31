'use client'

import { useState } from 'react'
import { deleteTransaction } from '@/app/actions/transactions'
import { useRouter } from 'next/navigation'
import { Trash2, Search } from 'lucide-react'

interface TransactionsListProps {
  transactions: any[]
  categories: any[]
}

export function TransactionsList({ transactions, categories }: TransactionsListProps) {
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null)
  const router = useRouter()

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure?')) return
    setDeleteLoading(id)
    try {
      await deleteTransaction(id)
      router.refresh()
    } finally {
      setDeleteLoading(null)
    }
  }

  const filtered = transactions.filter((tx) => {
    const matchSearch =
      tx.category.toLowerCase().includes(search.toLowerCase()) ||
      tx.description?.toLowerCase().includes(search.toLowerCase()) ||
      tx.amount.includes(search)
    const matchCategory = !selectedCategory || tx.category === selectedCategory
    return matchSearch && matchCategory
  })

  return (
    <div className="bg-card border border-border rounded-lg p-6 shadow-sm space-y-4">
      <h2 className="text-xl font-semibold text-foreground">Transactions</h2>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-secondary-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search transactions..."
            className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.name}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {/* Transactions Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-4 font-medium">Date</th>
              <th className="text-left py-3 px-4 font-medium">Category</th>
              <th className="text-left py-3 px-4 font-medium">Description</th>
              <th className="text-left py-3 px-4 font-medium">Type</th>
              <th className="text-right py-3 px-4 font-medium">Amount</th>
              <th className="text-center py-3 px-4 font-medium">Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-8 text-secondary-foreground">
                  No transactions found
                </td>
              </tr>
            ) : (
              filtered.map((tx) => (
                <tr key={tx.id} className="border-b border-border hover:bg-secondary transition">
                  <td className="py-3 px-4">
                    {new Date(tx.transactionDate).toLocaleDateString('id-ID')}
                  </td>
                  <td className="py-3 px-4">{tx.category}</td>
                  <td className="py-3 px-4">{tx.description || '-'}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        tx.type === 'income'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {tx.type === 'income' ? 'Income' : 'Expense'}
                    </span>
                  </td>
                  <td
                    className={`py-3 px-4 text-right font-medium ${
                      tx.type === 'income' ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {tx.type === 'income' ? '+' : '-'} IDR{' '}
                    {Math.abs(parseFloat(tx.amount)).toLocaleString('id-ID', {
                      maximumFractionDigits: 0,
                    })}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => handleDelete(tx.id)}
                      disabled={deleteLoading === tx.id}
                      className="text-red-500 hover:text-red-700 disabled:opacity-50 transition inline-flex items-center gap-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
