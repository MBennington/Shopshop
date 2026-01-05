const { roles } = require('../../config/role.config');

module.exports.permissions = {
  getStockByProduct: {
    path: '/product/:product_id',
    grantedUserRoles: [roles.admin, roles.seller, roles.buyer],
  },
  getStockBySeller: {
    path: '/seller',
    grantedUserRoles: [roles.admin, roles.seller],
  },
  incrementSales: {
    path: '/admin/increment-sales',
    grantedUserRoles: [roles.admin],
  },
  updateStock: {
    path: '/:product_id',
    grantedUserRoles: [roles.admin, roles.seller],
  },
  getAllStocks: {
    path: '/admin/all',
    grantedUserRoles: [roles.admin],
  },
  createOrGetStock: {
    path: '/create-or-get',
    grantedUserRoles: [roles.admin, roles.seller],
  },
  restockProduct: {
    path: '/restock',
    grantedUserRoles: [roles.admin, roles.seller],
  },
};
