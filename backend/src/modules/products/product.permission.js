const { roles } = require('../../config/role.config');

module.exports.permissions = {
  createProduct: {
    path: '/',
    grantedUserRoles: [roles.admin, roles.seller],
  },
};
