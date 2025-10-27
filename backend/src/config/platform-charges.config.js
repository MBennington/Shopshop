const platformCharges = Object.freeze({
  transaction_fee: {
    buyer: 0.025, // 2.5% transaction fee for buyers
    seller: 0.03,  // 3% transaction fee for sellers
  },
  platform_fee: {
    buyer: 0,      // No platform fee for buyers currently
    seller: 0.01,  // 1% platform fee for sellers
  },
  shipping_fee: {
    default: 100,  // Default shipping fee in LKR
    free_threshold: 5000, // Free shipping above this amount
  },
});

module.exports = {
  platformCharges,
};
