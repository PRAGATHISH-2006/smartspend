// Email Report Dispatcher Service (Supabase Edge Function & Resend integration)

import { supabase } from './supabase';
import { EmailReportData, generateHtmlEmail } from '../utils/emailTemplate';
import { getLastWeekRange, getCurrentMonthRange } from '../utils/dateUtils';

export interface EmailReportSendResult {
  success: boolean;
  message: string;
  reportData?: EmailReportData;
  htmlContent?: string;
  error?: string;
  deliveredTo?: string;
}

/**
 * Trigger weekly report email
 */
export async function triggerWeeklyReportEmail(params: {
  userId: string;
  isTest?: boolean;
}): Promise<EmailReportSendResult> {
  const { weekStart, weekEnd } = getLastWeekRange();
  return await dispatchReportInternal({
    userId: params.userId,
    startDate: weekStart,
    endDate: weekEnd,
    reportType: 'weekly',
  });
}

/**
 * Trigger monthly report email
 */
export async function triggerMonthlyReportEmail(params: {
  userId: string;
  isTest?: boolean;
}): Promise<EmailReportSendResult> {
  const { monthStart, monthEnd } = getCurrentMonthRange();
  return await dispatchReportInternal({
    userId: params.userId,
    startDate: monthStart,
    endDate: monthEnd,
    reportType: 'monthly',
  });
}

/**
 * Instant report dispatcher: Dispatches weekly, monthly, or both reports immediately
 */
export async function triggerInstantReportEmail(params: {
  userId: string;
  reportType: 'weekly' | 'monthly' | 'both';
}): Promise<EmailReportSendResult> {
  if (params.reportType === 'both') {
    const resWeek = await triggerWeeklyReportEmail({ userId: params.userId });
    const resMonth = await triggerMonthlyReportEmail({ userId: params.userId });
    const bothOk = resWeek.success && resMonth.success;
    return {
      success: bothOk,
      message: bothOk
        ? 'Both Weekly & Monthly expense digests have been dispatched to your email!'
        : resWeek.message || resMonth.message,
      reportData: resWeek.reportData || resMonth.reportData,
      htmlContent: resWeek.htmlContent || resMonth.htmlContent,
    };
  } else if (params.reportType === 'monthly') {
    return await triggerMonthlyReportEmail({ userId: params.userId });
  } else {
    return await triggerWeeklyReportEmail({ userId: params.userId });
  }
}

/**
 * Trigger custom date range report email (e.g. chosen from Transaction Log)
 */
export async function triggerCustomDateRangeEmail(params: {
  userId: string;
  startDate: string;
  endDate: string;
}): Promise<EmailReportSendResult> {
  return await dispatchReportInternal({
    userId: params.userId,
    startDate: params.startDate,
    endDate: params.endDate,
    reportType: 'weekly',
  });
}

export function getProxyEndpoints(path: string): string[] {
  const endpoints: string[] = [];
  const cleanPath = path.startsWith('/') ? path : `/${path}`;

  if (typeof window !== 'undefined' && window.location) {
    const { hostname } = window.location;
    if (hostname && hostname !== 'localhost' && hostname !== '127.0.0.1') {
      endpoints.push(`http://${hostname}:3001${cleanPath}`);
    }
    endpoints.push(`${cleanPath}`);
  }

  endpoints.push(`http://localhost:3001${cleanPath}`);
  endpoints.push(`http://127.0.0.1:3001${cleanPath}`);

  return Array.from(new Set(endpoints));
}

/**
 * Trigger month-end close archival statement email with Google Drive link
 */
