// Local CORS Proxy Server & Automated Daily & Month-End Fixed Expense Reminder Scheduler
const http = require('http');
const fs = require('fs');
const path = require('path');

// Load environment variables from .env if present
const envPath = path.join(__dirname, '.env');
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

const PORT = 3001;
const RESEND_API_KEY = process.env.RESEND_API_KEY || process.env.EXPO_PUBLIC_RESEND_API_KEY;
const DEFAULT_RECIPIENT = process.env.DEFAULT_RECIPIENT || 'selvanpragathish@gmail.com';
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://lsdrlcfyaltkjrzzhhqa.supabase.co';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzZHJsY2Z5YWx0a2pyenpoaHFhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA3NTI1NjEsImV4cCI6MjEwNjMyODU2MX0.Cb9c218Ye2HeDvApM8DUUBbiqWgcwWUeX3tBL7YVllQ';

// Tracking state for reminders so they fire once per time slot
let lastMorningDate = '';
let lastEveningDate = '';
let lastMonthEndDate = '';

/**
 * Generate a responsive HTML email for morning & evening fixed expense reminders
 */
function buildReminderEmailHtml(params) {
  const { slot, recipient, items, dateStr } = params;
  const isMorning = slot === 'morning';
  const isMonthEnd = slot === 'month_end';

  let greeting = isMorning ? 'Good morning' : 'Good evening';
  let timeLabel = isMorning ? '8:00 AM Daily Alert' : '6:00 PM Evening Check-In';
  let title = isMorning
    ? "Today's Pending Fixed Expenses"
    : "Don't Forget to Mark Today's Fixed Expenses!";
  let subtext = isMorning
    ? 'You have pending daily fixed expenses that require your action. You can Pay or Skip them directly in SmartSpend.'
    : 'Before your day ends, make sure to log your pending recurring expenses so your Safe to Spend balance stays 100% accurate.';

  if (isMonthEnd) {
    greeting = 'Hello';
    timeLabel = '🚨 2 Days Left in Month';
    title = 'Pending Monthly Fixed Expenses Reminder';
    subtext = 'Your monthly financial cycle is ending in 2 days. You have unpaid monthly fixed expenses that must be Paid or Skipped before closing the month.';
  }

  const totalAmount = items.reduce((sum, i) => sum + Number(i.amount || 0), 0);

  const itemsHtml = items.length === 0
    ? `<tr><td colspan="3" style="padding: 16px; text-align: center; color: #64748b; font-style: italic;">No pending recurring expenses at this time.</td></tr>`
    : items.map((i) => `
      <tr>
        <td style="padding: 12px 14px; border-bottom: 1px solid #f1f5f9; font-size: 14px; font-weight: 600; color: #0f172a;">${i.name}</td>
        <td style="padding: 12px 14px; border-bottom: 1px solid #f1f5f9; font-size: 13px; color: #64748b; text-transform: capitalize;">${i.frequency || 'Daily'}</td>
        <td style="padding: 12px 14px; border-bottom: 1px solid #f1f5f9; font-size: 14px; font-weight: 700; color: #059669; text-align: right;">₹${Number(i.amount).toLocaleString('en-IN')}</td>
      </tr>
    `).join('');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SmartSpend Reminder</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; padding: 30px 10px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06);">
          <!-- Header -->
          <tr>
            <td style="background-color: ${isMonthEnd ? '#991b1b' : '#0f172a'}; padding: 32px 28px; text-align: left;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <span style="display: inline-block; background-color: rgba(255, 255, 255, 0.2); color: #ffffff; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 999px; text-transform: uppercase; letter-spacing: 0.5px;">
                      ${timeLabel}
                    </span>
                    <h1 style="color: #ffffff; font-size: 22px; font-weight: 800; margin: 12px 0 6px 0; letter-spacing: -0.5px;">
                      ${title}
                    </h1>
                    <p style="color: #cbd5e1; font-size: 13px; margin: 0;">
                      ${dateStr} • Prepared for ${recipient}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 28px;">
              <p style="font-size: 16px; color: #1e293b; margin: 0 0 12px 0; font-weight: 600;">
                ${greeting}!
              </p>
              <p style="font-size: 14px; color: #475569; line-height: 1.6; margin: 0 0 20px 0;">
                ${subtext}
              </p>

              <!-- Daily Summary Card -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 12px; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 16px 20px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td>
                          <span style="font-size: 12px; font-weight: 600; color: #065f46; text-transform: uppercase;">Total Pending Amount</span>
                          <div style="font-size: 24px; font-weight: 800; color: #047857; margin-top: 4px;">₹${totalAmount.toLocaleString('en-IN')}</div>
                        </td>
                        <td align="right">
                          <span style="display: inline-block; background-color: #059669; color: #ffffff; font-size: 12px; font-weight: 700; padding: 6px 12px; border-radius: 8px;">
                            ${items.length} Pending Item${items.length === 1 ? '' : 's'}
                          </span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Expenses Table -->
              <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #e2e8f0; border-radius: 10px; border-collapse: separate; overflow: hidden; margin-bottom: 24px;">
                <tr style="background-color: #f1f5f9;">
                  <th align="left" style="padding: 10px 14px; font-size: 12px; font-weight: 700; color: #475569; text-transform: uppercase;">Expense</th>
                  <th align="left" style="padding: 10px 14px; font-size: 12px; font-weight: 700; color: #475569; text-transform: uppercase;">Frequency</th>
                  <th align="right" style="padding: 10px 14px; font-size: 12px; font-weight: 700; color: #475569; text-transform: uppercase;">Amount</th>
                </tr>
                ${itemsHtml}
              </table>

              <!-- Action Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="http://localhost:8081" style="display: inline-block; background-color: #059669; color: #ffffff; text-decoration: none; font-size: 15px; font-weight: 700; padding: 14px 32px; border-radius: 10px; box-shadow: 0 4px 12px rgba(5, 150, 105, 0.3);">
                      Open SmartSpend & Pay / Skip Now →
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px 28px; text-align: center;">
              <p style="font-size: 12px; color: #94a3b8; margin: 0 0 4px 0;">
                SmartSpend • Intelligent Mobile Financial Engine
              </p>
              <p style="font-size: 11px; color: #cbd5e1; margin: 0;">
                Daily reminder at 8:00 AM & 6:00 PM | Month-End Alert (2 days before close)
              </p>
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
 * Fetch pending fixed expenses from Supabase
 */
