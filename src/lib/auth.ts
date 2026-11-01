import crypto from 'node:crypto';

export const ADMIN_USERNAME = (process.env.ADMIN_USERNAME || 'LikithaTummapudi').toLowerCase();
export const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'LikithaLucky#1';
const SESSION_SECRET = process.env.SESSION_SECRET || 'likitha-blog-editorial-secret-key-2026';

// 30 days in seconds (30 * 24 * 60 * 60 = 2,592,000)
export const SESSION_DURATION_SECONDS = 30 * 24 * 60 * 60;

export interface AdminUser {
  username: string;
  name: string;
  avatar_url: string;
  github_token?: string;
}

/**
 * Validates the admin password in constant time to prevent timing attacks.
 * Defaults to 'LikithaLucky#1' if ADMIN_PASSWORD is not set in environment.
 */
export function verifyAdminPassword(password: string): boolean {
  if (!password || typeof password !== 'string') return false;

  const currentExpected = process.env.ADMIN_PASSWORD || 'LikithaLucky#1';
  const inputBuffer = Buffer.from(password);
  const expectedBuffer = Buffer.from(currentExpected);

  if (inputBuffer.length !== expectedBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(inputBuffer, expectedBuffer);
}

/**
 * Signs and creates a 30-day session cookie string using HMAC-SHA256
 */
export function createSessionCookie(
  user: AdminUser,
  durationSeconds: number = SESSION_DURATION_SECONDS
): string {
  const expiresAt = Date.now() + durationSeconds * 1000;
  const payload = JSON.stringify({
    ...user,
    expiresAt,
  });

  const base64Payload = Buffer.from(payload).toString('base64url');
  const hmac = crypto.createHmac('sha256', SESSION_SECRET);
  hmac.update(base64Payload);
  const signature = hmac.digest('base64url');

  return `${base64Payload}.${signature}`;
}

/**
 * Verifies and parses session cookie
 */
export function verifySessionCookie(cookieValue?: string): AdminUser | null {
  if (!cookieValue) return null;

  const parts = cookieValue.split('.');
  if (parts.length !== 2) return null;

  const [base64Payload, signature] = parts;

  // Verify HMAC signature
  const hmac = crypto.createHmac('sha256', SESSION_SECRET);
  hmac.update(base64Payload);
  const expectedSig = hmac.digest('base64url');

  if (signature !== expectedSig) {
    return null;
  }

  try {
    const raw = Buffer.from(base64Payload, 'base64url').toString('utf-8');
    const data = JSON.parse(raw);

    if (data.expiresAt && data.expiresAt < Date.now()) {
      return null;
    }

    if (data.username?.toLowerCase() !== ADMIN_USERNAME) {
      return null;
    }

    return {
      username: data.username,
      name: data.name || data.username,
      avatar_url: data.avatar_url || '',
      github_token: data.github_token || '',
    };
  } catch {
    return null;
  }
}

/**
 * Checks if request is from authorized admin
 */
export function getAuthenticatedUser(request: Request): AdminUser | null {
  const cookieHeader = request.headers.get('cookie') || '';
  const match = cookieHeader.match(/admin_session=([^;]+)/);
  if (!match) return null;

  return verifySessionCookie(match[1]);
}
