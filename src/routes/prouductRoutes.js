const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");
const upload = require("../middleware/upload");
const {getProducts,getProduct,addProduct,updateProduct,deleteProduct} = require("../controllers/productController");

router.get("/", getProducts);
router.get("/:id", getProduct);
router.post("/", upload.array("images", 4), addProduct);
router.put("/:id", upload.array("images", 4), updateProduct);
router.delete("/:id", deleteProduct);

module.exports = router;
