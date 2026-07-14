// Expense categories, styled as "wax-seal" stamps in the ledger UI.
// Each has an initial (shown inside the stamp) and a color.
export const EXPENSE_CATEGORIES = [
  { name: 'Food', initial: 'F', color: '#B8873A' },
  { name: 'Transport', initial: 'T', color: '#2E5E4E' },
  { name: 'Bills', initial: 'B', color: '#A6432E' },
  { name: 'Shopping', initial: 'S', color: '#7C9A82' },
  { name: 'Health', initial: 'H', color: '#8A5A44' },
  { name: 'Entertainment', initial: 'E', color: '#6B7FA6' },
  { name: 'Education', initial: 'Ed', color: '#4A6B7C' },
  { name: 'Rent', initial: 'R', color: '#5E4E2E' },
  { name: 'Other', initial: 'O', color: '#7A7A6E' },
]

export const INCOME_SOURCES = [
  { name: 'Salary', initial: 'Sa', color: '#2E5E4E' },
  { name: 'Freelance', initial: 'Fr', color: '#B8873A' },
  { name: 'Business', initial: 'Bu', color: '#7C9A82' },
  { name: 'Gift', initial: 'Gi', color: '#6B7FA6' },
  { name: 'Investment', initial: 'In', color: '#8A5A44' },
  { name: 'Other', initial: 'O', color: '#7A7A6E' },
]

export function categoryMeta(name, list = EXPENSE_CATEGORIES) {
  return list.find((c) => c.name === name) || { name, initial: name?.[0]?.toUpperCase() || '?', color: '#7A7A6E' }
}