export async function triggerMonthCloseStatementEmail(params: {
  userId: string;
  startDate: string;
  endDate: string;
  rolloverAmount: number;
  driveFolderUrl: string;
  pdfFilename?: string;
  pdfBase64?: string;
}): Promise<EmailReportSendResult> {
  const { userId, startDate, endDate, rolloverAmount, driveFolderUrl, pdfFilename, pdfBase64 } = params;

  const compiled = await compileUserReport({
    userId,
    startDate,
    endDate,
    reportType: 'monthly',
  });

  if (!compiled || !compiled.recipientEmail) {
    return {
      success: false,
      message: 'Could not determine the recipient email address for statement archive.',
    };
  }

  const { reportData, recipientEmail } = compiled;

  // Custom Archival HTML with Drive link and Rollover
  const archiveHtml = `
<!DOCTYPE html>
<html>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc; padding: 24px;">
  <table width="600" style="max-width: 600px; margin: 0 auto; background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
    <tr>
      <td style="background: #0f172a; padding: 32px 28px; color: #fff;">
        <span style="background: rgba(16, 185, 129, 0.2); color: #34d399; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 999px; text-transform: uppercase;">
          📁 Month-End Closed Statement
        </span>
        <h1 style="margin: 12px 0 6px 0; font-size: 24px;">Monthly Financial Cycle Closed</h1>
        <p style="margin: 0; color: #94a3b8; font-size: 14px;">Period: ${startDate} to ${endDate}</p>
      </td>
    </tr>
    <tr>
      <td style="padding: 28px;">
        <h3 style="color: #0f172a; margin-top: 0;">Summary of Closed Cycle</h3>
        <table width="100%" style="background: #f1f5f9; border-radius: 12px; padding: 16px; margin-bottom: 20px;">
          <tr>
            <td style="padding: 6px 12px; color: #64748b;">Starting Balance:</td>
            <td align="right" style="padding: 6px 12px; font-weight: bold; color: #0f172a;">₹${reportData.startingBalance.toLocaleString('en-IN')}</td>
          </tr>
          <tr>
            <td style="padding: 6px 12px; color: #64748b;">Total Money Added:</td>
            <td align="right" style="padding: 6px 12px; font-weight: bold; color: #059669;">+₹${reportData.moneyAdded.toLocaleString('en-IN')}</td>
          </tr>
          <tr>
            <td style="padding: 6px 12px; color: #64748b;">Total Expenses:</td>
            <td align="right" style="padding: 6px 12px; font-weight: bold; color: #dc2626;">-₹${reportData.totalExpenses.toLocaleString('en-IN')}</td>
          </tr>
          <tr style="border-top: 2px solid #cbd5e1;">
            <td style="padding: 10px 12px; color: #0f172a; font-weight: bold;">Closing Balance:</td>
            <td align="right" style="padding: 10px 12px; font-weight: 800; font-size: 16px; color: #0f172a;">₹${reportData.remainingBalance.toLocaleString('en-IN')}</td>
          </tr>
        </table>

        <!-- Rollover Notice -->
        <table width="100%" style="background: #ecfdf5; border: 1.5px solid #10b981; border-radius: 12px; padding: 16px; margin-bottom: 24px;">
          <tr>
            <td>
              <strong style="color: #065f46; font-size: 14px;">💰 Rollover Surplus Added to Next Month:</strong>
              <div style="font-size: 24px; font-weight: 800; color: #047857; margin-top: 4px;">₹${rolloverAmount.toLocaleString('en-IN')}</div>
              <p style="margin: 4px 0 0 0; font-size: 12px; color: #047857;">This unspent surplus has been automatically added as your new starting balance.</p>
            </td>
          </tr>
        </table>

        <!-- Google Drive Backup Link -->
        <table width="100%" style="background: #eff6ff; border: 1.5px solid #93c5fd; border-radius: 12px; padding: 16px; margin-bottom: 24px;">
          <tr>
            <td>
              <strong style="color: #1e40af; font-size: 14px;">☁️ Google Drive Archive:</strong>
              <p style="margin: 4px 0 12px 0; font-size: 13px; color: #1e3a8a;">
                Your complete transaction ledger has been compiled as <strong>${pdfFilename || 'Transactions.pdf'}</strong> and attached to this email. You can also view your permanent Google Drive folder here:
              </p>
              <a href="${driveFolderUrl}" target="_blank" style="display: inline-block; background: #2563eb; color: #fff; text-decoration: none; padding: 10px 20px; border-radius: 8px; font-weight: 700; font-size: 13px;">
                Open Google Drive Archival Folder →
              </a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  // Clean base64 for attachment if provided
  let attachments: Array<{ filename: string; content: string }> | undefined;
  if (pdfFilename && pdfBase64) {
    const rawContent = pdfBase64.includes(',') ? pdfBase64.split(',')[1] : pdfBase64;
    attachments = [{ filename: pdfFilename, content: rawContent }];
  }

  // Dispatch via local proxy or candidates
  const proxyEndpoints = getProxyEndpoints('/api/send-email');
  for (const endpoint of proxyEndpoints) {
    try {
      const proxyRes = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: recipientEmail,
          subject: `📁 Closed Month Archival Statement (${startDate} to ${endDate})`,
          html: archiveHtml,
          attachments,
        }),
      });

      if (proxyRes.ok) {
        const data = await proxyRes.json();
        if (data.success) {
          return {
            success: true,
            message: `Month closed successfully! Statement dispatched to ${recipientEmail} with Google Drive link and attached PDF.`,
            reportData,
            htmlContent: archiveHtml,
          };
        }
      }
    } catch {
      // Continue to next endpoint
    }
  }

  return {
    success: true,
    message: `Month closed successfully! Surplus of ₹${rolloverAmount} carried forward.`,
    reportData,
    htmlContent: archiveHtml,
  };
}

/**
 * Generate a CSV string from unified transactions
 */
export function generateTransactionsCsv(transactions: any[]): string {
  const headers = ['Date', 'Type', 'Category', 'Description', 'Amount (INR)', 'Notes'];
  const rows = transactions.map((tx) => [
    `"${tx.date}"`,
    `"${tx.rawType || tx.type}"`,
    `"${(tx.category || '').replace(/"/g, '""')}"`,
    `"${(tx.name || '').replace(/"/g, '""')}"`,
    tx.amount,
    `"${(tx.notes || '').replace(/"/g, '""')}"`,
  ]);
  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
}

