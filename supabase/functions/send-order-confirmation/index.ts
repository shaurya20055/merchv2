// supabase/functions/send-order-confirmation/index.ts

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS_HEADERS })
  }

  try {
    const { orderDetails } = await req.json()
    
    // --- IMPORTANT: Using Resend's default address for testing ---
    // Since you don't have a custom domain, we use this default 'from' address.
    // NOTE: Emails will ONLY be sent TO your verified Resend login email.
    // To send to any customer, you must verify a custom domain with Resend.
    const fromAddress = 'onboarding@resend.dev' 
    // -----------------------------------------------------------------

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: fromAddress,
        to: orderDetails.email,
        subject: 'Your ML Club Order is Confirmed!',
        html: `
          <h1>Thanks for your order, ${orderDetails.fullName}!</h1>
          <p>We've received your order and will begin processing it shortly.</p>
          <h3>Order Summary:</h3>
          <ul>
            <li>Product: ${orderDetails.product.name}</li>
            <li>Price: ₹${orderDetails.product.price}</li>
            <li>Size: ${orderDetails.tshirtSize}</li>
            <li>Delivery Address: ${orderDetails.deliveryAddress}</li>
            ${orderDetails.include_nits_logo ? '<li>Customization: Includes NIT Silchar Logo</li>' : ''}
            ${orderDetails.include_ml_club_logo ? '<li>Customization: Includes ML Club Logo</li>' : ''}
          </ul>
          <p>We will contact you once your payment has been verified.</p>
        `,
      }),
    })

    const data = await res.json()

    return new Response(JSON.stringify(data), {
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
```

After you update this file, you must **re-deploy the function** for the changes to take effect:
```bash
npx supabase functions deploy send-order-confirmation

