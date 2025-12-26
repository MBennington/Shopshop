// Following the same pattern as order.config.js
const subOrderStatus = Object.freeze({
  PENDING: 'pending',
  PROCESSING: 'processing',
  PACKED: 'packed',
  DISPATCHED: 'dispatched',
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

// Auto-confirm delivery threshold (in days)
// Can be overridden via environment variable AUTO_CONFIRM_DELIVERY_THRESHOLD_DAYS
const AUTO_CONFIRM_DELIVERY_THRESHOLD_DAYS = process.env.AUTO_CONFIRM_DELIVERY_THRESHOLD_DAYS
  ? parseInt(process.env.AUTO_CONFIRM_DELIVERY_THRESHOLD_DAYS, 10)
  : 7; // Default 7 days

module.exports = {
  subOrderStatus,
  sellerPaymentStatus,
  deliveryStatus,
  AUTO_CONFIRM_DELIVERY_THRESHOLD_DAYS,
};
