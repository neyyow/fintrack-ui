import client from './client'

export const getBudget = ({ year, month }) =>
  client.get('/budget', { params: { year, month } }).then((res) => res.data)

// categoryLimits: [{ category: string, amount: number }]
export const saveBudget = ({ year, month, overallTarget, categoryLimits }) =>
  client
    .put('/budget', {
      Year: year,
      Month: month,
      OverallTarget: overallTarget,
      CategoryLimits: categoryLimits.map((c) => ({ Category: c.category, Amount: c.amount })),
    })
    .then((res) => res.data)
