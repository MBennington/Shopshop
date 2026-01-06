const mongoose = require('mongoose');
const { Schema } = mongoose;

const wishlistItemSchema = new mongoose.Schema({
  product_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'product',
    required: true,
  },
  color_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  added_at: {
    type: Date,
    default: Date.now,
  },
});

const wishlistSchema = new Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
      required: true,
      unique: true,
    },
    items: [wishlistItemSchema],
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  }
);

wishlistSchema.index({ user_id: 1 });
wishlistSchema.index({ 'items.product_id': 1 });
wishlistSchema.index({ 'items.product_id': 1, 'items.color_id': 1 });

module.exports = mongoose.model('wishlist', wishlistSchema);
