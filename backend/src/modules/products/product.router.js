const express = require('express');
const multer = require('multer');

const router = express.Router();

const validator = require('../../services/validator.service');
const { permissions } = require('./product.permission');
const controller = require('./product.controller');
const schema = require('./product.schema');

const upload = multer({ dest: 'uploads/' });

router
  .route(permissions.createProduct.path)
  .post(
    upload.single('image'),
    validator.validateHeader(permissions.createProduct.grantedUserRoles),
    validator.validateBody(schema.createProduct),
    controller.createProduct
  );

module.exports = router;
