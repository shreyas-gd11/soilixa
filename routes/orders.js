const express = require('express');
const router = express.Router();
const { supabaseAdmin } = require('../services/supabase');
const { v4: uuidv4 } = require('uuid');
const { generateInvoice } = require('../utils/invoiceGenerator');

// POST /api/orders
router.post('/', async (req, res) => {
  try {
    const payload = req.body;
    // Basic validation - ensure required fields
    if (!payload.customer_name || !payload.phone || !payload.address || !Array.isArray(payload.items) || !payload.items.length) {
      return res.status(400).json({ error: 'Missing required order fields' });
    }

    const orderId = uuidv4();
    const orderNumber = `SI-${Date.now().toString().slice(-8)}`;

    const orderRecord = {
      id: orderId,
      order_number: orderNumber,
      customer_name: payload.customer_name,
      phone: payload.phone,
      email: payload.email || null,
      address: payload.address,
      village: payload.village || null,
      taluk: payload.taluk || null,
      district: payload.district || null,
      state: payload.state || null,
      pincode: payload.pincode || null,
      order_notes: payload.order_notes || null,
      subtotal: payload.subtotal || 0,
      delivery_charge: payload.delivery_charge || 0,
      gst: payload.gst || 0,
      total_amount: payload.total_amount || 0,
      payment_status: payload.payment_status || 'pending',
      payment_method: payload.payment_method || null,
      razorpay_order_id: payload.razorpay_order_id || null,
      razorpay_payment_id: payload.razorpay_payment_id || null
    };

    const { data: orderData, error: orderError } = await supabaseAdmin.from('orders').insert(orderRecord).select().single();
    if (orderError) return res.status(500).json({ error: orderError.message });

    // Insert order items
    const items = payload.items.map((it) => ({
      order_id: orderId,
      product_id: it.product_id || null,
      product_name: it.name || it.product_name || null,
      price: it.price,
      quantity: it.quantity,
      total: it.total
    }));

    const { data: itemsData, error: itemsError } = await supabaseAdmin.from('order_items').insert(items).select();
    if (itemsError) return res.status(500).json({ error: itemsError.message });

    res.json({ order: orderData, items: itemsData });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/orders/:orderNumber
router.get('/:orderNumber', async (req, res) => {
  try {
    const { orderNumber } = req.params;
    const { data: order } = await supabaseAdmin.from('orders').select('*').eq('order_number', orderNumber).single();
    if (!order) return res.status(404).json({ error: 'Order not found' });
    const { data: items } = await supabaseAdmin.from('order_items').select('*').eq('order_id', order.id);
    res.json({ order, items });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/orders/:orderNumber/invoice -> generate PDF invoice
router.get('/:orderNumber/invoice', async (req, res) => {
  try {
    const { orderNumber } = req.params;
    const { data: order } = await supabaseAdmin.from('orders').select('*').eq('order_number', orderNumber).single();
    if (!order) return res.status(404).json({ error: 'Order not found' });
    const { data: items } = await supabaseAdmin.from('order_items').select('*').eq('order_id', order.id);

    generateInvoice(order, items, (err, pdfBuffer) => {
      if (err) return res.status(500).json({ error: err.message });
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=Invoice-${order.order_number}.pdf`);
      res.end(pdfBuffer);
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
