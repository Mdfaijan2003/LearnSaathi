import multer from "multer";
import path from "path";
import fs from "fs";

const tempFolder = "./public/temp";

// create folder if it doesn't exist
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

    cb(null, name + "-" + Date.now() + ext);
  },
});

export const upload = multer({ storage });