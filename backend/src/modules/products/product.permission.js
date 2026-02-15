const { roles } = require('../../config/role.config');

module.exports.permissions = {
  createProduct: {
    path: '/',
    grantedUserRoles: [roles.admin, roles.seller],
  },
  getProductsBySeller: {
    path: '/products-by-seller',
    grantedUserRoles: [roles.admin, roles.seller],
  },
  getProductById: {
    path: '/:id',
    grantedUserRoles: [roles.admin, roles.seller],
  },
  getProducts: {
    path: '/',
  },
  getProductDetails: {
    path: '/details/:id',
  },
  updateProduct: {
    path: '/:id',
    grantedUserRoles: [roles.admin, roles.seller],
  },
  toggleProductStatus: {
    path: '/:id',
    grantedUserRoles: [roles.admin, roles.seller],
  },
  getProductsBySellerId: {
    path: '/products-by-seller-id/:id',
  },
};
