const PaymentModel = require('./payment.model');
const repository = require('../../services/repository.service');
const { paymentStatus, paymentMethod, orderStatus } = require('../../config/order.config');
const { subOrderStatus, sellerPaymentStatus } = require('../../config/suborder.config');
const orderService = require('../order/order.service');
const OrderModel = require('../order/order.model');
const SubOrderModel = require('../subOrder/suborder.model');
const Cart = require('../cart/cart.model');
const stockService = require('../../services/stock.service');
const giftCardService = require('../giftcard/giftcard.service');
const emailService = require('../../services/email.service');
const emailTemplateService = require('../../services/email-template.service');
const sellerWalletService = require('../sellerWallet/seller-wallet.service');
const subOrderService = require('../subOrder/suborder.service');
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

  if (payment_method === paymentMethod.COD || payment_method === paymentMethod.GIFT_CARD) {
    // For COD or gift card, handle order processing
    if (payment_method === paymentMethod.GIFT_CARD) {
      // Update payment record to PAID
      await repository.updateOne(
        PaymentModel,
        { _id: newPayment._id },
        { paymentStatus: paymentStatus.PAID },
        { new: true }
      );

      // Update the main order status to pending (sellers will update it)
      await repository.updateOne(
        OrderModel,
        { _id: order_id },
        { paymentStatus: paymentStatus.PAID, orderStatus: orderStatus.PENDING },
        { new: true }
      );

      // Update sub-orders: set seller payment to HELD (payment received but held)
      await repository.updateMany(
        SubOrderModel,
        { main_order_id: order_id },
        { seller_payment_status: sellerPaymentStatus.HELD },
        { new: true }
      );

      // Add seller share to pending balance for gift card payments
      try {
        const subOrders = await SubOrderModel.find({
          main_order_id: order_id,
        }).lean();

        if (subOrders && subOrders.length > 0) {
          // Group by seller and sum their finalTotal
          const sellerAmounts = {};
          for (const subOrder of subOrders) {
            const sellerId = subOrder.seller_id.toString();
            if (!sellerAmounts[sellerId]) {
              sellerAmounts[sellerId] = 0;
            }
            sellerAmounts[sellerId] += subOrder.finalTotal || 0;
          }

          // Add to pending balance for each seller
          for (const [sellerId, amount] of Object.entries(sellerAmounts)) {
            if (amount > 0) {
              try {
                await sellerWalletService.addToPendingBalance(sellerId, amount);
                console.log(`Added ${amount} to pending balance for seller ${sellerId} (gift card payment)`);
              } catch (error) {
                console.error(`Error adding to pending balance for seller ${sellerId}:`, error);
              }
            }
          }
        }
      } catch (error) {
        console.error('Error updating seller wallets for gift card payment:', error);
      }
    } else if (payment_method === paymentMethod.COD) {
      // For COD, order is accepted but payment is pending
      // Set order status to pending (sellers will update it)
      await repository.updateOne(
        OrderModel,
        { _id: order_id },
        { orderStatus: orderStatus.PENDING },
        { new: true }
      );
    }

    // For both COD and GIFT_CARD: Deduct stock and clear cart immediately
    // (Order is confirmed, so items should be reserved and cart cleared)
    const order = await repository.findOne(OrderModel, { _id: order_id });
    if (order && order.user_id) {
      try {
        await stockService.deductStock(order_id);
      } catch (error) {
        console.error('Error deducting stock after order creation:', error);
      }

      try {
        await repository.updateOne(
          Cart,
          { user_id: order.user_id },
          { products_list: [], total: 0 },
          { new: true }
        );
      } catch (error) {
        console.error('Error clearing cart after order creation:', error);
      }

      // Send order success email to buyer
      try {
        const order = await repository.findOne(OrderModel, { _id: order_id })
          .populate('user_id', 'name email')
          .lean();
        
        if (order && order.user_id) {
          // Get sub-orders for the email
          const subOrderService = require('../subOrder/suborder.service');
          const subOrders = await subOrderService.getSubOrdersByMainOrder(order_id);
          
          const orderWithSubOrders = {
            ...order,
            sub_orders_details: subOrders,
          };

          const emailTemplate = emailTemplateService.generateOrderSuccessEmail(orderWithSubOrders);
          await emailService.sendEmail({
            to: order.user_id.email,
            subject: emailTemplate.subject,
            html: emailTemplate.html,
          });
        }
      } catch (error) {
        console.error('Error sending order success email:', error);
        // Don't fail the operation if email fails
      }
    }

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

  // Get current order to check its status
  const currentOrder = await repository.findOne(OrderModel, {
    _id: new mongoose.Types.ObjectId(order_id),
  });

  // Check if sub-orders were previously cancelled (for retry scenario)
  const existingSubOrders = await SubOrderModel.find({
    main_order_id: new mongoose.Types.ObjectId(order_id),
  }).lean();
  const hasCancelledSubOrders = existingSubOrders.some(
    (so) => so.orderStatus === subOrderStatus.CANCELLED
  );

  // Update main order
  const orderUpdateData = {
    paymentStatus: status,
  };

  // If payment failed, cancel the order
  if (status === paymentStatus.FAILED) {
    orderUpdateData.orderStatus = orderStatus.CANCELLED;
  } else if (status === paymentStatus.PAID) {
    // If payment succeeds and order was previously cancelled (retry scenario), restore it
    if (currentOrder && currentOrder.orderStatus === orderStatus.CANCELLED) {
      // Validate stock availability again for retry scenario
      // Stock might have been sold to someone else between first attempt and retry
      if (currentOrder.products_list && currentOrder.products_list.length > 0) {
        const stockValidation = await stockService.validateStockAvailability(
          currentOrder.products_list
        );
        if (stockValidation.isValid) {
          orderUpdateData.orderStatus = orderStatus.PENDING;
        } else {
          // Stock no longer available, keep order cancelled
          console.error(
            `Stock validation failed for retry order ${order_id}:`,
            stockValidation.errors
          );
          // Order remains cancelled, payment will be refunded or handled separately
          orderUpdateData.orderStatus = orderStatus.CANCELLED;
        }
      } else {
        orderUpdateData.orderStatus = orderStatus.PENDING;
      }
    }
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
    
    // If sub-orders were previously cancelled (retry scenario), restore them to pending
    if (hasCancelledSubOrders) {
      subOrderUpdateData.orderStatus = subOrderStatus.PENDING;
    }
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

    // Sync main order status with sub-orders after status update
    if (subOrderUpdateData.orderStatus) {
      await subOrderService.syncMainOrderStatusWithSubOrders(order_id);
    }
  }

  // Add seller share to pending balance when payment is successful
  if (status === paymentStatus.PAID) {
    try {
      const subOrders = await SubOrderModel.find({
        main_order_id: new mongoose.Types.ObjectId(order_id),
      }).lean();

      if (subOrders && subOrders.length > 0) {
        // Group by seller and sum their finalTotal
        const sellerAmounts = {};
        for (const subOrder of subOrders) {
          const sellerId = subOrder.seller_id.toString();
          if (!sellerAmounts[sellerId]) {
            sellerAmounts[sellerId] = 0;
          }
          sellerAmounts[sellerId] += subOrder.finalTotal || 0;
        }

        // Add to pending balance for each seller
        for (const [sellerId, amount] of Object.entries(sellerAmounts)) {
          if (amount > 0) {
            try {
              await sellerWalletService.addToPendingBalance(sellerId, amount);
              console.log(`Added ${amount} to pending balance for seller ${sellerId}`);
            } catch (error) {
              console.error(`Error adding to pending balance for seller ${sellerId}:`, error);
              // Don't fail the payment update if wallet update fails
            }
          }
        }
      }
    } catch (error) {
      console.error('Error updating seller wallets after payment:', error);
      // Don't fail the payment update if wallet update fails
    }
  }

  // Deduct stock and clear cart only if payment is successful and order is valid
  if (status === paymentStatus.PAID) {
    try {
      // Get the updated order to check final status
      const order = await repository.findOne(OrderModel, {
        _id: new mongoose.Types.ObjectId(order_id),
      });

      if (order && order.user_id) {
        // Only deduct stock if order is not cancelled (retry validation might have failed)
        if (order.orderStatus !== orderStatus.CANCELLED) {
          // Apply gift cards for online payments (they were deferred until payment success)
          if (order.giftCardCodes && order.giftCardCodes.length > 0 && order.giftCards && order.giftCards.length > 0) {
            try {
              // Get shipping fees from sub-orders
              const subOrders = await SubOrderModel.find({
                main_order_id: new mongoose.Types.ObjectId(order_id),
              }).lean();
              
              const totalShippingFee = subOrders.reduce((sum, so) => sum + (so.shipping_fee || 0), 0);
              
              // Calculate order total before gift card discount (products + shipping + platform fees)
              const orderTotalBeforeGiftCard = (order.totalPrice || 0) + totalShippingFee +
                (order.platformChargesObject ? Object.values(order.platformChargesObject).reduce((sum, fee) => sum + (fee || 0), 0) : 0);
              
              let remainingOrderTotalForGiftCards = orderTotalBeforeGiftCard;
              
              // Apply each gift card
              for (let i = 0; i < order.giftCardCodes.length; i++) {
                const giftCardCodeData = order.giftCardCodes[i];
                const giftCardInfo = order.giftCards.find((gc) => gc.code === giftCardCodeData.code);
                
                if (giftCardInfo && remainingOrderTotalForGiftCards > 0) {
                  try {
                    await giftCardService.applyGiftCardToOrder(
                      giftCardCodeData.code,
                      remainingOrderTotalForGiftCards,
                      order.user_id.toString(),
                      order_id
                    );
                    
                    // Update remaining order total for next gift card
                    remainingOrderTotalForGiftCards -= giftCardInfo.amountApplied;
                    if (remainingOrderTotalForGiftCards <= 0) {
                      break;
                    }
                  } catch (error) {
                    console.error(`Error applying gift card ${giftCardCodeData.code} after payment:`, error);
                  }
                }
              }
              
              // Clear gift card codes from order after applying (for security)
              await repository.updateOne(
                OrderModel,
                { _id: new mongoose.Types.ObjectId(order_id) },
                { giftCardCodes: [] },
                { new: true }
              );
            } catch (error) {
              console.error('Error applying gift cards after payment success:', error);
            }
          }
          // Deduct stock from products
          try {
            await stockService.deductStock(order_id);
          } catch (error) {
            // Log error but don't fail the payment update
            console.error('Error deducting stock after payment:', error);
          }

          // Clear the entire cart - all items should be ordered together
          await repository.updateOne(
            Cart,
            { user_id: order.user_id },
            {
              products_list: [],
              total: 0,
            },
            { new: true }
          );

          // Send order success email to buyer
          try {
            const orderWithUser = await repository.findOne(OrderModel, {
              _id: new mongoose.Types.ObjectId(order_id),
            })
              .populate('user_id', 'name email')
              .lean();
            
            if (orderWithUser && orderWithUser.user_id) {
              // Get sub-orders for the email
              const subOrders = await subOrderService.getSubOrdersByMainOrder(order_id);
              
              const orderWithSubOrders = {
                ...orderWithUser,
                sub_orders_details: subOrders,
              };

              const emailTemplate = emailTemplateService.generateOrderSuccessEmail(orderWithSubOrders);
              await emailService.sendEmail({
                to: orderWithUser.user_id.email,
                subject: emailTemplate.subject,
                html: emailTemplate.html,
              });
            }
          } catch (error) {
            console.error('Error sending order success email:', error);
            // Don't fail the operation if email fails
          }
        } else {
          console.warn(
            `Order ${order_id} payment succeeded but order remains cancelled due to stock unavailability`
          );
        }
      }
    } catch (error) {
      // Log error but don't fail the payment update
      console.error('Error processing post-payment actions:', error);
    }
  }

  return updatedPayment;
};
