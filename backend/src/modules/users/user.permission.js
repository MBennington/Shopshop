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
  getAllSellers: {
    path: '/get-all-sellers',
  },
  getSellerDataForShop: {
    path: '/get-seller-data-for-shop/:id',
  },
  // Admin user management routes
  getAllUsers: {
    path: '/admin/all-users',
    grantedUserRoles: [roles.admin],
  },
  getUserById: {
    path: '/admin/user/:id',
    grantedUserRoles: [roles.admin],
  },
  updateUserRole: {
    path: '/admin/user/:id/role',
    grantedUserRoles: [roles.admin],
  },
  deleteUserByAdmin: {
    path: '/admin/user/:id',
    grantedUserRoles: [roles.admin],
  },
  updateUserByAdmin: {
    path: '/admin/user/:id',
    grantedUserRoles: [roles.admin],
  },
};
