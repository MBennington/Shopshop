const multer = require('multer');

const storage = multer.memoryStorage();

// Multer configuration for receipts (PDFs and images)
const uploadReceipt = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB (larger for PDFs)
    files: 5, // Allow up to 5 receipt files
  },
  fileFilter: (req, file, cb) => {
    // Allow images and PDFs
    if (
      file.mimetype.startsWith('image/') ||
      file.mimetype === 'application/pdf'
    ) {
      cb(null, true);
    } else {
      cb(new Error('Only image files and PDFs are allowed'), false);
    }
  },
});

module.exports = uploadReceipt;

