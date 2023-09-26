const multer = require('multer');
const fs = require('fs');

// Define the allowed MIME types for image files
const allowedImageMimeTypes = ['image/jpeg', 'image/png', 'image/gif'];

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/productImages');
  },
  filename: (req, file, cb) => {
    cb(null, file.fieldname + '-' + Date.now() + '.jpg');
  },
});

const bannerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const destinationPath = 'public/bannerImages';
    cb(null, destinationPath);
  },
  filename: (req, file, cb) => {
    cb(null, file.fieldname + '-' + Date.now() + '.jpg');
  },
});


const fileFilter = (req, file, cb) => {
  if (allowedImageMimeTypes.includes(file.mimetype)) {
   
    cb(null, true);
  } else {
   
    cb(new Error('Invalid file type. Only JPEG, PNG, and GIF images are allowed.'));
  }
};

const upload = multer({ storage: storage, fileFilter: fileFilter });
const banner = multer({ storage: bannerStorage, fileFilter: fileFilter });

module.exports = { upload, banner };
