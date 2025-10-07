const PaymentModel = require('./payment.model');
const repository = require('../../services/repository.service');
const { paymentStatus, paymentMethod } = require('../../config/order.config');
const orderService = require('../order/order.service');
const md5 = require('crypto-js/md5');

module.exports.createPayment = async (paymentInfo) => {
  const { user_id, payment_method, order_id, amount } = paymentInfo;

  // Create payment record
  const newPayment = new PaymentModel({
    user_id,
    paymentMethod: payment_method,
    order_id,
    amount,
    paymentStatus: paymentStatus.PENDING,
  });

  await repository.save(newPayment);

  if (payment_method === paymentMethod.COD) {
    return newPayment.toObject();
  }

  //if payment method is card, initiate payment
  const initiatePayment = await this.initiatePayment(order_id);

  return initiatePayment;
};

module.exports.generatePayHereHash = async (
  orderId,
  amount,
  currency = 'LKR'
) => {
  const MERCHANT_ID = process.env.PAYHERE_MERCHANT_ID;
  const MERCHANT_SECRET = process.env.PAYHERE_MERCHANT_SECRET;

  const hashedSecret = md5(MERCHANT_SECRET).toString().toUpperCase();
  const amountFormatted = parseFloat(amount)
    .toLocaleString('en-US', { minimumFractionDigits: 2 })
    .replaceAll(',', '');
  const hash = md5(
    MERCHANT_ID + orderId + amountFormatted + currency + hashedSecret
  )
    .toString()
    .toUpperCase();

  console.log('hash: ', hash);

  return hash;
};

module.exports.initiatePayment = async (order_id) => {
  console.log('order id', order_id);
  const order = await orderService.findOrderById(order_id);
  if (!order) {
    throw new Error('Order not found!');
  }

  const amount = order.totalPrice;
  const currency = 'LKR';

  // Generate PayHere hash
  const hash = await this.generatePayHereHash(
    order._id.toString(),
    amount,
    currency
  );

  const data = {
    merchantId: process.env.PAYHERE_MERCHANT_ID,
    user_id: order.user_id,
    orderId: order._id.toString(),
    payment_method: order.paymentMethod,
    payment_status: order.paymentStatus,
    amount,
    currency,
    hash,
  };

  return data;
};

module.exports.findPaymentByOrderId = async (order_id, payment_status) => {
  return await repository.findOne(PaymentModel, { order_id, paymentStatus: payment_status });
};

module.exports.updatePaymentStatus = async (paymentData) => {
  const { order_id, payment_id, status, amount, currency, method, status_message } = paymentData;

  // Find the payment record by order_id
  const payment = await repository.findOne(PaymentModel, { order_id });
  
  if (!payment) {
    throw new Error('Payment record not found');
  }

  // Update payment status and additional data
  payment.paymentStatus = status;
  payment.payment_id = payment_id;
  payment.amount = amount || payment.amount;
  payment.currency = currency || 'LKR';
  payment.method = method;
  payment.status_message = status_message;

  const updatedPayment = await repository.save(payment);
  return updatedPayment;
};
