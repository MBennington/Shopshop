const router = require('express').Router();

router.use('/users', require('./src/modules/users/user.router'));
router.use('/products', require('./src/modules/products/product.router'));
router.use('/reviews', require('./src/modules/reviews/review.router'));
router.use('/cart', require('./src/modules/cart/cart.router'));
router.use('/order', require('./src/modules/order/order.router'));
router.use('/payment', require('./src/modules/payment/payment.router'));

module.exports = router;
