const { supabaseAdmin } = require('./supabase');

async function fetchAvailableProducts() {
  if (!supabaseAdmin) throw new Error('Supabase not configured');

  const { data, error } = await supabaseAdmin
    .from('products')
    .select('*')
    .eq('is_available', true)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

async function getProductById(id) {
  if (!supabaseAdmin) throw new Error('Supabase not configured');

  const { data, error } = await supabaseAdmin.from('products').select('*').eq('id', id).single();
  if (error) throw error;
  return data;
}

module.exports = {
  fetchAvailableProducts,
  getProductById
};
