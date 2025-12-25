const express = require('express');

const router = express.Router();

const validator = require('../../services/validator.service');
const { permissions } = require('./suborder.permission');
const controller = require('./suborder.controller');
const schema = require('./suborder.schema');

// GET endpoint - no validation needed (only route params)
router
  .route(permissions.getSubOrdersByMainOrder.path)
  .get(
    validator.validateHeader(permissions.getSubOrdersByMainOrder.grantedUserRoles),
    controller.getSubOrdersByMainOrder
  );

// GET endpoint - validates query parameters
router
  .route(permissions.getSubOrdersBySeller.path)
  .get(
    validator.validateHeader(permissions.getSubOrdersBySeller.grantedUserRoles),
    validator.validateQueryParameters(schema.getSubOrdersBySeller),
    controller.getSubOrdersBySeller
  );

// GET endpoint - check review eligibility (must be before /:id route)
router
  .route(permissions.checkReviewEligibility.path)
  .get(
    validator.validateHeader(permissions.checkReviewEligibility.grantedUserRoles),
    controller.checkReviewEligibility
  );

// GET endpoint - get single sub-order by ID
router
  .route(permissions.getSubOrderById.path)
  .get(
    validator.validateHeader(permissions.getSubOrderById.grantedUserRoles),
    controller.getSubOrderById
  );

// PUT endpoints - validates req.body
router
  .route(permissions.updateSubOrderStatus.path)
  .put(
    validator.validateHeader(permissions.updateSubOrderStatus.grantedUserRoles),
    validator.validateBody(schema.updateSubOrderStatus),
    controller.updateSubOrderStatus
  );

router
  .route(permissions.updateTrackingNumber.path)
  .put(
    validator.validateHeader(permissions.updateTrackingNumber.grantedUserRoles),
    validator.validateBody(schema.updateTrackingNumber),
    controller.updateTrackingNumber
  );

router
  .route(permissions.confirmDelivery.path)
  .put(
    validator.validateHeader(permissions.confirmDelivery.grantedUserRoles),
    validator.validateBody(schema.confirmDelivery),
    controller.confirmDelivery
  );

router
  .route(permissions.buyerConfirmDelivery.path)
  .put(
    validator.validateHeader(permissions.buyerConfirmDelivery.grantedUserRoles),
    validator.validateBody(schema.buyerConfirmDelivery),
    controller.buyerConfirmDelivery
  );

module.exports = router;
