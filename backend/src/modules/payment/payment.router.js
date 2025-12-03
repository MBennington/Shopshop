const express = require('express');

const router = express.Router();

const { permissions } = require('./payment.permission');
const controller = require('./payment.controller');
const schema = require('./payment.schema');

router
  .route(permissions.updatePaymentStatus.path)
  .post(controller.updatePaymentStatus);

module.exports = router;




