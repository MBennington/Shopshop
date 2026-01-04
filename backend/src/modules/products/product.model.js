const mongoose = require('mongoose');
const { Schema } = mongoose;
const { categories } = require('../../config/category.config');
const { sizes } = require('../../config/sizes.config');

const productSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      enum: Object.values(categories),
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    hasSizes: {
      type: Boolean,
      default: false,
    },
    colors: [
      {
        colorCode: { type: String, required: true },
        colorName: { type: String, required: true },
        images: [{ type: String }],
        // For products with sizes
        sizes: [
          {
            size: { type: String, enum: sizes },
            quantity: { type: Number, default: 0 },
          },
        ],
        // For products without sizes
        quantity: { type: Number, default: 0 },
      },
    ],
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    salesCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  }
);

productSchema.index({ name: 1 });
productSchema.index({ salesCount: -1 }); // Index for best sellers queries

module.exports = mongoose.model('product', productSchema);
