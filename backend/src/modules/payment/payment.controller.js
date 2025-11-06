const paymentService = require('./payment.service');
const { paymentStatus } = require('../../config/order.config');

module.exports.updatePaymentStatus = async (req, res) => {
  try {
    const { order_id, payment_id, status, amount, currency, method, status_message } = req.body;

    if (!order_id || !status) {
      return res.status(400).json({
        success: false,
        msg: 'Order ID and status are required'
      });
    }

    // Update payment status in database
    const updatedPayment = await paymentService.updatePaymentStatus({
      order_id,
      payment_id,
      status: status === 'success' ? paymentStatus.PAID : paymentStatus.FAILED,
      amount,
      currency,
      method,
      status_message
    });

    if (!updatedPayment) {
      return res.status(404).json({
        success: false,
        msg: 'Payment record not found'
      });
    }

    res.status(200).json({
      success: true,
      msg: 'Payment status updated successfully',
      data: updatedPayment
    });

  } catch (error) {
    console.error('Update payment status error:', error);
    res.status(500).json({
      success: false,
      msg: 'Internal server error'
    });
  }
};



