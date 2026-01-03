const express = require('express');
const router = express.Router();
const validator = require('../../services/validator.service');
const { permissions } = require('./seller.permission');
const controller = require('./seller.controller');

// Seller routes
router
  .route(permissions.getAnalytics.path)
  .get(
    validator.validateHeader(permissions.getAnalytics.grantedUserRoles),
    controller.getAnalytics
  );

module.exports = router;


