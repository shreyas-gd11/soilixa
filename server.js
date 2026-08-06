// Express-based server with API routes for Supabase and manual UPI orders
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
app.use('/api/orders', require('./routes/orders'));


app.listen(port, () => console.log(`Soilixa server running at http://localhost:${port}`));

