const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    // Check if the file is an image
    const isImage = file.mimetype.startsWith('image/');
    
    // Cloudinary needs the extension for raw files to set the right Content-Type
    const ext = require('path').extname(file.originalname);
    const baseName = file.originalname.replace(/\.[^/.]+$/, "");
    
    return {
      folder: 'internship_logs',
      resource_type: isImage ? 'image' : 'raw', 
      public_id: isImage ? `${Date.now()}-${baseName}` : `${Date.now()}-${baseName}${ext}`
    };
  },
});

const upload = multer({ storage: storage });

module.exports = upload;