// import multer from "multer";
// import path from "path";
// import fs from "fs";

// const tempFolder = "./public/temp";

// // create folder if not exists
// if (!fs.existsSync(tempFolder)) {
//   fs.mkdirSync(tempFolder, { recursive: true });
// }

// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, tempFolder);
//   },

//   filename: function (req, file, cb) {
//     const ext = path.extname(file.originalname);
//     // const name = path.basename(file.originalname, ext);
//     const uniqueName = `${Date.now()}-${Math.round(Math.random()*1e9)}${ext}`;

//     cb(null, uniqueName);
//   }
// });

// export const upload = multer({
//   storage,

//   limits: {
//     fileSize: 50 * 1024 * 1024 // 50MB
//   },

//   fileFilter: (req, file, cb) => {

//     const allowedTypes = [
//       "image/jpeg",
//       "image/png",
//       "image/webp",
//       "video/mp4",
//       "application/pdf"
//     ];

//     if (allowedTypes.includes(file.mimetype)) {
//       cb(null, true);
//     } else {
//       cb(new Error("Unsupported file type"), false);
//     }

//   }
// });



import multer from "multer";
import path from "path";
import fs from "fs";

/* =====================================================
   TEMP FOLDER
===================================================== */

const tempFolder = "./public/temp";

if (!fs.existsSync(tempFolder)) {
  fs.mkdirSync(tempFolder, { recursive: true });
}

/* =====================================================
   STORAGE
===================================================== */

const storage = multer.diskStorage({

  destination: function (req, file, cb) {
    cb(null, tempFolder);
  },

  filename: function (req, file, cb) {

    const ext = path.extname(file.originalname);

    const uniqueName =
      `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;

    cb(null, uniqueName);
  }

});


/* =====================================================
   MIME TYPES
===================================================== */

const FILE_TYPES = {

  image: [

    "image/jpeg",
    "image/png",
    "image/webp"

  ],

  video: [

    "video/mp4",
    "video/webm",
    "video/quicktime"

  ],

  document: [

    "application/pdf",

    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",

    "application/vnd.openxmlformats-officedocument.presentationml.presentation",

    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"

  ],

  archive: [

    "application/zip",
    "application/x-zip-compressed"

  ],

  audio: [

    "audio/mpeg",
    "audio/wav"

  ]

};


/* =====================================================
   FACTORY FUNCTION
===================================================== */

const createUploader = (
  allowedTypes,
  maxSizeMB = 50
) => {

  return multer({

    storage,

    limits: {

      fileSize: maxSizeMB * 1024 * 1024

    },

    fileFilter: (req, file, cb) => {

      if (allowedTypes.includes(file.mimetype)) {

        cb(null, true);

      }

      else {

        cb(
          new Error(
            `Unsupported file type: ${file.mimetype}`
          ),
          false
        );

      }

    }

  });

};


/* =====================================================
   EXPORTS
===================================================== */

export const uploadImage =
  createUploader(FILE_TYPES.image, 10);

export const uploadVideo =
  createUploader(FILE_TYPES.video, 500);

export const uploadDocument =
  createUploader(
    [
      ...FILE_TYPES.document,
      ...FILE_TYPES.archive,
      ...FILE_TYPES.audio
    ],
    100
  );

export const uploadCourseVideo =
  createUploader(
    [
      ...FILE_TYPES.video,
      ...FILE_TYPES.image
    ],
    500
  );