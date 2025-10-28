// Following the same pattern as order.config.js
const subOrderStatus = Object.freeze({
  PENDING: 'pending',
  PROCESSING: 'processing', 
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
});

const sellerPaymentStatus = Object.freeze({
  PENDING: 'pending',
  HELD: 'held',
  RELEASED: 'released',
  REFUNDED: 'refunded',
});

const deliveryStatus = Object.freeze({
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  DISPUTED: 'disputed',
});

module.exports = {
  subOrderStatus,
  sellerPaymentStatus,
  deliveryStatus,
};
