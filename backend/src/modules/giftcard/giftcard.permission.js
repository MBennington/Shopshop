const { roles } = require('../../config/role.config');

module.exports.permissions = {
  purchaseGiftCard: {
    path: '/purchase',
    grantedUserRoles: [roles.buyer, roles.admin, roles.seller],
  },
  validateGiftCard: {
    path: '/validate',
    grantedUserRoles: [roles.buyer, roles.admin, roles.seller],
  },
  getUserGiftCards: {
    path: '/user-cards',
    grantedUserRoles: [roles.buyer, roles.admin, roles.seller],
  },
  sendGiftCardEmail: {
    path: '/send-email',
    grantedUserRoles: [roles.buyer, roles.admin, roles.seller],
  },
};
