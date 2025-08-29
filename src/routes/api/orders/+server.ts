// src/routes/api/orders/+server.ts

import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { supabase } from '$lib/supabaseClient';

export const POST: RequestHandler = async ({ request }) => {
  try {
    const { 
        product, 
        screenshotUrl,
        fullName,
        email,
        phoneNumber,
        tshirtSize,
        deliveryAddress,
        // Get the new logo choices from the request
        include_nits_logo,
        include_ml_club_logo
    } = await request.json();

    if (!product || !screenshotUrl || !fullName || !email || !deliveryAddress) {
      return json({ error: 'Missing required order details' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('orders')
      .insert([
        { 
          product_name: product.name, 
          product_price: product.price,
          screenshot_url: screenshotUrl,
          full_name: fullName,
          email: email,
          phone_number: phoneNumber,
          tshirt_size: tshirtSize,
          delivery_address: deliveryAddress,
          // Save the new logo choices to the database
          include_nits_logo: include_nits_logo,
          include_ml_club_logo: include_ml_club_logo
        },
      ])
      .select();

    if (error) {
      console.error('Supabase insert error:', error);
      throw new Error('Failed to save order to the database.');
    }

    return json({ success: true, order: data });

  } catch (error) {
    console.error('Error in /api/orders:', error);
    return json({ error: 'Failed to save order' }, { status: 500 });
  }
}
