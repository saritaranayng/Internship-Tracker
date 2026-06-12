const multer = require('multer');
const path = require('path');
const os = require('os');
const fs = require('fs');

// Ensure temp upload directory exists (Vercel allows writing to /tmp)
const tempDir = path.join(os.tmpdir(), 'uploads');
if (!fs.existsSync(tempDir)){
    fs.mkdirSync(tempDir, { recursive: true });
}

// Set storage engine
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, tempDir); // Store in temp directory
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname); // Unique filename
  }
});

// File filter for safety (optional)
const fileFilter = (req, file, cb) => {
  const allowedTypes = /pdf|doc|docx|jpg|png|jpeg/;
  const extName = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  if (extName) {
    cb(null, true);
  } else {
    cb(new Error('Only documents and images allowed'));
  }
};

const upload = multer({ storage: storage, fileFilter: fileFilter });

module.exports = upload;