/**
 * Client-side file downloader for web
 */
export function downloadFile(filename: string, content: string, mimeType: string = 'text/csv') {
  if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}

/**
 * Compile financial summary and HTML email for a given user & date range
 */
export async function compileUserReport(params: {
  userId: string;
  startDate: string;
  endDate: string;
  reportType: 'weekly' | 'monthly';
}): Promise<{
  reportData: EmailReportData;
  htmlContent: string;
  recipientEmail: string;
} | null> {
  const { userId, startDate, endDate, reportType } = params;

  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('name, email')
      .eq('id', userId)
      .maybeSingle();

    const sessionRes = await supabase.auth.getSession();
    const sessionEmail = sessionRes?.data?.session?.user?.email;
    const recipientEmail = (profile?.email || sessionEmail || '').trim();

    if (!recipientEmail) {
      return null;
    }

    // Fetch additions
    const { data: additions } = await supabase
      .from('money_additions')
      .select('amount, added_at')
      .eq('user_id', userId);

    const periodAdditions = (additions || []).filter((a) => {
      const d = a.added_at.split('T')[0];
      return d >= startDate && d <= endDate;
    });
    const periodMoneyAdded = periodAdditions.reduce((sum, a) => sum + Number(a.amount), 0);
    const totalAllAdditions = (additions || []).reduce((sum, a) => sum + Number(a.amount), 0);

    // Fetch manual expenses
    const { data: allManual } = await supabase
      .from('expenses')
      .select('amount, category_name, expense_date')
      .eq('user_id', userId);

    const periodManual = (allManual || []).filter(
      (e) => e.expense_date >= startDate && e.expense_date <= endDate
    );
    const periodManualTotal = periodManual.reduce((sum, e) => sum + Number(e.amount), 0);
    const totalAllManual = (allManual || []).reduce((sum, e) => sum + Number(e.amount), 0);

    // Fetch fixed occurrences
    const { data: allOccurrences } = await supabase
      .from('fixed_expense_occurrences')
      .select('id, fixed_expense_id, amount, status, occurrence_date')
      .eq('user_id', userId);

    const { data: fixedRules } = await supabase
      .from('fixed_expenses')
      .select('id, name, amount, frequency, active')
      .eq('user_id', userId);

    const periodOccurrences = (allOccurrences || []).filter(
      (o) => o.occurrence_date >= startDate && o.occurrence_date <= endDate
    );

    const periodCompletedFixed = periodOccurrences.filter((o) => o.status === 'completed');
    const periodFixedTotal = periodCompletedFixed.reduce((sum, o) => sum + Number(o.amount), 0);
    const totalAllFixedCompleted = (allOccurrences || [])
      .filter((o) => o.status === 'completed')
      .reduce((sum, o) => sum + Number(o.amount), 0);

    // Balance computation
    const remainingBalance = totalAllAdditions - (totalAllManual + totalAllFixedCompleted);
    const startingBalance = remainingBalance + periodManualTotal + periodFixedTotal - periodMoneyAdded;
    const totalPeriodExpenses = periodManualTotal + periodFixedTotal;

    const fixedBreakdown = (fixedRules || []).map((rule) => {
      const ruleOccs = periodOccurrences.filter((o) => o.fixed_expense_id === rule.id);
      const paidDays = ruleOccs.filter((o) => o.status === 'completed').length;
      const skippedDays = ruleOccs.filter((o) => o.status === 'skipped').length;
      const totalPaid = ruleOccs
        .filter((o) => o.status === 'completed')
        .reduce((sum, o) => sum + Number(o.amount), 0);
      return {
        name: rule.name,
        paidDays,
        skippedDays,
        amountPaid: totalPaid,
      };
    });

    const categoryMap: Record<string, number> = {};
    periodManual.forEach((e) => {
      const cat = e.category_name || 'Other';
      categoryMap[cat] = (categoryMap[cat] || 0) + Number(e.amount);
    });
    if (periodFixedTotal > 0) {
      categoryMap['Fixed Expenses'] = (categoryMap['Fixed Expenses'] || 0) + periodFixedTotal;
    }

    const categories = Object.entries(categoryMap).map(([name, amount]) => ({
      name,
      amount,
      percentage: totalPeriodExpenses > 0 ? Math.round((amount / totalPeriodExpenses) * 100) : 0,
    }));
    categories.sort((a, b) => b.amount - a.amount);

    const activeDaily = (fixedRules || [])
      .filter((r) => r.active && r.frequency === 'daily')
      .reduce((sum, r) => sum + Number(r.amount), 0);
    const daysRemaining = 5;
    const upcomingFixedExpenses = activeDaily * daysRemaining;
    const safeToSpend = Math.max(0, remainingBalance - upcomingFixedExpenses);

    const reportData: EmailReportData = {
      userName: profile?.name || sessionEmail?.split('@')[0] || 'SmartSpend User',
      periodStr: `${startDate} to ${endDate}`,
      reportType,
      startingBalance,
      moneyAdded: periodMoneyAdded,
      manualExpenses: periodManualTotal,
      fixedExpenses: periodFixedTotal,
      totalExpenses: totalPeriodExpenses,
      remainingBalance,
      upcomingFixedExpenses,
      safeToSpend,
      daysRemaining,
      categories,
      fixedBreakdown,
      highestCategory: categories[0] || null,
      transactionCount: periodManual.length + periodCompletedFixed.length + periodAdditions.length,
    };

    const htmlContent = generateHtmlEmail(reportData);

    return {
      reportData,
      htmlContent,
      recipientEmail,
    };
  } catch (err) {
    console.warn('Error compiling report:', err);
    return null;
  }
}

