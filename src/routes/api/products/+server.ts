// src/routes/api/products/+server.ts

import { json } from '@sveltejs/kit';
import { supabase } from '$lib/supabaseClient';

/**
 * Handles GET requests to /api/products.
 * Fetches all records from the 'products' table in Supabase.
 */
export async function GET() {
  // Use the Supabase client to select all columns (*) from the 'products' table.
  const { data: products, error } = await supabase
    .from('products')
    .select('*');

  // If there was an error during the fetch operation...
  if (error) {
    // Log the detailed error to the server console for debugging.
    console.error('Error fetching products from Supabase:', error);
    
    // Return a JSON response with a 500 Internal Server Error status.
    return json({ error: 'Failed to fetch products' }, { status: 500 });
  }

  // If the fetch was successful, return the product data as a JSON response.
  return json(products);
}