const express = require('express');

const router = express.Router();

const validator = require('../../services/validator.service');
const { permissions } = require('./order.permission');
const controller = require('./order.controller');
const schema = require('./order.schema');

router
  .route(permissions.createOrder.path)
  .post(
    validator.validateHeader(permissions.createOrder.grantedUserRoles),
    validator.validateBody(schema.createOrder),
    controller.createOrder
  );

module.exports = router;
