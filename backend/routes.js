const router = require('express').Router();

router.use('/users', require('./src/modules/users/user.router'));
router.use('/products', require('./src/modules/products/product.router'));
router.use('/reviews', require('./src/modules/reviews/review.router'));
router.use('/cart', require('./src/modules/cart/cart.router'));
router.use('/order', require('./src/modules/order/order.router'));
router.use('/suborder', require('./src/modules/subOrder/suborder.router'));
router.use('/payment', require('./src/modules/payment/payment.router'));
router.use('/gift-cards', require('./src/modules/giftcard/giftcard.router'));
router.use('/config/platform-charges', require('./src/modules/platformCharges/platformCharges.router'));
router.use('/seller-wallet', require('./src/modules/sellerWallet/seller-wallet.router'));
router.use('/payout', require('./src/modules/payout/payout.router'));
router.use('/admin', require('./src/modules/admin/admin.router'));

module.exports = router;
