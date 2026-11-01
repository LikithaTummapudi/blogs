import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// Environment variables
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';

let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (client) return client;
  if (!supabaseUrl || !supabaseKey) {
    return null;
  }
  client = createClient(supabaseUrl, supabaseKey);
  return client;
}

export interface Subscriber {
  id: string;
  email: string;
  status: 'active' | 'unsubscribed';
  token: string;
  created_at: string;
  updated_at: string;
}

/**
 * Returns total count of active subscribers
 */
export async function getActiveSubscriberCount(): Promise<number> {
  const supabase = getSupabase();
  if (!supabase) return 0;

  try {
    const { count, error } = await supabase
      .from('subscribers')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active');

    if (error) {
      console.error('Supabase error fetching subscriber count:', error.message);
      return 0;
    }
    return count || 0;
  } catch (err) {
    console.error('Failed to get subscriber count:', err);
    return 0;
  }
}

/**
 * Adds or reactivates a subscriber with a secure random token
 */
export async function addSubscriber(email: string): Promise<{
  success: boolean;
  status: 'created' | 'already_active' | 'reactivated';
  token: string;
  error?: string;
}> {
  const supabase = getSupabase();
  if (!supabase) {
    return {
      success: false,
      status: 'created',
      token: '',
      error: 'Supabase is not configured. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.',
    };
  }

  const cleanEmail = email.trim().toLowerCase();

  try {
    // 1. Check if email already exists
    const { data: existing, error: fetchErr } = await supabase
      .from('subscribers')
      .select('id, email, status, token')
      .eq('email', cleanEmail)
      .maybeSingle();

    if (fetchErr) {
      return { success: false, status: 'created', token: '', error: fetchErr.message };
    }

    if (existing) {
      if (existing.status === 'active') {
        return { success: true, status: 'already_active', token: existing.token };
      }

      // Reactivate unsubscribed user with new/existing token
      const { error: updateErr } = await supabase
        .from('subscribers')
        .update({
          status: 'active',
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id);

      if (updateErr) {
        return { success: false, status: 'created', token: '', error: updateErr.message };
      }

      return { success: true, status: 'reactivated', token: existing.token };
    }

    // 2. Create new subscriber
    const token = crypto.randomUUID();
    const now = new Date().toISOString();

    const { error: insertErr } = await supabase.from('subscribers').insert({
      email: cleanEmail,
      status: 'active',
      token,
      created_at: now,
      updated_at: now,
    });

    if (insertErr) {
      return { success: false, status: 'created', token: '', error: insertErr.message };
    }

    return { success: true, status: 'created', token };
  } catch (err: any) {
    return { success: false, status: 'created', token: '', error: err.message || 'Unknown database error' };
  }
}

/**
 * Unsubscribe a user using their secure token
 */
export async function unsubscribeByToken(token: string): Promise<{
  success: boolean;
  email?: string;
  error?: string;
}> {
  const supabase = getSupabase();
  if (!supabase) {
    return { success: false, error: 'Database service not configured.' };
  }

  try {
    const { data, error } = await supabase
      .from('subscribers')
      .update({
        status: 'unsubscribed',
        updated_at: new Date().toISOString(),
      })
      .eq('token', token)
      .select('email')
      .maybeSingle();

    if (error) {
      return { success: false, error: error.message };
    }

    if (!data) {
      return { success: false, error: 'Invalid or expired unsubscribe link.' };
    }

    return { success: true, email: data.email };
  } catch (err: any) {
    return { success: false, error: err.message || 'Unknown error during unsubscribe' };
  }
}

/**
 * Fetches all active subscriber emails and tokens
 */
export async function getAllActiveSubscribers(): Promise<Array<{ email: string; token: string }>> {
  const supabase = getSupabase();
  if (!supabase) return [];

  try {
    const { data, error } = await supabase
      .from('subscribers')
      .select('email, token')
      .eq('status', 'active');

    if (error) {
      console.error('Error fetching subscribers for notification:', error.message);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error('Failed to get active subscribers:', err);
    return [];
  }
}

/**
 * Checks if a notification has already been sent for an article slug
 */
export async function hasNotificationBeenSent(slug: string): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase) return false;

  try {
    const { data } = await supabase
      .from('sent_notifications')
      .select('id')
      .eq('article_slug', slug)
      .maybeSingle();

    return !!data;
  } catch {
    return false;
  }
}

/**
 * Records that a notification was sent to prevent duplicate blasts
 */
export async function recordNotificationSent(slug: string, title: string, count: number): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) return;

  try {
    await supabase.from('sent_notifications').insert({
      article_slug: slug,
      title,
      recipient_count: count,
      sent_at: new Date().toISOString(),
    });
  } catch (err) {
    console.error('Failed to record notification sent:', err);
  }
}
