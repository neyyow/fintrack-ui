import React, { useEffect, useState } from 'react'
import { getLogs } from '../api/logs'
import { formatCurrency } from '../utils/format'

const PAGE_SIZE = 25

function normalize(data) {
  return data.map((l) => ({
    id: l.id ?? l.Id,
    action: l.action ?? l.Action,
    entityType: l.entityType ?? l.EntityType,
    amount: Number(l.amount ?? l.Amount),
    label: l.label ?? l.Label,
    description: l.description ?? l.Description,
    timestamp: l.timestamp ?? l.Timestamp,
  }))
}

function formatTimestamp(value) {
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleString('en-PH', {
    month: 'short', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

export default function Logs() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState('')
  const [actionFilter, setActionFilter] = useState('all') // all | Added | Edited | Deleted
  const [typeFilter, setTypeFilter] = useState('all') // all | Income | Expense
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)

  useEffect(() => {
    async function load() {
      setLoading(true)
      setErrorMsg('')
      try {
        const data = await getLogs({ page, pageSize: PAGE_SIZE, action: actionFilter, entityType: typeFilter })
        const items = data.items ?? data.Items
        setLogs(normalize(items))
        setTotalPages(data.totalPages ?? data.TotalPages ?? 1)
        setTotalCount(data.totalCount ?? data.TotalCount ?? 0)
      } catch {
        setErrorMsg('Could not reach FinTrack API. Check your API base URL in .env.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [page, actionFilter, typeFilter])

  function handleActionFilterChange(value) {
    setActionFilter(value)
    setPage(1) // changing a filter always jumps back to page 1
  }

  function handleTypeFilterChange(value) {
    setTypeFilter(value)
    setPage(1)
  }

  return (
    <div>
      <div className="mb-7">
        <h1 className="text-3xl font-semibold">Logs</h1>
        <p className="text-ink/55 mt-1">Every time something was added, edited, or removed, recorded here.</p>
      </div>

      {errorMsg && (
        <p className="text-sm text-rust bg-rust/10 border border-rust/20 rounded-md px-4 py-3 mb-6">
          {errorMsg}
        </p>
      )}

      <div className="ledger-card p-4 md:p-5 mb-6">
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="label-field" htmlFor="actionFilter">Action</label>
            <select
              id="actionFilter"
              value={actionFilter}
              onChange={(e) => handleActionFilterChange(e.target.value)}
              className="input-field"
            >
              <option value="all">All</option>
              <option value="Added">Added</option>
              <option value="Edited">Edited</option>
              <option value="Deleted">Deleted</option>
            </select>
          </div>
          <div>
            <label className="label-field" htmlFor="typeFilter">Type</label>
            <select
              id="typeFilter"
              value={typeFilter}
              onChange={(e) => handleTypeFilterChange(e.target.value)}
              className="input-field"
            >
              <option value="all">All</option>
              <option value="Income">Income</option>
              <option value="Expense">Expense</option>
            </select>
          </div>
        </div>
      </div>

      <div className="ledger-card p-2 md:p-5">
        {loading && <p className="text-ink/50 text-sm py-6 text-center">Loading…</p>}
        {!loading && logs.length === 0 && (
          <p className="text-ink/50 text-sm py-8 text-center">No activity matches these filters.</p>
        )}
        {!loading && logs.length > 0 && (
          <>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-ink/50 border-b border-pine/10">
                  <th className="py-2 px-3 md:px-0 font-medium">When</th>
                  <th className="py-2 px-3 font-medium">Action</th>
                  <th className="py-2 px-3 font-medium">Type</th>
                  <th className="py-2 px-3 font-medium">Category / Source</th>
                  <th className="py-2 px-3 font-medium">Details</th>
                  <th className="py-2 px-3 font-medium text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-pine/5">
                {logs.map((l) => (
                  <tr key={l.id}>
                    <td className="py-2 px-3 md:px-0 whitespace-nowrap text-ink/70">{formatTimestamp(l.timestamp)}</td>
                    <td className="py-2 px-3">
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                          l.action === 'Added'
                            ? 'bg-pine/10 text-pine-dark'
                            : l.action === 'Edited'
                            ? 'bg-gold/10 text-gold'
                            : 'bg-rust/10 text-rust'
                        }`}
                      >
                        {l.action}
                      </span>
                    </td>
                    <td className="py-2 px-3">{l.entityType}</td>
                    <td className="py-2 px-3">{l.label}</td>
                    <td className="py-2 px-3 text-ink/60">{l.description || '—'}</td>
                    <td className="py-2 px-3 text-right amount font-medium">{formatCurrency(l.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex items-center justify-between mt-4 px-3 md:px-0 text-sm text-ink/60">
              <span>
                Page {page} of {totalPages} · {totalCount} total
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="btn-secondary text-sm px-3 py-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  ← Previous
                </button>
                <button
                  type="button"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="btn-secondary text-sm px-3 py-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Next →
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
