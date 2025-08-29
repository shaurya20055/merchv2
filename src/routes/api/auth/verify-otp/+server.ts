// src/routes/api/auth/verify-otp/+server.ts

import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { supabase } from '$lib/supabaseClient';

export const POST: RequestHandler = async ({ request }) => {
  try {
    const { email, token } = await request.json();

    if (!email || !token) {
      return json({ error: 'Email and OTP are required' }, { status: 400 });
    }

    const { data, error } = await supabase.auth.verifyOtp({
      email: email,
      token: token,
      // THE FIX IS HERE:
      // Even though we customized the email to show a 6-digit code,
      // we are still using the "Magic Link" email template, so the
      // correct type for verification is 'magiclink'.
      type: 'magiclink',
    });

    if (error) {
      throw error;
    }

    // If verification is successful, data contains the user session
    return json({ success: true, session: data.session });

  } catch (error: any) {
    console.error('Error verifying OTP:', error);
    // Corrected 'message' to 'error.message'
    return json({ error: error.message || 'Failed to verify OTP' }, { status: 500 });
  }
};
