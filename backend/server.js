// Express API server for Supabase-backed products and orders
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');

dotenv.config({ path: require('path').resolve(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 3000;

const allowedOrigins = ['https://soilixa.com', 'https://www.soilixa.com',
  ...(process.env.NODE_ENV === 'production' ? [] : ['http://localhost:5500', 'http://127.0.0.1:5500', 'http://localhost:3000', 'http://127.0.0.1:3000'])]
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(helmet());
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }
    callback(new Error(`Origin ${origin} is not allowed by CORS`));
  }
}));
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: true }));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/products', require('./routes/products'));
app.use('/api/orders', rateLimit({ windowMs: 15 * 60 * 1000, limit: 8, standardHeaders: 'draft-8', legacyHeaders: false }), require('./routes/orders'));
app.use('/api/requests', rateLimit({ windowMs: 15 * 60 * 1000, limit: 5, standardHeaders: 'draft-8', legacyHeaders: false }), require('./routes/requests'));

app.use((err, _req, res, next) => {
  if (err && err.message && err.message.includes('not allowed by CORS')) {
    return res.status(403).json({ error: err.message });
  }
  return next(err);
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Soilixa API server running on port ${PORT}`);
});
