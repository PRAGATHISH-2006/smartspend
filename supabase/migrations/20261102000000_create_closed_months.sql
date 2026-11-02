-- Migration: Add closed_months table for archiving monthly ledger summaries and transactions
CREATE TABLE IF NOT EXISTS public.closed_months (
    id TEXT PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    month_name TEXT NOT NULL,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    total_money_added NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
    total_withdrawn NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
    closing_balance NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
    transactions JSONB NOT NULL DEFAULT '[]'::jsonb,
    category_breakdown JSONB NOT NULL DEFAULT '[]'::jsonb,
    closed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.closed_months ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own closed months" ON public.closed_months FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own closed months" ON public.closed_months FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own closed months" ON public.closed_months FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own closed months" ON public.closed_months FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_closed_months_user_closed_at ON public.closed_months(user_id, closed_at DESC);
