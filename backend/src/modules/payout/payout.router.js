const express = require('express');
const router = express.Router();
const validator = require('../../services/validator.service');
const { permissions } = require('./payout.permission');
const controller = require('./payout.controller');
const schema = require('./payout.schema');

// Seller routes
router
  .route(permissions.createPayoutRequest.path)
  .post(
    validator.validateHeader(permissions.createPayoutRequest.grantedUserRoles),
    validator.validateBody(schema.createPayoutRequest),
    controller.createPayoutRequest
  );

router
  .route(permissions.getPayoutsBySeller.path)
  .get(
    validator.validateHeader(permissions.getPayoutsBySeller.grantedUserRoles),
    validator.validateQueryParameters(schema.getPayouts),
    controller.getPayoutsBySeller
  );

router
  .route(permissions.cancelPayout.path)
  .post(
    validator.validateHeader(permissions.cancelPayout.grantedUserRoles),
    controller.cancelPayout
  );

// Admin routes
router
  .route(permissions.getAllPayouts.path)
  .get(
    validator.validateHeader(permissions.getAllPayouts.grantedUserRoles),
    validator.validateQueryParameters(schema.getPayouts),
    controller.getAllPayouts
  );

router
  .route(permissions.approvePayout.path)
  .post(
    validator.validateHeader(permissions.approvePayout.grantedUserRoles),
    validator.validateBody(schema.approvePayout),
    controller.approvePayout
  );

router
  .route(permissions.rejectPayout.path)
  .post(
    validator.validateHeader(permissions.rejectPayout.grantedUserRoles),
    validator.validateBody(schema.rejectPayout),
    controller.rejectPayout
  );

router
  .route(permissions.markPayoutAsPaid.path)
  .post(
    validator.validateHeader(permissions.markPayoutAsPaid.grantedUserRoles),
    validator.validateBody(schema.markPayoutAsPaid),
    controller.markPayoutAsPaid
  );

// Shared routes (seller and admin)
router
  .route(permissions.getPayoutById.path)
  .get(
    validator.validateHeader(permissions.getPayoutById.grantedUserRoles),
    controller.getPayoutById
  );

module.exports = router;
