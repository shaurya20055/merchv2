// src/routes/api/orders/+server.ts

import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { supabase } from '$lib/supabaseClient';

// We add `fetch` to the function's arguments, which is provided by SvelteKit for server-side API calls.
export const POST: RequestHandler = async ({ request, fetch }) => {
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
        include_ml_club_logo,
        customPrintText,
        quantity
    } = orderDetails;

    if (!product || !screenshotUrl || !fullName || !email || !deliveryAddress) {
      return json({ error: 'Missing required order details' }, { status: 400 });
    }

    // --- Check for existing order (Functionality Preserved) ---
    const { data: existingOrder, error: checkError } = await supabase
      .from('orders')
      .select('email')
      .eq('email', email)
      .maybeSingle();

    if (checkError) {
      console.error('Error checking for existing order:', checkError);
      return json({ error: 'Could not verify your order status. Please try again.' }, { status: 500 });
    }

    if (existingOrder) {
      return json({ error: 'An order has already been placed with this email address.' }, { status: 409 });
    }
    // -----------------------------------------------------------

    // 1. Save order to the database
    const { data: orderData, error } = await supabase
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
          include_ml_club_logo: include_ml_club_logo,
          custom_print_text: customPrintText,
          quantity: quantity
        },
      ])
      .select()
      .single(); // Using .single() to ensure we get a single object back

    if (error) {
      console.error('Supabase insert error:', error);
      throw new Error('Failed to save order to the database.');
    }

    // 2. --- MODIFIED: Call the new Nodemailer API route instead of the Edge Function ---
    if (orderData) {
      console.log('Order saved. Attempting to send confirmation email via Nodemailer...');
      
      // We pass all the original details, plus the new order ID from the database, to the email API
      const emailResponse = await fetch('/api/send-email', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({ orderDetails: { ...orderDetails, id: orderData.id } })
      });
      
      if (!emailResponse.ok) {
        console.error('Failed to send confirmation email.');
      } else {
        console.log('Confirmation email sent successfully.');
      }
    }
    // ------------------------------------------------------------------------------------

    return json({ success: true, order: orderData });

  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
    console.error('Error in /api/orders:', errorMessage);
    return json({ error: 'Failed to save order', details: errorMessage }, { status: 500 });
  }
}

