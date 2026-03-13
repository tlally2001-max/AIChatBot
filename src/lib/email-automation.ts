import { Resend } from 'resend'
import { BusinessProfile } from '@/types'

interface EmailParams {
  clientName: string
  businessName: string
  businessProfile: BusinessProfile
  prospectEmail: string
  demoToken: string
  appUrl: string
}

export async function sendPersonalizedDemoEmail(params: EmailParams): Promise<string> {
  const resend = new Resend(process.env.RESEND_API_KEY)

  const {
    clientName,
    businessName,
    businessProfile,
    prospectEmail,
    demoToken,
    appUrl,
  } = params

  // Build demo URL with tracking parameters
  const demoUrl = `${appUrl}/demo/${demoToken}?name=${encodeURIComponent(clientName)}&email=${encodeURIComponent(prospectEmail)}`

  // Email content with personalization
  const emailHtml = generateEmailHTML({
    clientName,
    businessName,
    demoUrl,
    businessProfile,
    demoToken,
  })

  try {
    const { data, error } = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: prospectEmail,
      subject: `As promised: Your new AI demo for ${businessName}`,
      html: emailHtml,
      headers: {
        'X-Demo-Token': demoToken,
        'X-Business-Name': businessName,
      },
    })

    if (error) {
      throw new Error(`Resend error: ${error.message}`)
    }

    return data!.id
  } catch (error) {
    console.error('Email send failed:', error)
    throw error
  }
}

function generateEmailHTML(params: {
  clientName: string
  businessName: string
  demoUrl: string
  businessProfile: BusinessProfile
  demoToken: string
}): string {
  const { clientName, businessName, demoUrl, businessProfile, demoToken } = params

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 0;
          }
          .container {
            background-color: #ffffff;
          }
          .header {
            background: linear-gradient(135deg, #2563eb 0%, #4f46e5 100%);
            color: white;
            padding: 40px 20px;
            text-align: center;
          }
          .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: bold;
          }
          .content {
            padding: 40px 20px;
            background-color: #f9fafb;
          }
          .content p {
            margin: 0 0 20px 0;
            font-size: 16px;
          }
          .highlight-box {
            background-color: #eff6ff;
            border-left: 4px solid #2563eb;
            padding: 20px;
            margin: 20px 0;
            border-radius: 4px;
          }
          .highlight-box h3 {
            margin-top: 0;
            color: #1e40af;
          }
          .highlight-box ul {
            margin: 10px 0;
            padding-left: 20px;
          }
          .highlight-box li {
            margin: 8px 0;
            color: #1e40af;
          }
          .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #2563eb 0%, #4f46e5 100%);
            color: white;
            padding: 16px 40px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: bold;
            font-size: 18px;
            margin: 20px 0;
            text-align: center;
          }
          .cta-button:hover {
            background: linear-gradient(135deg, #1d4ed8 0%, #4338ca 100%);
          }
          .footer {
            padding: 20px;
            text-align: center;
            font-size: 12px;
            color: #666;
            background-color: #f3f4f6;
            border-top: 1px solid #e5e7eb;
          }
          .footer a {
            color: #2563eb;
            text-decoration: none;
          }
          .tracking-pixel {
            width: 1px;
            height: 1px;
            display: none;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <!-- Header -->
          <div class="header">
            <h1>🎉 Your Custom AI Demo is Ready!</h1>
          </div>

          <!-- Main Content -->
          <div class="content">
            <p>Hi ${clientName},</p>

            <p>As promised, I've built a custom AI receptionist specifically for ${businessName}. This agent is trained on your business data and ready to handle customer conversations, capture leads, and provide 24/7 support.</p>

            <p>
              <strong>Here's what I've done:</strong>
            </p>

            <div class="highlight-box">
              <h3>✨ Your AI Agent Includes:</h3>
              <ul>
                <li><strong>Smart Lead Capture:</strong> Gathers names, phone numbers, and project details automatically</li>
                <li><strong>Business Knowledge:</strong> Trained on your website and services</li>
                <li><strong>24/7 Availability:</strong> Never misses another lead, even after hours</li>
                <li><strong>Natural Conversations:</strong> Feels like talking to a real team member</li>
              </ul>
            </div>

            <p>
              <strong>What you can do:</strong>
            </p>
            <ul>
              <li>Test the live chat demo right on your website</li>
              <li>Try the voice agent to see it in action</li>
              <li>See how it handles real customer questions</li>
              <li>Understand the potential for your business</li>
            </ul>

            <p style="text-align: center;">
              <a href="${demoUrl}" class="cta-button">
                See Your AI Demo →
              </a>
            </p>

            <div class="highlight-box" style="background-color: #f0fdf4; border-left-color: #16a34a;">
              <h3 style="color: #166534;">Expected Results:</h3>
              <p style="color: #166534; margin: 0;">
                Businesses like yours typically see a <strong>40-60% increase in lead capture</strong> within the first month. Many recoup their investment on the first deal closed.
              </p>
            </div>

            <p>
              <strong>Next Steps:</strong>
            </p>
            <ol style="margin: 0; padding-left: 20px;">
              <li>Click the button above to see your custom demo</li>
              <li>Test both chat and voice interactions</li>
              <li>Book a call with me to discuss pricing and implementation</li>
            </ol>

            <p>
              If you have any questions or the link doesn't work, just reply to this email and I'll help right away.
            </p>

            <p>
              Looking forward to showing you what's possible!<br>
              <strong>Demo Drop Team</strong>
            </p>
          </div>

          <!-- Footer -->
          <div class="footer">
            <p>
              © 2026 Demo Drop. All rights reserved.<br>
              <a href="https://demodrop.app">Visit our website</a> |
              <a href="https://demodrop.app/privacy">Privacy Policy</a>
            </p>
            <p>
              You received this email because you're interested in AI for your business.
            </p>
            <!-- Tracking pixel - DO NOT REMOVE -->
            <img src="${process.env.NEXT_PUBLIC_APP_URL}/api/email-tracking?token=${params.demoToken}&event=open" alt="" class="tracking-pixel" />
          </div>
        </div>
      </body>
    </html>
  `
}

/**
 * Send demo email automatically after successful scrape
 * Call this function after lead creation in the scrape API
 */
export async function triggerDemoEmailAfterScrape(params: {
  clientName: string
  businessName: string
  businessProfile: BusinessProfile
  prospectEmail?: string
  demoToken: string
  appUrl: string
}): Promise<{ emailSent: boolean; emailId?: string; error?: string }> {
  // Only send if prospect email is provided
  if (!params.prospectEmail) {
    return { emailSent: false, error: 'No prospect email provided' }
  }

  try {
    const emailId = await sendPersonalizedDemoEmail({
      clientName: params.clientName,
      businessName: params.businessName,
      businessProfile: params.businessProfile,
      prospectEmail: params.prospectEmail,
      demoToken: params.demoToken,
      appUrl: params.appUrl,
    })

    return { emailSent: true, emailId }
  } catch (error) {
    console.error('Failed to send demo email:', error)
    return {
      emailSent: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}
