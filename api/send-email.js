// Serverless function for Vercel: /api/send-email
module.exports = async (req, res) => {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  try {
    const { to, subject, html, attachments } = req.body || {};
    const resendApiKey = process.env.RESEND_API_KEY || process.env.EXPO_PUBLIC_RESEND_API_KEY || '';
    const fromSender = process.env.EXPO_PUBLIC_RESEND_FROM || 'SmartSpend <onboarding@resend.dev>';
    const recipient = Array.isArray(to) ? to : [to || 'selvanpragathish@gmail.com'];

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
