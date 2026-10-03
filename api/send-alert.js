// Serverless function for Vercel: /api/send-alert
module.exports = async (req, res) => {
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
    const { alertType, to = 'selvanpragathish@gmail.com', data = {} } = req.body || {};
    const resendApiKey = process.env.RESEND_API_KEY || process.env.EXPO_PUBLIC_RESEND_API_KEY || '';

    let subject = '⚠️ SmartSpend Alert';
    let html = '<p>SmartSpend Alert</p>';

    if (alertType === 'low_balance') {
      subject = `⚠️ SmartSpend Alert: Low Balance Warning (₹${Number(data.currentBalance || 0).toLocaleString('en-IN')})`;
      html = `
<!DOCTYPE html>
<html>
<body style="font-family: sans-serif; background-color: #f8fafc; padding: 24px;">
  <div style="max-width: 600px; margin: 0 auto; background: #fff; border-radius: 12px; overflow: hidden; border: 1px solid #fee2e2;">
    <div style="background: #dc2626; color: #fff; padding: 24px; text-align: center;">
      <h2 style="margin: 0;">⚠️ Low Balance Alert</h2>
      <p style="margin: 6px 0 0 0; opacity: 0.9;">Wallet balance is below your threshold</p>
    </div>
    <div style="padding: 24px;">
      <p>Hello <strong>${data.userName || 'SmartSpend User'}</strong>,</p>
      <p>Your current wallet balance is <strong>₹${Number(data.currentBalance || 0).toLocaleString('en-IN')}</strong>, which has dropped below your minimum threshold of <strong>₹${Number(data.threshold || 0).toLocaleString('en-IN')}</strong>.</p>
      <p>Safe to spend: <strong>₹${Number(data.safeToSpend || 0).toLocaleString('en-IN')}</strong></p>
      <div style="text-align: center; margin-top: 24px;">
        <a href="https://smartspend-two.vercel.app" style="background: #dc2626; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">Open SmartSpend</a>
      </div>
    </div>
  </div>
</body>
</html>
      `;
    } else if (alertType === 'cycle_ending') {
      subject = `⏳ SmartSpend Alert: ${data.daysRemaining || 5} Days Left in Budget Cycle`;
      html = `
<!DOCTYPE html>
<html>
<body style="font-family: sans-serif; background-color: #f8fafc; padding: 24px;">
  <div style="max-width: 600px; margin: 0 auto; background: #fff; border-radius: 12px; overflow: hidden; border: 1px solid #fed7aa;">
    <div style="background: #d97706; color: #fff; padding: 24px; text-align: center;">
      <h2 style="margin: 0;">⏳ Budget Cycle Ending Soon</h2>
      <p style="margin: 6px 0 0 0; opacity: 0.9;">${data.daysRemaining || 5} Days Left until ${data.periodEnd || 'Cycle End'}</p>
    </div>
    <div style="padding: 24px;">
      <p>Hello <strong>${data.userName || 'SmartSpend User'}</strong>,</p>
      <p>Your current budget cycle will conclude in <strong>${data.daysRemaining || 5} days</strong>.</p>
      <p>• Remaining Balance: <strong>₹${Number(data.remainingBalance || 0).toLocaleString('en-IN')}</strong><br/>
      • Safe to Spend: <strong>₹${Number(data.safeToSpend || 0).toLocaleString('en-IN')}</strong><br/>
      • Upcoming Commitments: <strong>₹${Number(data.upcomingFixedExpenses || 0).toLocaleString('en-IN')}</strong></p>
      <div style="text-align: center; margin-top: 24px;">
        <a href="https://smartspend-two.vercel.app" style="background: #d97706; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">Review Active Cycle</a>
      </div>
    </div>
  </div>
</body>
</html>
      `;
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: 'SmartSpend <onboarding@resend.dev>',
        to: [to],
        subject,
        html,
      }),
    });

    const resData = await response.json();
    return res.status(response.ok ? 200 : 400).json({
      success: response.ok,
      deliveredTo: to,
      id: resData.id || null,
      message: response.ok ? `Alert (${alertType}) sent to ${to}!` : resData.message || 'Failed',
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message || String(err) });
  }
};
