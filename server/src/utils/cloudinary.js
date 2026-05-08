import path from "path";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import { ApiError } from "../utils/ApiError.js";

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
// Image/video upload function
export const uploadCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) {
      throw new Error(400, "No file path provided for upload.");
    }

    const response = await cloudinary.uploader.upload(localFilePath, {
      folder: "learnsaathi/uploads",
      resource_type: "auto",
    });

    if (localFilePath && fs.existsSync(localFilePath)) {
      fs.unlink(localFilePath, () => {});
    }

    return response;

  } catch (error) {

    if (localFilePath && fs.existsSync(localFilePath)) {
      fs.unlink(localFilePath, () => {});
    }

    console.error("Cloudinary upload error:", error);
    return new ApiError(500, error.message || "Cloudinary upload failed");
  }
};

//DOCUMENT UPLOAD (PDF/DOCX/PPT)


export const uploadDocumentCloudinary = async ( localFilePath) => {
  try {
    if (!localFilePath) {
      throw new ApiError(
        400,
        "No document provided"
      );
    }

    /* =========================================
       🔥 AUTO DETECT FILE TYPE
    ========================================= */

    const ext = path
      .extname(localFilePath)
      .toLowerCase();

    let resourceType = "raw";

    // PDFs preview better as image
    if (ext === ".pdf") {
      resourceType = "image";
    }

    /* =========================================
       🔥 UPLOAD
    ========================================= */

    const response = await cloudinary.uploader.upload(localFilePath,
        {
          folder: "learnsaathi/documents",
          resource_type: resourceType,
          use_filename: true,
          unique_filename: true,
          overwrite: false
        }
      );

    /* =========================================
       🔥 DELETE TEMP FILE
    ========================================= */

    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }

    /* =========================================
       🔥 FIX PDF URL
    ========================================= */

    let finalUrl = response.secure_url;

    if (ext === ".pdf") {
      finalUrl = cloudinary.url(
        response.public_id,
        {
          resource_type: "image",
          format: "pdf",
          secure: true,
          flags: "attachment:false"
        }
      );
    }

    return {
      ...response,
      secure_url: finalUrl
    };
  } catch (error) {
    if (
      localFilePath &&
      fs.existsSync(localFilePath)
    ) {
      fs.unlinkSync(localFilePath);
    }
    console.error("Document upload error:", error);

    throw new ApiError(
      500,
      error.message || "Document upload failed"
    );
  }
};

//delete from cloudinary
export const deleteFromCloudinary = async ( publicId, resourceType = "image") => {
  try {
    const response = await cloudinary.uploader.destroy( publicId,
      { resource_type: resourceType }
    );
    return response;

  } catch (error) {

    console.error("Cloudinary delete error:", error);

    throw new ApiError(
      500,
      error.message || "Cloudinary delete failed"
    );
  }
};