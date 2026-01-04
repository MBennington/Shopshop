const issueReportService = require('./issue-report.service');
const {
  successWithData,
  successWithMessage,
  customError,
} = require('../../services/response.service');

/**
 * Create a new issue report
 * @param req
 * @param res
 * @returns {Promise<*>}
 */
module.exports.createIssueReport = async (req, res) => {
  try {
    const user_id = res.locals.user.id;
    const data = await issueReportService.createIssueReport(req.body, user_id);
    return successWithData(data, res);
  } catch (error) {
    console.error('Create issue report error:', error);
    return customError(`${error.message}`, res);
  }
};

/**
 * Get issue reports for the current user
 * @param req
 * @param res
 * @returns {Promise<*>}
 */
module.exports.getIssueReports = async (req, res) => {
  try {
    const user_id = res.locals.user.id;
    const queryParams = {
      page: req.query.page,
      limit: req.query.limit,
      status: req.query.status,
    };
    const data = await issueReportService.getIssueReportsByUser(
      user_id,
      queryParams
    );
    return successWithData(data, res);
  } catch (error) {
    console.error('Get issue reports error:', error);
    return customError(`${error.message}`, res);
  }
};

/**
 * Get issue report by ID
 * @param req
 * @param res
 * @returns {Promise<*>}
 */
module.exports.getIssueReportById = async (req, res) => {
  try {
    const user_id = res.locals.user.id;
    const issueReportId = req.params.id;
    const data = await issueReportService.getIssueReportById(
      issueReportId,
      user_id
    );
    return successWithData(data, res);
  } catch (error) {
    console.error('Get issue report by ID error:', error);
    return customError(`${error.message}`, res);
  }
};

/**
 * Get all issue reports (admin only)
 * @param req
 * @param res
 * @returns {Promise<*>}
 */
module.exports.getAllIssueReports = async (req, res) => {
  try {
    const queryParams = {
      page: req.query.page,
      limit: req.query.limit,
      status: req.query.status,
      issueType: req.query.issueType,
    };
    const data = await issueReportService.getAllIssueReports(queryParams);
    return successWithData(data, res);
  } catch (error) {
    console.error('Get all issue reports error:', error);
    return customError(`${error.message}`, res);
  }
};

/**
 * Update issue report (admin only)
 * @param req
 * @param res
 * @returns {Promise<*>}
 */
module.exports.updateIssueReport = async (req, res) => {
  try {
    const issueReportId = req.params.id;
    const data = await issueReportService.updateIssueReport(
      issueReportId,
      req.body
    );
    return successWithData(data, res);
  } catch (error) {
    console.error('Update issue report error:', error);
    return customError(`${error.message}`, res);
  }
};


