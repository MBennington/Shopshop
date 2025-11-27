const express = require('express');

const router = express.Router();

const validator = require('../../services/validator.service');
const { permissions } = require('./giftcard.permission');
const controller = require('./giftcard.controller');
const schema = require('./giftcard.schema');

router
  .route(permissions.purchaseGiftCard.path)
  .post(
    validator.validateHeader(permissions.purchaseGiftCard.grantedUserRoles),
    validator.validateBody(schema.purchaseGiftCard),
    controller.purchaseGiftCard
  );

router
  .route(permissions.validateGiftCard.path)
  .post(
    validator.validateHeader(permissions.validateGiftCard.grantedUserRoles),
    validator.validateBody(schema.validateGiftCard),
    controller.validateGiftCard
  );

router
  .route(permissions.getUserGiftCards.path)
  .get(
    validator.validateHeader(permissions.getUserGiftCards.grantedUserRoles),
    controller.getUserGiftCards
  );

router
  .route(permissions.sendGiftCardEmail.path)
  .post(
    validator.validateHeader(permissions.sendGiftCardEmail.grantedUserRoles),
    validator.validateBody(schema.sendGiftCardEmail),
    controller.sendGiftCardEmail
  );

router
  .route(permissions.initiateGiftCardPurchase.path)
  .post(
    validator.validateHeader(permissions.initiateGiftCardPurchase.grantedUserRoles),
    validator.validateBody(schema.purchaseGiftCard), // Reuse purchase schema
    controller.initiateGiftCardPurchase
  );

router
  .route(permissions.updateGiftCardPaymentStatus.path)
  .post(
    // No auth required - called from webhook
    controller.updateGiftCardPaymentStatus
  );

router
  .route(permissions.getGiftCardPaymentById.path)
  .get(
    validator.validateHeader(permissions.getGiftCardPaymentById.grantedUserRoles),
    controller.getGiftCardPaymentById
  );

module.exports = router;

