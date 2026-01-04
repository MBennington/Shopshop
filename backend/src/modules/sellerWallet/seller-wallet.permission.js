const { roles } = require('../../config/role.config');

module.exports.permissions = {
  getWallet: {
    path: '/',
    grantedUserRoles: [roles.admin, roles.seller],
  },
};





