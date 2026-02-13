const { roles } = require('../../config/role.config');

module.exports.permissions = {
  getSubOrdersByMainOrder: {
    path: '/main-order/:mainOrderId',
    grantedUserRoles: [roles.admin, roles.seller, roles.buyer],
  },
  getSellerCustomers: {
    path: '/seller/:sellerId/customers',
    grantedUserRoles: [roles.seller],
  },
  getSubOrdersBySeller: {
    path: '/seller/:sellerId',
    grantedUserRoles: [roles.admin, roles.seller],
  },
  getSubOrderById: {
    path: '/:id',
    grantedUserRoles: [roles.admin, roles.seller, roles.buyer],
  },
  updateSubOrderStatus: {
    path: '/:id/status',
    grantedUserRoles: [roles.admin, roles.seller],
  },
  updateTrackingNumber: {
    path: '/:id/tracking',
    grantedUserRoles: [roles.admin, roles.seller],
  },
  confirmDelivery: {
    path: '/:id/confirm-delivery',
    grantedUserRoles: [roles.admin, roles.buyer],
  },
  buyerConfirmDelivery: {
    path: '/:id/buyer-confirm-delivery',
    grantedUserRoles: [roles.buyer],
  },
  checkReviewEligibility: {
    path: '/check-review-eligibility/:productId',
    grantedUserRoles: [roles.buyer],
  }
};
