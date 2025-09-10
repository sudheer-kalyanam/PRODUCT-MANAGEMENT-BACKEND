const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      minlength: 2,
      maxlength: 100,
    },

    description: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: "",
    },

    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price must be greater than 0"],
    },

    category: {
      type: String,
      required: [true, "Category is required"],
      enum: ["Electronics", "Clothing", "Home & Garden", "Sports", "Books", 
    "Toys", "Beauty", "Automotive", "Food", "Other"], // example categories
    },

    sizes: {
      type: [String],
      enum: ["XS", "S", "M", "L", "XL", "XXL", "NA"], // multiple sizes for apparel
      default: ["NA"],
    },

    images: {
      type: [String], // array of image URLs
      validate: {
        validator: function (arr) {
          return arr.length > 0 && arr.length <= 4;
        },
        message: "A product must have between 1 and 4 images",
      },
      required: true,
    },

    stock: {
      type: Number,
      default: 0,
      min: [0, "Stock cannot be negative"],
    },

    sku: {
      type: String, // unique product code
      unique: true,
      sparse: true,
      trim: true,
    },

    tags: {
      type: [String], // for search & filters
      default: [],
    },

    isActive: {
      type: Boolean,
      default: true, // soft delete toggle
    },
  },
  {
    timestamps: true, // auto adds createdAt & updatedAt
  }
);

module.exports = mongoose.model("Product", productSchema);
