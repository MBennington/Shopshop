const mongoose = require('mongoose');

const issueReportSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    issueType: {
      type: String,
      required: true,
      enum: ['order', 'product', 'delivery', 'payment', 'review', 'other'],
    },
    subject: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
    orderId: {
      type: String,
      trim: true,
      default: null,
    },
    productId: {
      type: String,
      trim: true,
      default: null,
    },
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'resolved', 'closed'],
      default: 'pending',
    },
    adminNotes: {
      type: String,
      trim: true,
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

// Index for efficient queries
issueReportSchema.index({ user_id: 1, created_at: -1 });
issueReportSchema.index({ status: 1 });
issueReportSchema.index({ issueType: 1 });

const IssueReportModel = mongoose.model('IssueReport', issueReportSchema);

module.exports = IssueReportModel;


