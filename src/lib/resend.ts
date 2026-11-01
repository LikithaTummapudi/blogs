import { Resend } from 'resend';

const resendApiKey = process.env.RESEND_API_KEY || '';
const emailFrom = process.env.EMAIL_FROM || "Likitha's Blog <onboarding@resend.dev>";
const siteUrl = process.env.SITE_URL || 'https://my-editorial-blog.vercel.app';

let resendInstance: Resend | null = null;

export function getResend(): Resend | null {
  if (resendInstance) return resendInstance;
  if (!resendApiKey) return null;
  resendInstance = new Resend(resendApiKey);
  return resendInstance;
}

/**
 * Generates editorial HTML email wrapper matching the blog's visual identity
 */
function renderEmailShell(contentHtml: string, unsubscribeUrl?: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Chronicles & Code</title>
</head>
<body style="margin:0;padding:0;background-color:#FAF7F2;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#1A1918;line-height:1.6;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#FAF7F2;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:580px;background-color:#FFFFFF;border:1px solid #E7E2D8;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.04);">
          <!-- Header Bar -->
          <tr>
            <td style="padding:28px 32px;border-bottom:1px solid #ECE3D4;background-color:#FAF7F2;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <span style="display:inline-block;width:28px;height:28px;line-height:28px;text-align:center;background-color:#1A1918;color:#FAF7F2;font-family:Georgia,serif;font-weight:bold;font-size:14px;border-radius:6px;margin-right:10px;vertical-align:middle;">C</span>
                    <span style="font-family:Georgia,serif;font-size:18px;font-weight:bold;color:#1A1918;vertical-align:middle;">Chronicles &amp; Code</span>
                  </td>
                  <td align="right">
                    <span style="font-size:11px;font-family:monospace;color:#736E67;text-transform:uppercase;letter-spacing:1px;">Likitha Tummapudi</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Content Body -->
          <tr>
            <td style="padding:36px 32px;">
              ${contentHtml}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 32px;background-color:#F5EFE6;border-top:1px solid #ECE3D4;font-size:12px;color:#736E67;text-align:center;">
              <p style="margin:0 0 8px 0;">You received this email because you subscribed to Likitha Tummapudi's personal technical publication.</p>
              ${
                unsubscribeUrl
                  ? `<p style="margin:0;"><a href="${unsubscribeUrl}" style="color:#C2593F;text-decoration:underline;">Unsubscribe</a> &bull; <a href="${siteUrl}" style="color:#736E67;text-decoration:none;">Visit Website</a></p>`
                  : `<p style="margin:0;"><a href="${siteUrl}" style="color:#736E67;text-decoration:none;">Visit Website</a></p>`
              }
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

/**
 * Sends a welcome email to a new subscriber
 */
export async function sendWelcomeEmail(toEmail: string, token: string): Promise<{ success: boolean; error?: string }> {
  const resend = getResend();
  if (!resend) {
    console.warn('Resend API key not configured. Welcome email not sent.');
    return { success: false, error: 'Resend is not configured. Set RESEND_API_KEY.' };
  }

  const unsubscribeUrl = `${siteUrl}/api/unsubscribe?token=${token}`;

  const bodyHtml = `
    <h2 style="font-family:Georgia,serif;font-size:24px;color:#1A1918;margin:0 0 16px 0;line-height:1.25;">Welcome to Chronicles &amp; Code!</h2>
    <p style="font-size:15px;color:#3D3A37;margin:0 0 16px 0;">Hello,</p>
    <p style="font-size:15px;color:#3D3A37;margin:0 0 16px 0;">
      Thank you for subscribing to my personal publication. I am <strong>Likitha Tummapudi</strong>, a Computer Science student at VIT-AP University.
    </p>
    <p style="font-size:15px;color:#3D3A37;margin:0 0 16px 0;">
      Whenever I publish a new article exploring artificial intelligence, machine learning, systems architecture, or practical software experiments, you will receive a clean, thoughtful summary directly in your inbox.
    </p>
    <div style="margin:28px 0;padding:20px;background-color:#FAF7F2;border-left:3px solid #C2593F;border-radius:4px;">
      <p style="margin:0;font-family:Georgia,serif;font-style:italic;color:#282624;font-size:14px;">
        "Writing about what you learn turns passive consumption into active mastery."
      </p>
    </div>
    <table cellpadding="0" cellspacing="0" style="margin:24px 0 12px 0;">
      <tr>
        <td style="background-color:#1A1918;border-radius:6px;text-align:center;">
          <a href="${siteUrl}" style="display:inline-block;padding:12px 24px;font-size:13px;font-weight:bold;color:#FAF7F2;text-decoration:none;letter-spacing:0.5px;">Visit the Publication &rarr;</a>
        </td>
      </tr>
    </table>
    <p style="font-size:13px;color:#736E67;margin:24px 0 0 0;">
      Warm regards,<br>
      <strong>Likitha Tummapudi</strong>
    </p>
  `;

  const fullHtml = renderEmailShell(bodyHtml, unsubscribeUrl);

  try {
    const { error } = await resend.emails.send({
      from: emailFrom,
      to: toEmail,
      subject: "You're subscribed to Likitha's Blog!",
      html: fullHtml,
    });

    if (error) {
      console.error('Error sending welcome email with Resend:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    console.error('Failed to send welcome email:', err);
    return { success: false, error: err.message || 'Unknown error' };
  }
}

/**
 * Sends a notification email about a newly published article to all active subscribers
 */
export async function sendNewArticleNotification(
  article: {
    title: string;
    description: string;
    category: string;
    slug: string;
    coverImage?: string;
  },
  subscribers: Array<{ email: string; token: string }>
): Promise<{ success: boolean; sentCount: number; error?: string }> {
  const resend = getResend();
  if (!resend) {
    console.warn('Resend API key not configured. Notifications not sent.');
    return { success: false, sentCount: 0, error: 'Resend API key missing' };
  }

  if (subscribers.length === 0) {
    return { success: true, sentCount: 0 };
  }

  const articleUrl = `${siteUrl}/blogs/${article.slug}`;
  let sentCount = 0;

  for (const subscriber of subscribers) {
    const unsubscribeUrl = `${siteUrl}/api/unsubscribe?token=${subscriber.token}`;

    const bodyHtml = `
      <div style="margin-bottom:12px;">
        <span style="display:inline-block;padding:3px 10px;background-color:#FDF6F4;color:#C2593F;border:1px solid #F3D5CA;border-radius:12px;font-size:11px;font-family:monospace;text-transform:uppercase;font-weight:600;">
          ${article.category}
        </span>
      </div>
      <h2 style="font-family:Georgia,serif;font-size:24px;color:#1A1918;margin:0 0 14px 0;line-height:1.25;">
        ${article.title}
      </h2>
      <p style="font-size:15px;color:#3D3A37;margin:0 0 20px 0;line-height:1.6;">
        ${article.description}
      </p>
      ${
        article.coverImage
          ? `<div style="margin:0 0 24px 0;"><img src="${article.coverImage.startsWith('http') ? article.coverImage : `${siteUrl}${article.coverImage}`}" alt="${article.title}" style="width:100%;max-height:280px;object-fit:cover;border-radius:8px;border:1px solid #E7E2D8;" /></div>`
          : ''
      }
      <table cellpadding="0" cellspacing="0" style="margin:24px 0 12px 0;">
        <tr>
          <td style="background-color:#1A1918;border-radius:6px;text-align:center;">
            <a href="${articleUrl}" style="display:inline-block;padding:12px 24px;font-size:13px;font-weight:bold;color:#FAF7F2;text-decoration:none;letter-spacing:0.5px;">Read Full Article &rarr;</a>
          </td>
        </tr>
      </table>
      <p style="font-size:13px;color:#736E67;margin:24px 0 0 0;">
        Written by <strong>Likitha Tummapudi</strong>
      </p>
    `;

    const fullHtml = renderEmailShell(bodyHtml, unsubscribeUrl);

    try {
      await resend.emails.send({
        from: emailFrom,
        to: subscriber.email,
        subject: `New Article: ${article.title}`,
        html: fullHtml,
      });
      sentCount++;
    } catch (err) {
      console.error(`Failed to send notification to ${subscriber.email}:`, err);
    }
  }

  return { success: true, sentCount };
}
