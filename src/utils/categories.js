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

// A small rotating palette for auto-generated custom categories,
// so each new custom name gets a distinct, stable-ish color.
const CUSTOM_PALETTE = ['#9C6B4A', '#4A7A6B', '#6B4A9C', '#9C4A6B', '#4A6B9C', '#7A9C4A']

function colorForCustomName(name) {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) >>> 0
  return CUSTOM_PALETTE[hash % CUSTOM_PALETTE.length]
}

// Combines the built-in list with any custom category/source names the user
// has already used on their own transactions, so they reappear as real options
// next time — no separate "categories" table needed on the backend.
// `kind` is 'expense' or 'income', used to keep hidden-category lists separate.
export function mergeCategories(builtInList, transactions, fieldName, kind) {
  const builtInNames = new Set(builtInList.map((c) => c.name))
  const hiddenNames = new Set(getHiddenNames(kind))
  const customNames = new Set()

  for (const t of transactions) {
    const name = t[fieldName]
    if (name && !builtInNames.has(name) && !hiddenNames.has(name)) customNames.add(name)
  }

  const customEntries = Array.from(customNames).map((name) => ({
    name,
    initial: name[0]?.toUpperCase() || '?',
    color: colorForCustomName(name),
    custom: true,
  }))

  return [...builtInList, ...customEntries]
}

// "Deleting" a custom category doesn't touch past transactions — it just stops
// suggesting that name in the dropdown from now on. Stored per-browser.
const HIDDEN_KEY_PREFIX = 'fintrack:hiddenCategories:'

function getHiddenNames(kind) {
  try {
    const raw = localStorage.getItem(HIDDEN_KEY_PREFIX + kind)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function hideCustomCategory(kind, name) {
  const hidden = getHiddenNames(kind)
  if (!hidden.includes(name)) {
    hidden.push(name)
    localStorage.setItem(HIDDEN_KEY_PREFIX + kind, JSON.stringify(hidden))
  }
}
