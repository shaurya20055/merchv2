import { json } from '@sveltejs/kit';
import { supabase } from '$lib/supabaseClient';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
  try {
    // --- Step 1: Define IST Timezone and get today's date ---
    // Use Intl.DateTimeFormat to get the date in 'YYYY-MM-DD' format for the Asia/Kolkata timezone.
    const options: Intl.DateTimeFormatOptions = { timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit' };
    const formatter = new Intl.DateTimeFormat('en-CA', options); // 'en-CA' locale reliably gives YYYY-MM-DD
    const today = formatter.format(new Date());

    const { data: availableQrCodes, error: fetchError } = await supabase
      .from('qr_codes')
      .select('id, qr_code_url, usage_count, last_used_at')
      .eq('is_active', true)
      .lt('usage_count', 20);

    if (fetchError) {
      console.error('Supabase error fetching QR codes:', fetchError);
      throw new Error('Could not fetch QR codes.');
    }
    
    // Filter out codes that were used today but have hit the limit.
    const validQrCodes = availableQrCodes.filter(qr => {
        if (!qr.last_used_at) return true; // Never used before
        // Convert the last_used_at timestamp (which is in UTC) to an IST date string for comparison
        const lastUsedDate = formatter.format(new Date(qr.last_used_at));
        return lastUsedDate < today || qr.usage_count < 20;
    });

    if (!validQrCodes || validQrCodes.length === 0) {
      return json({ error: 'All available payment methods are currently busy. Please try again in a few minutes.' }, { status: 503 });
    }

    // --- Step 2: Select a random QR and update its count ---
    const randomIndex = Math.floor(Math.random() * validQrCodes.length);
    const chosenQr = validQrCodes[randomIndex];

    // Convert the last_used_at timestamp to an IST date string for the reset logic
    const lastUsedDate = chosenQr.last_used_at ? formatter.format(new Date(chosenQr.last_used_at)) : null;
    
    let newUsageCount;
    // If the QR has never been used OR was last used (in IST) before today, reset the counter.
    if (!lastUsedDate || lastUsedDate < today) {
        newUsageCount = 1;
    } else {
        newUsageCount = chosenQr.usage_count + 1;
    }
    
    const { error: updateError } = await supabase
      .from('qr_codes')
      .update({ 
        usage_count: newUsageCount,
        last_used_at: new Date().toISOString() // Still save as UTC timestamp, which is standard
      })
      .eq('id', chosenQr.id);

    if (updateError) {
      console.error('Supabase error updating QR code count:', updateError);
    }

    return json({ qr_code_url: chosenQr.qr_code_url });

  } catch (err) {
    if (err instanceof Error) {
      return json({ error: err.message }, { status: 500 });
    }
    return json({ error: 'An unknown error occurred.' }, { status: 500 });
  }
};