async function getPendingFixedItems(frequencyFilter = null) {
  try {
    const todayStr = new Date().toISOString().split('T')[0];

    // 1. Fetch active rules
    let rulesUrl = `${SUPABASE_URL}/rest/v1/fixed_expenses?active=eq.true&select=*`;
    if (frequencyFilter) {
      rulesUrl += `&frequency=eq.${frequencyFilter}`;
    }

    const rulesRes = await fetch(rulesUrl, {
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
    });

    if (!rulesRes.ok) return [];
    const rules = await rulesRes.json();
    if (!Array.isArray(rules) || rules.length === 0) return [];

    // 2. Fetch occurrences
    const occRes = await fetch(`${SUPABASE_URL}/rest/v1/fixed_expense_occurrences?select=*`, {
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
    });

    const occurrences = occRes.ok ? await occRes.json() : [];

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    // 3. Filter only items that are pending (not completed and not skipped)
    const pendingItems = [];

    for (const rule of rules) {
      if (rule.frequency === 'daily') {
        const occToday = occurrences.find(
          (o) => o.fixed_expense_id === rule.id && o.occurrence_date === todayStr
        );
        // If not completed and not skipped today
        if (!occToday || occToday.status === 'pending') {
          pendingItems.push({
            id: rule.id,
            name: rule.name,
            amount: Number(rule.amount),
            frequency: rule.frequency,
            category: rule.category_name || 'Bills',
          });
        }
      } else if (rule.frequency === 'monthly') {
        const occThisMonth = occurrences.find((o) => {
          if (o.fixed_expense_id !== rule.id) return false;
          const occD = new Date(o.occurrence_date);
          return occD.getFullYear() === currentYear && occD.getMonth() === currentMonth;
        });

        if (!occThisMonth || occThisMonth.status === 'pending') {
          pendingItems.push({
            id: rule.id,
            name: rule.name,
            amount: Number(rule.amount),
            frequency: rule.frequency,
            category: rule.category_name || 'Bills',
          });
        }
      } else {
        pendingItems.push({
          id: rule.id,
          name: rule.name,
          amount: Number(rule.amount),
          frequency: rule.frequency,
          category: rule.category_name || 'Bills',
        });
      }
    }

    return pendingItems;
  } catch (err) {
    console.warn('[Reminder] Error querying pending items:', err.message);
    return [];
  }
}

/**
 * Dispatch reminder email via Resend
 */
