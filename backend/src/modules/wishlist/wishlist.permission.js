const { roles } = require('../../config/role.config');

module.exports.permissions = {
  addToWishlist: {
    path: '/',
    grantedUserRoles: [roles.admin, roles.seller, roles.buyer],
  },
  getWishlistByUserId: {
    path: '/',
    grantedUserRoles: [roles.admin, roles.seller, roles.buyer],
  },
  removeFromWishlist: {
    path: '/',
    grantedUserRoles: [roles.admin, roles.seller, roles.buyer],
  },
  addWishlistItemToCart: {
    path: '/add-to-cart',
    grantedUserRoles: [roles.admin, roles.seller, roles.buyer],
  },
};

