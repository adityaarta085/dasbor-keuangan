'use client'

import { useState } from 'react'
import { createBudget } from '@/app/actions/budgets'
import { useRouter } from 'next/navigation'
import { Plus, Trash2 } from 'lucide-react'

interface BudgetFormProps {
  categories: any[]
}

interface AllocationItem {
  categoryId: string
  allocationPercentage: string
}

export function BudgetForm({ categories }: BudgetFormProps) {
  const [month, setMonth] = useState(new Date().toISOString().split('T')[0].slice(0, 7))
  const [totalBudget, setTotalBudget] = useState('')
  const [allocations, setAllocations] = useState<AllocationItem[]>([
    { categoryId: categories[0]?.id || '', allocationPercentage: '' },
  ])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleAddAllocation = () => {
    if (allocations.length < categories.length) {
      setAllocations([
        ...allocations,
        { categoryId: categories[allocations.length]?.id || '', allocationPercentage: '' },
      ])
    }
  }

  const handleRemoveAllocation = (index: number) => {
    setAllocations(allocations.filter((_, i) => i !== index))
  }

  const handleAllocationChange = (index: number, field: string, value: string) => {
    const newAllocations = [...allocations]
    newAllocations[index] = { ...newAllocations[index], [field]: value }
    setAllocations(newAllocations)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (!month) throw new Error('Please select a month')
      if (!totalBudget) throw new Error('Please enter total budget')
      if (allocations.some((a) => !a.categoryId || !a.allocationPercentage)) {
        throw new Error('Please fill all allocations')
      }

      const totalPercentage = allocations.reduce(
        (sum, a) => sum + parseFloat(a.allocationPercentage),
        0
      )

      if (Math.abs(totalPercentage - 100) > 0.01) {
        throw new Error(`Total percentage must be 100%, currently ${totalPercentage.toFixed(2)}%`)
      }

      await createBudget({
        month,
        totalBudget,
        allocations,
      })

      setMonth(new Date().toISOString().split('T')[0].slice(0, 7))
      setTotalBudget('')
      setAllocations([{ categoryId: categories[0]?.id || '', allocationPercentage: '' }])
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const totalPercentage = allocations.reduce(
    (sum, a) => sum + (parseFloat(a.allocationPercentage) || 0),
    0
  )

  return (
    <div className="bg-card border border-border rounded-lg p-6 shadow-sm space-y-4">
      <h2 className="text-xl font-semibold text-foreground">Create Budget</h2>

      {error && (
        <div className="bg-red-50 text-red-800 p-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Month Selection */}
        <div>
          <label htmlFor="month" className="block text-sm font-medium text-foreground mb-2">
            Month
          </label>
          <input
            id="month"
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>

        {/* Total Budget */}
        <div>
          <label htmlFor="totalBudget" className="block text-sm font-medium text-foreground mb-2">
            Total Budget
          </label>
          <input
            id="totalBudget"
            type="number"
            value={totalBudget}
            onChange={(e) => setTotalBudget(e.target.value)}
            placeholder="0.00"
            step="0.01"
            min="0"
            className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>

        {/* Category Allocations */}
        <div className="space-y-3 border-t border-border pt-4">
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium text-foreground">Allocations (%)</label>
            <span className={`text-sm font-medium ${Math.abs(totalPercentage - 100) < 0.01 ? 'text-green-600' : 'text-red-600'}`}>
              {totalPercentage.toFixed(2)}%
            </span>
          </div>

          {allocations.map((alloc, index) => (
            <div key={index} className="flex gap-2">
              <select
                value={alloc.categoryId}
                onChange={(e) => handleAllocationChange(index, 'categoryId', e.target.value)}
                className="flex-1 px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent text-sm"
              >
                <option value="">Select category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              <input
                type="number"
                value={alloc.allocationPercentage}
                onChange={(e) => handleAllocationChange(index, 'allocationPercentage', e.target.value)}
                placeholder="0"
                min="0"
                max="100"
                step="0.01"
                className="w-20 px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent text-sm"
              />
              {allocations.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveAllocation(index)}
                  className="text-red-500 hover:text-red-700 transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}

          {allocations.length < categories.length && (
            <button
              type="button"
              onClick={handleAddAllocation}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-border rounded-lg text-secondary-foreground hover:bg-secondary transition text-sm"
            >
              <Plus className="w-4 h-4" />
              Add Allocation
            </button>
          )}
        </div>

        <button
          type="submit"
          disabled={loading || Math.abs(totalPercentage - 100) > 0.01}
          className="w-full bg-accent text-accent-foreground py-2 rounded-lg font-medium hover:opacity-90 disabled:opacity-50 transition"
        >
          {loading ? 'Creating...' : 'Create Budget'}
        </button>
      </form>
    </div>
  )
}