async function dispatchReminderEmail(slot = 'morning', targetEmail = DEFAULT_RECIPIENT) {
  const isMonthEnd = slot === 'month_end';
  const items = await getPendingFixedItems(isMonthEnd ? 'monthly' : null);

  // If no pending items and it's a routine scheduler run, we can log and return
  if (items.length === 0) {
    console.log(`[Reminder] No pending fixed expenses for ${slot}. Skipping email.`);
    return { ok: true, data: { message: 'No pending items to alert' } };
  }

  const dateStr = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const subject = isMonthEnd
    ? `🚨 SmartSpend Reminder: 2 Days Left to Pay Monthly Fixed Expense (${dateStr})`
    : slot === 'morning'
    ? `⏰ SmartSpend Morning Reminder: Today's Pending Fixed Expenses (${dateStr})`
    : `⏰ SmartSpend Evening Reminder: Don't forget to mark today's fixed expenses!`;

  const html = buildReminderEmailHtml({
    slot,
    recipient: targetEmail,
    items,
    dateStr,
  });

  console.log(`[Reminder] Dispatching ${slot} reminder to ${targetEmail} (${items.length} items)...`);

  const resendRes = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: 'SmartSpend <onboarding@resend.dev>',
      to: [targetEmail],
      subject,
      html,
    }),
  });

  const data = await resendRes.json();
  console.log(`[Reminder] Resend response for ${slot}:`, data);
  return { ok: resendRes.ok, data };
}

/**
 * Scheduler check running every minute:
 * - 08:00 AM Morning reminder
 * - 09:00 AM Check 2-days before month end
 * - 18:00 (06:00 PM) Evening reminder
 */
function checkScheduledReminders() {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const todayDateStr = now.toISOString().split('T')[0];

  // 1. Morning daily reminder: 8:00 AM (08:00)
  if (hours === 8 && minutes === 0 && lastMorningDate !== todayDateStr) {
    lastMorningDate = todayDateStr;
    console.log(`[Scheduler] 8:00 AM reached. Firing daily reminder for ${todayDateStr}`);
    dispatchReminderEmail('morning', DEFAULT_RECIPIENT).catch((e) =>
      console.error('[Scheduler] Morning reminder error:', e)
    );
  }

  // 2. Month-end 2-day reminder check: 9:00 AM (09:00)
  if (hours === 9 && minutes === 0 && lastMonthEndDate !== todayDateStr) {
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const currentDay = now.getDate();
    const daysLeft = lastDayOfMonth - currentDay;

    if (daysLeft <= 2) {
      lastMonthEndDate = todayDateStr;
      console.log(`[Scheduler] 2 days before month end (${daysLeft} days left). Checking pending monthly expenses...`);
      dispatchReminderEmail('month_end', DEFAULT_RECIPIENT).catch((e) =>
        console.error('[Scheduler] Month-end reminder error:', e)
      );
    }
  }

  // 3. Evening daily reminder: 6:00 PM (18:00)
  if (hours === 18 && minutes === 0 && lastEveningDate !== todayDateStr) {
    lastEveningDate = todayDateStr;
    console.log(`[Scheduler] 6:00 PM reached. Firing evening reminder for ${todayDateStr}`);
    dispatchReminderEmail('evening', DEFAULT_RECIPIENT).catch((e) =>
      console.error('[Scheduler] Evening reminder error:', e)
    );
  }
}

// Check every 60 seconds
setInterval(checkScheduledReminders, 60 * 1000);

