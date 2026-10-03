// Serverless function for Vercel: /api/send-reminder
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
    const { slot = 'morning', to = 'selvanpragathish@gmail.com', items = [] } = req.body || {};
    const resendApiKey = process.env.RESEND_API_KEY || process.env.EXPO_PUBLIC_RESEND_API_KEY || '';

    const dateStr = new Date().toLocaleDateString('en-IN', {
      weekday: 'long',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

    const isMorning = slot === 'morning';
    const isMonthEnd = slot === 'month_end';
    const isMidWeek = slot === 'mid_week';
    const isWeekEnd = slot === 'week_end';

    let greeting = isMorning ? 'Good morning' : 'Good evening';
    let timeLabel = isMorning ? '8:00 AM Daily Alert' : '6:00 PM Evening Check-In';
    let title = isMorning
      ? "Today's Pending Fixed Expenses"
      : "Don't Forget to Mark Today's Fixed Expenses!";
    let subtext = isMorning
      ? 'You have pending daily fixed expenses that require your action. You can Pay or Skip them directly in SmartSpend.'
      : 'Before your day ends, make sure to log your pending recurring expenses so your Safe to Spend balance stays 100% accurate.';

    if (isMidWeek) {
      greeting = 'Hello';
      timeLabel = '📅 Mid-Week Check-In (Day 3)';
      title = 'Mid-Week Pending Weekly Expenses Alert';
      subtext = 'You are on Day 3 of your current 7-day budget week. You have unpaid weekly commitments due this week.';
    } else if (isWeekEnd) {
      greeting = 'Hello';
      timeLabel = '⏳ 1 Day Left in Budget Week';
      title = 'Weekly Budget Week Ending Soon Alert';
      subtext = "Your current 7-day budget week ends tomorrow. Please make sure to log or pay this week's pending weekly commitments.";
    } else if (isMonthEnd) {
      greeting = 'Hello';
      timeLabel = '🚨 2 Days Left in Month';
      title = 'Pending Monthly Fixed Expenses Reminder';
      subtext = 'Your monthly financial cycle is ending in 2 days. You have unpaid monthly fixed expenses that must be Paid or Skipped before closing the month.';
    }

    const displayItems = items.length > 0 ? items : [
      { name: 'Milk & Groceries', amount: 150, frequency: 'daily' },
      { name: 'High-Speed Broadband', amount: 999, frequency: 'monthly' }
    ];

    const totalAmount = displayItems.reduce((sum, i) => sum + Number(i.amount || 0), 0);

    const itemsHtml = displayItems.map((i) => `
      <tr>
        <td style="padding: 12px 14px; border-bottom: 1px solid #f1f5f9; font-size: 14px; font-weight: 600; color: #0f172a;">${i.name}</td>
        <td style="padding: 12px 14px; border-bottom: 1px solid #f1f5f9; font-size: 13px; color: #64748b; text-transform: capitalize;">${i.frequency || 'Daily'}</td>
        <td style="padding: 12px 14px; border-bottom: 1px solid #f1f5f9; font-size: 14px; font-weight: 700; color: #059669; text-align: right;">₹${Number(i.amount).toLocaleString('en-IN')}</td>
      </tr>
    `).join('');

    const html = `
<!DOCTYPE html>
<html>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table width="100%" style="background-color: #f8fafc; padding: 30px 10px;">
    <tr>
      <td align="center">
        <table width="600" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06);">
          <tr>
            <td style="background-color: ${isMonthEnd ? '#991b1b' : '#0f172a'}; padding: 32px 28px; text-align: left;">
              <span style="display: inline-block; background-color: rgba(255, 255, 255, 0.2); color: #ffffff; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 999px; text-transform: uppercase;">
                ${timeLabel}
              </span>
              <h1 style="color: #ffffff; font-size: 22px; font-weight: 800; margin: 12px 0 6px 0;">${title}</h1>
              <p style="color: #cbd5e1; font-size: 13px; margin: 0;">${dateStr} • Prepared for ${to}</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 28px;">
              <p style="font-size: 16px; color: #1e293b; margin: 0 0 12px 0; font-weight: 600;">${greeting}!</p>
              <p style="font-size: 14px; color: #475569; line-height: 1.6; margin: 0 0 20px 0;">${subtext}</p>
              <table width="100%" style="background-color: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 12px; margin-bottom: 24px; padding: 16px 20px;">
                <tr>
                  <td>
                    <span style="font-size: 12px; font-weight: 600; color: #065f46; text-transform: uppercase;">Total Pending Amount</span>
                    <div style="font-size: 24px; font-weight: 800; color: #047857; margin-top: 4px;">₹${totalAmount.toLocaleString('en-IN')}</div>
                  </td>
                  <td align="right">
                    <span style="background-color: #059669; color: #ffffff; font-size: 12px; font-weight: 700; padding: 6px 12px; border-radius: 8px;">
                      ${displayItems.length} Pending Item${displayItems.length === 1 ? '' : 's'}
                    </span>
                  </td>
                </tr>
              </table>
              <table width="100%" style="border: 1px solid #e2e8f0; border-radius: 10px; border-collapse: separate; overflow: hidden; margin-bottom: 24px;">
                <tr style="background-color: #f1f5f9;">
                  <th align="left" style="padding: 10px 14px; font-size: 12px; color: #475569;">Expense</th>
                  <th align="left" style="padding: 10px 14px; font-size: 12px; color: #475569;">Frequency</th>
                  <th align="right" style="padding: 10px 14px; font-size: 12px; color: #475569;">Amount</th>
                </tr>
                ${itemsHtml}
              </table>
              <div align="center">
                <a href="https://smartspend-two.vercel.app" style="display: inline-block; background-color: #059669; color: #ffffff; text-decoration: none; font-size: 15px; font-weight: 700; padding: 14px 32px; border-radius: 10px;">
                  Open SmartSpend & Pay / Skip Now →
                </a>
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    const subject = isMidWeek
      ? `📅 SmartSpend Mid-Week Alert: Weekly Fixed Expenses Check-In (${dateStr})`
      : isWeekEnd
      ? `⏳ SmartSpend Alert: 1 Day Left in Current Budget Week (${dateStr})`
      : isMonthEnd
      ? `🚨 SmartSpend Reminder: 2 Days Left to Pay Monthly Fixed Expense (${dateStr})`
      : isMorning
      ? `⏰ SmartSpend Morning Reminder: Today's Pending Fixed Expenses (${dateStr})`
      : `⏰ SmartSpend Evening Reminder: Don't forget to mark today's fixed expenses!`;

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

    const data = await response.json();
    return res.status(response.ok ? 200 : 400).json({
      success: response.ok,
      slot,
      deliveredTo: to,
      id: data.id || null,
      message: response.ok ? `Reminder email (${slot}) sent to ${to}!` : data.message || 'Failed',
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message || String(err) });
  }
};
