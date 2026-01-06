const express = require('express');

const router = express.Router();

const validator = require('../../services/validator.service');
const { permissions } = require('./wishlist.permission');
const controller = require('./wishlist.controller');
const schema = require('./wishlist.schema');

router
  .route(permissions.addToWishlist.path)
  .post(
    validator.validateHeader(permissions.addToWishlist.grantedUserRoles),
    validator.validateBody(schema.addToWishlist),
    controller.addToWishlist
  );

router
  .route(permissions.getWishlistByUserId.path)
  .get(
    validator.validateHeader(permissions.getWishlistByUserId.grantedUserRoles),
    controller.getWishlistByUserId
  );

module.exports = router;

