const express = require('express');

const router = express.Router();

const validator = require('../../services/validator.service');
const { permissions } = require('./cart.permission');
const controller = require('./cart.controller');
const schema = require('./cart.schema');

router
  .route(permissions.createOrUpdateCart.path)
  .post(
    validator.validateHeader(permissions.createOrUpdateCart.grantedUserRoles),
    validator.validateBody(schema.createOrUpdateCart),
    controller.createOrUpdateCart
  );

router
  .route(permissions.getCartByUserId.path)
  .get(
    validator.validateHeader(permissions.getCartByUserId.grantedUserRoles),
    controller.getCartByUserId
  );

router
  .route(permissions.removeFromCart.path)
  .delete(
    validator.validateHeader(permissions.removeFromCart.grantedUserRoles),
    validator.validateQueryParameters(schema.removeFromCart),
    controller.removeFromCart
  );

module.exports = router;
