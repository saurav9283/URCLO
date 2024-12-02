const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    const imageTypes = ["image/jpg", "image/jpeg", "image/png"];

    if (imageTypes.includes(file.mimetype)) {
      callback(null, "public/images");
    } else {
      callback(new Error("Invalid file type"), false);
    }
  },
  filename: (req, file, callback) => {
    const fileExtension = path.extname(file.originalname);
    const originalNameWithoutExt = path.basename(file.originalname, fileExtension);
    const fileName = Date.now().toString() + "-" + originalNameWithoutExt + fileExtension;
    callback(null, fileName);
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // Limit to 10MB for image uploads
  },
  fileFilter: (req, file, callback) => {
    const allowedTypes = ["image/jpg", "image/jpeg", "image/png"];

    if (allowedTypes.includes(file.mimetype)) {
      callback(null, true);
    } else {
      callback(new Error("Invalid file type"), false);
    }
  },
});

module.exports = upload;