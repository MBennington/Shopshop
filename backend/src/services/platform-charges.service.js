const { platformCharges } = require('../config/platform-charges.config');

/**
 * Calculate platform charges for a given subtotal and role
 * 
 * @param {Number} subtotal - The subtotal amount to calculate fees on
 * @param {String} role - 'buyer' or 'seller'
 * @param {Object} options - Additional options (shippingFee, paymentMethod, etc.)
 * @returns {Object} - Breakdown of all charges and totals
 * 
 * Structure:
 * {
 *   charges: {
 *     transaction_fee: 25.50,
 *     platform_fee: 0,
 *     ...
 *   },
 *   chargesBreakdown: [
 *     { name: 'transaction_fee', amount: 25.50, description: '...', type: 'percentage' },
 *     ...
 *   ],
 *   totalCharges: 25.50,
 *   finalTotal: 1025.50
 * }
 */
const calculatePlatformCharges = (subtotal, role, options = {}) => {
  const { shippingFee = 0 } = options;
  const charges = {};
  const chargesBreakdown = [];
  let totalCharges = 0;

  // Iterate through all fee types in config
  Object.keys(platformCharges).forEach((feeKey) => {
    // Skip shipping_fee as it's handled separately
    if (feeKey === 'shipping_fee') {
      return;
    }

    const feeConfig = platformCharges[feeKey];
    
    // Check if this fee applies to the given role
    if (!feeConfig[role]) {
      return; // This fee doesn't apply to this role
    }

    const roleFeeConfig = feeConfig[role];
    
    // Validate fee configuration
    if (!roleFeeConfig.type || roleFeeConfig.value === undefined) {
      console.warn(`Invalid fee configuration for ${feeKey}.${role}`);
      return;
    }

    let feeAmount = 0;

    try {
      // Calculate based on fee type
      if (roleFeeConfig.type === 'percentage') {
        feeAmount = subtotal * roleFeeConfig.value;
        
        // Apply conditions if specified
        if (roleFeeConfig.conditions) {
          if (roleFeeConfig.conditions.min !== undefined && subtotal < roleFeeConfig.conditions.min) {
            feeAmount = 0; // Fee doesn't apply below minimum
          }
          if (roleFeeConfig.conditions.max !== undefined) {
            feeAmount = Math.min(feeAmount, roleFeeConfig.conditions.max); // Cap at maximum
          }
          if (roleFeeConfig.conditions.freeAbove !== undefined && subtotal >= roleFeeConfig.conditions.freeAbove) {
            feeAmount = 0; // Free above threshold
          }
        }
      } else if (roleFeeConfig.type === 'fixed') {
        feeAmount = roleFeeConfig.value;
        
        // Apply conditions if specified
        if (roleFeeConfig.conditions) {
          if (roleFeeConfig.conditions.min !== undefined && subtotal < roleFeeConfig.conditions.min) {
            feeAmount = 0; // Fee doesn't apply below minimum
          }
        }
      } else {
        console.warn(`Unknown fee type '${roleFeeConfig.type}' for ${feeKey}.${role}`);
        return;
      }

      // Round to 2 decimal places
      feeAmount = Math.round(feeAmount * 100) / 100;

      // Only include non-zero fees
      if (feeAmount > 0) {
        charges[feeKey] = feeAmount;
        totalCharges += feeAmount;
        
        chargesBreakdown.push({
          name: feeKey,
          amount: feeAmount,
          description: roleFeeConfig.description || feeKey.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          type: roleFeeConfig.type,
          value: roleFeeConfig.value,
        });
      }
    } catch (error) {
      console.error(`Error calculating fee ${feeKey}.${role}:`, error);
      // Continue with other fees even if one fails
    }
  });

  // Calculate final total (subtotal + shipping + all charges)
  const finalTotal = subtotal + shippingFee + totalCharges;

  return {
    charges, // Object with fee names as keys and amounts as values
    chargesBreakdown, // Array with detailed breakdown
    totalCharges,
    subtotal,
    shippingFee,
    finalTotal,
  };
};

/**
 * Get all configured fees for a role (for display purposes)
 * 
 * @param {String} role - 'buyer' or 'seller'
 * @returns {Array} - List of fee configurations
 */
const getConfiguredFees = (role) => {
  const fees = [];
  
  Object.keys(platformCharges).forEach((feeKey) => {
    if (feeKey === 'shipping_fee') {
      return;
    }
    
    const feeConfig = platformCharges[feeKey];
    if (feeConfig[role]) {
      fees.push({
        name: feeKey,
        ...feeConfig[role],
      });
    }
  });
  
  return fees;
};

module.exports = {
  calculatePlatformCharges,
  getConfiguredFees,
};


