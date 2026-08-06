const express = require('express');
const router = express.Router();
const { createOrder, getOrderByNumber } = require('../services/orders');
const { generateInvoice } = require('../utils/invoiceGenerator');

router.post('/', async (req, res) => {
  try {
    const payload = req.body;
    if (!payload.customer_name || !payload.phone || !payload.address || !Array.isArray(payload.items) || !payload.items.length) {
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
