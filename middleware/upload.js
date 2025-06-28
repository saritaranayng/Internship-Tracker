const multer = require('multer');
const path = require('path');

// Set storage engine
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Folder where files will be stored
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