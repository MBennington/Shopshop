const orderStatus = Object.freeze({
  PENDING: 'pending',
  PROCESSING: 'processing',
  PACKED: 'packed',
  DISPATCHED: 'dispatched',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
  RETURNED: 'returned',
});

const paymentStatus = Object.freeze({
  PENDING: 'Pending',
  PAID: 'Paid',
  FAILED: 'Failed',
  REFUNDED: 'Refunded',
});

const paymentMethod = Object.freeze({
  COD: 'cod',
  CARD: 'card',
  PAYPAL: 'PayPal',
  STRIPE: 'Stripe',
});

module.exports = {
  orderStatus,
  paymentStatus,
  paymentMethod,
};
