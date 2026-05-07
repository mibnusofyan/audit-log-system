const Product = require("../models/product.model");
const auditLogService = require("../services/auditLog.service");

// CREATE Product
exports.createProduct = async (req, res) => {
  try {
    const { name, description, price, stock } = req.body;

    const product = await Product.create({
      name,
      description,
      price,
      stock,
    });

    // Log aktivitas CREATE
    await auditLogService.logEvent({
      userId: req.user.id,
      action: "CREATE",
      entity: "Product",
      entityId: product.id,
      details: { newData: product },
      ipAddress: req.ip,
    });

    res.status(201).json({ message: "Product created successfully", product });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// READ All Products
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.findAll();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// READ Single Product
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// UPDATE Product
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, stock } = req.body;

    const product = await Product.findByPk(id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    // Simpan data lama untuk audit
    const oldData = { ...product.toJSON() };

    await product.update({ name, description, price, stock });

    // Log aktivitas UPDATE
    await auditLogService.logEvent({
      userId: req.user.id,
      action: "UPDATE",
      entity: "Product",
      entityId: product.id,
      details: { oldData, newData: product },
      ipAddress: req.ip,
    });

    res.json({ message: "Product updated successfully", product });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// DELETE Product
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findByPk(id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    const oldData = { ...product.toJSON() };

    await product.destroy();

    // Log aktivitas DELETE
    await auditLogService.logEvent({
      userId: req.user.id,
      action: "DELETE",
      entity: "Product",
      entityId: id,
      details: { oldData },
      ipAddress: req.ip,
    });

    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};