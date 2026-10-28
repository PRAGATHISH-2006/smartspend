// Serverless function for Vercel: /api/send-email
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const [key, ...rest] = trimmed.split('=');
      const val = rest.join('=').trim();
      if (!process.env[key.trim()]) {
        process.env[key.trim()] = val;
      }
    }
  });
}

module.exports = async (req, res) => {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    return res.status(200).json({
      status: 'active',
      service: 'SmartSpend Resend Email Proxy',
      defaultRecipient: process.env.DEFAULT_RECIPIENT || 'selvanpragathish@gmail.com',
      resendConfigured: Boolean(process.env.RESEND_API_KEY || process.env.EXPO_PUBLIC_RESEND_API_KEY),
    });
  }

  try {
    const { to, subject, html, attachments, force } = req.body || {};

    // Stop sending emails
    if (process.env.ENABLE_EMAILS !== 'true') {
      return res.status(200).json({
        success: true,
        stopped: true,
        message: 'Email sending has been stopped.',
      });
    }

    const resendApiKey = process.env.RESEND_API_KEY || process.env.EXPO_PUBLIC_RESEND_API_KEY || '';
    const fromSender = process.env.EXPO_PUBLIC_RESEND_FROM || 'SmartSpend <onboarding@resend.dev>';
    const fallbackTo = process.env.DEFAULT_RECIPIENT || 'selvanpragathish@gmail.com';
    const recipient = Array.isArray(to) ? to : [to || fallbackTo];

    const payload = {
      from: fromSender,
      to: recipient,
      subject: subject || 'SmartSpend Notification',
      html: html || '<p>SmartSpend Notification</p>',
    };

    if (attachments && Array.isArray(attachments) && attachments.length > 0) {
      payload.attachments = attachments.map((att) => ({
        filename: att.filename,
        content: att.content,
      }));
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ success: false, error: data.message || 'Resend error', data });
    }

    return res.status(200).json({ success: true, id: data.id, deliveredTo: recipient[0], data });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message || String(err) });
  }
};
