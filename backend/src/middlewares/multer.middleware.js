import multer from "multer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { ApiError } from "../utils/ApiError.js";

// Resolve public/temp relative to this file so multer works no matter which
// directory the server is started from.
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const tempDir = path.resolve(__dirname, "../../public/temp");

fs.mkdirSync(tempDir, { recursive: true });

export const MAX_UPLOAD_MB = 5;
const MAX_FILE_SIZE = MAX_UPLOAD_MB * 1024 * 1024;

const ALLOWED_IMAGE_MIME = /^image\/(jpeg|jpg|pjpeg|png|webp|gif|avif|svg\+xml)$/;

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, tempDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_");
    cb(null, `${uniqueSuffix}-${safeName}`);
  },
});

// Only real images are accepted, nothing else
const fileFilter = (req, file, cb) => {
  if (ALLOWED_IMAGE_MIME.test(file.mimetype)) {
    return cb(null, true);
  }

  return cb(
    new ApiError(
      400,
      `Only image files are allowed (received: ${file.mimetype || "unknown"})`,
    ),
  );
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 5,
  },
});