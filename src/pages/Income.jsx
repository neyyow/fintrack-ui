import React, { useEffect, useState } from 'react'
import { getIncomes, createIncome, deleteIncome } from '../api/income'
import Modal from '../components/Modal'
import TransactionRow from '../components/TransactionRow'
import { INCOME_SOURCES } from '../utils/categories'

const emptyForm = { amount: '', source: INCOME_SOURCES[0].name }

export default function Income() {
  const [incomes, setIncomes] = useState([])
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  async function load() {
    setLoading(true)
    setErrorMsg('')
    try {
      const data = await getIncomes()
      setIncomes(normalize(data))
    } catch {
      setErrorMsg('Could not reach FinTrack API. Check your API base URL in .env.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  function normalize(data) {
    return data
      .map((i) => ({
        id: i.id ?? i.Id,
        amount: i.amount ?? i.Amount,
        source: i.source ?? i.Source,
        dateCreated: i.dateCreated ?? i.DateCreated,
        type: 'income',
      }))
      .sort((a, b) => new Date(b.dateCreated) - new Date(a.dateCreated))
  }

  function openAdd() {
    setForm(emptyForm)
    setModalOpen(true)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    try {
      await createIncome({ amount: Number(form.amount), source: form.source })
      setModalOpen(false)
      await load()
    } catch {
      setErrorMsg('Could not save that income. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(transaction) {
    if (!window.confirm(`Delete this ${transaction.source} income entry?`)) return
    try {
      await deleteIncome(transaction.id)
      setIncomes((prev) => prev.filter((i) => i.id !== transaction.id))
    } catch {
      setErrorMsg('Could not delete that income entry. Please try again.')
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-7">
        <div>
          <h1 className="text-3xl font-semibold">Income</h1>
          <p className="text-ink/55 mt-1">Every peso in, logged to the page.</p>
        </div>
        <button onClick={openAdd} className="btn-primary">
          + Add income
        </button>
      </div>

      {errorMsg && (
        <p className="text-sm text-rust bg-rust/10 border border-rust/20 rounded-md px-4 py-3 mb-6">
          {errorMsg}
        </p>
      )}

      <div className="ledger-card p-2 md:p-5">
        <div className="ledger-ruled px-3 md:px-0 divide-y divide-pine/5">
          {loading && <p className="text-ink/50 text-sm py-6 text-center">Loading…</p>}
          {!loading && incomes.length === 0 && (
            <p className="text-ink/50 text-sm py-8 text-center">
              No income logged yet. Add your first entry above.
            </p>
          )}
          {incomes.map((i) => (
            <TransactionRow key={i.id} transaction={i} onDelete={handleDelete} />
          ))}
        </div>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add income">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label-field" htmlFor="amount">Amount</label>
            <input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              required
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              className="input-field"
              placeholder="0.00"
            />
          </div>

          <div>
            <label className="label-field" htmlFor="source">Source</label>
            <select
              id="source"
              value={form.source}
              onChange={(e) => setForm({ ...form, source: e.target.value })}
              className="input-field"
            >
              {INCOME_SOURCES.map((s) => (
                <option key={s.name} value={s.name}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving} className="btn-primary flex-1 disabled:opacity-60">
              {saving ? 'Saving…' : 'Add income'}
            </button>
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">
              Cancel
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
