export const prerender = false;

import type { APIRoute } from 'astro';
import { addSubscriber } from '../../lib/supabase';
import { sendWelcomeEmail } from '../../lib/resend';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const email = body.email?.trim().toLowerCase();

    // 1. Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: 'Please enter a valid email address.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 2. Add or reactivate in Supabase
    const result = await addSubscriber(email);

    if (!result.success) {
      return new Response(
        JSON.stringify({ error: result.error || 'Failed to save subscription.' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 3. If newly created or reactivated, send welcome email
    if (result.status === 'created' || result.status === 'reactivated') {
      // Fire welcome email asynchronously
      sendWelcomeEmail(email, result.token).catch((err) => {
        console.error('Welcome email dispatch failed:', err);
      });
    }

    const message =
      result.status === 'already_active'
        ? "You are already actively subscribed to Likitha's blog!"
        : "You're subscribed! A welcome email has been sent to your inbox.";

    return new Response(
      JSON.stringify({ success: true, message, status: result.status }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message || 'Server error processing subscription.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
