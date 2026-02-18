/**
 * Payout limits configuration.
 */
const payoutConfig = Object.freeze({
  /** Minimum amount (in LKR) a seller can request per payout */
  MIN_PAYOUT_AMOUNT: 500,
  /** Maximum total amount (in LKR) a seller can request per calendar day (UTC). Only PENDING and APPROVED requests count. */
  MAX_DAILY_PAYOUT_AMOUNT: 5000,
});

module.exports = {
  payoutConfig,
};
