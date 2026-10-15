import React from 'react'
import { formatCurrency } from '../utils/format'

export default function StatCard({ label, amount, tone = 'pine', eyebrow, loading = false }) {
  const toneClasses = {
    pine: 'text-pine-dark',
    rust: 'text-rust',
    gold: 'text-gold',
  }

  return (
    <div className="ledger-card p-5 flex-1 min-w-[160px]">
      {eyebrow && (
        <p className="text-xs uppercase tracking-[0.14em] text-ink/50 mb-1 font-medium">{eyebrow}</p>
      )}
      <p className="text-sm text-ink/60 mb-2">{label}</p>
      {loading ? (
        // Same height as the amount text (text-2xl / md:text-3xl line heights) so nothing shifts
        <div className="skeleton h-8 md:h-9 w-32" aria-hidden="true" />
      ) : (
        <p className={`amount text-2xl md:text-3xl font-semibold ${toneClasses[tone]}`}>
          {formatCurrency(amount)}
        </p>
      )}
    </div>
  )
}
