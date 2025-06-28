const mongoose = require("mongoose");
const { Schema } = mongoose;
const {categories} = require("../../config/category.config");

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
      type: String,
      required: true,
    },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  }
);

productSchema.index({ name: 1 });

module.exports = mongoose.model("product", productSchema);