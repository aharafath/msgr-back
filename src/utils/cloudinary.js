import cloudinary from "cloudinary";

// Configuring Cloudinary
cloudinary.v2.config({
  cloud_name: "dvcdftu0k",
  api_key: "249699223824383",
  api_secret: "SCOpsRxQeg44Gv5S8Uiem6RWtFw",
});

export const cloudUpload = async (file, folder) => {
  // Ensure the file exists
  if (!file) {
    throw new Error("No file provided for upload");
  }

  try {
    // Upload the file to Cloudinary
    const data = await cloudinary.v2.uploader.upload(file.path, {
      folder: folder,
    });

    return data; // Return the uploaded data
  } catch (error) {
    console.error("Error uploading file to Cloudinary:", error);
    throw new Error("File upload failed");
  }
};

export const cloudUploads = async (path, folder) => {
  // Ensure the path exists
  if (!path) {
    throw new Error("No path provided for upload");
  }

  try {
    // Upload the file from the path
    const data = await cloudinary.v2.uploader.upload(path, {
      folder: folder,
    });

    return data.secure_url; // Return the secure URL after upload
  } catch (error) {
    console.error("Error uploading file to Cloudinary:", error);
    throw new Error("File upload failed");
  }
};

export const cloudDelete = async (publicId) => {
  if (!publicId) {
    throw new Error("No public ID provided for deletion");
  }

  try {
    const result = await cloudinary.v2.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error("Error deleting file from Cloudinary:", error);
    throw new Error("File deletion failed: " + error.message);
  }
};
