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

router
  .route(permissions.getProductsBySeller.path)
  .get(
    validator.validateHeader(permissions.getProductsBySeller.grantedUserRoles),
    controller.getProductsBySeller
  );

router
  .route(permissions.getProductById.path)
  .get(
    validator.validateHeader(permissions.getProductById.grantedUserRoles),
    controller.getProductById
  );

router.route(permissions.getProducts.path).get(
  //validator.validateHeader(),
  validator.validateQueryParameters(schema.getProducts),
  controller.getProducts
);

router.route(permissions.updateProduct.path).put(
  upload.single('image'),
  validator.validateHeader(permissions.updateProduct.grantedUserRoles),
  validator.validateBody(schema.updateProduct), // Use update schema
  controller.updateProduct
);

router
  .route(permissions.deleteProduct.path)
  .delete(
    validator.validateHeader(permissions.deleteProduct.grantedUserRoles),
    controller.deleteProduct
  );

router.route(permissions.getProductDetails.path).get(
  //validator.validateHeader(),
  validator.validateQueryParameters(schema.getProductDetails),
  controller.getProductDetails
);

module.exports = router;
