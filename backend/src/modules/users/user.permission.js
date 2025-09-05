const { roles } = require('../../config/role.config');

module.exports.permissions = {
  createUser: {
    path: '/',
  },
  login: {
    path: '/login',
  },
  getUserProfile: {
    path: '/user-profile',
    grantedUserRoles: [roles.admin, roles.seller, roles.buyer],
  },
  updateUserProfile: {
    path: '/update-profile',
    grantedUserRoles: [roles.admin, roles.seller, roles.buyer],
  },
};
