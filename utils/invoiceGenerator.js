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
  doc.fontSize(10).text('Invoice', { align: 'right' });
  doc.moveDown();

  doc.fontSize(12).text(`Invoice Number: INV-${order.order_number}`);
  doc.text(`Order Number: ${order.order_number}`);
  doc.text(`Date: ${new Date(order.created_at).toLocaleString()}`);
  doc.moveDown();

  doc.text(`Customer: ${order.customer_name}`);
  doc.text(`Phone: ${order.phone}`);
  if (order.email) doc.text(`Email: ${order.email}`);
  doc.text(`Address: ${order.address}, ${order.village || ''} ${order.taluk || ''} ${order.district || ''} ${order.state || ''} - ${order.pincode || ''}`);
  doc.moveDown();

  // Table header
  doc.fontSize(10).text('Items:', { underline: true });
  doc.moveDown(0.5);

  items.forEach((it) => {
    doc.text(`${it.product_name} — ${it.quantity} x ₹${it.price} = ₹${it.total}`);
  });

  doc.moveDown();
  doc.text(`Subtotal: ₹${order.subtotal}`);
  doc.text(`GST: ₹${order.gst}`);
  doc.text(`Delivery: ₹${order.delivery_charge}`);
  doc.fontSize(12).text(`Total: ₹${order.total_amount}`, { underline: true });

  doc.moveDown(2);
  doc.fontSize(10).text('Thank you for purchasing from Soilixa.', { align: 'center' });

  doc.end();
}

module.exports = { generateInvoice };
