const { supabasePublic } = require('./supabase');

async function fetchAvailableProducts() {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
    console.error('[Soilixa] Missing SUPABASE_URL or SUPABASE_ANON_KEY');
    throw new Error('Supabase not configured');
  }

  console.info('[Soilixa] Querying products where is_available = true');

  // PostgREST applies a maximum response size (commonly 1,000 rows). Fetch
  // explicitly in pages so larger catalogs are not silently truncated.
  const pageSize = 1000;
  const data = [];
  let from = 0;

  while (true) {
    const { data: page, error } = await supabasePublic
      .from('products')
      .select('*')
      .eq('is_available', true)
      .order('created_at', { ascending: false })
      .order('id', { ascending: true })
      .range(from, from + pageSize - 1);

    if (error) {
      console.error('[Soilixa] Supabase products query failed:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      });
      throw error;
    }

    data.push(...page);
    if (page.length < pageSize) break;
    from += pageSize;
  }

  console.info('[Soilixa] Products fetched:', Array.isArray(data) ? data.length : 0);
  return data;
}

async function getProductById(id) {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
    console.error('[Soilixa] Missing SUPABASE_URL or SUPABASE_ANON_KEY');
    throw new Error('Supabase not configured');
  }

  const { data, error } = await supabasePublic.from('products').select('*').eq('id', id).eq('is_available', true).single();
  if (error) {
    console.error('[Soilixa] Supabase product-by-id failed:', {
      id,
      message: error.message,
      code: error.code
    });
    throw error;
  }
  return data;
}

module.exports = {
  fetchAvailableProducts,
  getProductById
};
