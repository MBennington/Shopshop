const express = require('express');
const router = express.Router();

const validator = require('../../services/validator.service');
const { permissions } = require('./issue-report.permission');
const controller = require('./issue-report.controller');
const schema = require('./issue-report.schema');

router
  .route(permissions.createIssueReport.path)
  .post(
    validator.validateHeader(permissions.createIssueReport.grantedUserRoles),
    validator.validateBody(schema.createIssueReport),
    controller.createIssueReport
  );

router
  .route(permissions.getIssueReports.path)
  .get(
    validator.validateHeader(permissions.getIssueReports.grantedUserRoles),
    controller.getIssueReports
  );

router
  .route(permissions.getIssueReportById.path)
  .get(
    validator.validateHeader(permissions.getIssueReportById.grantedUserRoles),
    controller.getIssueReportById
  );

// Admin routes
router
  .route('/admin/all')
  .get(
    validator.validateHeader(['admin']),
    controller.getAllIssueReports
  );

router
  .route(permissions.updateIssueReport.path)
  .put(
    validator.validateHeader(permissions.updateIssueReport.grantedUserRoles),
    validator.validateBody(schema.updateIssueReport),
    controller.updateIssueReport
  );

module.exports = router;


