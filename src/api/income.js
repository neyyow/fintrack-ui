import client from './client'

export const getIncomes = () => client.get('/income').then((res) => res.data)

export const getIncome = (id) => client.get(`/income/${id}`).then((res) => res.data)

export const createIncome = ({ amount, source }) =>
  client.post('/income', { Amount: amount, Source: source }).then((res) => res.data)

export const deleteIncome = (id) => client.delete(`/income/${id}`).then((res) => res.data)

// --- Recurring income ---

export const getRecurringIncomes = () =>
  client.get('/income/recurring').then((res) => res.data)

// frequency: 'Weekly' | 'Monthly' | 'Custom'
// intervalDays only matters when frequency is 'Custom'
// nextRunDate is the start date - the first date this rule should fire
export const createRecurringIncome = ({ amount, source, frequency, intervalDays, nextRunDate }) =>
  client
    .post('/income/recurring', {
      Amount: amount,
      Source: source,
      Frequency: frequency,
      IntervalDays: intervalDays ?? null,
      NextRunDate: nextRunDate,
    })
    .then((res) => res.data)

export const toggleRecurringIncome = (id) =>
  client.put(`/income/recurring/${id}/toggle`).then((res) => res.data)

export const deleteRecurringIncome = (id) =>
  client.delete(`/income/recurring/${id}`).then((res) => res.data)
