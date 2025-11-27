const giftCardStatus = Object.freeze({
  ACTIVE: 'active',
  EXPIRED: 'expired',
  FULLY_REDEEMED: 'fully_redeemed',
  CANCELLED: 'cancelled',
});

const giftCardConfig = Object.freeze({
  MIN_AMOUNT: 500,
  MAX_AMOUNT: 50000,
  EXPIRY_DAYS: 365, // 1 year
  CODE_PREFIX: 'GC',
  CODE_LENGTH: 12, // After prefix, total will be GC-XXXX-XXXX-XXXX
  ACCEPTANCE_TOKEN_EXPIRY_DAYS: 7, // Token expires in 7 days
});

module.exports = {
  giftCardStatus,
  giftCardConfig,
};

