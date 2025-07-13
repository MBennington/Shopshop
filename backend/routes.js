const router = require('express').Router();

router.use('/users', require('./src/modules/users/user.router'));
router.use('/products', require('./src/modules/products/product.router'));

module.exports = router;
