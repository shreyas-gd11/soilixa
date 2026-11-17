const PDFDocument = require('pdfkit');

function generateInvoice(order, items, callback) {
  const doc = new PDFDocument({ size: 'A4', margin: 50 });
  const buffers = [];

  doc.on('data', buffers.push.bind(buffers));
  doc.on('end', () => {
    const pdfData = Buffer.concat(buffers);
    callback(null, pdfData);
  });

  // Header
  doc.fontSize(20).text('Soilixa', { align: 'left' });
  doc.fontSize(10).text('Order Bill', { align: 'right' });
  doc.moveDown();

  doc.fontSize(12).text(`Bill Reference: ${order.order_number}`);
  doc.text(`Order Number: ${order.order_number}`);
  doc.text(`Date: ${new Date(order.created_at).toLocaleString()}`);
  doc.moveDown();

  doc.text(`Customer: ${order.customer_name}`);
  doc.text(`Phone: ${order.phone}`);
  if (order.email) doc.text(`Email: ${order.email}`);
  doc.text(`Address: ${order.address}, ${order.village || ''} ${order.taluk || ''} ${order.district || ''} ${order.state || ''} - ${order.pincode || ''}`);
  const paymentMethod = order.payment_method === 'online_contact'
    ? 'Online payment - contact Soilixa'
    : order.payment_method === 'cash_on_delivery'
      ? 'Cash on Delivery'
      : 'Contact Soilixa to confirm the payment method';
  doc.text(`Payment method: ${paymentMethod}`);
  doc.moveDown();

  // Table header
  doc.fontSize(10).text('Items:', { underline: true });
  doc.moveDown(0.5);

  items.forEach((it) => {
    doc.text(`${it.product_name} — ${it.quantity} x ₹${it.price} = ₹${it.total}`);
  });

  const totalAmount = Number(order.total_amount ?? 0);

  doc.moveDown();
  doc.fontSize(12).text(`Grand Total: ₹${totalAmount}`, { underline: true });

  doc.moveDown(2);
  doc.fontSize(10).text('This is an order bill, not a final tax invoice. Soilixa will contact you to confirm final billing and delivery details.', { align: 'center' });
  doc.moveDown();
  doc.fontSize(10).text('Thank you for purchasing from Soilixa.', { align: 'center' });

  doc.end();
}

module.exports = { generateInvoice };
