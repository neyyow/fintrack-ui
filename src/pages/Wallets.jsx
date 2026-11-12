import React, { useEffect, useState } from 'react'
import { getWallets, createWallet, updateWallet, deleteWallet } from '../api/wallet'
import Modal from '../components/Modal'

const MAX_NAME_LENGTH = 50

function normalize(data) {
  return data.map((w) => ({
    id: w.id ?? w.Id,
    name: w.name ?? w.Name,
    expenseCount: w.expenseCount ?? w.ExpenseCount ?? 0,
  }))
}

export default function Wallets() {
  const [wallets, setWallets] = useState([])
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState('')

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null) // the wallet being renamed, or null when adding
  const [name, setName] = useState('')
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')

  async function load() {
    setLoading(true)
    setErrorMsg('')
    try {
      setWallets(normalize(await getWallets()))
    } catch {
      setErrorMsg('Could not load your wallets. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  function openAdd() {
    setEditing(null)
    setName('')
    setFormError('')
    setModalOpen(true)
  }

  function openEdit(wallet) {
    setEditing(wallet)
    setName(wallet.name)
    setFormError('')
    setModalOpen(true)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setFormError('')
    try {
      if (editing) {
        await updateWallet(editing.id, { name })
      } else {
        await createWallet({ name })
      }
      setModalOpen(false)
      await load()
    } catch (err) {
      const message = err.response?.data
      setFormError(typeof message === 'string' ? message : 'Could not save that wallet. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(wallet) {
    const note =
      wallet.expenseCount > 0
        ? ` Its ${wallet.expenseCount} ${wallet.expenseCount === 1 ? 'expense' : 'expenses'} will be kept, but will show no wallet.`
        : ''
    if (!window.confirm(`Delete the "${wallet.name}" wallet?${note}`)) return
    try {
      await deleteWallet(wallet.id)
      setWallets((prev) => prev.filter((w) => w.id !== wallet.id))
    } catch {
      setErrorMsg('Could not delete that wallet. Please try again.')
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-7">
        <div>
          <h1 className="text-3xl font-semibold">Wallets</h1>
          <p className="text-ink/55 mt-1">Where your money lives: cash, e-wallets, bank accounts.</p>
        </div>
        <button onClick={openAdd} className="btn-primary">
          + Add wallet
        </button>
      </div>

      {errorMsg && (
        <p className="text-sm text-rust bg-rust/10 border border-rust/20 rounded-md px-4 py-3 mb-6">
          {errorMsg}
        </p>
      )}

      <div className="ledger-card p-2 md:p-5" aria-busy={loading}>
        <div className="px-3 md:px-0 divide-y divide-pine/5">
          {loading &&
            [0, 1, 2].map((i) => (
              <div key={i} className="py-3.5 px-1" aria-hidden="true">
                <div className="skeleton h-11" />
              </div>
            ))}

          {!loading && wallets.length === 0 && (
            <p className="text-ink/50 text-sm py-8 text-center">
              No wallets yet. Add one (like "Cash" or "GCash") to track where your expenses come from.
            </p>
          )}

          {!loading &&
            wallets.map((w) => (
              <div key={w.id} className="flex items-center gap-4 py-3.5 px-1">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-ink truncate">{w.name}</p>
                  <p className="text-sm text-ink/50">
                    {w.expenseCount} {w.expenseCount === 1 ? 'expense' : 'expenses'}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => openEdit(w)}
                    className="text-xs text-pine-dark/70 hover:text-pine-dark px-2 py-1 rounded"
                  >
                    Rename
                  </button>
                  <button
                    onClick={() => handleDelete(w)}
                    className="text-xs text-rust/70 hover:text-rust px-2 py-1 rounded"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
        </div>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Rename wallet' : 'Add wallet'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <p className="text-sm text-rust bg-rust/10 border border-rust/20 rounded-md px-4 py-3">{formError}</p>
          )}

          <div>
            <label className="label-field" htmlFor="wallet-name">Name</label>
            <input
              id="wallet-name"
              type="text"
              required
              autoFocus
              maxLength={MAX_NAME_LENGTH}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-field"
              placeholder="e.g. GCash"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving} className="btn-primary flex-1 disabled:opacity-60">
              {saving ? 'Saving…' : editing ? 'Save changes' : 'Add wallet'}
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
