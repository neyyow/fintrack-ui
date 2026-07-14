import client from './client'

export const getIncomes = () => client.get('/income').then((res) => res.data)

export const getIncome = (id) => client.get(`/income/${id}`).then((res) => res.data)

export const createIncome = ({ amount, source }) =>
  client.post('/income', { Amount: amount, Source: source }).then((res) => res.data)

export const deleteIncome = (id) => client.delete(`/income/${id}`).then((res) => res.data)
