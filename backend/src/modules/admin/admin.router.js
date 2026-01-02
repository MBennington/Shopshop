const express = require('express');
const router = express.Router();
const validator = require('../../services/validator.service');
const { permissions } = require('./admin.permission');
const controller = require('./admin.controller');

// Admin routes
router
  .route(permissions.getDashboardStats.path)
  .get(
    validator.validateHeader(permissions.getDashboardStats.grantedUserRoles),
    controller.getDashboardStats
  );

module.exports = router;


