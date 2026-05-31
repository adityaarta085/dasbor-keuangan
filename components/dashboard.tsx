'use client'

import { useEffect, useState } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { DollarSign, ArrowUpRight, ArrowDownLeft } from 'lucide-react'

interface Transaction {
  id: string
  category: string
  categoryColor: string | null
  categoryIcon: string | null
  type: string
  amount: string
  description: string | null
  transactionDate: string
  createdAt: Date
}

interface DashboardProps {
  transactions: Transaction[]
}

export function Dashboard({ transactions }: DashboardProps) {
  const [totalIncome, setTotalIncome] = useState(0)
  const [totalExpense, setTotalExpense] = useState(0)
  const [balance, setBalance] = useState(0)
  const [categoryData, setCategoryData] = useState<any[]>([])
  const [monthlyData, setMonthlyData] = useState<any[]>([])

  useEffect(() => {
    if (!transactions || transactions.length === 0) return

    let income = 0
    let expense = 0
    const categoryMap = new Map()
    const monthlyMap = new Map()

    transactions.forEach((tx) => {
      const amount = parseFloat(tx.amount)
      
      if (tx.type === 'income') {
        income += amount
      } else {
        expense += amount
      }

      // Category breakdown
      const current = categoryMap.get(tx.category) || 0
      categoryMap.set(tx.category, current + amount)

      // Monthly breakdown
      const [year, month] = tx.transactionDate.split('-').slice(0, 2)
      const monthKey = `${year}-${month}`
      const monthData = monthlyMap.get(monthKey) || { month: monthKey, income: 0, expense: 0 }
      
      if (tx.type === 'income') {
        monthData.income += amount
      } else {
        monthData.expense += amount
      }
      monthlyMap.set(monthKey, monthData)
    })

    const categories = Array.from(categoryMap.entries()).map(([name, value]) => ({
      name,
      value: parseFloat(value.toFixed(2)),
    }))

    const monthly = Array.from(monthlyMap.values()).sort((a, b) => a.month.localeCompare(b.month))

    setTotalIncome(income)
    setTotalExpense(expense)
    setBalance(income - expense)
    setCategoryData(categories)
    setMonthlyData(monthly)
  }, [transactions])

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4']

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-secondary-foreground mb-1">Total Income</p>
              <p className="text-2xl font-bold text-foreground">IDR {totalIncome.toLocaleString('id-ID', { maximumFractionDigits: 0 })}</p>
            </div>
            <ArrowUpRight className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-secondary-foreground mb-1">Total Expense</p>
              <p className="text-2xl font-bold text-foreground">IDR {totalExpense.toLocaleString('id-ID', { maximumFractionDigits: 0 })}</p>
            </div>
            <ArrowDownLeft className="w-8 h-8 text-red-500" />
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-secondary-foreground mb-1">Balance</p>
              <p className={`text-2xl font-bold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                IDR {balance.toLocaleString('id-ID', { maximumFractionDigits: 0 })}
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-accent" />
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trend */}
        <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-foreground mb-4">Monthly Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="income" stroke="#10b981" name="Income" />
              <Line type="monotone" dataKey="expense" stroke="#ef4444" name="Expense" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Category Breakdown */}
        <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-foreground mb-4">Expense by Category</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: IDR ${value.toLocaleString('id-ID')}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {categoryData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => typeof value === 'number' ? `IDR ${value.toLocaleString('id-ID', { maximumFractionDigits: 0 })}` : ''} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-foreground mb-4">Recent Transactions</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 font-medium">Date</th>
                <th className="text-left py-3 px-4 font-medium">Category</th>
                <th className="text-left py-3 px-4 font-medium">Description</th>
                <th className="text-right py-3 px-4 font-medium">Amount</th>
              </tr>
            </thead>
            <tbody>
              {transactions.slice(0, 10).map((tx) => (
                <tr key={tx.id} className="border-b border-border hover:bg-secondary transition">
                  <td className="py-3 px-4">{new Date(tx.transactionDate).toLocaleDateString('id-ID')}</td>
                  <td className="py-3 px-4">{tx.category}</td>
                  <td className="py-3 px-4">{tx.description || '-'}</td>
                  <td className={`py-3 px-4 text-right font-medium ${tx.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                    {tx.type === 'income' ? '+' : '-'} IDR {Math.abs(parseFloat(tx.amount)).toLocaleString('id-ID', { maximumFractionDigits: 0 })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
