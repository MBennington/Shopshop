const PaymentModel = require('./payment.model');
const repository = require('../../services/repository.service');
const { paymentStatus, paymentMethod, orderStatus } = require('../../config/order.config');
const { subOrderStatus, sellerPaymentStatus } = require('../../config/suborder.config');
const orderService = require('../order/order.service');
const OrderModel = require('../order/order.model');
const SubOrderModel = require('../subOrder/suborder.model');
const md5 = require('crypto-js/md5');
const mongoose = require('mongoose');

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

  const amount = order.finalTotal;
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
  return await repository.findOne(PaymentModel, {
    order_id,
    paymentStatus: payment_status,
  });
};

module.exports.updatePaymentStatus = async (data) => {
  const { order_id, status_code, payment_id, status_message, method } = data;

  let status;
  if (status_code == 2) status = paymentStatus.PAID;
  else if (status_code == -2) status = paymentStatus.FAILED;
  else status = paymentStatus.PENDING;

  // Update payment record
  const updatedPayment = await repository.updateOne(
    PaymentModel,
    { order_id: new mongoose.Types.ObjectId(order_id) },
    {
      paymentStatus: status,
      payhere_payment_id: payment_id,
      method,
      status_message,
    },
    { new: true }
  );

  // Update main order
  const orderUpdateData = {
    paymentStatus: status,
  };

  // If payment failed, cancel the order
  if (status === paymentStatus.FAILED) {
    orderUpdateData.orderStatus = orderStatus.CANCELLED;
  }

  await repository.updateOne(
    OrderModel,
    { _id: new mongoose.Types.ObjectId(order_id) },
    orderUpdateData,
    { new: true }
  );

  // Update all sub orders
  const subOrderUpdateData = {};
  
  if (status === paymentStatus.PAID) {
    // Payment successful: keep sub orders as pending, set seller payment to held
    // Sub-orders remain pending until seller manually updates them
    subOrderUpdateData.seller_payment_status = sellerPaymentStatus.HELD;
  } else if (status === paymentStatus.FAILED) {
    // Payment failed: cancel sub orders, keep seller payment as pending
    subOrderUpdateData.orderStatus = subOrderStatus.CANCELLED;
    // seller_payment_status remains pending (no update needed)
  }

  // Only update sub orders if we have data to update
  if (Object.keys(subOrderUpdateData).length > 0) {
    await repository.updateMany(
      SubOrderModel,
      { main_order_id: new mongoose.Types.ObjectId(order_id) },
      subOrderUpdateData,
      { new: true }
    );
  }

  return updatedPayment;
};
