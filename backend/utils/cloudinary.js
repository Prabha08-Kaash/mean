const cloudinary = require("cloudinary").v2
 const dotenv = require("dotenv");
 dotenv.config();

 //cloudinary configuration
 cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
   api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
 });

 //helper function for upload 
const uploadToCloudinary = async (filePath, folderPath) => {
return await cloudinary.uploader.upload(filePath, {
    folder: folderPath || "uploads",
});
 };

 module.exports = {cloudinary, uploadToCloudinary}


