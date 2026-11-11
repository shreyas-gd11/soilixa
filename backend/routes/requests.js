const express = require('express');
const router = express.Router();
const { supabaseAdmin } = require('../services/supabase');

router.post('/', async (req, res) => {
  const { name, phone, message, village, taluk, district, pincode, request_type, consent, consent_timestamp, consent_policy_version } = req.body || {};
  if (!name || String(name).length > 120 || !/^[6-9]\d{9}$/.test(String(phone || '')) || !message || String(message).length > 2000 || consent !== true || !Number.isFinite(Date.parse(consent_timestamp)) || consent_policy_version !== '2026-11-07-v1') {
    return res.status(400).json({ error: 'Valid name, Indian mobile, message and privacy consent are required.' });
  }
  if (request_type === 'soil-test' && (!village || !taluk || !district || !/^\d{6}$/.test(String(pincode || '')))) {
    return res.status(400).json({ error: 'Village, taluk, district and a valid 6-digit PIN are required for a soil-test request.' });
  }
  try {
    if (!supabaseAdmin) return res.status(503).json({ error: 'Request service is not configured.' });
    const { error } = await supabaseAdmin.from('farmer_requests').insert({
      name: String(name).slice(0, 120), phone: String(phone), message: String(message).slice(0, 2000),
      village: village ? String(village).slice(0, 120) : null, taluk: taluk ? String(taluk).slice(0, 120) : null,
      district: district ? String(district).slice(0, 120) : null, pincode: /^\d{6}$/.test(String(pincode || '')) ? String(pincode) : null,
      request_type: request_type === 'soil-test' ? 'soil-test' : 'contact',
      consent: true, consent_timestamp, consent_policy_version
    });
    if (error) throw error;
    return res.status(201).json({ ok: true });
  } catch (error) {
    console.error('[Soilixa] Could not save farmer request:', error.message);
    return res.status(500).json({ error: 'We could not save your request. Please try again.' });
  }
});

module.exports = router;
