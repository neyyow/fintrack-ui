import React, { useEffect, useMemo, useState } from 'react'
import {
  getIncomes,
  createIncome,
  deleteIncome,
  getRecurringIncomes,
  createRecurringIncome,
  toggleRecurringIncome,
  deleteRecurringIncome,
} from '../api/income'
import Modal from '../components/Modal'
import TransactionRow from '../components/TransactionRow'
import CategoryPicker from '../components/CategoryPicker'
import { INCOME_SOURCES, mergeCategories, hideCustomCategory } from '../utils/categories'
import { formatCurrency } from '../utils/format'

function todayDateInputValue() {
  const d = new Date()
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
  return local.toISOString().slice(0, 10)
}

const emptyForm = {
  amount: '',
  source: INCOME_SOURCES[0].name,
  isRecurring: false,
  frequency: 'Monthly',
  intervalDays: '30',
  startDate: todayDateInputValue(),
}

function describeFrequency(rule) {
  const frequency = rule.frequency ?? rule.Frequency
  if (frequency === 'Weekly') return 'Every week'
  if (frequency === 'Monthly') return 'Every month'
  const days = rule.intervalDays ?? rule.IntervalDays
  return `Every ${days} day${days === 1 ? '' : 's'}`
}

export default function Income() {
  const [incomes, setIncomes] = useState([])
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [hiddenVersion, setHiddenVersion] = useState(0)
  const [recurringRules, setRecurringRules] = useState([])

  const sourceOptions = useMemo(
    () => mergeCategories(INCOME_SOURCES, incomes, 'source', 'income'),
    [incomes, hiddenVersion]
  )

  function handleDeleteSource(name) {
    hideCustomCategory('income', name)
    setHiddenVersion((v) => v + 1)
  }

  async function load() {
    setLoading(true)
    setErrorMsg('')
    try {
      // Loading income also triggers the backend to generate any recurring
      // income that's come due, so we refresh the recurring list right after.
      const data = await getIncomes()
      setIncomes(normalize(data))
      await loadRecurring()
    } catch {
      setErrorMsg('Could not reach FinTrack API. Check your API base URL in .env.')
    } finally {
      setLoading(false)
    }
  }

  async function loadRecurring() {
    try {
      const data = await getRecurringIncomes()
      setRecurringRules(data)
    } catch {
      // Non-fatal - the page still works without the recurring list loading.
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
      if (form.isRecurring) {
        await createRecurringIncome({
          amount: Number(form.amount),
          source: form.source,
          frequency: form.frequency,
          intervalDays: form.frequency === 'Custom' ? Number(form.intervalDays) : null,
          nextRunDate: form.startDate,
        })
      } else {
        await createIncome({ amount: Number(form.amount), source: form.source })
      }
      setModalOpen(false)
      await load()
    } catch (err) {
      setErrorMsg(err.response?.data ?? 'Could not save that income. Please try again.')
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

  async function handleToggleRecurring(rule) {
    try {
      await toggleRecurringIncome(rule.id ?? rule.Id)
      await loadRecurring()
    } catch {
      setErrorMsg('Could not update that recurring rule. Please try again.')
    }
  }

  async function handleDeleteRecurring(rule) {
    if (!window.confirm(`Stop "${rule.source ?? rule.Source}" from repeating? Income entries it already created will stay.`)) return
    try {
      await deleteRecurringIncome(rule.id ?? rule.Id)
      await loadRecurring()
    } catch {
      setErrorMsg('Could not delete that recurring rule. Please try again.')
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

      {recurringRules.length > 0 && (
        <div className="ledger-card p-4 md:p-5 mb-6">
          <h2 className="text-lg font-semibold mb-3">Recurring income</h2>
          <div className="divide-y divide-pine/5">
            {recurringRules.map((rule) => {
              const isActive = rule.isActive ?? rule.IsActive
              const nextRunDate = rule.nextRunDate ?? rule.NextRunDate
              return (
                <div key={rule.id ?? rule.Id} className="flex items-center justify-between py-3 gap-3">
                  <div className="min-w-0">
                    <p className="font-medium text-ink truncate">
                      {rule.source ?? rule.Source}{' '}
                      <span className="amount text-sm text-ink/60">
                        {formatCurrency(rule.amount ?? rule.Amount)}
                      </span>
                    </p>
                    <p className="text-sm text-ink/50">
                      {describeFrequency(rule)} · Next: {new Date(nextRunDate).toLocaleDateString()}
                      {!isActive && <span className="text-gold ml-2">Paused</span>}
                    </p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => handleToggleRecurring(rule)} className="btn-secondary text-sm px-3 py-1.5">
                      {isActive ? 'Pause' : 'Resume'}
                    </button>
                    <button onClick={() => handleDeleteRecurring(rule)} className="btn-danger">
                      Delete
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
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

          <CategoryPicker
            id="source"
            label="Source"
            options={sourceOptions}
            value={form.source}
            onChange={(val) => setForm({ ...form, source: val })}
            onDeleteCustom={handleDeleteSource}
          />

          <label className="flex items-center gap-2 text-sm text-ink/80 pt-1">
            <input
              type="checkbox"
              checked={form.isRecurring}
              onChange={(e) => setForm({ ...form, isRecurring: e.target.checked })}
              className="w-4 h-4 accent-pine"
            />
            Make this repeat automatically
          </label>

          {form.isRecurring && (
            <div className="bg-pine/5 border border-pine/15 rounded-md p-4 space-y-4">
              <div>
                <label className="label-field" htmlFor="frequency">Repeat</label>
                <select
                  id="frequency"
                  value={form.frequency}
                  onChange={(e) => setForm({ ...form, frequency: e.target.value })}
                  className="input-field"
                >
                  <option value="Weekly">Every week</option>
                  <option value="Monthly">Every month</option>
                  <option value="Custom">Every N days</option>
                </select>
              </div>

              {form.frequency === 'Custom' && (
                <div>
                  <label className="label-field" htmlFor="intervalDays">Repeat every (days)</label>
                  <input
                    id="intervalDays"
                    type="number"
                    min="1"
                    required
                    value={form.intervalDays}
                    onChange={(e) => setForm({ ...form, intervalDays: e.target.value })}
                    className="input-field"
                    placeholder="e.g. 14"
                  />
                </div>
              )}

              <div>
                <label className="label-field" htmlFor="startDate">
                  {form.frequency === 'Monthly' ? 'First payment date (sets the day of month)' : 'First payment date'}
                </label>
                <input
                  id="startDate"
                  type="date"
                  required
                  value={form.startDate}
                  onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                  className="input-field"
                />
              </div>

              <p className="text-xs text-ink/50">
                This adds itself automatically the next time you open FinTrack on or after each due date - no need to add it by hand again.
              </p>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving} className="btn-primary flex-1 disabled:opacity-60">
              {saving ? 'Saving…' : form.isRecurring ? 'Save recurring income' : 'Add income'}
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
