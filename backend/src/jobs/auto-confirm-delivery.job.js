const SubOrderModel = require('../modules/subOrder/suborder.model');
const subOrderService = require('../modules/subOrder/suborder.service');
const {
  deliveryStatus,
  AUTO_CONFIRM_DELIVERY_THRESHOLD_DAYS,
} = require('../config/suborder.config');

/**
 * Auto-Confirm Delivery Cron Job
 * 
 * This job checks for suborders where:
 * - delivery_status is 'pending'
 * - seller_marked_as_delivered is true
 * - seller_marked_as_delivered_at is at least AUTO_CONFIRM_DELIVERY_THRESHOLD_DAYS ago
 * 
 * For eligible suborders, it automatically confirms delivery and updates
 * the order status, following the same flow as buyer confirmation.
 */
const run = async () => {
  try {
    console.log(
      `[Cron Job] Auto-confirm delivery job started at ${new Date().toISOString()}`
    );

    // Calculate threshold date
    const thresholdDate = new Date();
    thresholdDate.setDate(
      thresholdDate.getDate() - AUTO_CONFIRM_DELIVERY_THRESHOLD_DAYS
    );

    // Find eligible suborders
    // Conditions:
    // 1. delivery_status is 'pending'
    // 2. seller_marked_as_delivered is true
    // 3. seller_marked_as_delivered_at exists and is <= thresholdDate
    const eligibleSubOrders = await SubOrderModel.find({
      delivery_status: deliveryStatus.PENDING,
      seller_marked_as_delivered: true,
      seller_marked_as_delivered_at: {
        $exists: true,
        $ne: null,
        $lte: thresholdDate,
      },
    })
      .select('_id seller_marked_as_delivered_at')
      .lean();

    console.log(
      `[Cron Job] Found ${eligibleSubOrders.length} eligible suborder(s) for auto-confirmation`
    );

    if (eligibleSubOrders.length === 0) {
      console.log(
        `[Cron Job] Auto-confirm delivery job completed - no eligible suborders`
      );
      return;
    }

    // Process each suborder
    let successCount = 0;
    let failureCount = 0;
    const failedSubOrderIds = [];

    for (const subOrder of eligibleSubOrders) {
      try {
        const result = await subOrderService.autoConfirmDeliveryAfterThreshold(
          subOrder._id.toString()
        );

        if (result) {
          successCount++;
          console.log(
            `[Cron Job] Successfully auto-confirmed delivery for suborder ${subOrder._id}`
          );
        } else {
          // Suborder didn't meet conditions (might have been updated concurrently)
          console.log(
            `[Cron Job] Skipped suborder ${subOrder._id} - conditions not met`
          );
        }
      } catch (error) {
        failureCount++;
        failedSubOrderIds.push(subOrder._id.toString());
        console.error(
          `[Cron Job] Failed to auto-confirm delivery for suborder ${subOrder._id}:`,
          error.message
        );
        // Continue processing other suborders even if one fails
      }
    }

    console.log(
      `[Cron Job] Auto-confirm delivery job completed at ${new Date().toISOString()}`
    );
    console.log(
      `[Cron Job] Summary: ${successCount} succeeded, ${failureCount} failed`
    );

    if (failedSubOrderIds.length > 0) {
      console.log(
        `[Cron Job] Failed suborder IDs: ${failedSubOrderIds.join(', ')}`
      );
    }
  } catch (error) {
    console.error(`[Cron Job] Auto-confirm delivery job failed:`, error);
    // Don't throw - let the cron scheduler continue
  }
};

module.exports = {
  run,
};

