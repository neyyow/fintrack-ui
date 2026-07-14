import client from './client'

export const getExpenses = () => client.get('/expense').then((res) => res.data)

export const getExpense = (id) => client.get(`/expense/${id}`).then((res) => res.data)

// backend assigns UserId from the JWT claim, so we only send Amount/Category/Description
export const createExpense = ({ amount, category, description }) =>
  client
    .post('/expense', { Amount: amount, Category: category, Description: description })
    .then((res) => res.data)

export const updateExpense = (id, { amount, category, description }) =>
  client
    .put(`/expense/${id}`, { Amount: amount, Category: category, Description: description })
    .then((res) => res.data)

export const deleteExpense = (id) => client.delete(`/expense/${id}`).then((res) => res.data)
