const multer = require("multer");

// store files temporarily before uploading to cloudinary
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // max 5MB per image
});

module.exports = upload;
