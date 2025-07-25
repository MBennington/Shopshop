const parseJSONFields = (req, res, next) => {
  try {
    const fieldsToParse = [
      'sellerInfo',
      'notifications',
      'privacySettings',
      'accountPreferences',
      'savedAddresses',
    ];

    fieldsToParse.forEach((field) => {
      if (req.body[field] && typeof req.body[field] === 'string') {
        req.body[field] = JSON.parse(req.body[field]);
      }
    });

    next();
  } catch (error) {
    return res.status(400).json({
      status: false,
      msg: 'Invalid JSON format in one of the fields.',
    });
  }
};

module.exports = { parseJSONFields };
