const { roles } = require('../../config/role.config');

module.exports.permissions = {
  createOrder: {
    path: '/',
    grantedUserRoles: [roles.admin, roles.seller, roles.buyer],
  },
  findOrderById: {
    path: '/find-order-by-id',
    grantedUserRoles: [roles.admin, roles.seller, roles.buyer],
  },
};
