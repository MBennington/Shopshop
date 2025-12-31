const { roles } = require('../../config/role.config');

module.exports.permissions = {
  createPayoutRequest: {
    path: '/',
    grantedUserRoles: [roles.seller],
  },
  getPayoutsBySeller: {
    path: '/seller',
    grantedUserRoles: [roles.seller],
  },
  getPayoutById: {
    path: '/:id',
    grantedUserRoles: [roles.admin, roles.seller],
  },
  getAllPayouts: {
    path: '/',
    grantedUserRoles: [roles.admin],
  },
  approvePayout: {
    path: '/:id/approve',
    grantedUserRoles: [roles.admin],
  },
  rejectPayout: {
    path: '/:id/reject',
    grantedUserRoles: [roles.admin],
  },
  markPayoutAsPaid: {
    path: '/:id/mark-paid',
    grantedUserRoles: [roles.admin],
  },
  cancelPayout: {
    path: '/:id/cancel',
    grantedUserRoles: [roles.seller],
  },
};

