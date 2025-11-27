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
  initiateGiftCardPurchase: {
    path: '/payment/initiate',
    grantedUserRoles: [roles.buyer, roles.admin, roles.seller],
  },
  updateGiftCardPaymentStatus: {
    path: '/payment/update-status',
    grantedUserRoles: [], // No auth required - called from webhook
  },
  getGiftCardPaymentById: {
    path: '/payment/:payment_id',
    grantedUserRoles: [roles.buyer, roles.admin, roles.seller],
  },
  sendGiftCard: {
    path: '/send',
    grantedUserRoles: [roles.buyer, roles.admin, roles.seller],
  },
  getGiftCardByAcceptanceToken: {
    path: '/accept/:token',
    grantedUserRoles: [], // No auth required - public endpoint
  },
  acceptGiftCard: {
    path: '/accept/:token/confirm',
    grantedUserRoles: [roles.buyer, roles.admin, roles.seller],
  },
};
