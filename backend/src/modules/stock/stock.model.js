const mongoose = require('mongoose');
const { Schema } = mongoose;

const stockSchema = new Schema(
  {
    product_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'product',
      required: true,
      unique: true,
    },
    seller_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
      required: true,
    },
    sales_count: {
      type: Number,
      default: 0,
      min: 0,
    },
    salesCountByColor: [
      {
        colorCode: {
          type: String,
          required: true,
        },
        colorName: {
          type: String,
          required: true,
        },
        // For products without sizes
        salesCount: {
          type: Number,
          default: 0,
          min: 0,
        },
        // For products with sizes
        sizes: [
          {
            size: {
              type: String,
              required: true,
            },
            salesCount: {
              type: Number,
              default: 0,
              min: 0,
            },
          },
        ],
      },
    ],
    total_earnings: {
      type: Number,
      default: 0,
      min: 0,
    },
    // Inventory tracking - Initial stock by color and size
    initial_stock_by_color: [
      {
        colorCode: {
          type: String,
          required: true,
        },
        colorName: {
          type: String,
          required: true,
        },
        // For products without sizes
        initialStock: {
          type: Number,
          default: 0,
          min: 0,
        },
        // For products with sizes
        sizes: [
          {
            size: {
              type: String,
              required: true,
            },
            initialStock: {
              type: Number,
              default: 0,
              min: 0,
            },
          },
        ],
      },
    ],
    // Available stock by color and size
    available_stock_by_color: [
      {
        colorCode: {
          type: String,
          required: true,
        },
        colorName: {
          type: String,
          required: true,
        },
        // For products without sizes
        availableStock: {
          type: Number,
          default: 0,
          min: 0,
        },
        // For products with sizes
        sizes: [
          {
            size: {
              type: String,
              required: true,
            },
            availableStock: {
              type: Number,
              default: 0,
              min: 0,
            },
          },
        ],
      },
    ],
    // Reserved stock by color and size
    reserved_stock_by_color: [
      {
        colorCode: {
          type: String,
          required: true,
        },
        colorName: {
          type: String,
          required: true,
        },
        // For products without sizes
        reservedStock: {
          type: Number,
          default: 0,
          min: 0,
        },
        // For products with sizes
        sizes: [
          {
            size: {
              type: String,
              required: true,
            },
            reservedStock: {
              type: Number,
              default: 0,
              min: 0,
            },
          },
        ],
      },
    ],
    // Restock history
    restock_history: [
      {
        date: {
          type: Date,
          default: Date.now,
        },
        quantity: {
          type: Number,
          required: true,
          min: 0,
        },
        colorCode: {
          type: String,
          required: true,
        },
        size: {
          type: String,
          default: null,
        },
        notes: {
          type: String,
          default: null,
        },
      },
    ],
    last_restocked_date: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  }
);

stockSchema.index({ product_id: 1 }, { unique: true });
stockSchema.index({ seller_id: 1 });
stockSchema.index({ sales_count: -1 });
stockSchema.index({ total_earnings: -1 });
stockSchema.index({ seller_id: 1, sales_count: -1 });

module.exports = mongoose.model('stock', stockSchema);
