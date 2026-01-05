const express = require('express');
const router = express.Router();

const validator = require('../../services/validator.service');
const { permissions } = require('./stock.permission');
const controller = require('./stock.controller');
const schema = require('./stock.schema');

router
  .route(permissions.getStockByProduct.path)
  .get(
    validator.validateHeader(permissions.getStockByProduct.grantedUserRoles),
    controller.getStockByProduct
  );

router
  .route(permissions.getStockBySeller.path)
  .get(
    validator.validateHeader(permissions.getStockBySeller.grantedUserRoles),
    controller.getStockBySeller
  );

router
  .route(permissions.incrementSales.path)
  .post(
    validator.validateHeader(permissions.incrementSales.grantedUserRoles),
    validator.validateBody(schema.incrementSales),
    controller.incrementSales
  );

router
  .route(permissions.updateStock.path)
  .put(
    validator.validateHeader(permissions.updateStock.grantedUserRoles),
    validator.validateBody(schema.updateStock),
    controller.updateStock
  );

router
  .route(permissions.getAllStocks.path)
  .get(
    validator.validateHeader(permissions.getAllStocks.grantedUserRoles),
    controller.getAllStocks
  );

router
  .route(permissions.createOrGetStock.path)
  .post(
    validator.validateHeader(permissions.createOrGetStock.grantedUserRoles),
    controller.createOrGetStock
  );

router
  .route(permissions.restockProduct.path)
  .post(
    validator.validateHeader(permissions.restockProduct.grantedUserRoles),
    validator.validateBody(schema.restockProduct),
    controller.restockProduct
  );

module.exports = router;

