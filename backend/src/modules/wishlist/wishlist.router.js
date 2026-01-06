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

router
  .route(permissions.removeFromWishlist.path)
  .delete(
    validator.validateHeader(permissions.removeFromWishlist.grantedUserRoles),
    validator.validateQueryParameters(schema.removeFromWishlist),
    controller.removeFromWishlist
  );

router
  .route(permissions.addWishlistItemToCart.path)
  .post(
    validator.validateHeader(permissions.addWishlistItemToCart.grantedUserRoles),
    validator.validateBody(schema.addWishlistItemToCart),
    controller.addWishlistItemToCart
  );

module.exports = router;

