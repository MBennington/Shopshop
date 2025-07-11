const express = require('express');

const router = express.Router();

const validator = require('../../services/validator.service');
const { permissions } = require('./product.permission');
const controller = require('./product.controller');
const schema = require('./product.schema');

router
  .route(permissions.createProduct.path)
  .post(
    validator.validateHeader(permissions.createProduct.grantedUserRoles),
    validator.validateBody(schema.createProduct),
    controller.createProduct
  );

module.exports = router;
