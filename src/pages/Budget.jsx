import React, { useEffect, useMemo, useState } from 'react'
import { getBudget, saveBudget } from '../api/budget'
import { formatCurrency } from '../utils/format'
import { categoryMeta } from '../utils/categories'

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

function currentYearMonth() {
  const d = new Date()
  return { year: d.getFullYear(), month: d.getMonth() + 1 }
}

export default function Budget() {
  const [{ year, month }, setYearMonth] = useState(currentYearMonth())
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [savedMsg, setSavedMsg] = useState('')

  const [overallTargetInput, setOverallTargetInput] = useState('')
  const [categoryLimitInputs, setCategoryLimitInputs] = useState({})

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setErrorMsg('')
      setSavedMsg('')
      try {
        const result = await getBudget({ year, month })
        if (cancelled) return
        setData(result)

        const overall = result.overallTarget ?? result.OverallTarget ?? 0
        setOverallTargetInput(overall > 0 ? String(overall) : '')

        const limits = result.categoryLimits ?? result.CategoryLimits ?? []
        const limitsMap = {}
        limits.forEach((l) => {
          limitsMap[l.category ?? l.Category] = String(l.amount ?? l.Amount)
        })
        setCategoryLimitInputs(limitsMap)
      } catch {
        if (!cancelled) setErrorMsg('Could not reach FinTrack API. Check your API base URL in .env.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [year, month])

  function goToPreviousMonth() {
    setYearMonth((prev) => (prev.month === 1 ? { year: prev.year - 1, month: 12 } : { year: prev.year, month: prev.month - 1 }))
  }

  function goToNextMonth() {
    setYearMonth((prev) => (prev.month === 12 ? { year: prev.year + 1, month: 1 } : { year: prev.year, month: prev.month + 1 }))
  }

  function goToCurrentMonth() {
    setYearMonth(currentYearMonth())
  }

  const totalIncome = data?.totalIncome ?? data?.TotalIncome ?? 0
  const totalExpense = data?.totalExpense ?? data?.TotalExpense ?? 0
  const balance = data?.balance ?? data?.Balance ?? 0

  const byCategory = useMemo(() => {
    const raw = data?.byCategory ?? data?.ByCategory ?? []
    return raw.map((c) => ({
      name: c.category ?? c.Category,
      spent: Number(c.spent ?? c.Spent) || 0,
    }))
  }, [data])

  // Categories to show: anything spent on this month, plus any category with a
  // saved limit even if nothing was spent on it this particular month.
  const categoryRows = useMemo(() => {
    const names = new Set(byCategory.map((c) => c.name))
    Object.keys(categoryLimitInputs).forEach((name) => names.add(name))
    return Array.from(names)
      .map((name) => ({
        name,
        spent: byCategory.find((c) => c.name === name)?.spent ?? 0,
        meta: categoryMeta(name),
      }))
      .sort((a, b) => b.spent - a.spent)
  }, [byCategory, categoryLimitInputs])

  const overallTarget = Number(overallTargetInput) || 0
  const overallUsedPct = overallTarget > 0 ? Math.round((totalExpense / overallTarget) * 100) : null
  const incomeExpensePct = totalIncome > 0 ? Math.min(100, Math.round((totalExpense / totalIncome) * 100)) : 0

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    setErrorMsg('')
    setSavedMsg('')
    try {
      const categoryLimits = Object.entries(categoryLimitInputs)
        .map(([category, value]) => ({ category, amount: Number(value) || 0 }))
        .filter((c) => c.amount > 0)

      await saveBudget({ year, month, overallTarget, categoryLimits })
      setSavedMsg('Saved.')
    } catch {
      setErrorMsg('Could not save your budget. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const isCurrentMonth = year === currentYearMonth().year && month === currentYearMonth().month

  return (
    <div>
      <div className="flex items-center justify-between mb-7 flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-semibold">Budget summary</h1>
          <p className="text-ink/55 mt-1">How {MONTH_NAMES[month - 1]} {year} stacks up against your targets.</p>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={goToPreviousMonth} className="btn-secondary px-3 py-1.5 text-sm">← Prev</button>
          {!isCurrentMonth && (
            <button type="button" onClick={goToCurrentMonth} className="btn-secondary px-3 py-1.5 text-sm">Today</button>
          )}
          <button type="button" onClick={goToNextMonth} className="btn-secondary px-3 py-1.5 text-sm">Next →</button>
        </div>
      </div>

      {errorMsg && (
        <p className="text-sm text-rust bg-rust/10 border border-rust/20 rounded-md px-4 py-3 mb-6">
          {errorMsg}
        </p>
      )}

      <form onSubmit={handleSave}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="ledger-card p-6">
            <h2 className="text-lg font-semibold mb-4">Income vs. expenses</h2>
            {loading ? (
              <p className="text-ink/50 text-sm py-4 text-center">Loading…</p>
            ) : (
              <>
                <div className="space-y-3">
                  <Row label="Income" value={totalIncome} tone="pine" />
                  <Row label="Expenses" value={totalExpense} tone="rust" />
                  <div className="border-t border-pine/10 pt-3">
                    <Row label="Balance" value={balance} tone="gold" bold />
                  </div>
                </div>

                <div className="mt-5">
                  <div className="flex justify-between text-xs text-ink/50 mb-1.5">
                    <span>Spent of income</span>
                    <span>{totalIncome > 0 ? `${incomeExpensePct}%` : '—'}</span>
                  </div>
                  <div className="h-2.5 rounded-full bg-pine/10 overflow-hidden">
                    <div
                      className="h-full bg-rust rounded-full transition-all duration-500"
                      style={{ width: `${incomeExpensePct}%` }}
                    />
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="ledger-card p-6">
            <h2 className="text-lg font-semibold mb-4">Monthly spending target</h2>
            <input
              type="number"
              min="0"
              step="0.01"
              value={overallTargetInput}
              onChange={(e) => setOverallTargetInput(e.target.value)}
              placeholder="Set a target, e.g. 15000"
              className="input-field mb-5"
            />

            {overallTarget > 0 ? (
              <>
                <div className="flex justify-between text-xs text-ink/50 mb-1.5">
                  <span>{formatCurrency(totalExpense)} of {formatCurrency(overallTarget)}</span>
                  <span>{overallUsedPct}%</span>
                </div>
                <div className="h-2.5 rounded-full bg-pine/10 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${overallUsedPct >= 100 ? 'bg-rust' : 'bg-pine'}`}
                    style={{ width: `${Math.min(100, overallUsedPct)}%` }}
                  />
                </div>
              </>
            ) : (
              <p className="text-sm text-ink/50">Set a target above to track it here.</p>
            )}
          </div>
        </div>

        <div className="ledger-card p-6 mt-6">
          <h2 className="text-lg font-semibold mb-1">By category</h2>
          <p className="text-sm text-ink/50 mb-4">
            Optionally set a limit per category - the bar turns red once you go over it.
          </p>

          {categoryRows.length === 0 ? (
            <p className="text-ink/50 text-sm py-4 text-center">No expenses recorded for this month yet.</p>
          ) : (
            <div className="space-y-4">
              {categoryRows.map((c) => {
                const limitValue = categoryLimitInputs[c.name] ?? ''
                const limit = Number(limitValue) || 0
                const pct = limit > 0 ? Math.round((c.spent / limit) * 100) : null
                return (
                  <div key={c.name}>
                    <div className="flex items-center justify-between gap-3 text-sm mb-1.5">
                      <span className="flex items-center gap-2 min-w-0">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: c.meta.color }} />
                        <span className="truncate">{c.name}</span>
                      </span>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="amount text-ink/70">{formatCurrency(c.spent)} of</span>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={limitValue}
                          onChange={(e) => setCategoryLimitInputs({ ...categoryLimitInputs, [c.name]: e.target.value })}
                          placeholder="no limit"
                          className="input-field w-28 text-right py-1"
                        />
                      </div>
                    </div>
                    <div className="h-1.5 rounded-full bg-pine/10 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${limit > 0 ? Math.min(100, pct) : 0}%`,
                          backgroundColor: limit > 0 && pct >= 100 ? '#A6432E' : c.meta.color,
                        }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 mt-6">
          <button type="submit" disabled={saving || loading} className="btn-primary disabled:opacity-60">
            {saving ? 'Saving…' : 'Save budget'}
          </button>
          {savedMsg && <span className="text-sm text-pine-dark">{savedMsg}</span>}
        </div>
      </form>
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
