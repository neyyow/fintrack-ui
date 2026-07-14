import React, { useEffect, useMemo, useState } from 'react'
import { getSummary } from '../api/summary'
import { getExpenses } from '../api/expense'
import { formatCurrency } from '../utils/format'
import { categoryMeta } from '../utils/categories'

const BUDGET_KEY = 'fintrack_monthly_budget'

export default function Budget() {
  const [summary, setSummary] = useState(null)
  const [expenses, setExpenses] = useState([])
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState('')
  const [budget, setBudget] = useState(() => Number(localStorage.getItem(BUDGET_KEY)) || 0)
  const [budgetInput, setBudgetInput] = useState(budget || '')

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setErrorMsg('')
      try {
        const [summaryData, expenseData] = await Promise.all([getSummary(), getExpenses()])
        if (cancelled) return
        setSummary(summaryData)
        setExpenses(expenseData)
      } catch {
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

  const totalIncome = summary?.TotalIncome ?? summary?.totalIncome ?? 0
  const totalExpense = summary?.TotalExpense ?? summary?.totalExpense ?? 0
  const balanceValue = summary?.Balance ?? summary?.balance ?? 0

  const byCategory = useMemo(() => {
    const totals = {}
    expenses.forEach((e) => {
      const cat = e.category ?? e.Category
      const amt = Number(e.amount ?? e.Amount) || 0
      totals[cat] = (totals[cat] || 0) + amt
    })
    return Object.entries(totals)
      .map(([name, value]) => ({ name, value, meta: categoryMeta(name) }))
      .sort((a, b) => b.value - a.value)
  }, [expenses])

  const budgetUsedPct = budget > 0 ? Math.min(100, Math.round((totalExpense / budget) * 100)) : null
  const incomeExpensePct = totalIncome > 0 ? Math.min(100, Math.round((totalExpense / totalIncome) * 100)) : 0

  function saveBudget(e) {
    e.preventDefault()
    const value = Number(budgetInput) || 0
    setBudget(value)
    localStorage.setItem(BUDGET_KEY, String(value))
  }

  return (
    <div>
      <div className="mb-7">
        <h1 className="text-3xl font-semibold">Budget summary</h1>
        <p className="text-ink/55 mt-1">How this period's income stacks up against spending.</p>
      </div>

      {errorMsg && (
        <p className="text-sm text-rust bg-rust/10 border border-rust/20 rounded-md px-4 py-3 mb-6">
          {errorMsg}
        </p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="ledger-card p-6">
          <h2 className="text-lg font-semibold mb-4">Income vs. expenses</h2>
          <div className="space-y-3">
            <Row label="Income" value={totalIncome} tone="pine" />
            <Row label="Expenses" value={totalExpense} tone="rust" />
            <div className="border-t border-pine/10 pt-3">
              <Row label="Balance" value={balanceValue} tone="gold" bold />
            </div>
          </div>

          <div className="mt-5">
            <div className="flex justify-between text-xs text-ink/50 mb-1.5">
              <span>Spent of income</span>
              <span>{loading ? '—' : `${incomeExpensePct}%`}</span>
            </div>
            <div className="h-2.5 rounded-full bg-pine/10 overflow-hidden">
              <div
                className="h-full bg-rust rounded-full transition-all duration-500"
                style={{ width: `${loading ? 0 : incomeExpensePct}%` }}
              />
            </div>
          </div>
        </div>

        <div className="ledger-card p-6">
          <h2 className="text-lg font-semibold mb-4">Monthly spending target</h2>
          <form onSubmit={saveBudget} className="flex gap-2 mb-5">
            <input
              type="number"
              min="0"
              step="0.01"
              value={budgetInput}
              onChange={(e) => setBudgetInput(e.target.value)}
              placeholder="Set a target, e.g. 15000"
              className="input-field"
            />
            <button type="submit" className="btn-secondary shrink-0">Save</button>
          </form>

          {budget > 0 ? (
            <>
              <div className="flex justify-between text-xs text-ink/50 mb-1.5">
                <span>{formatCurrency(totalExpense)} of {formatCurrency(budget)}</span>
                <span>{budgetUsedPct}%</span>
              </div>
              <div className="h-2.5 rounded-full bg-pine/10 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    budgetUsedPct >= 100 ? 'bg-rust' : 'bg-pine'
                  }`}
                  style={{ width: `${budgetUsedPct}%` }}
                />
              </div>
              <p className="text-xs text-ink/45 mt-2">
                Stored on this device only — the API doesn't have a budget-target endpoint yet.
              </p>
            </>
          ) : (
            <p className="text-sm text-ink/50">Set a target above to track it here.</p>
          )}
        </div>
      </div>

      <div className="ledger-card p-6 mt-6">
        <h2 className="text-lg font-semibold mb-4">By category</h2>
        {byCategory.length === 0 ? (
          <p className="text-ink/50 text-sm py-4 text-center">No expenses recorded yet.</p>
        ) : (
          <div className="space-y-3">
            {byCategory.map((c) => {
              const pct = totalExpense > 0 ? Math.round((c.value / totalExpense) * 100) : 0
              return (
                <div key={c.name}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.meta.color }} />
                      {c.name}
                    </span>
                    <span className="amount">{formatCurrency(c.value)} · {pct}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-pine/10 overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${pct}%`, backgroundColor: c.meta.color }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

function Row({ label, value, tone, bold }) {
  const toneClasses = { pine: 'amount-income', rust: 'amount-expense', gold: 'text-gold' }
  return (
    <div className="flex justify-between items-baseline">
      <span className={`text-ink/70 ${bold ? 'font-medium' : ''}`}>{label}</span>
      <span className={`amount ${bold ? 'text-lg font-semibold' : 'font-medium'} ${toneClasses[tone]}`}>
        {formatCurrency(value)}
      </span>
    </div>
  )
}
