/**
 * Platform Charges Configuration
 *
 * Structure:
 * - Each fee type has a unique key (e.g., 'transaction_fee', 'platform_fee')
 * - Each fee can have buyer and/or seller configurations
 * - Calculation types: 'percentage' (0.025 = 2.5%) or 'fixed' (amount in LKR)
 * - Optional conditions: min, max, freeAbove (for conditional fees)
 *
 * To add a new fee type:
 * 1. Add a new key to this object
 * 2. Define buyer and/or seller configuration
 * 3. The calculation service will automatically include it
 */
const platformCharges = Object.freeze({
  transaction_fee: {
    buyer: {
      type: 'percentage',
      value: 0.025, // 2.5% transaction fee for buyers
      description: 'Transaction processing fee',
    },
    seller: {
      type: 'percentage',
      value: 0.03, // 3% transaction fee for sellers
      description: 'Transaction processing fee',
    },
  },
  platform_fee: {
    buyer: {
      type: 'percentage',
      value: 0.01, // 1% platform fee for buyers currently
      description: 'Platform service fee',
    },
    seller: {
      type: 'percentage',
      value: 0.01, // 1% platform fee for sellers
      description: 'Platform service fee',
    },
  },
  // Example: Future fee types can be added here
  // service_fee: {
  //   buyer: {
  //     type: 'fixed',
  //     value: 50,
  //     description: 'Service handling fee',
  //     conditions: {
  //       min: 0, // Minimum subtotal to apply
  //       max: null, // Maximum fee cap (null = no cap)
  //     },
  //   },
  // },
  shipping_fee: {
    default: 100, // Default shipping fee in LKR
    free_threshold: 5000, // Free shipping above this amount (optional feature)
  },
});

module.exports = {
  platformCharges,
};
