import React, { useEffect, useMemo, useState } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { getSummary } from '../api/summary'
import { getExpenses } from '../api/expense'
import { getIncomes } from '../api/income'
import StatCard from '../components/StatCard'
import TransactionRow from '../components/TransactionRow'
import { categoryMeta } from '../utils/categories'
import { formatCurrency } from '../utils/format'

export default function Dashboard() {
  const [summary, setSummary] = useState(null)
  const [expenses, setExpenses] = useState([])
  const [incomes, setIncomes] = useState([])
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setErrorMsg('')
      try {
        const [summaryData, expenseData, incomeData] = await Promise.all([
          getSummary(),
          getExpenses(),
          getIncomes(),
        ])
        if (cancelled) return
        setSummary(summaryData)
        setExpenses(expenseData)
        setIncomes(incomeData)
      } catch (err) {
        if (!cancelled) setErrorMsg('Could not reach FinTrack API. Check your API base URL in .env.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  const recent = useMemo(() => {
    const merged = [
      ...expenses.map((e) => ({ ...e, type: 'expense', dateCreated: e.dateCreated ?? e.DateCreated, amount: e.amount ?? e.Amount, category: e.category ?? e.Category, description: e.description ?? e.Description, id: e.id ?? e.Id })),
      ...incomes.map((i) => ({ ...i, type: 'income', dateCreated: i.dateCreated ?? i.DateCreated, amount: i.amount ?? i.Amount, source: i.source ?? i.Source, id: i.id ?? i.Id })),
    ]
    return merged
      .sort((a, b) => new Date(b.dateCreated) - new Date(a.dateCreated))
      .slice(0, 8)
  }, [expenses, incomes])

  const categoryData = useMemo(() => {
    const totals = {}
    expenses.forEach((e) => {
      const cat = e.category ?? e.Category
      const amt = Number(e.amount ?? e.Amount) || 0
      totals[cat] = (totals[cat] || 0) + amt
    })
    return Object.entries(totals).map(([name, value]) => ({
      name,
      value,
      color: categoryMeta(name).color,
    }))
  }, [expenses])

  const totalIncome = summary?.TotalIncome ?? summary?.totalIncome ?? 0
  const totalExpense = summary?.TotalExpense ?? summary?.totalExpense ?? 0
  const balance = summary?.Balance ?? summary?.balance ?? 0

  return (
    <div>
      <div className="mb-7">
        <h1 className="text-3xl font-semibold">Dashboard</h1>
        <p className="text-ink/55 mt-1">Here's where your ledger stands today.</p>
      </div>

      {errorMsg && (
        <p className="text-sm text-rust bg-rust/10 border border-rust/20 rounded-md px-4 py-3 mb-6">
          {errorMsg}
        </p>
      )}

      <div className="flex flex-wrap gap-4 mb-8">
        <StatCard label="Total income" amount={totalIncome} tone="pine" eyebrow="In" />
        <StatCard label="Total expenses" amount={totalExpense} tone="rust" eyebrow="Out" />
        <StatCard label="Balance" amount={balance} tone="gold" eyebrow="Net" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 ledger-card p-2 md:p-5">
          <h2 className="text-lg font-semibold px-3 pt-2 md:px-0 md:pt-0 mb-1">Recent entries</h2>
          <div className="ledger-ruled px-3 md:px-0 divide-y divide-pine/5">
            {loading && <p className="text-ink/50 text-sm py-6 text-center">Loading your ledger…</p>}
            {!loading && recent.length === 0 && (
              <p className="text-ink/50 text-sm py-6 text-center">
                No entries yet. Add an expense or income to get started.
              </p>
            )}
            {recent.map((t) => (
              <TransactionRow key={`${t.type}-${t.id}`} transaction={t} />
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 ledger-card p-5">
          <h2 className="text-lg font-semibold mb-4">Spending by category</h2>
          {categoryData.length === 0 ? (
            <p className="text-ink/50 text-sm py-10 text-center">No expenses recorded yet.</p>
          ) : (
            <>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={2}
                    >
                      {categoryData.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} stroke="none" />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2 mt-3">
                {categoryData
                  .sort((a, b) => b.value - a.value)
                  .map((c) => (
                    <div key={c.name} className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                        {c.name}
                      </span>
                      <span className="amount font-medium">{formatCurrency(c.value)}</span>
                    </div>
                  ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
