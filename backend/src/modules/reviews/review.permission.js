const { roles } = require('../../config/role.config');

module.exports.permissions = {
  createReview: {
    path: '/',
    grantedUserRoles: [roles.admin, roles.seller, roles.buyer],
  },
  getReviews: {
    path: '/',
  },
  updateReview: {
    path: '/:id',
    grantedUserRoles: [roles.admin, roles.seller, roles.buyer],
  },
  deleteReview: {
    path: '/:id',
    grantedUserRoles: [roles.admin, roles.seller, roles.buyer],
  },
};
