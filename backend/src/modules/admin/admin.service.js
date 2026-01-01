const UserModel = require('../users/user.model');
const OrderModel = require('../order/order.model');
const ProductModel = require('../products/product.model');
const PayoutModel = require('../payout/payout.model');
const PaymentModel = require('../payment/payment.model');
const { roles } = require('../../config/role.config');
const { paymentStatus } = require('../../config/order.config');
const mongoose = require('mongoose');

/**
 * Get admin dashboard statistics
 * @returns {Promise<Object>}
 */
module.exports.getDashboardStats = async () => {
  try {
    // Get user counts
    const [totalUsers, totalBuyers, totalSellers, totalAdmins] = await Promise.all([
      UserModel.countDocuments(),
      UserModel.countDocuments({ role: roles.buyer }),
      UserModel.countDocuments({ role: roles.seller }),
      UserModel.countDocuments({ role: roles.admin }),
    ]);

    // Get order counts and revenue
    const now = new Date();
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);
    
    const weekStart = new Date(now);
    weekStart.setDate(weekStart.getDate() - 7);
    
    const monthStart = new Date(now);
    monthStart.setMonth(monthStart.getMonth() - 1);

    // Total orders
    const totalOrders = await OrderModel.countDocuments();

    // Today's orders
    const todayOrders = await OrderModel.countDocuments({
      created_at: { $gte: todayStart },
    });

    // This week's orders
    const weekOrders = await OrderModel.countDocuments({
      created_at: { $gte: weekStart },
    });

    // This month's orders
    const monthOrders = await OrderModel.countDocuments({
      created_at: { $gte: monthStart },
    });

    // Calculate revenue from payments
    const allPayments = await PaymentModel.find({
      paymentStatus: paymentStatus.PAID,
    }).lean();

    const totalRevenue = allPayments.reduce((sum, p) => sum + (p.amount || 0), 0);

    // Today's revenue
    const todayPayments = await PaymentModel.find({
      paymentStatus: paymentStatus.PAID,
      created_at: { $gte: todayStart },
    }).lean();
    const todayRevenue = todayPayments.reduce((sum, p) => sum + (p.amount || 0), 0);

    // This week's revenue
    const weekPayments = await PaymentModel.find({
      paymentStatus: paymentStatus.PAID,
      created_at: { $gte: weekStart },
    }).lean();
    const weekRevenue = weekPayments.reduce((sum, p) => sum + (p.amount || 0), 0);

    // This month's revenue
    const monthPayments = await PaymentModel.find({
      paymentStatus: paymentStatus.PAID,
      created_at: { $gte: monthStart },
    }).lean();
    const monthRevenue = monthPayments.reduce((sum, p) => sum + (p.amount || 0), 0);

    // Get pending payouts
    const pendingPayouts = await PayoutModel.find({ status: 'PENDING' }).lean();
    const pendingPayoutCount = pendingPayouts.length;
    const pendingPayoutAmount = pendingPayouts.reduce((sum, p) => sum + (p.amount_requested || 0), 0);

    // Get active products
    const activeProducts = await ProductModel.countDocuments({ isActive: { $ne: false } });

    // Calculate platform revenue (platform charges from orders)
    // This is a simplified calculation - you may need to adjust based on your platform charges structure
    const ordersWithCharges = await OrderModel.find({
      platformChargesObject: { $exists: true, $ne: {} },
    }).lean();

    let platformRevenue = 0;
    ordersWithCharges.forEach((order) => {
      if (order.platformChargesObject) {
        const charges = Object.values(order.platformChargesObject);
        platformRevenue += charges.reduce((sum, charge) => sum + (charge || 0), 0);
      }
    });

    return {
      totalUsers,
      totalBuyers,
      totalSellers,
      totalAdmins,
      totalOrders,
      totalRevenue,
      pendingPayouts: pendingPayoutCount,
      pendingPayoutAmount,
      activeProducts,
      platformRevenue,
      todayOrders,
      todayRevenue,
      weekOrders,
      weekRevenue,
      monthOrders,
      monthRevenue,
    };
  } catch (error) {
    console.error('Error getting dashboard stats:', error);
    throw new Error('Failed to fetch dashboard statistics');
  }
};

