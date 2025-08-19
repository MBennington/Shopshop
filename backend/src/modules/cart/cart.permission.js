const { roles } = require('../../config/role.config');

module.exports.permissions = {
  createOrUpdateCart: {
    path: '/',
    grantedUserRoles: [roles.admin, roles.seller, roles.buyer],
  },
  getCartByUserId: {
    path: '/',
    grantedUserRoles: [roles.admin, roles.seller, roles.buyer],
  },
  removeFromCart: {
    path: '/',
    grantedUserRoles: [roles.admin, roles.seller, roles.buyer],
  },
  updateQuantity: {
    path: '/',
    grantedUserRoles: [roles.admin, roles.seller, roles.buyer],
  },
};
