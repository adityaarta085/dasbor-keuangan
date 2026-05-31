'use client'

import { useState } from 'react'
import { createTransaction } from '@/app/actions/transactions'
import { createCategory } from '@/app/actions/categories'
import { useRouter } from 'next/navigation'
import { Plus } from 'lucide-react'

interface TransactionFormProps {
  categories: any[]
}

export function TransactionForm({ categories: initialCategories }: TransactionFormProps) {
  const [type, setType] = useState<'income' | 'expense'>('expense')
  const [categoryId, setCategoryId] = useState(initialCategories[0]?.id || '')
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [transactionDate, setTransactionDate] = useState(new Date().toISOString().split('T')[0])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showNewCategory, setShowNewCategory] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (!categoryId) {
        throw new Error('Please select a category')
      }
      if (!amount) {
        throw new Error('Please enter an amount')
      }

      await createTransaction({
        categoryId,
        type,
        amount,
        description,
        transactionDate,
      })

      // Reset form
      setAmount('')
      setDescription('')
      setTransactionDate(new Date().toISOString().split('T')[0])
      setCategoryId(initialCategories[0]?.id || '')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (!newCategoryName) {
        throw new Error('Please enter a category name')
      }

      const result = await createCategory({
        name: newCategoryName,
        color: '#3b82f6',
      })

      setCategoryId(result.id)
      setNewCategoryName('')
      setShowNewCategory(false)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-card border border-border rounded-lg p-6 shadow-sm space-y-4">
      <h2 className="text-xl font-semibold text-foreground">Add Transaction</h2>

      {error && (
        <div className="bg-red-50 text-red-800 p-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Type Selection */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Type</label>
          <div className="flex gap-2">
            {(['income', 'expense'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                className={`flex-1 py-2 rounded-lg font-medium transition ${
                  type === t
                    ? 'bg-accent text-accent-foreground'
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary'
                }`}
              >
                {t === 'income' ? 'Income' : 'Expense'}
              </button>
            ))}
          </div>
        </div>

        {/* Category Selection */}
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-foreground mb-2">
            Category
          </label>
          {showNewCategory ? (
            <form onSubmit={handleAddCategory} className="flex gap-2 mb-2">
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="Category name"
                className="flex-1 px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
              />
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-accent text-accent-foreground rounded-lg font-medium hover:opacity-90 disabled:opacity-50"
              >
                Add
              </button>
              <button
                type="button"
                onClick={() => setShowNewCategory(false)}
                className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg font-medium hover:opacity-90"
              >
                Cancel
              </button>
            </form>
          ) : (
            <>
              <select
                id="category"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
              >
                <option value="">Select category</option>
                {initialCategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setShowNewCategory(true)}
                className="w-full mt-2 flex items-center justify-center gap-2 px-4 py-2 border border-border rounded-lg text-secondary-foreground hover:bg-secondary transition"
              >
                <Plus className="w-4 h-4" />
                New Category
              </button>
            </>
          )}
        </div>

        {/* Amount */}
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-foreground mb-2">
            Amount
          </label>
          <input
            id="amount"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            step="0.01"
            min="0"
            className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>

        {/* Date */}
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-foreground mb-2">
            Date
          </label>
          <input
            id="date"
            type="date"
            value={transactionDate}
            onChange={(e) => setTransactionDate(e.target.value)}
            className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-foreground mb-2">
            Description (Optional)
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add a note..."
            className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent resize-none"
            rows={3}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-accent text-accent-foreground py-2 rounded-lg font-medium hover:opacity-90 disabled:opacity-50 transition"
        >
          {loading ? 'Adding...' : 'Add Transaction'}
        </button>
      </form>
    </div>
  )
}
