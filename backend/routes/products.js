const express = require('express');
const router = express.Router();
const { fetchAvailableProducts, getProductById } = require('../services/products');

// GET /api/products
router.get('/', async (req, res) => {
  try {
    const products = await fetchAvailableProducts();
    res.json(products);
  } catch (err) {
    console.error('[Soilixa] GET /api/products failed:', err);
    res.status(500).json({
      error: err.message || 'Failed to load products',
      code: err.code || undefined
    });
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
    console.error('[Soilixa] GET /api/products/:id failed:', err);
    res.status(500).json({
      error: err.message || 'Failed to load product',
      code: err.code || undefined
    });
  }
});

module.exports = router;
