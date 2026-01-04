const IssueReportModel = require('./issue-report.model');
const repository = require('../../services/repository.service');
const userService = require('../users/user.service');
const emailService = require('../../services/email.service');
const emailTemplateService = require('../../services/email-template.service');

/**
 * Create a new issue report
 * @param {Object} body - Issue report data
 * @param {String} user_id - User ID reporting the issue
 * @returns {Promise<Object>}
 */
module.exports.createIssueReport = async (body, user_id) => {
  const { issueType, subject, description, orderId, productId } = body;

  const issueReport = new IssueReportModel({
    user_id,
    issueType,
    subject,
    description,
    orderId: orderId || null,
    productId: productId || null,
    status: 'pending',
  });

  const savedIssueReport = await repository.save(issueReport);

  // Get user information for email
  try {
    const user = await userService.getUserById(user_id);
    if (user && user.email) {
      // Generate and send confirmation email
      const emailTemplate =
        emailTemplateService.generateIssueReportConfirmationEmail({
          userName: user.name || 'Customer',
          userEmail: user.email,
          issueType,
          subject,
          issueReportId: savedIssueReport._id.toString(),
        });

      await emailService.sendEmail({
        to: user.email,
        subject: emailTemplate.subject,
        html: emailTemplate.html,
      });
    }
  } catch (error) {
    console.error('Error sending issue report confirmation email:', error);
    // Don't fail the operation if email fails
  }

  return savedIssueReport.toObject();
};

/**
 * Get issue reports for a user
 * @param {String} user_id - User ID
 * @param {Object} queryParams - Query parameters (page, limit, status)
 * @returns {Promise<Object>}
 */
module.exports.getIssueReportsByUser = async (user_id, queryParams = {}) => {
  const { page = 1, limit = 10, status } = queryParams;
  const skip = (page - 1) * limit;

  const filter = { user_id };
  if (status) {
    filter.status = status;
  }

  const issueReports = await IssueReportModel.find(filter)
    .sort({ created_at: -1 })
    .skip(skip)
    .limit(parseInt(limit))
    .lean();

  const total = await IssueReportModel.countDocuments(filter);

  return {
    issueReports,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * Get issue report by ID
 * @param {String} issueReportId - Issue report ID
 * @param {String} user_id - User ID (for authorization)
 * @returns {Promise<Object>}
 */
module.exports.getIssueReportById = async (issueReportId, user_id) => {
  const issueReport = await repository.findOne(IssueReportModel, {
    _id: issueReportId,
  });

  if (!issueReport) {
    throw new Error('Issue report not found');
  }

  // Check if user is authorized (owner or admin)
  const user = await userService.getUserById(user_id);
  if (
    issueReport.user_id.toString() !== user_id &&
    user.role !== 'admin'
  ) {
    throw new Error('Unauthorized to view this issue report');
  }

  return issueReport.toObject();
};

/**
 * Get all issue reports (admin only)
 * @param {Object} queryParams - Query parameters
 * @returns {Promise<Object>}
 */
module.exports.getAllIssueReports = async (queryParams = {}) => {
  const { page = 1, limit = 10, status, issueType } = queryParams;
  const skip = (page - 1) * limit;

  const filter = {};
  if (status) {
    filter.status = status;
  }
  if (issueType) {
    filter.issueType = issueType;
  }

  const issueReports = await IssueReportModel.find(filter)
    .populate('user_id', 'name email')
    .sort({ created_at: -1 })
    .skip(skip)
    .limit(parseInt(limit))
    .lean();

  const total = await IssueReportModel.countDocuments(filter);

  return {
    issueReports,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * Update issue report (admin only)
 * @param {String} issueReportId - Issue report ID
 * @param {Object} updateData - Update data
 * @returns {Promise<Object>}
 */
module.exports.updateIssueReport = async (issueReportId, updateData) => {
  const updatedIssueReport = await repository.updateOne(
    IssueReportModel,
    { _id: issueReportId },
    updateData,
    { new: true }
  );

  if (!updatedIssueReport) {
    throw new Error('Issue report not found');
  }

  return updatedIssueReport.toObject();
};


