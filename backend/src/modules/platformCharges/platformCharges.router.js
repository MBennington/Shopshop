const express = require('express');

const router = express.Router();

const { permissions } = require('./platformCharges.permission');
const controller = require('./platformCharges.controller');

router
  .route(permissions.getPlatformCharges.path)
  .get(controller.getPlatformCharges);

module.exports = router;