// HTTP Server
const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // Standard email dispatch proxy
  if (req.method === 'POST' && req.url === '/api/send-email') {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
    });

    req.on('end', async () => {
      try {
        const { to, subject, html, attachments } = JSON.parse(body);
        const recipient = Array.isArray(to) ? to : [to];

        console.log(`[Email Proxy] Dispatching email to: ${recipient.join(', ')} with ${attachments ? attachments.length : 0} attachment(s)`);

        const resendPayload = {
          from: 'SmartSpend <onboarding@resend.dev>',
          to: recipient,
          subject: subject || 'SmartSpend Financial Report',
          html: html || '<p>SmartSpend Financial Digest</p>',
        };

        if (attachments && Array.isArray(attachments) && attachments.length > 0) {
          resendPayload.attachments = attachments.map((att) => ({
            filename: att.filename,
            content: att.content,
          }));
        }

        const resendRes = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${RESEND_API_KEY}`,
          },
          body: JSON.stringify(resendPayload),
        });

        const data = await resendRes.json();
        console.log('[Email Proxy] Resend response:', data);

        res.writeHead(resendRes.ok ? 200 : resendRes.status, {
          'Content-Type': 'application/json',
        });
        res.end(
          JSON.stringify({
            success: resendRes.ok,
            id: data.id || null,
            deliveredTo: recipient[0],
            data,
            error: data.message || null,
          })
        );
      } catch (err) {
        console.error('[Email Proxy] Error:', err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: err.message }));
      }
    });
    return;
  }

  // Instant or test reminder trigger
  if (req.method === 'POST' && req.url === '/api/send-reminder') {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
    });

    req.on('end', async () => {
      try {
        const parsed = body ? JSON.parse(body) : {};
        const slot = parsed.slot || (new Date().getHours() < 12 ? 'morning' : 'evening');
        const to = parsed.to || DEFAULT_RECIPIENT;

        const result = await dispatchReminderEmail(slot, to);

        res.writeHead(result.ok ? 200 : 400, { 'Content-Type': 'application/json' });
        res.end(
          JSON.stringify({
            success: result.ok,
            slot,
            deliveredTo: to,
            id: result.data?.id || null,
            message: result.ok
              ? `Reminder email (${slot}) sent to ${to}!`
              : result.data?.message || 'Failed to dispatch reminder',
            data: result.data,
          })
        );
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: err.message }));
      }
    });
    return;
  }

  // Automatic Google Drive Upload Webhook Proxy
  if (req.method === 'POST' && req.url === '/api/upload-to-drive') {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
    });

    req.on('end', async () => {
      try {
        const parsed = body ? JSON.parse(body) : {};
        const { filename, base64, webhookUrl } = parsed;

        const targetWebhookUrl =
          webhookUrl ||
          process.env.GOOGLE_DRIVE_WEBHOOK_URL ||
          process.env.EXPO_PUBLIC_GOOGLE_DRIVE_WEBHOOK_URL ||
          'https://script.google.com/macros/s/AKfycbwvX1VHlHlUQvBGfybe04iDpL9euETLyXG3bnK8zYvJplsO_6W-KiHZP3nwOww_utCpTg/exec';

        // Save local backup file as well
        if (filename && base64) {
          try {
            const clean = base64.includes(',') ? base64.split(',')[1] : base64;
            const pdfBuffer = Buffer.from(clean, 'base64');
            const localOut = path.join(__dirname, filename);
            fs.writeFileSync(localOut, pdfBuffer);
            console.log(`[Drive Upload] Saved local PDF copy: ${localOut}`);
          } catch (writeErr) {
            console.warn('[Drive Upload] Error saving local PDF:', writeErr);
          }
        }

        // Post base64 PDF payload to the Google Apps Script Web App
        console.log(`[Drive Upload] Forwarding ${filename} to Google Apps Script Webhook...`);
        const cleanBase64 = base64.includes(',') ? base64.split(',')[1] : base64;

        const gResponse = await fetch(targetWebhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            filename: filename || 'Transactions.pdf',
            base64: cleanBase64,
            folderId: '1AJzY39IKyCTR0d7HspLN0bMk609kITT2',
          }),
          redirect: 'follow',
        });

        const gText = await gResponse.text();
        let gData = {};
        try {
          gData = JSON.parse(gText);
        } catch {
          gData = { raw: gText };
        }

        console.log('[Drive Upload] Response from Google Apps Script:', gData);

        const isOk = gResponse.ok && gData.status !== 'error';

        res.writeHead(isOk ? 200 : 502, { 'Content-Type': 'application/json' });
        res.end(
          JSON.stringify({
            success: isOk,
            filename,
            fileId: gData.fileId || gData.id || null,
            fileUrl: gData.fileUrl || gData.url || null,
            driveFolderUrl: 'https://drive.google.com/drive/folders/1AJzY39IKyCTR0d7HspLN0bMk609kITT2?usp=sharing',
            message: isOk
              ? `Successfully uploaded ${filename} automatically to Google Drive!`
              : gData.message || 'Failed to upload to Google Drive',
            data: gData,
          })
        );
      } catch (err) {
        console.warn('[Drive Upload] Error:', err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: err.message }));
      }
    });
    return;
  }

  if (req.method === 'GET' && req.url === '/health') {
    const now = new Date();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(
      JSON.stringify({
        status: 'ok',
        proxy: 'smartspend-email-proxy',
        currentTime: now.toLocaleTimeString(),
        scheduler: {
          morningReminder: '08:00 AM (Daily Pending Alerts)',
          monthEndReminder: '09:00 AM (2 Days Before Month End Alert)',
          eveningReminder: '06:00 PM (Daily Pending Alerts)',
          recipient: DEFAULT_RECIPIENT,
          lastMorningDate,
          lastEveningDate,
          lastMonthEndDate,
        },
      })
    );
    return;
  }

  res.writeHead(404);
  res.end();
});

server.listen(PORT, () => {
  console.log(`[Email Proxy] Server running on http://localhost:${PORT}`);
  console.log(`[Scheduler] Daily reminders active for 8:00 AM & 6:00 PM -> ${DEFAULT_RECIPIENT}`);
  console.log(`[Scheduler] Month-end reminder active 2 days before close -> ${DEFAULT_RECIPIENT}`);
});
