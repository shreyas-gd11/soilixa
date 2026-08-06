const express = require('express');
const router = express.Router();
const { fetchAvailableProducts, getProductById } = require('../services/products');

// GET /api/products
router.get('/', async (req, res) => {
  try {
    const products = await fetchAvailableProducts();
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/products/:id
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const product = await getProductById(id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
