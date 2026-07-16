import client from './client'

// page is 1-indexed. action/entityType are optional - pass 'all' or omit to skip filtering.
export const getLogs = ({ page = 1, pageSize = 25, action, entityType } = {}) =>
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
