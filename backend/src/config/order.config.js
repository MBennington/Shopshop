const orderStatus = Object.freeze({
  PENDING: 'Pending',
  PAID: 'Paid',
  SHIPPED: 'Shipped',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
  RETURNED: 'Returned',
});

const paymentStatus = Object.freeze({
  PENDING: 'Pending',
  PAID: 'Paid',
  FAILED: 'Failed',
  REFUNDED: 'Refunded',
});

const paymentMethod = Object.freeze({
  COD: 'CashOnDelivery',
  CARD: 'Card',
  PAYPAL: 'PayPal',
  STRIPE: 'Stripe',
});

module.exports = {
  orderStatus,
  paymentStatus,
  paymentMethod,
  userRoles,
  categories,
  sizes,
};
