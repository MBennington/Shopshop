const { roles } = require('../../config/role.config');

module.exports.permissions = {
  createOrUpdateCart: {
    path: '/',
    grantedUserRoles: [roles.admin, roles.seller, roles.buyer],
  },
  getCartByUserId: {
    path: '/:id',
    grantedUserRoles: [roles.admin, roles.seller, roles.buyer],
  },
};
