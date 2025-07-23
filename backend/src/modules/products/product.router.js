const express = require('express');

const router = express.Router();

const validator = require('../../services/validator.service');
const { permissions } = require('./product.permission');
const controller = require('./product.controller');
const schema = require('./product.schema');
const upload = require('../../services/multer.service');

router
  .route(permissions.createProduct.path)
  .post(
    upload.any(),
    validator.validateHeader(permissions.createProduct.grantedUserRoles),
    validator.validateBody(schema.createProduct),
    controller.createProduct
  );

router
  .route(permissions.getProductsBySeller.path)
  .get(
    validator.validateHeader(permissions.getProductsBySeller.grantedUserRoles),
    controller.getProductsBySeller
  );

router.route(permissions.getProductById.path).get(controller.getProductById);

router
  .route(permissions.updateProduct.path)
  .put(
    upload.any(),
    validator.validateHeader(permissions.updateProduct.grantedUserRoles),
    validator.validateBody(schema.updateProduct),
    controller.updateProduct
  );

router
  .route(permissions.deleteProduct.path)
  .delete(
    validator.validateHeader(permissions.deleteProduct.grantedUserRoles),
    controller.deleteProduct
  );

router
  .route(permissions.getProducts.path)
  .get(
    validator.validateQueryParameters(schema.getProducts),
    controller.getProducts
  );

router
  .route(permissions.getProductDetails.path)
  .get(controller.getProductDetails);

module.exports = router;
