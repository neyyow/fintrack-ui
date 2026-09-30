import client from './client'

export const getLogs = ({ page = 1, pageSize = 15, action, entityType } = {}) =>
  client
    .get('/logs', {
      params: {
        page,
        pageSize,
        action: action && action !== 'all' ? action : undefined,
        entityType: entityType && entityType !== 'all' ? entityType : undefined,
      },
    })
    .then((res) => res.data)