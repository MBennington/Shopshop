const { roles } = require('../../config/role.config');

module.exports.permissions = {
  // Old purchaseGiftCard permission removed - use initiateGiftCardPurchase instead
  validateGiftCard: {
    path: '/validate',
    grantedUserRoles: [roles.buyer, roles.admin, roles.seller],
  },
  getUserGiftCards: {
    path: '/user-cards',
    grantedUserRoles: [roles.buyer, roles.admin, roles.seller],
  },
  // Old sendGiftCardEmail permission removed - gift cards are sent automatically after payment
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
  // Old acceptance flow permissions removed:
  // - sendGiftCard
  // - getGiftCardByAcceptanceToken
  // - acceptGiftCard
};
