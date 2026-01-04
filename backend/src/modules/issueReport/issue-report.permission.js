const { roles } = require('../../config/role.config');

module.exports.permissions = {
  createIssueReport: {
    path: '/',
    grantedUserRoles: [roles.admin, roles.seller, roles.buyer],
  },
  getIssueReports: {
    path: '/',
    grantedUserRoles: [roles.admin, roles.seller, roles.buyer],
  },
  getIssueReportById: {
    path: '/:id',
    grantedUserRoles: [roles.admin, roles.seller, roles.buyer],
  },
  updateIssueReport: {
    path: '/:id',
    grantedUserRoles: [roles.admin],
  },
};


