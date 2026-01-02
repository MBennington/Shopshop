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

router
  .route(permissions.getAllProductsForAdmin.path)
  .get(
    validator.validateHeader(permissions.getAllProductsForAdmin.grantedUserRoles),
    controller.getAllProductsForAdmin
  );

router
  .route(permissions.deactivateProduct.path)
  .put(
    validator.validateHeader(permissions.deactivateProduct.grantedUserRoles),
    controller.deactivateProduct
  );

router
  .route(permissions.activateProduct.path)
  .put(
    validator.validateHeader(permissions.activateProduct.grantedUserRoles),
    controller.activateProduct
  );

router
  .route(permissions.getProductStockData.path)
  .get(
    validator.validateHeader(permissions.getProductStockData.grantedUserRoles),
    controller.getProductStockData
  );

router
  .route(permissions.getAnalytics.path)
  .get(
    validator.validateHeader(permissions.getAnalytics.grantedUserRoles),
    controller.getAnalytics
  );

module.exports = router;


