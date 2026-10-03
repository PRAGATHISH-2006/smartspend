// Client-side HTML Email Generator and Preview Builder

import { formatINR } from './currency';

export interface EmailReportData {
  userName: string;
  periodStr: string;
  reportType?: 'weekly' | 'monthly' | 'instant';
  startingBalance: number;
  moneyAdded: number;
  manualExpenses: number;
  fixedExpenses: number;
  totalExpenses: number;
  remainingBalance: number;
  upcomingFixedExpenses: number;
  safeToSpend: number;
  daysRemaining: number;
  categories: Array<{ name: string; amount: number; percentage: number }>;
  fixedBreakdown: Array<{
    name: string;
    paidDays: number;
    skippedDays: number;
    amountPaid: number;
  }>;
  highestCategory: { name: string; amount: number } | null;
  transactionCount: number;
}

export function generateHtmlEmail(data: EmailReportData): string {
  const {
    userName,
    periodStr,
    reportType = 'weekly',
    startingBalance,
    moneyAdded,
    manualExpenses,
    fixedExpenses,
    totalExpenses,
    remainingBalance,
    upcomingFixedExpenses,
    safeToSpend,
    daysRemaining,
    categories,
    fixedBreakdown,
    highestCategory,
    transactionCount,
  } = data;

  const isMonthly = reportType === 'monthly';
  const reportTitle = isMonthly ? 'Monthly Financial Digest' : 'Weekly Expense Report';
  const greetingSubtitle = isMonthly
    ? 'Here is your comprehensive monthly financial overview and expense breakdown.'
    : 'Here is your financial overview and expense breakdown for the past week.';

  const categoryRows = categories
    .map(
      (c) => `
      <tr>
        <td style="padding: 10px 12px; border-bottom: 1px solid #f1f5f9; font-size: 14px; color: #334155;">${c.name}</td>
        <td style="padding: 10px 12px; border-bottom: 1px solid #f1f5f9; font-size: 14px; color: #0f172a; font-weight: 600; text-align: right;">${formatINR(c.amount)}</td>
        <td style="padding: 10px 12px; border-bottom: 1px solid #f1f5f9; font-size: 13px; color: #64748b; text-align: right;">${c.percentage}%</td>
      </tr>`
    )
    .join('');

  const fixedRows = fixedBreakdown
    .map(
      (f) => `
      <tr>
        <td style="padding: 10px 12px; border-bottom: 1px solid #f1f5f9; font-size: 14px; color: #334155; font-weight: 600;">${f.name}</td>
        <td style="padding: 10px 12px; border-bottom: 1px solid #f1f5f9; font-size: 13px; color: #059669; text-align: center;">${f.paidDays} paid</td>
        <td style="padding: 10px 12px; border-bottom: 1px solid #f1f5f9; font-size: 13px; color: #d97706; text-align: center;">${f.skippedDays} skipped</td>
        <td style="padding: 10px 12px; border-bottom: 1px solid #f1f5f9; font-size: 14px; color: #0f172a; font-weight: 600; text-align: right;">${formatINR(f.amountPaid)}</td>
      </tr>`
    )
    .join('');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SmartSpend ${reportTitle}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #0f172a;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); overflow: hidden; border: 1px solid #e2e8f0;">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #059669 0%, #047857 100%); padding: 32px 24px; text-align: center; color: #ffffff;">
              <h1 style="margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">SMARTSPEND</h1>
              <p style="margin: 6px 0 0 0; font-size: 15px; opacity: 0.9;">${reportTitle}</p>
              <p style="margin: 12px 0 0 0; display: inline-block; background-color: rgba(255,255,255,0.2); padding: 4px 12px; border-radius: 20px; font-size: 13px; font-weight: 600;">
                Period: ${periodStr}
              </p>
            </td>
          </tr>

          <!-- Greeting -->
          <tr>
            <td style="padding: 24px 24px 8px 24px;">
              <p style="margin: 0; font-size: 16px; color: #334155;">Hello <strong>${userName}</strong>,</p>
              <p style="margin: 6px 0 0 0; font-size: 14px; color: #64748b;">${greetingSubtitle}</p>
            </td>
          </tr>

          <!-- Summary Highlights Cards -->
          <tr>
            <td style="padding: 16px 24px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td width="48%" style="background-color: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 12px; padding: 16px; text-align: center;">
                    <div style="font-size: 12px; color: #047857; font-weight: 700; text-transform: uppercase;">Remaining Balance</div>
                    <div style="font-size: 22px; color: #065f46; font-weight: 800; margin-top: 4px;">${formatINR(remainingBalance)}</div>
                  </td>
                  <td width="4%"></td>
                  <td width="48%" style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 16px; text-align: center;">
                    <div style="font-size: 12px; color: #15803d; font-weight: 700; text-transform: uppercase;">Safe to Spend</div>
                    <div style="font-size: 22px; color: #14532d; font-weight: 800; margin-top: 4px;">${formatINR(safeToSpend)}</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Financial Snapshot Table -->
          <tr>
            <td style="padding: 8px 24px 16px 24px;">
              <h3 style="margin: 0 0 12px 0; font-size: 15px; color: #0f172a; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px;">${isMonthly ? 'Monthly Cash Flow' : 'Weekly Cash Flow'}</h3>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; font-size: 14px; color: #64748b;">Starting Balance</td>
                  <td style="padding: 8px 0; font-size: 14px; color: #0f172a; font-weight: 600; text-align: right;">${formatINR(startingBalance)}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-size: 14px; color: #64748b;">Money Added</td>
                  <td style="padding: 8px 0; font-size: 14px; color: #059669; font-weight: 600; text-align: right;">+${formatINR(moneyAdded)}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-size: 14px; color: #64748b;">Manual Expenses</td>
                  <td style="padding: 8px 0; font-size: 14px; color: #dc2626; font-weight: 600; text-align: right;">-${formatINR(manualExpenses)}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-size: 14px; color: #64748b;">Fixed Recurring Expenses</td>
                  <td style="padding: 8px 0; font-size: 14px; color: #dc2626; font-weight: 600; text-align: right;">-${formatINR(fixedExpenses)}</td>
                </tr>
                <tr style="border-top: 1px solid #cbd5e1; border-bottom: 2px solid #0f172a;">
                  <td style="padding: 10px 0; font-size: 15px; color: #0f172a; font-weight: 700;">Total Actual Expenses</td>
                  <td style="padding: 10px 0; font-size: 15px; color: #dc2626; font-weight: 800; text-align: right;">-${formatINR(totalExpenses)}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-size: 14px; color: #64748b;">Upcoming Fixed Expenses</td>
                  <td style="padding: 8px 0; font-size: 14px; color: #d97706; font-weight: 600; text-align: right;">${formatINR(upcomingFixedExpenses)}</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Daily Fixed Expenses Breakdown -->
          ${
            fixedBreakdown.length > 0
              ? `
          <tr>
            <td style="padding: 8px 24px 16px 24px;">
              <h3 style="margin: 0 0 12px 0; font-size: 15px; color: #0f172a; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px;">Daily Recurring Expenses</h3>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse: collapse;">
                <thead>
                  <tr style="background-color: #f8fafc;">
                    <th style="padding: 8px 12px; font-size: 12px; color: #64748b; text-align: left;">Expense</th>
                    <th style="padding: 8px 12px; font-size: 12px; color: #64748b; text-align: center;">Paid</th>
                    <th style="padding: 8px 12px; font-size: 12px; color: #64748b; text-align: center;">Skipped</th>
                    <th style="padding: 8px 12px; font-size: 12px; color: #64748b; text-align: right;">Total Paid</th>
                  </tr>
                </thead>
                <tbody>
                  ${fixedRows}
                </tbody>
              </table>
            </td>
          </tr>`
              : ''
          }

          <!-- Category Breakdown -->
          <tr>
            <td style="padding: 8px 24px 16px 24px;">
              <h3 style="margin: 0 0 12px 0; font-size: 15px; color: #0f172a; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px;">Expenses by Category</h3>
              ${
                categories.length > 0
                  ? `
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse: collapse;">
                <thead>
                  <tr style="background-color: #f8fafc;">
                    <th style="padding: 8px 12px; font-size: 12px; color: #64748b; text-align: left;">Category</th>
                    <th style="padding: 8px 12px; font-size: 12px; color: #64748b; text-align: right;">Amount</th>
                    <th style="padding: 8px 12px; font-size: 12px; color: #64748b; text-align: right;">Share</th>
                  </tr>
                </thead>
                <tbody>
                  ${categoryRows}
                </tbody>
              </table>`
                  : `<p style="font-size: 14px; color: #94a3b8; font-style: italic;">No expenses recorded in this period.</p>`
              }
            </td>
          </tr>

          <!-- Highlights & Stats -->
          <tr>
            <td style="padding: 8px 24px 24px 24px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f1f5f9; border-radius: 10px; padding: 14px;">
                <tr>
                  <td style="font-size: 13px; color: #475569;">
                    <strong>Highest spending category:</strong> ${
                      highestCategory
                        ? `${highestCategory.name} (${formatINR(highestCategory.amount)})`
                        : 'None'
                    }<br/>
                    <strong>Total Transactions:</strong> ${transactionCount} | <strong>Days Remaining:</strong> ${daysRemaining}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px 24px; text-align: center; font-size: 12px; color: #94a3b8;">
              Sent automatically by <strong>SmartSpend</strong> • Intelligent Expense Tracking.<br/>
              You can customize your email report frequency in the app settings.
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
 * Generate a responsive HTML email for Low Balance Warning
 */
export function generateLowBalanceEmail(data: {
  userName: string;
  currentBalance: number;
  threshold: number;
  safeToSpend: number;
}): string {
  const { userName, currentBalance, threshold, safeToSpend } = data;
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SmartSpend Low Balance Alert</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #0f172a;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.06); overflow: hidden; border: 1px solid #fee2e2;">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); padding: 32px 24px; text-align: center; color: #ffffff;">
              <span style="display: inline-block; background-color: rgba(255,255,255,0.2); padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">
                ⚠️ Urgent Financial Warning
              </span>
              <h1 style="margin: 12px 0 0 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">Low Balance Alert</h1>
              <p style="margin: 6px 0 0 0; font-size: 14px; opacity: 0.9;">Your wallet balance has fallen below your set threshold</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 24px;">
              <p style="margin: 0 0 16px 0; font-size: 16px; color: #334155;">Hello <strong>${userName}</strong>,</p>
              <p style="margin: 0 0 20px 0; font-size: 14px; color: #64748b; line-height: 1.6;">
                This is an automated alert from SmartSpend. Your available balance is now <strong>${formatINR(currentBalance)}</strong>, which is lower than your minimum safety threshold of <strong>${formatINR(threshold)}</strong>.
              </p>

              <!-- Warning Balance Card -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #fef2f2; border: 1.5px solid #f87171; border-radius: 12px; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 18px 20px;">
                    <table width="100%">
                      <tr>
                        <td>
                          <span style="font-size: 12px; font-weight: 700; color: #991b1b; text-transform: uppercase;">Current Balance</span>
                          <div style="font-size: 26px; font-weight: 800; color: #dc2626; margin-top: 4px;">${formatINR(currentBalance)}</div>
                        </td>
                        <td align="right">
                          <span style="font-size: 12px; font-weight: 700; color: #991b1b; text-transform: uppercase;">Threshold</span>
                          <div style="font-size: 18px; font-weight: 700; color: #7f1d1d; margin-top: 4px;">${formatINR(threshold)}</div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Safe to Spend Snapshot -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 14px; margin-bottom: 24px;">
                <tr>
                  <td style="font-size: 14px; color: #475569;">
                    <strong>Safe to Spend:</strong> <span style="font-weight: 700; color: ${safeToSpend > 0 ? '#059669' : '#dc2626'};">${formatINR(safeToSpend)}</span><br/>
                    <span style="font-size: 12px; color: #94a3b8;">Top up your wallet or review your upcoming commitments to avoid budget overshoots.</span>
                  </td>
                </tr>
              </table>

              <!-- Action Link -->
              <table width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center">
                    <a href="https://smartspend-two.vercel.app" style="display: inline-block; background-color: #dc2626; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 700; padding: 12px 28px; border-radius: 8px;">
                      Open SmartSpend & Top Up Wallet →
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 18px 24px; text-align: center; font-size: 12px; color: #94a3b8;">
              SmartSpend • Real-time Financial Guardrails
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
 * Generate a responsive HTML email for 5-Day Remaining Cycle Alert
 */
export function generateCycleEndingEmail(data: {
  userName: string;
  daysRemaining: number;
  periodEnd: string;
  remainingBalance: number;
  safeToSpend: number;
  upcomingFixedExpenses: number;
}): string {
  const { userName, daysRemaining, periodEnd, remainingBalance, safeToSpend, upcomingFixedExpenses } = data;
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SmartSpend Budget Cycle Alert</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #0f172a;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.06); overflow: hidden; border: 1px solid #fed7aa;">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #d97706 0%, #b45309 100%); padding: 32px 24px; text-align: center; color: #ffffff;">
              <span style="display: inline-block; background-color: rgba(255,255,255,0.2); padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">
                ⏳ Cycle Ending Alert
              </span>
              <h1 style="margin: 12px 0 0 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">${daysRemaining} Days Left in Current Budget Cycle</h1>
              <p style="margin: 6px 0 0 0; font-size: 14px; opacity: 0.9;">Cycle Ends on ${periodEnd}</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 24px;">
              <p style="margin: 0 0 16px 0; font-size: 16px; color: #334155;">Hello <strong>${userName}</strong>,</p>
              <p style="margin: 0 0 20px 0; font-size: 14px; color: #64748b; line-height: 1.6;">
                Your current financial cycle is closing in <strong>${daysRemaining} days</strong> (ends on ${periodEnd}). Here is your current snapshot before the cycle wraps up:
              </p>

              <!-- Key Metrics Grid -->
              <table width="100%" cellspacing="0" cellpadding="0" style="margin-bottom: 24px;">
                <tr>
                  <td width="48%" style="background-color: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 12px; padding: 16px; text-align: center;">
                    <div style="font-size: 11px; color: #047857; font-weight: 700; text-transform: uppercase;">Safe to Spend</div>
                    <div style="font-size: 22px; color: #065f46; font-weight: 800; margin-top: 4px;">${formatINR(safeToSpend)}</div>
                  </td>
                  <td width="4%"></td>
                  <td width="48%" style="background-color: #fff7ed; border: 1px solid #fed7aa; border-radius: 12px; padding: 16px; text-align: center;">
                    <div style="font-size: 11px; color: #c2410c; font-weight: 700; text-transform: uppercase;">Upcoming Commitments</div>
                    <div style="font-size: 22px; color: #9a3412; font-weight: 800; margin-top: 4px;">${formatINR(upcomingFixedExpenses)}</div>
                  </td>
                </tr>
              </table>

              <!-- Details Box -->
              <table width="100%" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 14px; margin-bottom: 24px;">
                <tr>
                  <td style="font-size: 14px; color: #334155; line-height: 1.6;">
                    • <strong>Current Total Balance:</strong> ${formatINR(remainingBalance)}<br/>
                    • <strong>Cycle End Date:</strong> ${periodEnd}<br/>
                    • <strong>Status:</strong> ${safeToSpend > 0 ? '✅ Budget on track' : '⚠️ Overspent / Tight balance'}
                  </td>
                </tr>
              </table>

              <!-- Action Link -->
              <table width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center">
                    <a href="https://smartspend-two.vercel.app" style="display: inline-block; background-color: #d97706; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 700; padding: 12px 28px; border-radius: 8px;">
                      Open SmartSpend & Review Budget →
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 18px 24px; text-align: center; font-size: 12px; color: #94a3b8;">
              SmartSpend • Automated Cycle Tracking & Forecasting
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

