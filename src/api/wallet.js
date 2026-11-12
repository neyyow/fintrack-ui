import client from './client'

// Each wallet: { id, name, expenseCount }
export const getWallets = () => client.get('/wallet').then((res) => res.data)

// backend assigns UserId from the JWT claim, so we only send the name
export const createWallet = ({ name }) =>
  client.post('/wallet', { Name: name }).then((res) => res.data)

export const updateWallet = (id, { name }) =>
  client.put(`/wallet/${id}`, { Name: name }).then((res) => res.data)

// expenses that used this wallet are kept; they just become "No wallet"
export const deleteWallet = (id) => client.delete(`/wallet/${id}`).then((res) => res.data)
