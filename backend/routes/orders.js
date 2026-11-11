const express = require('express');
const router = express.Router();
const { createOrder, getOrderByNumber } = require('../services/orders');
const { generateInvoice } = require('../utils/invoiceGenerator');

router.post('/', async (req, res) => {
  try {
    const payload = req.body;
    if (!payload.customer_name || String(payload.customer_name).length > 120 || !/^[6-9]\d{9}$/.test(String(payload.phone || '')) || !payload.address || String(payload.address).length > 1000 || !/^\d{6}$/.test(String(payload.pincode || '')) || !Array.isArray(payload.items) || !payload.items.length || payload.items.length > 30 || payload.items.some((item) => !item.name || String(item.name).length > 160 || !Number.isInteger(Number(item.quantity)) || Number(item.quantity) < 1 || Number(item.quantity) > 100 || !Number.isFinite(Number(item.price)) || Number(item.price) < 0) || payload.consent !== true || !Number.isFinite(Date.parse(payload.consent_timestamp)) || payload.consent_policy_version !== '2026-11-07-v1') {
      return res.status(400).json({ error: 'Missing required order fields' });
    }

    const result = await createOrder(payload);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:orderNumber', async (req, res) => {
  try {
    const { orderNumber } = req.params;
    const result = await getOrderByNumber(orderNumber);
    if (!result?.order) return res.status(404).json({ error: 'Order not found' });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:orderNumber/invoice', async (req, res) => {
  try {
    const { orderNumber } = req.params;
    const result = await getOrderByNumber(orderNumber);
    if (!result?.order) return res.status(404).json({ error: 'Order not found' });

    generateInvoice(result.order, result.items, (err, pdfBuffer) => {
      if (err) return res.status(500).json({ error: err.message });
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=Invoice-${result.order.order_number}.pdf`);
      res.end(pdfBuffer);
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
