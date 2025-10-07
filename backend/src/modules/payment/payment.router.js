const express = require('express');
const router = express.Router();
const paymentController = require('./payment.controller');

// Update payment status endpoint
router.post('/update-status', paymentController.updatePaymentStatus);

module.exports = router;
