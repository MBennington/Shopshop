const express = require('express');
const multer = require('multer');

const router = express.Router();

const validator = require('../../services/validator.service');
const { permissions } = require('./product.permission');
const controller = require('./product.controller');
const schema = require('./product.schema');

// Configure multer for memory storage to work with Cloudinary
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 25, // Maximum 25 files (5 images per color, 5 colors max)
  },
  fileFilter: (req, file, cb) => {
    // Check file type
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  },
});

router.route(permissions.createProduct.path).post(
  upload.any(), // Accept any field name for multiple files
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

router.route(permissions.updateProduct.path).put(
  upload.any(), // Accept any field name for multiple files
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

router.route(permissions.getProducts.path).get(controller.getProducts);

router
  .route(permissions.getProductDetails.path)
  .get(controller.getProductDetails);

module.exports = router;
