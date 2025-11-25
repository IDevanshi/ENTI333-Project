// Resend integration for email delivery
import { Resend } from 'resend';

let connectionSettings: any;

async function getCredentials() {
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;

  if (!xReplitToken) {
    throw new Error('X_REPLIT_TOKEN not found for repl/depl');
  }

  connectionSettings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=resend',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    }
  ).then(res => res.json()).then(data => data.items?.[0]);

  if (!connectionSettings || (!connectionSettings.settings.api_key)) {
    throw new Error('Resend not connected');
  }
  return {
    apiKey: connectionSettings.settings.api_key, 
    fromEmail: connectionSettings.settings.from_email
  };
}

// WARNING: Never cache this client.
// Access tokens expire, so a new client must be created each time.
// Always call this function again to get a fresh client.
export async function getUncachableResendClient() {
  const credentials = await getCredentials();
  return {
    client: new Resend(credentials.apiKey),
    fromEmail: connectionSettings.settings.from_email
  };
}

// Send verification email with 6-digit code
export async function sendVerificationEmail(toEmail: string, verificationCode: string): Promise<boolean> {
  try {
    const { client, fromEmail } = await getUncachableResendClient();
    
    // Always use a verified sender domain - Resend's test domain for development
    // The user's email domain (e.g., gmail.com) cannot be used as a sender
    const senderEmail = 'CampusConnect <onboarding@resend.dev>';
    
    const result = await client.emails.send({
      from: senderEmail,
      to: toEmail,
      subject: 'Verify your CampusConnect account',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #7C3AED; text-align: center;">Welcome to CampusConnect!</h1>
          <p style="font-size: 16px; color: #333;">
            Thank you for signing up. To complete your registration, please enter this verification code:
          </p>
          <div style="background-color: #F3F4F6; border-radius: 8px; padding: 20px; text-align: center; margin: 24px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #7C3AED;">
              ${verificationCode}
            </span>
          </div>
          <p style="font-size: 14px; color: #666;">
            This code will expire in 10 minutes. If you didn't request this, please ignore this email.
          </p>
          <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 24px 0;" />
          <p style="font-size: 12px; color: #999; text-align: center;">
            CampusConnect - Building meaningful campus connections
          </p>
        </div>
      `
    });
    
    console.log('Verification email sent:', result);
    return true;
  } catch (error) {
    console.error('Failed to send verification email:', error);
    return false;
  }
}
