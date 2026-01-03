const { roles } = require('../../config/role.config');

module.exports.permissions = {
  getAnalytics: {
    path: '/analytics',
    grantedUserRoles: [roles.seller],
  },
};


