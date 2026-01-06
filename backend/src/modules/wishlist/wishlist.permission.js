const { roles } = require('../../config/role.config');

module.exports.permissions = {
  addToWishlist: {
    path: '/',
    grantedUserRoles: [roles.admin, roles.seller, roles.buyer],
  },
};

