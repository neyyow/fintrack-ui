import client from './client'

export const getLogs = () => client.get('/logs').then((res) => res.data)
