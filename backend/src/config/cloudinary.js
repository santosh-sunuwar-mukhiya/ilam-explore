import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import "./env.js";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null
        // upload file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, { resource_type: "auto" });
        console.log("file is uploaded on cloudinary", response.url);
        removeLocalFile(localFilePath); // temp copy is no longer needed
        return response;
    } catch (err) {
        console.log("Error Occurred", err.message);
        removeLocalFile(localFilePath); // remove locally saved files.
        return null;
    }
}

const removeLocalFile = (localFilePath) => {
    try {
        if (localFilePath && fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);
        }
    } catch (err) {
        console.log("Could not remove local temp file:", err.message);
    }
}

// Only assets uploaded to OUR cloud may ever be destroyed
const isOurCloudinaryUrl = (url) =>
    typeof url === "string" &&
    Boolean(process.env.CLOUDINARY_CLOUD_NAME) &&
    url.includes(`res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/`);

const getCloudinaryPublicId = (url) => {
    if (!isOurCloudinaryUrl(url)) return null;

    const withoutQuery = url.split("?")[0];
    const match = withoutQuery.match(/\/upload\/(?:v\d+\/)?(.+)$/);
    if (!match) return null;

    // strip the file extension: "folder/name.png" -> "folder/name"
    return match[1].replace(/\.[a-zA-Z0-9]+$/, "");
}

// Removes a single asset. Never throws: a failed cleanup must not break a
// request that already succeeded in the database.
const deleteFromCloudinary = async (url) => {
    const publicId = getCloudinaryPublicId(url);
    if (!publicId) return false;

    try {
        const result = await cloudinary.uploader.destroy(publicId);
        return result?.result === "ok";
    } catch (err) {
        console.log("Cloudinary delete failed:", err.message);
        return false;
    }
}

// Removes several assets and returns how many were actually deleted
const deleteFromCloudinaryMany = async (urls = []) => {
    const publicIds = urls.map(getCloudinaryPublicId).filter(Boolean);
    if (!publicIds.length) return 0;

    const results = await Promise.allSettled(
        publicIds.map((publicId) => cloudinary.uploader.destroy(publicId)),
    );

    return results.filter(
        (result) => result.status === "fulfilled" && result.value?.result === "ok",
    ).length;
}

export {
    uploadOnCloudinary,
    deleteFromCloudinary,
    deleteFromCloudinaryMany,
    getCloudinaryPublicId,
}
