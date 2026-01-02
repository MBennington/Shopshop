const { roles } = require('../../config/role.config');

module.exports.permissions = {
  getDashboardStats: {
    path: '/dashboard',
    grantedUserRoles: [roles.admin],
  },
};


