// src/routes/api/auth/send-otp/+server.ts

import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { supabase } from '$lib/supabaseClient';

export const POST: RequestHandler = async ({ request }) => {
  try {
    const { email } = await request.json();

    if (!email) {
      return json({ error: 'Email is required' }, { status: 400 });
    }

    // Updated to include the options object
    const { error } = await supabase.auth.signInWithOtp({
      email: email,
      options: {
        // This allows new users to sign up, fixing the "stuck" issue.
        shouldCreateUser: true,
      }
    });

    if (error) {
      throw error;
    }

    return json({ success: true, message: 'OTP sent successfully' });

  } catch (error: any) {
    console.error('Error sending OTP:', error);
    return json({ error: error.message || 'Failed to send OTP' }, { status: 500 });
  }
};
