const mongoose = require('mongoose');
const { Schema } = mongoose;

const payoutSchema = new Schema(
  {
    seller_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
      required: true,
    },

    amount_requested: {
      type: Number,
      required: true,
    },

    amount_paid: {
      type: Number,
      default: 0,
    },

    currency: {
      type: String,
      default: 'LKR',
    },

    status: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'PAID', 'REJECTED', 'FAILED', 'CANCELLED'],
      default: 'PENDING',
    },

    method: {
      type: String,
      enum: ['BANK_TRANSFER', 'PAYHERE_PAYOUT'],
      default: 'BANK_TRANSFER',
    },

    bank_name: {
      type: String,
      default: null,
    },

    bank_account_number: {
      type: String,
      default: null,
    },

    bank_account_name: {
      type: String,
      default: null,
    },

    admin_note: {
      type: String,
      default: null,
    },

    receipt_urls: {
      type: [String],
      default: [],
    },

    requested_at: {
      type: Date,
      default: Date.now,
    },

    approved_at: {
      type: Date,
      default: null,
    },

    paid_at: {
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

module.exports = mongoose.model('payout', payoutSchema);
