const Product = require("../models/Product");
const streamifier = require("streamifier");
const cloudinary = require("../config/cloudinary");

exports.createProduct = async (data, files) => {
  // upload images to Cloudinary
  const imageUrls = [];

  for (const file of files) {
    const uploadResult = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: "products" },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );

      // convert buffer to stream and pipe into cloudinary upload_stream
      streamifier.createReadStream(file.buffer).pipe(stream);
    });

    imageUrls.push(uploadResult.secure_url);
  }

  const product = new Product({ ...data, images: imageUrls });
  return await product.save();
};


exports.getAllProducts = async () => {
  return await Product.find({ isActive: true }).sort({ createdAt: -1 });
};

exports.updateProduct = async (id, data = {}, files = []) => {
  // Coerce types and normalize incoming data (strings -> numbers/arrays/booleans)
  const update = { ...data };
  console.log("Update data:", update);

  // If fields come as strings from multipart/form-data, coerce them
  if (update.price !== undefined) {
    const parsed = Number(update.price);
    if (!Number.isNaN(parsed)) update.price = parsed;
    else delete update.price;
  }

  if (update.stock !== undefined) {
    const parsed = Number(update.stock);
    if (!Number.isNaN(parsed)) update.stock = parsed;
    else delete update.stock;
  }

  // Normalize tags: accept JSON array or comma-separated string
  if (update.tags) {
    if (typeof update.tags === "string") {
      try {
        // If client sent JSON string for tags
        const maybe = JSON.parse(update.tags);
        if (Array.isArray(maybe)) update.tags = maybe;
        else update.tags = update.tags.split(",").map((t) => t.trim()).filter(Boolean);
      } catch {
        update.tags = update.tags.split(",").map((t) => t.trim()).filter(Boolean);
      }
    }
  }

  // Normalize removeImages from FormData (can be repeated keys or JSON)
  let removeImages = [];
  if (update.removeImages) {
    if (typeof update.removeImages === "string") {
      try {
        const maybe = JSON.parse(update.removeImages);
        removeImages = Array.isArray(maybe) ? maybe : [update.removeImages];
      } catch {
        removeImages = [update.removeImages];
      }
    } else if (Array.isArray(update.removeImages)) {
      removeImages = update.removeImages;
    }
    delete update.removeImages;
  }

  // Get current product to compute final images
  const current = await Product.findById(id);
  if (!current) return null;

  // Start with current images minus ones marked for removal
  let finalImages = Array.isArray(current.images)
    ? current.images.filter((url) => !removeImages.includes(url))
    : [];

  // If files provided, upload and append/replace
  if (files && files.length > 0) {
    const imageUrls = await uploadFilesToCloudinary(files);
    if (imageUrls.length) finalImages = [...finalImages, ...imageUrls];
  }

  // Apply images only if we computed them (avoid accidentally setting undefined)
  update.images = finalImages;

  // Make sure we don't accidentally set images to undefined and trip required validator
  // Use findByIdAndUpdate with runValidators
  const updated = await Product.findByIdAndUpdate(id, update, {
    new: true,
    runValidators: true,
    context: "query",
  });

  return updated;
};

exports.deleteProduct = async (id) => {
  return await Product.findByIdAndUpdate(id, { isActive: false }, { new: true }); // soft delete
};

exports.getProductById = async (id) => {
  return await Product.findById(id);
};

// Helper to upload buffers to Cloudinary using upload_stream
async function uploadFilesToCloudinary(files) {
  const urls = [];
  for (const file of files) {
    // Skip empty or invalid buffers defensively
    if (!file || !file.buffer || !file.buffer.length) continue;
    const uploadResult = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: "products" },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      streamifier.createReadStream(file.buffer).pipe(stream);
    });
    if (uploadResult && uploadResult.secure_url) {
      urls.push(uploadResult.secure_url);
    }
  }
  return urls;
}