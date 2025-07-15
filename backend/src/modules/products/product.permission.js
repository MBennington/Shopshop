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
  updateProduct: {
    path: '/:id',
    grantedUserRoles: [roles.admin, roles.seller],
  },
};
