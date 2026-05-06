const express = require("express");
const router = express.Router();

const productController = require("../controllers/product.controller");
const { verifyToken, isAdmin } = require("../middleware/auth.middleware");

// Pengguna yang login dapat melihat produk
router.get("/", verifyToken, productController.getAllProducts);
router.get("/:id", verifyToken, productController.getProductById);

// Hanya admin yang dapat membuat, mengubah, atau menghapus produk
router.post("/", verifyToken, isAdmin, productController.createProduct);
router.put("/:id", verifyToken, isAdmin, productController.updateProduct);
router.delete("/:id", verifyToken, isAdmin, productController.deleteProduct);

module.exports = router;