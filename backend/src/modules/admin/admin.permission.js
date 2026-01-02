const { roles } = require('../../config/role.config');

module.exports.permissions = {
  getDashboardStats: {
    path: '/dashboard',
    grantedUserRoles: [roles.admin],
  },
  getAllProductsForAdmin: {
    path: '/products',
    grantedUserRoles: [roles.admin],
  },
  deactivateProduct: {
    path: '/products/:id/deactivate',
    grantedUserRoles: [roles.admin],
  },
  activateProduct: {
    path: '/products/:id/activate',
    grantedUserRoles: [roles.admin],
  },
  getProductStockData: {
    path: '/products/:id/stock',
    grantedUserRoles: [roles.admin],
  },
  getAnalytics: {
    path: '/analytics',
    grantedUserRoles: [roles.admin],
  },
};


