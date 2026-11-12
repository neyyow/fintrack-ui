import client from './client'

export const getExpenses = () => client.get('/expense').then((res) => res.data)

export const getExpense = (id) => client.get(`/expense/${id}`).then((res) => res.data)

// backend assigns UserId from the JWT claim, so we only send Amount/Category/Description/WalletId
// walletId is optional: pass null for "no wallet"
export const createExpense = ({ amount, category, description, walletId = null }) =>
  client
    .post('/expense', { Amount: amount, Category: category, Description: description, WalletId: walletId })
    .then((res) => res.data)

export const updateExpense = (id, { amount, category, description, walletId = null }) =>
  client
    .put(`/expense/${id}`, { Amount: amount, Category: category, Description: description, WalletId: walletId })
    .then((res) => res.data)

export const deleteExpense = (id) => client.delete(`/expense/${id}`).then((res) => res.data)
