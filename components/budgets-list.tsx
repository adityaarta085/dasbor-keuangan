'use client'

import { useState } from 'react'
import { getBudgetDetails, deleteBudget } from '@/app/actions/budgets'
import { useRouter } from 'next/navigation'
import { Trash2, ChevronDown, ChevronRight } from 'lucide-react'

interface BudgetsListProps {
  budgets: any[]
  categories: any[]
}

export function BudgetsList({ budgets, categories }: BudgetsListProps) {
  const [expandedBudgetId, setExpandedBudgetId] = useState<string | null>(null)
  const [budgetDetails, setBudgetDetails] = useState<Record<string, any>>({})
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null)
  const router = useRouter()

  const handleExpandBudget = async (budgetId: string) => {
    if (expandedBudgetId === budgetId) {
      setExpandedBudgetId(null)
    } else {
      if (!budgetDetails[budgetId]) {
        const details = await getBudgetDetails(budgetId)
        setBudgetDetails({ ...budgetDetails, [budgetId]: details })
      }
      setExpandedBudgetId(budgetId)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure?')) return
    setDeleteLoading(id)
    try {
      await deleteBudget(id)
      router.refresh()
    } finally {
      setDeleteLoading(null)
    }
  }

  return (
    <div className="bg-card border border-border rounded-lg p-6 shadow-sm space-y-4">
      <h2 className="text-xl font-semibold text-foreground">Budgets</h2>

      {budgets.length === 0 ? (
        <p className="text-center py-8 text-secondary-foreground">No budgets created yet</p>
      ) : (
        <div className="space-y-2">
          {budgets.map((budget) => (
            <div key={budget.id} className="border border-border rounded-lg overflow-hidden">
              <button
                onClick={() => handleExpandBudget(budget.id)}
                className="w-full flex items-center justify-between p-4 hover:bg-secondary transition"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div>{expandedBudgetId === budget.id ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}</div>
                  <div className="text-left flex-1">
                    <p className="font-medium text-foreground">{budget.month}</p>
                    <p className="text-sm text-secondary-foreground">
                      IDR {parseFloat(budget.totalBudget).toLocaleString('id-ID', { maximumFractionDigits: 0 })}
                    </p>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDelete(budget.id)
                  }}
                  disabled={deleteLoading === budget.id}
                  className="text-red-500 hover:text-red-700 disabled:opacity-50 transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </button>

              {expandedBudgetId === budget.id && budgetDetails[budget.id] && (
                <div className="border-t border-border p-4 bg-secondary space-y-3">
                  {budgetDetails[budget.id].allocations.map((alloc: any) => {
                    const allocatedAmount = alloc.allocationAmount
                      ? parseFloat(alloc.allocationAmount)
                      : (parseFloat(budget.totalBudget) * parseFloat(alloc.allocationPercentage || 0)) / 100

                    return (
                      <div key={alloc.id} className="space-y-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-sm font-medium text-foreground">{alloc.categoryName}</p>
                            <p className="text-xs text-secondary-foreground">
                              {alloc.allocationPercentage}% • IDR {allocatedAmount.toLocaleString('id-ID', { maximumFractionDigits: 0 })}
                            </p>
                          </div>
                        </div>
                        <div className="w-full bg-background rounded-full h-2">
                          <div
                            className="bg-accent rounded-full h-2 transition-all"
                            style={{ width: `${Math.min(100, (allocatedAmount / parseFloat(budget.totalBudget)) * 100)}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
