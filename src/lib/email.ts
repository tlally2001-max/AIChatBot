import { Resend } from 'resend'

export async function sendDemoEmail(
  prospectEmail: string,
  businessName: string,
  demoToken: string
): Promise<string> {
  const resend = new Resend(process.env.RESEND_API_KEY)
  const demoLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/demo/${demoToken}`

  const { data, error } = await resend.emails.send({
    from: 'demo@demoDrop.app',
    to: prospectEmail,
    subject: 'Your AI Receptionist Demo is Ready',
    html: generateEmailHTML(businessName, demoLink),
  })

  if (error) {
    throw new Error(`Failed to send email: ${error.message}`)
  }

  return data!.id
}

function generateEmailHTML(businessName: string, demoLink: string): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #2563eb; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 20px; }
          .cta { text-align: center; padding: 20px 0; }
          .button {
            display: inline-block;
            background: #2563eb;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: bold;
          }
          .footer { text-align: center; font-size: 12px; color: #666; padding: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Your Demo is Ready!</h1>
          </div>
          <div class="content">
            <p>Hi ${businessName} Team,</p>
            <p>We've created a personalized AI Receptionist demo specifically tailored for your business. Click below to explore how we can transform your customer interactions.</p>
            <div class="cta">
              <a href="${demoLink}" class="button">Launch Your Demo</a>
            </div>
            <p style="color: #666; font-size: 14px;">
              If the button doesn't work, you can also visit:<br>
              <code>${demoLink}</code>
            </p>
          </div>
          <div class="footer">
            <p>&copy; 2026 Demo Drop. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `
}
