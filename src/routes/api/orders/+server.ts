// src/routes/api/orders/+server.ts

import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
// Import the regular client for database operations
import { supabase } from '$lib/supabaseClient';
// --- NEW: Import tools to create a special admin client ---
import { createClient } from '@supabase/supabase-js';
import { env } from '$env/dynamic/private';
// -----------------------------------------------------------

export const POST: RequestHandler = async ({ request }) => {
  try {
    const orderDetails = await request.json();
    const { 
        product, 
        screenshotUrl,
        fullName,
        email,
        phoneNumber,
        tshirtSize,
        deliveryAddress,
        include_nits_logo,
        include_ml_club_logo
    } = orderDetails;

    if (!product || !screenshotUrl || !fullName || !email || !deliveryAddress) {
      return json({ error: 'Missing required order details' }, { status: 400 });
    }

    // 1. Save order to the database using the regular client
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
          include_nits_logo: include_nits_logo,
          include_ml_club_logo: include_ml_club_logo
        },
      ])
      .select();

    if (error) {
      console.error('Supabase insert error:', error);
      throw new Error('Failed to save order to the database.');
    }

    // 2. --- MODIFIED: Invoke the Edge Function using the admin client ---
    if (data) {
      // Create a new admin client with the service role key to get permissions
      const supabaseAdmin = createClient(
        'https://qxuoklwlejtcgjugdkpb.supabase.co', // Your Supabase project URL
        env.SUPABASE_SERVICE_ROLE_KEY
      );
      
      console.log('Order saved successfully. Attempting to invoke email function...');
      const { error: invokeError } = await supabaseAdmin.functions.invoke('send-order-confirmation', {
        body: { orderDetails },
      });

      if (invokeError) {
        console.error('Error invoking email function:', invokeError);
      } else {
        console.log('Email function invoked successfully.');
      }
    }
    // ----------------------------------------------------------------------

    return json({ success: true, order: data });

  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
    console.error('Error in /api/orders:', errorMessage);
    return json({ error: 'Failed to save order', details: errorMessage }, { status: 500 });
  }
}

