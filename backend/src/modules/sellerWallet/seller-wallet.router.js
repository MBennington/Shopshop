const express = require('express');
const router = express.Router();
const validator = require('../../services/validator.service');
const { permissions } = require('./seller-wallet.permission');
const controller = require('./seller-wallet.controller');

// Get seller's own wallet
router
  .route(permissions.getWallet.path)
  .get(
    validator.validateHeader(permissions.getWallet.grantedUserRoles),
    controller.getWallet
  );

// Get wallet by seller ID (admin)
router
  .route('/seller/:seller_id')
  .get(
    validator.validateHeader(['admin']),
    controller.getWalletBySellerId
  );

module.exports = router;

