const express = require('express');
const router = express.Router();
const razorpay = require('../services/razorpay');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');

// POST /api/payment/create-order
router.post('/create-order', async (req, res) => {
  try {
    const { amount, currency = 'INR', receipt } = req.body;
    if (!amount) return res.status(400).json({ error: 'Amount is required' });

    const options = {
      amount: Math.round(Number(amount) * 100), // rupees to paise
      currency,
      receipt: receipt || `rcpt_${Date.now()}`
    };

    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/payment/verify
router.post('/verify', express.json(), (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ verified: false, error: 'Missing fields' });
    }

    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expected = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET).update(body).digest('hex');
    const verified = expected === razorpay_signature;
    res.json({ verified });
  } catch (err) {
    res.status(500).json({ verified: false, error: err.message });
  }
});

module.exports = router;
