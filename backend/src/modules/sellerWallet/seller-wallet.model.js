const mongoose = require('mongoose');
const { Schema } = mongoose;

const sellerWalletSchema = new Schema(
  {
    seller_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
      required: true,
    },

    available_balance: {
      type: Number,
      default: 0,
    },

    pending_balance: {
      type: Number,
      default: 0,
    },

    total_earned: {
      type: Number,
      default: 0,
    },

    total_withdrawn: {
      type: Number,
      default: 0,
    },

    currency: {
      type: String,
      default: 'LKR',
    },
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  }
);

module.exports = mongoose.model('seller-wallet', sellerWalletSchema);
