// Supabase Edge Function: send-weekly-report
// Generates weekly financial analytics and sends a responsive HTML email via Resend.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.8";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function formatCurrency(amount: number): string {
  return "₹" + amount.toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

function buildEmailHtml(params: {
  userName: string;
  periodStr: string;
  startingBalance: number;
  moneyAdded: number;
  manualExpenses: number;
  fixedExpenses: number;
  totalExpenses: number;
  remainingBalance: number;
  upcomingFixedExpenses: number;
  safeToSpend: number;
  daysRemaining: number;
  categories: { name: string; amount: number; percentage: number }[];
  fixedBreakdown: { name: string; paidDays: number; skippedDays: number; amountPaid: number }[];
  highestCategory: { name: string; amount: number } | null;
  transactionCount: number;
}): string {
  const {
    userName,
    periodStr,
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
  } = params;

  const categoryRowsHtml = categories
    .map(
      (c) => `
      <tr>
        <td style="padding: 10px 12px; border-bottom: 1px solid #f1f5f9; font-size: 14px; color: #334155;">${c.name}</td>
        <td style="padding: 10px 12px; border-bottom: 1px solid #f1f5f9; font-size: 14px; color: #0f172a; font-weight: 600; text-align: right;">${formatCurrency(c.amount)}</td>
        <td style="padding: 10px 12px; border-bottom: 1px solid #f1f5f9; font-size: 13px; color: #64748b; text-align: right;">${c.percentage}%</td>
      </tr>`
    )
    .join("");

  const fixedRowsHtml = fixedBreakdown
    .map(
      (f) => `
      <tr>
        <td style="padding: 10px 12px; border-bottom: 1px solid #f1f5f9; font-size: 14px; color: #334155; font-weight: 600;">${f.name}</td>
        <td style="padding: 10px 12px; border-bottom: 1px solid #f1f5f9; font-size: 13px; color: #059669; text-align: center;">${f.paidDays} paid</td>
        <td style="padding: 10px 12px; border-bottom: 1px solid #f1f5f9; font-size: 13px; color: #d97706; text-align: center;">${f.skippedDays} skipped</td>
        <td style="padding: 10px 12px; border-bottom: 1px solid #f1f5f9; font-size: 14px; color: #0f172a; font-weight: 600; text-align: right;">${formatCurrency(f.amountPaid)}</td>
      </tr>`
    )
    .join("");

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SmartSpend Weekly Report</title>
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
              <p style="margin: 6px 0 0 0; font-size: 15px; opacity: 0.9;">Weekly Expense Report</p>
              <p style="margin: 12px 0 0 0; display: inline-block; background-color: rgba(255,255,255,0.2); padding: 4px 12px; border-radius: 20px; font-size: 13px; font-weight: 600;">
                Period: ${periodStr}
              </p>
            </td>
          </tr>

          <!-- Greeting -->
          <tr>
            <td style="padding: 24px 24px 8px 24px;">
              <p style="margin: 0; font-size: 16px; color: #334155;">Hello <strong>${userName}</strong>,</p>
              <p style="margin: 6px 0 0 0; font-size: 14px; color: #64748b;">Here is your financial overview and expense breakdown for the past week.</p>
            </td>
          </tr>

          <!-- Summary Highlights Cards -->
          <tr>
            <td style="padding: 16px 24px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td width="48%" style="background-color: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 12px; padding: 16px; text-align: center;">
                    <div style="font-size: 12px; color: #047857; font-weight: 700; text-transform: uppercase;">Remaining Balance</div>
                    <div style="font-size: 22px; color: #065f46; font-weight: 800; margin-top: 4px;">${formatCurrency(remainingBalance)}</div>
                  </td>
                  <td width="4%"></td>
                  <td width="48%" style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 16px; text-align: center;">
                    <div style="font-size: 12px; color: #15803d; font-weight: 700; text-transform: uppercase;">Safe to Spend</div>
                    <div style="font-size: 22px; color: #14532d; font-weight: 800; margin-top: 4px;">${formatCurrency(safeToSpend)}</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Financial Snapshot Table -->
          <tr>
            <td style="padding: 8px 24px 16px 24px;">
              <h3 style="margin: 0 0 12px 0; font-size: 15px; color: #0f172a; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px;">Weekly Cash Flow</h3>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; font-size: 14px; color: #64748b;">Starting Balance</td>
                  <td style="padding: 8px 0; font-size: 14px; color: #0f172a; font-weight: 600; text-align: right;">${formatCurrency(startingBalance)}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-size: 14px; color: #64748b;">Money Added</td>
                  <td style="padding: 8px 0; font-size: 14px; color: #059669; font-weight: 600; text-align: right;">+${formatCurrency(moneyAdded)}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-size: 14px; color: #64748b;">Manual Expenses</td>
                  <td style="padding: 8px 0; font-size: 14px; color: #dc2626; font-weight: 600; text-align: right;">-${formatCurrency(manualExpenses)}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-size: 14px; color: #64748b;">Fixed Recurring Expenses</td>
                  <td style="padding: 8px 0; font-size: 14px; color: #dc2626; font-weight: 600; text-align: right;">-${formatCurrency(fixedExpenses)}</td>
                </tr>
                <tr style="border-top: 1px solid #cbd5e1; border-bottom: 2px solid #0f172a;">
                  <td style="padding: 10px 0; font-size: 15px; color: #0f172a; font-weight: 700;">Total Actual Expenses</td>
                  <td style="padding: 10px 0; font-size: 15px; color: #dc2626; font-weight: 800; text-align: right;">-${formatCurrency(totalExpenses)}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-size: 14px; color: #64748b;">Upcoming Fixed Expenses</td>
                  <td style="padding: 8px 0; font-size: 14px; color: #d97706; font-weight: 600; text-align: right;">${formatCurrency(upcomingFixedExpenses)}</td>
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
                  ${fixedRowsHtml}
                </tbody>
              </table>
            </td>
          </tr>`
              : ""
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
                  ${categoryRowsHtml}
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
                      highestCategory ? `${highestCategory.name} (${formatCurrency(highestCategory.amount)})` : "None"
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

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const resendApiKey = Deno.env.get("RESEND_API_KEY") ?? "";

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase configuration");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body = req.headers.get("content-type")?.includes("application/json")
      ? await req.json().catch(() => ({}))
      : {};

    const targetUserId = body.user_id || null;
    const isManualTest = Boolean(body.is_test);

    // Calculate last 7 days window (e.g. Sep 23 - Sep 29)
    const now = new Date();
    const weekEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
    const weekStart = new Date(weekEnd.getFullYear(), weekEnd.getMonth(), weekEnd.getDate() - 6);

    const weekStartStr = body.week_start || weekStart.toISOString().split("T")[0];
    const weekEndStr = body.week_end || weekEnd.toISOString().split("T")[0];

    const usersQuery = supabase
      .from("profiles")
      .select("id, name, email");

    if (targetUserId) {
      usersQuery.eq("id", targetUserId);
    }

    const { data: users, error: usersError } = await usersQuery;
    if (usersError) throw usersError;

    const results = [];

    for (const user of users || []) {
      // 1. Check if report already sent for this period (unless isManualTest)
      if (!isManualTest) {
        const { data: existingReport } = await supabase
          .from("weekly_reports")
          .select("id")
          .eq("user_id", user.id)
          .eq("week_start", weekStartStr)
          .eq("week_end", weekEndStr)
          .maybeSingle();

        if (existingReport) {
          results.push({ user_id: user.id, status: "skipped_already_sent" });
          continue;
        }
      }

      // 2. Fetch Money Additions in the week
      const { data: additions } = await supabase
        .from("money_additions")
        .select("amount, added_at")
        .eq("user_id", user.id);

      const weekAdditions = (additions || []).filter((a) => {
        const d = a.added_at.split("T")[0];
        return d >= weekStartStr && d <= weekEndStr;
      });
      const weekMoneyAdded = weekAdditions.reduce((sum, a) => sum + Number(a.amount), 0);
      const totalAllAdditions = (additions || []).reduce((sum, a) => sum + Number(a.amount), 0);

      // 3. Fetch Manual Expenses in the week
      const { data: allManual } = await supabase
        .from("expenses")
        .select("amount, category_name, expense_date")
        .eq("user_id", user.id);

      const weekManual = (allManual || []).filter((e) => e.expense_date >= weekStartStr && e.expense_date <= weekEndStr);
      const weekManualTotal = weekManual.reduce((sum, e) => sum + Number(e.amount), 0);
      const totalAllManual = (allManual || []).reduce((sum, e) => sum + Number(e.amount), 0);

      // 4. Fetch Fixed Expenses and Occurrences
      const { data: fixedRules } = await supabase
        .from("fixed_expenses")
        .select("id, name, amount, frequency, active")
        .eq("user_id", user.id);

      const { data: allOccurrences } = await supabase
        .from("fixed_expense_occurrences")
        .select("id, fixed_expense_id, amount, status, occurrence_date")
        .eq("user_id", user.id);

      const weekOccurrences = (allOccurrences || []).filter(
        (o) => o.occurrence_date >= weekStartStr && o.occurrence_date <= weekEndStr
      );

      const weekCompletedFixed = weekOccurrences.filter((o) => o.status === "completed");
      const weekFixedTotal = weekCompletedFixed.reduce((sum, o) => sum + Number(o.amount), 0);

      const totalAllFixedCompleted = (allOccurrences || [])
        .filter((o) => o.status === "completed")
        .reduce((sum, o) => sum + Number(o.amount), 0);

      // 5. Compute Balances
      const remainingBalance = totalAllAdditions - (totalAllManual + totalAllFixedCompleted);
      const startingBalance = remainingBalance + weekManualTotal + weekFixedTotal - weekMoneyAdded;
      const totalWeekExpenses = weekManualTotal + weekFixedTotal;

      // 6. Compute Fixed Breakdown (Paid vs Skipped counts)
      const fixedBreakdown = (fixedRules || []).map((rule) => {
        const ruleOccs = weekOccurrences.filter((o) => o.fixed_expense_id === rule.id);
        const paidCount = ruleOccs.filter((o) => o.status === "completed").length;
        const skippedCount = ruleOccs.filter((o) => o.status === "skipped").length;
        const totalPaid = ruleOccs
          .filter((o) => o.status === "completed")
          .reduce((sum, o) => sum + Number(o.amount), 0);
        return {
          name: rule.name,
          paidDays: paidCount,
          skippedDays: skippedCount,
          amountPaid: totalPaid,
        };
      });

      // 7. Category Breakdown
      const categoryMap: { [key: string]: number } = {};
      weekManual.forEach((e) => {
        const cat = e.category_name || "Other";
        categoryMap[cat] = (categoryMap[cat] || 0) + Number(e.amount);
      });
      if (weekFixedTotal > 0) {
        categoryMap["Fixed Expenses"] = (categoryMap["Fixed Expenses"] || 0) + weekFixedTotal;
      }

      const categories = Object.entries(categoryMap).map(([name, amount]) => ({
        name,
        amount,
        percentage: totalWeekExpenses > 0 ? Math.round((amount / totalWeekExpenses) * 100) : 0,
      }));

      categories.sort((a, b) => b.amount - a.amount);
      const highestCategory = categories.length > 0 ? categories[0] : null;

      // 8. Upcoming Fixed & Safe-to-Spend
      const activeDaily = (fixedRules || [])
        .filter((r) => r.active && r.frequency === "daily")
        .reduce((sum, r) => sum + Number(r.amount), 0);
      const daysRemaining = 5; // Default reference remaining period
      const upcomingFixedExpenses = activeDaily * daysRemaining;
      const safeToSpend = Math.max(0, remainingBalance - upcomingFixedExpenses);

      const periodStr = `${weekStartStr} - ${weekEndStr}`;
      const transactionCount = weekManual.length + weekCompletedFixed.length + weekAdditions.length;

      // 9. Generate HTML Email
      const emailHtml = buildEmailHtml({
        userName: user.name || "SmartSpend User",
        periodStr,
        startingBalance,
        moneyAdded: weekMoneyAdded,
        manualExpenses: weekManualTotal,
        fixedExpenses: weekFixedTotal,
        totalExpenses: totalWeekExpenses,
        remainingBalance,
        upcomingFixedExpenses,
        safeToSpend,
        daysRemaining,
        categories,
        fixedBreakdown,
        highestCategory,
        transactionCount,
      });

      let resendId = null;
      let emailStatus = "sent";

      if (resendApiKey) {
        const resendRes = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${resendApiKey}`,
          },
          body: JSON.stringify({
            from: "SmartSpend <reports@smartspend.app>",
            to: [user.email],
            subject: `SmartSpend Weekly Expense Report (${periodStr})`,
            html: emailHtml,
          }),
        });

        const resendData = await resendRes.json();
        resendId = resendData.id || null;
        if (!resendRes.ok) {
          console.warn("Resend API returned error:", resendData);
          emailStatus = "failed";
        }
      } else {
        console.log(`[Dev Simulation] Email rendered successfully for ${user.email}`);
      }

      // 10. Record in weekly_reports table
      await supabase.from("weekly_reports").upsert(
        {
          user_id: user.id,
          week_start: weekStartStr,
          week_end: weekEndStr,
          starting_balance: startingBalance,
          money_added: weekMoneyAdded,
          manual_expenses: weekManualTotal,
          fixed_expenses: weekFixedTotal,
          total_expenses: totalWeekExpenses,
          remaining_balance: remainingBalance,
          upcoming_fixed_expenses: upcomingFixedExpenses,
          safe_to_spend: safeToSpend,
          category_breakdown: categoryMap,
          fixed_breakdown: fixedBreakdown,
          status: emailStatus,
          resend_id: resendId,
          sent_at: new Date().toISOString(),
        },
        { onConflict: "user_id,week_start,week_end" }
      );

      // 11. Add in-app notification
      await supabase.from("notifications").insert({
        user_id: user.id,
        type: "WEEKLY_REPORT",
        title: "📊 Weekly Expense Report Ready",
        message: `Your report for ${periodStr} has been prepared. Total expenses: ${formatCurrency(totalWeekExpenses)}.`,
        metadata: { weekStart: weekStartStr, weekEnd: weekEndStr, totalWeekExpenses },
      });

      results.push({
        user_id: user.id,
        email: user.email,
        period: periodStr,
        totalExpenses: totalWeekExpenses,
        remainingBalance,
        status: emailStatus,
        resendId,
      });
    }

    return new Response(JSON.stringify({ success: true, count: results.length, results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ success: false, error: err.message || String(err) }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
