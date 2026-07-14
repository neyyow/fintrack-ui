import client from './client'

// GET /summary -> { TotalIncome, TotalExpense, Balance }
export const getSummary = () => client.get('/summary').then((res) => res.data)
