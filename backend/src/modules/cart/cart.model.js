const mongoose = require('mongoose');
const { Schema } = mongoose;
const { sizes } = require('../../config/sizes.config');

const productsListSchema = new mongoose.Schema({
  product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  quantity: { type: Number, required: true },
  color: { type: String },
  size: { type: String, enum: sizes },
  subtotal: { type: Number },
});

const cartSchema = new Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
      required: true,
    },
    products_list: [productListSchema],
    total: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  }
);

cartSchema.index({ user_id: 1 });
cartSchema.index({ 'productList.product_id': 1 });

module.exports = mongoose.model('cart', cartSchema);
