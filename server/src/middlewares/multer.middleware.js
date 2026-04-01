import multer from "multer";
import path from "path";
import fs from "fs";

const tempFolder = "./public/temp";

// create folder if not exists
if (!fs.existsSync(tempFolder)) {
  fs.mkdirSync(tempFolder, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, tempFolder);
  },

  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);

    cb(null, `${name}-${Date.now()}${ext}`);
  }
});

export const upload = multer({
  storage,

  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB
  },

  fileFilter: (req, file, cb) => {

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "video/mp4",
      "application/pdf"
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Unsupported file type"), false);
    }

  }
});