const { supabaseAdmin } = require('./supabase');

async function generateOrderNumber() {
  const { data, error } = await supabaseAdmin
    .from('orders')
    .select('order_number')
    .like('order_number', 'SX-______')
    .order('order_number', { ascending: false })
    .limit(1);

  if (error) throw error;

  const lastNumber = data?.[0]?.order_number || 'SX-000000';
  const lastSequence = Number(lastNumber.split('-')[1] || 0);
  const nextSequence = String(lastSequence + 1).padStart(6, '0');
  return `SX-${nextSequence}`;
}

async function createOrder(payload) {
  if (!supabaseAdmin) throw new Error('Supabase not configured');

  let orderData = null;
  let attempt = 0;

  while (!orderData && attempt < 5) {
    attempt += 1;
    const orderNumber = await generateOrderNumber();
    const totalAmount = Number(
      payload.total_amount ?? (payload.items || []).reduce((sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0), 0)
    );

    const orderRecord = {
      order_number: orderNumber,
      customer_name: payload.customer_name,
      phone: payload.phone,
      address: payload.address,
      village: payload.village || null,
      taluk: payload.taluk || null,
      district: payload.district || null,
      state: payload.state || null,
      pincode: payload.pincode || null,
      total_amount: totalAmount,
      payment_status: payload.payment_status || 'Pending Payment',
      order_status: payload.order_status || 'New'
    };

    const { data, error } = await supabaseAdmin
      .from('orders')
      .insert(orderRecord)
      .select()
      .single();

    if (error) {
      if (error.code === '23505' || /duplicate key/i.test(error.message || '')) {
        continue;
      }
      throw error;
    }

    orderData = data;
  }

  if (!orderData) {
    throw new Error('Unable to generate a unique order number. Please try again.');
  }

  const items = (payload.items || []).map((it) => ({
    order_id: orderData.id,
    product_id: it.product_id || null,
    product_name: it.name || it.product_name || null,
    price: it.price,
    quantity: it.quantity,
    total: it.total
  }));

  const { data: itemsData, error: itemsError } = await supabaseAdmin
    .from('order_items')
    .insert(items)
    .select();

  if (itemsError) throw itemsError;

  return { order: orderData, items: itemsData };
}

async function getOrderByNumber(orderNumber) {
  if (!supabaseAdmin) throw new Error('Supabase not configured');

  const { data: order, error: orderError } = await supabaseAdmin
    .from('orders')
    .select('*')
    .eq('order_number', orderNumber)
    .single();

  if (orderError) throw orderError;

  const { data: items, error: itemsError } = await supabaseAdmin
    .from('order_items')
    .select('*')
    .eq('order_id', order.id);

  if (itemsError) throw itemsError;

  return { order, items };
}

async function getOrderById(id) {
  if (!supabaseAdmin) throw new Error('Supabase not configured');

  const { data: order, error: orderError } = await supabaseAdmin
    .from('orders')
    .select('*')
    .eq('id', id)
    .single();

  if (orderError) throw orderError;

  const { data: items, error: itemsError } = await supabaseAdmin
    .from('order_items')
    .select('*')
    .eq('order_id', order.id);

  if (itemsError) throw itemsError;

  return { order, items };
}

async function updateOrderStatus(orderNumber, updates) {
  if (!supabaseAdmin) throw new Error('Supabase not configured');

  const { data, error } = await supabaseAdmin
    .from('orders')
    .update({
      payment_status: updates.payment_status,
      order_status: updates.order_status
    })
    .eq('order_number', orderNumber)
    .select()
    .single();

  if (error) throw error;
  return data;
}

module.exports = {
  createOrder,
  getOrderByNumber,
  updateOrderStatus
};
