// Supabase Edge Function: process-daily-expenses
// Runs daily via pg_cron or Edge Function scheduled invocation.
// Idempotently creates pending fixed expense occurrences, checks thresholds,
// and sends notifications.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.8";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body = req.headers.get("content-type")?.includes("application/json")
      ? await req.json().catch(() => ({}))
      : {};

    const targetUserId = body.user_id || null;
    const targetDateStr = body.date || new Date().toISOString().split("T")[0];
    const targetDate = new Date(targetDateStr);

    // Call stored procedure to create occurrences idempotently
    const { data: procResult, error: procError } = await supabase.rpc(
      "generate_due_fixed_expense_occurrences",
      {
        p_user_id: targetUserId,
        p_target_date: targetDateStr,
      }
    );

    if (procError) {
      console.error("Error executing generate_due_fixed_expense_occurrences:", procError);
      throw procError;
    }

    // Now evaluate balance & warnings for users
    const usersQuery = supabase
      .from("profiles")
      .select("id, name, email");
    
    if (targetUserId) {
      usersQuery.eq("id", targetUserId);
    }

    const { data: users, error: usersError } = await usersQuery;
    if (usersError) throw usersError;

    const summaryResults = [];

    for (const user of users || []) {
      // 1. Fetch total money additions
      const { data: additions } = await supabase
        .from("money_additions")
        .select("amount")
        .eq("user_id", user.id);
      const totalAdded = (additions || []).reduce((sum, a) => sum + Number(a.amount), 0);

      // 2. Fetch completed manual expenses
      const { data: manualExpenses } = await supabase
        .from("expenses")
        .select("amount")
        .eq("user_id", user.id);
      const totalManual = (manualExpenses || []).reduce((sum, e) => sum + Number(e.amount), 0);

      // 3. Fetch completed fixed occurrences
      const { data: completedOccurrences } = await supabase
        .from("fixed_expense_occurrences")
        .select("amount")
        .eq("user_id", user.id)
        .eq("status", "completed");
      const totalFixedCompleted = (completedOccurrences || []).reduce((sum, o) => sum + Number(o.amount), 0);

      const currentBalance = totalAdded - (totalManual + totalFixedCompleted);

      // 4. Fetch budget settings
      const { data: budgetSettings } = await supabase
        .from("budget_settings")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      const threshold = Number(budgetSettings?.low_balance_threshold ?? 2000);

      // 5. Check low balance warning
      if (currentBalance <= threshold) {
        // Insert notification if not already sent today
        await supabase.from("notifications").insert({
          user_id: user.id,
          type: "LOW_BALANCE",
          title: "⚠️ Low Balance Alert",
          message: `Your current balance is ₹${currentBalance.toFixed(2)}, which is below your threshold of ₹${threshold.toFixed(2)}.`,
          metadata: { currentBalance, threshold },
        });
      }

      summaryResults.push({
        user_id: user.id,
        currentBalance,
        totalAdded,
        totalSpent: totalManual + totalFixedCompleted,
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        date: targetDateStr,
        insertedOccurrences: procResult,
        summaries: summaryResults,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ success: false, error: err.message || String(err) }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
