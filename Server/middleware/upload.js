const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

// Two separate folders on Cloudinary so society logos and profile photos
// don't mix — mirrors how GREH organizes its listing images.
const storage = new CloudinaryStorage({
  cloudinary,
  params: (req, file) => {
    const isSocietyLogo = req.baseUrl.includes("society");
    return {
      folder: isSocietyLogo ? "smms/society" : "smms/profiles",
      allowed_formats: ["jpg", "jpeg", "png", "webp"],
      transformation: [{ width: 500, height: 500, crop: "limit" }],
    };
  },
});

const upload = multer({ storage });

module.exports = upload;
