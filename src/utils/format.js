export const currencyFormatter = new Intl.NumberFormat('en-PH', {
  style: 'currency',
  currency: 'PHP',
  minimumFractionDigits: 2,
})

export function formatCurrency(amount) {
  const value = Number(amount) || 0
  return currencyFormatter.format(value)
}

export function formatDate(dateString) {
  const date = new Date(dateString)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString('en-PH', { month: 'short', day: '2-digit', year: 'numeric' })
}

export function formatDateShort(dateString) {
  const date = new Date(dateString)
  if (Number.isNaN(date.getTime())) return { day: '--', month: '---' }
  return {
    day: date.toLocaleDateString('en-PH', { day: '2-digit' }),
    month: date.toLocaleDateString('en-PH', { month: 'short' }).toUpperCase(),
  }
}
