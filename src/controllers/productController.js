const productService = require("../services/productService");

exports.addProduct = async (req, res) => {
  try {
    const product = await productService.createProduct(req.body, req.files);
    res.status(201).json(product);
  } catch (error) {
    // Normalize validation errors for the frontend
    if (error && error.name === "ValidationError" && error.errors) {
      const errors = Object.keys(error.errors).reduce((acc, key) => {
        acc[key] = error.errors[key]?.message || "Invalid value";
        return acc;
      }, {});
      return res.status(400).json({ message: "Validation failed", errors });
    }
    // Handle duplicate key (e.g., unique SKU)
    if (error && (error.code === 11000 || error.name === "MongoServerError")) {
      const field = Object.keys(error.keyPattern || {})[0] || "field";
      const msg = `${field} must be unique`;
      return res.status(400).json({ message: msg, errors: { [field]: msg } });
    }
    res.status(400).json({ message: error.message || "Failed to create product" });
  }
};

exports.getProducts = async (req, res) => {
  try {
    const products = await productService.getAllProducts();
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    console.log("body",req.body);
    const id = req.params.id;
    const files = req.files || []; // multer: upload.array('images', 4)
    const data = req.body || {};

    const updated = await productService.updateProduct(id, data, files);

    if (!updated) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(updated);
  } catch (error) {
    console.error("Update product error:", error);
    if (error && error.name === "ValidationError" && error.errors) {
      const errors = Object.keys(error.errors).reduce((acc, key) => {
        acc[key] = error.errors[key]?.message || "Invalid value";
        return acc;
      }, {});
      return res.status(400).json({ message: "Validation failed", errors });
    }
    if (error && (error.code === 11000 || error.name === "MongoServerError")) {
      const field = Object.keys(error.keyPattern || {})[0] || "field";
      const msg = `${field} must be unique`;
      return res.status(400).json({ message: msg, errors: { [field]: msg } });
    }
    res.status(400).json({ message: error.message || "Failed to update product" });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const product = await productService.deleteProduct(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json({ message: "Product deleted successfully", product });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getProduct = async (req, res) => {
  try {
    const product = await productService.getProductById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
