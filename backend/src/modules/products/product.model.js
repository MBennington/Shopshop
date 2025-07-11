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
    sizes: {
      type: [String],
      enum: sizes,
      default: [],
    },
    colors: [
      {
        colorCode: { type: String, required: true },
        images: [{ type: String }],
      },
    ],
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
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

productSchema.index({ name: 1 });

module.exports = mongoose.model('product', productSchema);
