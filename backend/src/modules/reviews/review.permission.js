const { roles } = require('../../config/role.config');

module.exports.permissions = {
  createReview: {
    path: '/',
    grantedUserRoles: [roles.admin, roles.seller, roles.customer],
  },
  getReviews: {
    path: '/',
  },
  updateReview: {
    path: '/:id',
    grantedUserRoles: [roles.admin, roles.seller, roles.customer],
  },
  deleteReview: {
    path: '/:id',
    grantedUserRoles: [roles.admin, roles.seller, roles.customer],
  },
};
