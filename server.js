// Express-based server with API routes for Supabase and Razorpay integration
const express = require('express');
const path = require('path');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Static files (public root)
app.use(express.static(path.join(__dirname)));

// API routes
app.use('/api/products', require('./routes/products'));
app.use('/api/payment', require('./routes/payment'));
app.use('/api/orders', require('./routes/orders'));

// Public config (only non-secret values)
app.get('/api/config', (req, res) => {
  res.json({ razorpayKeyId: process.env.RAZORPAY_KEY_ID || null });
});

// keep old fertilizer endpoints for backward compatibility
const fertilizersRepoPath = path.join(__dirname, 'api', 'fertilizers', 'repository.js');
try {
  const { getFertilizerById, getFertilizers } = require('./api/fertilizers/repository');
  app.get('/api/fertilizers', (req, res) => res.json(getFertilizers({ category: req.query.category, crop: req.query.crop })));
  app.get('/api/fertilizers/:id', (req, res) => {
    const p = getFertilizerById(req.params.id);
    if (!p) return res.status(404).json({ error: 'Fertilizer not found' });
    res.json(p);
  });
} catch (err) {
  // ignore if repository not available
}

app.listen(port, () => console.log(`Soilixa server running at http://localhost:${port}`));

