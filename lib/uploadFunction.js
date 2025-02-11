const multer = require("multer");
const path = require("path");

// Configure storage for Multer
const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    const allowedTypes = ["image/jpg", "image/jpeg", "image/png"];
    if (allowedTypes.includes(file.mimetype)) {
      // console.log('allowedTypes: ', allowedTypes);
      callback(null, "public/images"); // Set the upload directory
    } else {
      callback(new Error("Invalid file type"), false); // Reject unsupported file types
    }
  },
  filename: (req, file, callback) => {
    const fileExtension = path.extname(file.originalname); // Extract file extension
    // console.log('fileExtension: ', fileExtension);
    const originalNameWithoutExt = path.basename(file.originalname, fileExtension); // Extract name without extension
    // console.log('originalNameWithoutExt: ', originalNameWithoutExt);
    const uniqueFileName = `${Date.now()}-${originalNameWithoutExt}${fileExtension}`; // Create unique filename
    // console.log('uniqueFileName: ', uniqueFileName);
    callback(null, uniqueFileName);
  },
});

// Configure Multer with storage and limits
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // Limit file size to 10MB
  },
  fileFilter: (req, file, callback) => {
    // console.log('file: ', file);
    const allowedTypes = ["image/jpg", "image/jpeg", "image/png"];
    if (allowedTypes.includes(file.mimetype)) {
      callback(null, true); // Accept the file
    } else {
      callback(new Error("Invalid file type")); // Reject unsupported file types
    }
  },
});

module.exports = upload;