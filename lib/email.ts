import { Resend } from 'resend'

// Allow build to proceed without RESEND_API_KEY (build time vs runtime)
const resend = new Resend(process.env.RESEND_API_KEY || 'placeholder_key')

export async function sendPasswordResetEmail(
  email: string,
  resetToken: string
) {
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password/${resetToken}`

  await resend.emails.send({
    from: 'LandlordOS <noreply@landlordos.com>',
    to: email,
    subject: 'Reset your password',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2563EB;">Reset Your Password</h1>
        <p>You requested to reset your password. Click the link below to set a new password:</p>
        <p>
          <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background-color: #2563EB; color: white; text-decoration: none; border-radius: 6px;">
            Reset Password
          </a>
        </p>
        <p style="color: #64748B; font-size: 14px;">
          This link will expire in 1 hour. If you didn't request this, you can safely ignore this email.
        </p>
        <p style="color: #64748B; font-size: 12px;">
          Or copy and paste this URL into your browser:<br>
          ${resetUrl}
        </p>
      </div>
    `,
  })
}

export async function sendWelcomeEmail(email: string, name: string) {
  await resend.emails.send({
    from: 'LandlordOS <noreply@landlordos.com>',
    to: email,
    subject: 'Welcome to LandlordOS!',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2563EB;">Welcome to LandlordOS, ${name}!</h1>
        <p>Your account has been created successfully. You can now start managing your properties.</p>
        <p>
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" style="display: inline-block; padding: 12px 24px; background-color: #2563EB; color: white; text-decoration: none; border-radius: 6px;">
            Go to Dashboard
          </a>
        </p>
        <p style="color: #64748B; font-size: 14px;">
          Need help? Reply to this email or visit our help center.
        </p>
      </div>
    `,
  })
}
