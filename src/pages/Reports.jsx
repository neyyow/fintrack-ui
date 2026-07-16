import React, { useEffect, useMemo, useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  PieChart, Pie, Cell, ResponsiveContainer, Legend,
} from 'recharts'
import { getExpenses } from '../api/expense'
import { getIncomes } from '../api/income'
import StatCard from '../components/StatCard'
import { categoryMeta } from '../utils/categories'
import { formatCurrency, formatDate } from '../utils/format'

function firstDayOfThisMonth() {
  const d = new Date()
  const local = new Date(d.getFullYear(), d.getMonth(), 1)
  return local.toISOString().slice(0, 10)
}

function todayDateInputValue() {
  const d = new Date()
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
  return local.toISOString().slice(0, 10)
}

function monthKey(dateString) {
  const d = new Date(dateString)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

function monthLabel(key) {
  const [year, month] = key.split('-')
  return new Date(Number(year), Number(month) - 1, 1).toLocaleDateString('en-PH', {
    month: 'short',
    year: '2-digit',
  })
}

export default function Reports() {
  const [expenses, setExpenses] = useState([])
  const [incomes, setIncomes] = useState([])
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState('')

  const [from, setFrom] = useState(firstDayOfThisMonth())
  const [to, setTo] = useState(todayDateInputValue())
  const [typeFilter, setTypeFilter] = useState('all') // all | income | expense
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [sortNewestFirst, setSortNewestFirst] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)
      setErrorMsg('')
      try {
        const [expenseData, incomeData] = await Promise.all([getExpenses(), getIncomes()])
        setExpenses(normalizeExpenses(expenseData))
        setIncomes(normalizeIncomes(incomeData))
      } catch {
        setErrorMsg('Could not reach FinTrack API. Check your API base URL in .env.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  function normalizeExpenses(data) {
    return data.map((e) => ({
      id: e.id ?? e.Id,
      amount: Number(e.amount ?? e.Amount),
      label: e.category ?? e.Category,
      description: e.description ?? e.Description,
      dateCreated: e.dateCreated ?? e.DateCreated,
      type: 'expense',
    }))
  }

  function normalizeIncomes(data) {
    return data.map((i) => ({
      id: i.id ?? i.Id,
      amount: Number(i.amount ?? i.Amount),
      label: i.source ?? i.Source,
      description: '',
      dateCreated: i.dateCreated ?? i.DateCreated,
      type: 'income',
    }))
  }

  // All transactions in the selected date range, before type/category filters -
  // used for the summary cards and charts, which should reflect the whole range.
  const inRange = useMemo(() => {
    const fromDate = new Date(from)
    const toDate = new Date(to)
    toDate.setHours(23, 59, 59, 999) // include the entire "to" day

    return [...expenses, ...incomes].filter((t) => {
      const d = new Date(t.dateCreated)
      return d >= fromDate && d <= toDate
    })
  }, [expenses, incomes, from, to])

  const categoryOptions = useMemo(() => {
    const names = new Set(inRange.filter((t) => typeFilter === 'all' || t.type === typeFilter).map((t) => t.label))
    return Array.from(names).sort()
  }, [inRange, typeFilter])

  // The same range, further narrowed by type/category - drives the detailed list.
  const filtered = useMemo(() => {
    let list = inRange
    if (typeFilter !== 'all') list = list.filter((t) => t.type === typeFilter)
    if (categoryFilter !== 'all') list = list.filter((t) => t.label === categoryFilter)
    return [...list].sort((a, b) =>
      sortNewestFirst
        ? new Date(b.dateCreated) - new Date(a.dateCreated)
        : new Date(a.dateCreated) - new Date(b.dateCreated)
    )
  }, [inRange, typeFilter, categoryFilter, sortNewestFirst])

  const totalIncome = useMemo(
    () => inRange.filter((t) => t.type === 'income').reduce((sum, t) => sum + t.amount, 0),
    [inRange]
  )
  const totalExpense = useMemo(
    () => inRange.filter((t) => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0),
    [inRange]
  )

  const categoryBreakdown = useMemo(() => {
    const totals = {}
    inRange.filter((t) => t.type === 'expense').forEach((t) => {
      totals[t.label] = (totals[t.label] || 0) + t.amount
    })
    return Object.entries(totals)
      .map(([name, value]) => ({ name, value, color: categoryMeta(name).color }))
      .sort((a, b) => b.value - a.value)
  }, [inRange])

  const monthlyTrend = useMemo(() => {
    const byMonth = {}
    inRange.forEach((t) => {
      const key = monthKey(t.dateCreated)
      if (!byMonth[key]) byMonth[key] = { key, income: 0, expense: 0 }
      byMonth[key][t.type] += t.amount
    })
    return Object.values(byMonth)
      .sort((a, b) => (a.key > b.key ? 1 : -1))
      .map((m) => ({ ...m, label: monthLabel(m.key) }))
  }, [inRange])

  function resetFilters() {
    setFrom(firstDayOfThisMonth())
    setTo(todayDateInputValue())
    setTypeFilter('all')
    setCategoryFilter('all')
  }

  return (
    <div>
      {/* Only shown on the printed page - gives the report a proper header once the sidebar is hidden */}
      <div className="hidden print:block mb-6">
        <h1 className="text-2xl font-semibold">FinTrack Report</h1>
        <p className="text-sm text-ink/60">
          {formatDate(from)} — {formatDate(to)} · Generated {formatDate(new Date().toISOString())}
        </p>
      </div>

      <div className="flex items-center justify-between mb-7 print:hidden">
        <div>
          <h1 className="text-3xl font-semibold">Reports</h1>
          <p className="text-ink/55 mt-1">See how your money moved, then print it if you need a copy.</p>
        </div>
        <button onClick={() => window.print()} className="btn-primary">
          🖨 Print report
        </button>
      </div>

      {errorMsg && (
        <p className="text-sm text-rust bg-rust/10 border border-rust/20 rounded-md px-4 py-3 mb-6 print:hidden">
          {errorMsg}
        </p>
      )}

      {/* Filters */}
      <div className="ledger-card p-4 md:p-5 mb-6 print:hidden">
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="label-field" htmlFor="from">From</label>
            <input id="from" type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="input-field" />
          </div>
          <div>
            <label className="label-field" htmlFor="to">To</label>
            <input id="to" type="date" value={to} onChange={(e) => setTo(e.target.value)} className="input-field" />
          </div>
          <div>
            <label className="label-field" htmlFor="typeFilter">Type</label>
            <select
              id="typeFilter"
              value={typeFilter}
              onChange={(e) => { setTypeFilter(e.target.value); setCategoryFilter('all') }}
              className="input-field"
            >
              <option value="all">All</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
          </div>
          <div>
            <label className="label-field" htmlFor="categoryFilter">Category</label>
            <select
              id="categoryFilter"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="input-field"
            >
              <option value="all">All categories</option>
              {categoryOptions.map((name) => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
          </div>
          <button type="button" onClick={resetFilters} className="btn-secondary">
            Reset
          </button>
        </div>
      </div>

      {loading ? (
        <p className="text-ink/50 text-sm py-6 text-center">Loading…</p>
      ) : (
        <>
          {/* Summary */}
          <div className="flex flex-wrap gap-4 mb-8">
            <StatCard label="Income in range" amount={totalIncome} tone="pine" eyebrow="In" />
            <StatCard label="Expenses in range" amount={totalExpense} tone="rust" eyebrow="Out" />
            <StatCard label="Net" amount={totalIncome - totalExpense} tone="gold" eyebrow="Net" />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-8">
            <div className="lg:col-span-3 ledger-card p-5">
              <h2 className="text-lg font-semibold mb-4">Income vs. expenses by month</h2>
              {monthlyTrend.length === 0 ? (
                <p className="text-ink/50 text-sm py-10 text-center">No transactions in this range.</p>
              ) : (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyTrend}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(46,94,78,0.1)" />
                      <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <RechartsTooltip formatter={(value) => formatCurrency(value)} />
                      <Legend />
                      <Bar dataKey="income" name="Income" fill="#2E5E4E" radius={[3, 3, 0, 0]} />
                      <Bar dataKey="expense" name="Expense" fill="#A6432E" radius={[3, 3, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            <div className="lg:col-span-2 ledger-card p-5">
              <h2 className="text-lg font-semibold mb-4">Spending by category</h2>
              {categoryBreakdown.length === 0 ? (
                <p className="text-ink/50 text-sm py-10 text-center">No expenses in this range.</p>
              ) : (
                <>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={categoryBreakdown} dataKey="value" nameKey="name" innerRadius={45} outerRadius={75} paddingAngle={2}>
                          {categoryBreakdown.map((entry) => (
                            <Cell key={entry.name} fill={entry.color} stroke="none" />
                          ))}
                        </Pie>
                        <RechartsTooltip formatter={(value) => formatCurrency(value)} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-1.5 mt-3">
                    {categoryBreakdown.map((c) => (
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

          {/* Detailed list */}
          <div className="ledger-card p-2 md:p-5">
            <div className="flex items-center justify-between px-3 md:px-0 mb-2">
              <h2 className="text-lg font-semibold">Detailed transactions</h2>
              <button
                type="button"
                onClick={() => setSortNewestFirst((v) => !v)}
                className="text-sm text-pine-dark hover:underline print:hidden"
              >
                Sort: {sortNewestFirst ? 'Newest first' : 'Oldest first'}
              </button>
            </div>

            {filtered.length === 0 ? (
              <p className="text-ink/50 text-sm py-8 text-center">No transactions match these filters.</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-ink/50 border-b border-pine/10">
                    <th className="py-2 px-3 md:px-0 font-medium">Date</th>
                    <th className="py-2 px-3 font-medium">Type</th>
                    <th className="py-2 px-3 font-medium">Category / Source</th>
                    <th className="py-2 px-3 font-medium">Description</th>
                    <th className="py-2 px-3 font-medium text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-pine/5">
                  {filtered.map((t) => (
                    <tr key={`${t.type}-${t.id}`}>
                      <td className="py-2 px-3 md:px-0 whitespace-nowrap">{formatDate(t.dateCreated)}</td>
                      <td className="py-2 px-3 capitalize">{t.type}</td>
                      <td className="py-2 px-3">{t.label}</td>
                      <td className="py-2 px-3 text-ink/60">{t.description || '—'}</td>
                      <td className={`py-2 px-3 text-right amount font-medium ${t.type === 'expense' ? 'amount-expense' : 'amount-income'}`}>
                        {t.type === 'expense' ? '−' : '+'}{formatCurrency(t.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </div>
  )
}
