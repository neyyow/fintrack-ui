import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { getExpenses, createExpense, updateExpense, deleteExpense } from '../api/expense'
import { getWallets } from '../api/wallet'
import Modal from '../components/Modal'
import TransactionRow from '../components/TransactionRow'
import CategoryPicker from '../components/CategoryPicker'
import { EXPENSE_CATEGORIES, mergeCategories, hideCustomCategory } from '../utils/categories'

const emptyForm = { amount: '', category: EXPENSE_CATEGORIES[0].name, description: '', walletId: '' }

export default function Expenses() {
  const [expenses, setExpenses] = useState([])
  const [wallets, setWallets] = useState([])
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [hiddenVersion, setHiddenVersion] = useState(0)

  // Attach each expense's wallet name for display (no wallet -> undefined)
  const expensesWithWallet = useMemo(() => {
    const nameById = Object.fromEntries(wallets.map((w) => [w.id, w.name]))
    return expenses.map((e) => ({ ...e, walletName: nameById[e.walletId] }))
  }, [expenses, wallets])

  const categoryOptions = useMemo(
    () => mergeCategories(EXPENSE_CATEGORIES, expenses, 'category', 'expense'),
    [expenses, hiddenVersion]
  )

  function handleDeleteCategory(name) {
    hideCustomCategory('expense', name)
    setHiddenVersion((v) => v + 1)
  }

  async function load() {
    setLoading(true)
    setErrorMsg('')
    try {
      // If wallets can't load, expenses should still show, just without wallet labels
      const [data, walletData] = await Promise.all([getExpenses(), getWallets().catch(() => [])])
      setExpenses(normalize(data))
      setWallets(walletData.map((w) => ({ id: w.id ?? w.Id, name: w.name ?? w.Name })))
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
      .map((e) => ({
        id: e.id ?? e.Id,
        amount: e.amount ?? e.Amount,
        category: e.category ?? e.Category,
        description: e.description ?? e.Description,
        dateCreated: e.dateCreated ?? e.DateCreated,
        walletId: e.walletId ?? e.WalletId ?? null,
        type: 'expense',
      }))
      .sort((a, b) => new Date(b.dateCreated) - new Date(a.dateCreated))
  }

  function openAdd() {
    setEditing(null)
    setForm(emptyForm)
    setModalOpen(true)
  }

  function openEdit(transaction) {
    setEditing(transaction)
    setForm({
      amount: String(transaction.amount),
      category: transaction.category,
      description: transaction.description ?? '',
      walletId: transaction.walletId ?? '',
    })
    setModalOpen(true)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = {
        amount: Number(form.amount),
        category: form.category,
        description: form.description,
        walletId: form.walletId === '' ? null : Number(form.walletId),
      }
      if (editing) {
        await updateExpense(editing.id, payload)
      } else {
        await createExpense(payload)
      }
      setModalOpen(false)
      await load()
    } catch (err) {
      setErrorMsg(err.response?.data ?? 'Could not save that expense. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(transaction) {
    if (!window.confirm(`Delete this ${transaction.category} expense?`)) return
    try {
      await deleteExpense(transaction.id)
      setExpenses((prev) => prev.filter((e) => e.id !== transaction.id))
    } catch {
      setErrorMsg('Could not delete that expense. Please try again.')
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-7">
        <div>
          <h1 className="text-3xl font-semibold">Expenses</h1>
          <p className="text-ink/55 mt-1">Every peso out, stamped and dated.</p>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/wallets" className="btn-secondary">
            Manage wallets
          </Link>
          <button onClick={openAdd} className="btn-primary">
            + Add expense
          </button>
        </div>
      </div>

      {errorMsg && (
        <p className="text-sm text-rust bg-rust/10 border border-rust/20 rounded-md px-4 py-3 mb-6">
          {errorMsg}
        </p>
      )}

      <div className="ledger-card p-2 md:p-5">
        <div className="ledger-ruled px-3 md:px-0 divide-y divide-pine/5">
          {loading && <p className="text-ink/50 text-sm py-6 text-center">Loading…</p>}
          {!loading && expenses.length === 0 && (
            <p className="text-ink/50 text-sm py-8 text-center">
              No expenses yet. Add your first one above.
            </p>
          )}
          {expensesWithWallet.map((e) => (
            <TransactionRow key={e.id} transaction={e} onEdit={openEdit} onDelete={handleDelete} />
          ))}
        </div>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit expense' : 'Add expense'}>
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
            id="category"
            label="Category"
            options={categoryOptions}
            value={form.category}
            onChange={(val) => setForm({ ...form, category: val })}
            onDeleteCustom={handleDeleteCategory}
          />

          <div>
            <label className="label-field" htmlFor="wallet">Wallet</label>
            <select
              id="wallet"
              value={form.walletId}
              onChange={(e) => setForm({ ...form, walletId: e.target.value })}
              className="input-field"
            >
              <option value="">No wallet</option>
              {wallets.map((w) => (
                <option key={w.id} value={w.id}>{w.name}</option>
              ))}
            </select>
            {wallets.length === 0 && (
              <p className="text-xs text-ink/50 mt-1.5">
                No wallets yet. <Link to="/wallets" className="underline">Add one</Link> to track where this money came from.
              </p>
            )}
          </div>

          <div>
            <label className="label-field" htmlFor="description">Description</label>
            <input
              id="description"
              type="text"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="input-field"
              placeholder="e.g. Lunch with team"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving} className="btn-primary flex-1 disabled:opacity-60">
              {saving ? 'Saving…' : editing ? 'Save changes' : 'Add expense'}
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