/**
 * Generate a mailto URI with financial report summary
 */
export function createMailtoUrl(params: {
  to: string;
  subject: string;
  reportData: EmailReportData;
}): string {
  const { to, subject, reportData } = params;
  const bodyText = `SmartSpend Financial Report (${reportData.periodStr})

Hi ${reportData.userName},

Here is your financial summary:
- Starting Balance: ₹${reportData.startingBalance}
- Money Added: ₹${reportData.moneyAdded}
- Total Expenses: ₹${reportData.totalExpenses}
- Remaining Balance: ₹${reportData.remainingBalance}
- Safe to Spend: ₹${reportData.safeToSpend}
- Total Transactions: ${reportData.transactionCount}

Top Categories:
${reportData.categories.slice(0, 5).map((c) => `• ${c.name}: ₹${c.amount} (${c.percentage}%)`).join('\n')}

Generated via SmartSpend Intelligent Financial Engine.`;

  return `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(bodyText)}`;
}

/**
 * Core compiler and dispatcher for any period range (Weekly / Monthly / Custom)
 * STRICT: Sends exclusively to the user's registered email address.
 */
async function dispatchReportInternal(params: {
  userId: string;
  startDate: string;
  endDate: string;
  reportType: 'weekly' | 'monthly';
}): Promise<EmailReportSendResult> {
  const { userId, startDate, endDate, reportType } = params;

  try {
    const compiled = await compileUserReport({
      userId,
      startDate,
      endDate,
      reportType,
    });

    if (!compiled || !compiled.recipientEmail) {
      return {
        success: false,
        message: 'Could not determine the registered email address for this user. Please check your profile.',
        error: 'No recipient email found',
      };
    }

    const { reportData, htmlContent, recipientEmail } = compiled;
    let resendId: string | null = null;
    let resendErrorMsg: string | null = null;
    const subjectTitle = reportType === 'monthly' ? 'Monthly Financial Digest' : 'Weekly Expense Report';

    const resendApiKey =
      process.env.EXPO_PUBLIC_RESEND_API_KEY ||
      process.env.RESEND_API_KEY ||
      '';

    const fromSender =
      process.env.EXPO_PUBLIC_RESEND_FROM ||
      'SmartSpend <onboarding@resend.dev>';

    let emailDispatched = false;

    // 1. First attempt: Local/serverless CORS proxy route (bypasses browser CORS)
    const proxyEndpoints = getProxyEndpoints('/api/send-email');

    for (const endpoint of proxyEndpoints) {
      if (emailDispatched) break;
      try {
        const proxyRes = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: recipientEmail,
            subject: `SmartSpend ${subjectTitle} (${reportData.periodStr})`,
            html: htmlContent,
          }),
        });
        if (proxyRes.ok) {
          const proxyData = await proxyRes.json();
          if (
            proxyData.success &&
            proxyData.id &&
            (!proxyData.deliveredTo || proxyData.deliveredTo.toLowerCase() === recipientEmail.toLowerCase())
          ) {
            resendId = proxyData.id;
            emailDispatched = true;
            break;
          }
        }
      } catch {
        // Fall back to direct Resend call
      }
    }

    // 2. Direct Resend API dispatch to the user's registered email (Native iOS/Android)
    if (!emailDispatched && resendApiKey && recipientEmail) {
      try {
        const resendRes = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${resendApiKey}`,
          },
          body: JSON.stringify({
            from: fromSender,
            to: [recipientEmail],
            subject: `SmartSpend ${subjectTitle} (${reportData.periodStr})`,
            html: htmlContent,
          }),
        });

        const resendJson = await resendRes.json();
        if (resendRes.ok && resendJson.id) {
          resendId = resendJson.id;
          emailDispatched = true;
        } else if (
          resendRes.status === 403 ||
          resendJson.statusCode === 403 ||
          (resendJson.message && resendJson.message.includes('You can only send testing emails')) ||
          (resendJson.message && resendJson.message.includes('verify a domain'))
        ) {
          resendErrorMsg = `Resend test tier limitation: Free accounts using onboarding@resend.dev can only deliver to the verified Resend owner. To deliver to "${recipientEmail}", please verify a custom domain in Resend.`;
        } else {
          resendErrorMsg = resendJson.message || resendJson.name || JSON.stringify(resendJson);
          console.warn('Resend response:', resendJson);
        }
      } catch (emailErr: any) {
        resendErrorMsg = 'Browser network restriction (CORS). Make sure the local email proxy is active on port 3001.';
        console.warn('Error calling Resend API:', emailErr);
      }
    }

    // Save report record in Supabase
    try {
      await supabase.from('weekly_reports').upsert(
        {
          user_id: userId,
          week_start: startDate,
          week_end: endDate,
          starting_balance: reportData.startingBalance,
          money_added: reportData.moneyAdded,
          manual_expenses: reportData.manualExpenses,
          fixed_expenses: reportData.fixedExpenses,
          total_expenses: reportData.totalExpenses,
          remaining_balance: reportData.remainingBalance,
          upcoming_fixed_expenses: reportData.upcomingFixedExpenses,
          safeToSpend: reportData.safeToSpend,
          category_breakdown: reportData.categories.reduce((acc, c) => ({ ...acc, [c.name]: c.amount }), {}),
          fixed_breakdown: reportData.fixedBreakdown,
          status: emailDispatched ? 'sent' : 'compiled',
          resend_id: resendId,
          sent_at: emailDispatched ? new Date().toISOString() : null,
        },
        { onConflict: 'user_id,week_start,week_end' }
      );
    } catch {
      // Non-blocking log
    }

    if (!emailDispatched) {
      return {
        success: false,
        message:
          resendErrorMsg ||
          `Resend API key is not configured or domain is unverified. You can preview, print, or open your report directly.`,
        error: resendErrorMsg || 'Email delivery not configured',
        reportData,
        htmlContent,
        deliveredTo: recipientEmail,
      };
    }

    return {
      success: true,
      message: `${subjectTitle} sent successfully to ${recipientEmail}! (Please check Inbox & Spam folder)`,
      reportData,
      htmlContent,
      deliveredTo: recipientEmail,
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Failed to compile ${reportType} report`,
      error: err.message || String(err),
    };
  }
}
