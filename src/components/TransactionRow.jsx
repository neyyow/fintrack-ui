import React from 'react'
import CategoryStamp from './CategoryStamp'
import { formatDateShort, formatCurrency } from '../utils/format'
import { categoryMeta, EXPENSE_CATEGORIES, INCOME_SOURCES } from '../utils/categories'

export default function TransactionRow({ transaction, onEdit, onDelete }) {
  const isExpense = transaction.type === 'expense'
  const meta = categoryMeta(
    isExpense ? transaction.category : transaction.source,
    isExpense ? EXPENSE_CATEGORIES : INCOME_SOURCES
  )
  const { day, month } = formatDateShort(transaction.dateCreated)

  return (
    <div className="flex items-center gap-4 py-3.5 px-1 group">
      <div className="flex flex-col items-center w-9 shrink-0 font-mono">
        <span className="text-[11px] text-ink/45 tracking-wide">{month}</span>
        <span className="text-lg font-semibold text-pine-dark leading-none">{day}</span>
      </div>

      <CategoryStamp meta={meta} />

      <div className="flex-1 min-w-0">
        <p className="font-medium text-ink truncate">{isExpense ? transaction.category : transaction.source}</p>
        {isExpense && transaction.description && (
          <p className="text-sm text-ink/50 truncate">{transaction.description}</p>
        )}
      </div>

      <p className={`amount text-base font-semibold shrink-0 ${isExpense ? 'amount-expense' : 'amount-income'}`}>
        {isExpense ? '−' : '+'}
        {formatCurrency(transaction.amount)}
      </p>

      <div className="hidden group-hover:flex items-center gap-1.5 shrink-0">
        {isExpense && onEdit && (
          <button
            onClick={() => onEdit(transaction)}
            className="text-xs text-pine-dark/70 hover:text-pine-dark px-2 py-1 rounded"
          >
            Edit
          </button>
        )}
        {onDelete && (
          <button
            onClick={() => onDelete(transaction)}
            className="text-xs text-rust/70 hover:text-rust px-2 py-1 rounded"
          >
            Delete
          </button>
        )}
      </div>
    </div>
  )
}
