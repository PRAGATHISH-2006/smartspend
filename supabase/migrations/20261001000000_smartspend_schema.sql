-- ==============================================================================
-- SmartSpend PostgreSQL Schema Migration
-- Production-Ready Personal Expense Management with Recurring Fixed Expenses,
-- Safe-to-Spend Forecasts, Row Level Security, and Weekly Reporting.
-- ==============================================================================

-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 1. PROFILES TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    currency TEXT NOT NULL DEFAULT 'INR',
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- 2. WALLETS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.wallets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    currency TEXT NOT NULL DEFAULT 'INR',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- 3. MONEY ADDITIONS (WALLET TOP-UPS)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.money_additions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    wallet_id UUID REFERENCES public.wallets(id) ON DELETE SET NULL,
    amount NUMERIC(14, 2) NOT NULL CHECK (amount > 0),
    description TEXT NOT NULL DEFAULT 'Added money to wallet',
    payment_method TEXT DEFAULT 'UPI / Bank Transfer',
    added_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- 4. CATEGORIES TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- NULL for system-wide defaults
    name TEXT NOT NULL,
    icon TEXT NOT NULL DEFAULT 'tag',
    color TEXT NOT NULL DEFAULT '#10B981',
    is_default BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- 5. MANUAL EXPENSES TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    amount NUMERIC(14, 2) NOT NULL CHECK (amount > 0),
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    category_name TEXT NOT NULL DEFAULT 'Other',
    description TEXT NOT NULL,
    notes TEXT,
    expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
    expense_type TEXT NOT NULL DEFAULT 'manual' CHECK (expense_type IN ('manual')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- 6. FIXED EXPENSES (RECURRING EXPENSE RULES)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.fixed_expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    amount NUMERIC(14, 2) NOT NULL CHECK (amount > 0),
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    category_name TEXT NOT NULL DEFAULT 'Bills',
    frequency TEXT NOT NULL CHECK (frequency IN ('daily', 'weekly', 'monthly', 'yearly')),
    start_date DATE NOT NULL DEFAULT CURRENT_DATE,
    end_date DATE,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- 7. FIXED EXPENSE OCCURRENCES (DAILY/SCHEDULED INSTANCES)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.fixed_expense_occurrences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    fixed_expense_id UUID NOT NULL REFERENCES public.fixed_expenses(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    occurrence_date DATE NOT NULL,
    amount NUMERIC(14, 2) NOT NULL CHECK (amount > 0),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'skipped')),
    processed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_fixed_expense_occurrence UNIQUE (fixed_expense_id, occurrence_date)
);

-- ==============================================================================
-- 8. NOTIFICATIONS & INBOX
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN (
        'DAILY_FIXED_EXPENSE',
        'FIXED_EXPENSE_DEDUCTED',
        'FIXED_EXPENSE_SKIPPED',
        'LOW_BALANCE',
        'FIXED_EXPENSE_WARNING',
        'FIVE_DAYS_REMAINING',
        'WEEKLY_REPORT',
        'INFO'
    )),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- 9. NOTIFICATION SETTINGS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.notification_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    notifications_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    low_balance_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    fixed_expense_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    five_day_warning_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    weekly_report_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    expo_push_token TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- 10. BUDGET SETTINGS & PERIODS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.budget_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    period_type TEXT NOT NULL DEFAULT 'monthly' CHECK (period_type IN ('weekly', 'monthly')),
    low_balance_threshold NUMERIC(14, 2) NOT NULL DEFAULT 2000.00 CHECK (low_balance_threshold >= 0),
    weekly_report_day TEXT NOT NULL DEFAULT 'Sunday',
    last_five_day_warning_date DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- 11. WEEKLY REPORTS LOG
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.weekly_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    week_start DATE NOT NULL,
    week_end DATE NOT NULL,
    starting_balance NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
    money_added NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
    manual_expenses NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
    fixed_expenses NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
    total_expenses NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
    remaining_balance NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
    upcoming_fixed_expenses NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
    safe_to_spend NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
    category_breakdown JSONB NOT NULL DEFAULT '{}'::jsonb,
    fixed_breakdown JSONB NOT NULL DEFAULT '[]'::jsonb,
    status TEXT NOT NULL DEFAULT 'sent' CHECK (status IN ('pending', 'sent', 'failed')),
    resend_id TEXT,
    sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_user_weekly_report UNIQUE (user_id, week_start, week_end)
);

-- ==============================================================================
-- INDEXES FOR MAXIMUM QUERY PERFORMANCE
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_money_additions_user_date ON public.money_additions(user_id, added_at DESC);
CREATE INDEX IF NOT EXISTS idx_expenses_user_date ON public.expenses(user_id, expense_date DESC);
CREATE INDEX IF NOT EXISTS idx_fixed_expenses_user_active ON public.fixed_expenses(user_id, active);
CREATE INDEX IF NOT EXISTS idx_fixed_occurrences_user_date ON public.fixed_expense_occurrences(user_id, occurrence_date);
CREATE INDEX IF NOT EXISTS idx_fixed_occurrences_status ON public.fixed_expense_occurrences(status);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON public.notifications(user_id, read) WHERE read = FALSE;

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.money_additions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fixed_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fixed_expense_occurrences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budget_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_reports ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can view and update their own profile
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Wallets
CREATE POLICY "Users can view own wallet" ON public.wallets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own wallet" ON public.wallets FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own wallet" ON public.wallets FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Money Additions
CREATE POLICY "Users can view own money additions" ON public.money_additions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own money additions" ON public.money_additions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own money additions" ON public.money_additions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own money additions" ON public.money_additions FOR DELETE USING (auth.uid() = user_id);

-- Categories: Users see global default categories (user_id IS NULL) + their own custom categories
CREATE POLICY "Users can view categories" ON public.categories FOR SELECT USING (user_id IS NULL OR auth.uid() = user_id);
CREATE POLICY "Users can insert own categories" ON public.categories FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own categories" ON public.categories FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own categories" ON public.categories FOR DELETE USING (auth.uid() = user_id);

-- Expenses
CREATE POLICY "Users can view own expenses" ON public.expenses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own expenses" ON public.expenses FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own expenses" ON public.expenses FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own expenses" ON public.expenses FOR DELETE USING (auth.uid() = user_id);

-- Fixed Expenses (Recurring rules)
CREATE POLICY "Users can view own fixed expenses" ON public.fixed_expenses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own fixed expenses" ON public.fixed_expenses FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own fixed expenses" ON public.fixed_expenses FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own fixed expenses" ON public.fixed_expenses FOR DELETE USING (auth.uid() = user_id);

-- Fixed Expense Occurrences
CREATE POLICY "Users can view own occurrences" ON public.fixed_expense_occurrences FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own occurrences" ON public.fixed_expense_occurrences FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own occurrences" ON public.fixed_expense_occurrences FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own occurrences" ON public.fixed_expense_occurrences FOR DELETE USING (auth.uid() = user_id);

-- Notifications
CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own notifications" ON public.notifications FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own notifications" ON public.notifications FOR DELETE USING (auth.uid() = user_id);

-- Notification Settings
CREATE POLICY "Users can view own notification settings" ON public.notification_settings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notification settings" ON public.notification_settings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own notification settings" ON public.notification_settings FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Budget Settings
CREATE POLICY "Users can view own budget settings" ON public.budget_settings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own budget settings" ON public.budget_settings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own budget settings" ON public.budget_settings FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Weekly Reports
CREATE POLICY "Users can view own weekly reports" ON public.weekly_reports FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own weekly reports" ON public.weekly_reports FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ==============================================================================
-- TRIGGER: AUTO CREATE PROFILE, WALLET, DEFAULT CATEGORIES & SETTINGS ON SIGNUP
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- 1. Create Profile
    INSERT INTO public.profiles (id, name, email, currency)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
        NEW.email,
        'INR'
    ) ON CONFLICT (id) DO NOTHING;

    -- 2. Create Wallet
    INSERT INTO public.wallets (user_id, currency)
    VALUES (NEW.id, 'INR')
    ON CONFLICT (user_id) DO NOTHING;

    -- 3. Create Notification Settings
    INSERT INTO public.notification_settings (user_id)
    VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;

    -- 4. Create Budget Settings
    INSERT INTO public.budget_settings (user_id, period_type, low_balance_threshold)
    VALUES (NEW.id, 'monthly', 2000.00)
    ON CONFLICT (user_id) DO NOTHING;

    -- 5. Seed default categories for this user
    INSERT INTO public.categories (user_id, name, icon, color, is_default)
    VALUES
        (NEW.id, 'Food', 'utensils', '#F59E0B', TRUE),
        (NEW.id, 'Transport', 'bus', '#3B82F6', TRUE),
        (NEW.id, 'Shopping', 'shopping-bag', '#EC4899', TRUE),
        (NEW.id, 'Education', 'book-open', '#8B5CF6', TRUE),
        (NEW.id, 'Entertainment', 'film', '#6366F1', TRUE),
        (NEW.id, 'Health', 'activity', '#EF4444', TRUE),
        (NEW.id, 'Bills', 'file-text', '#10B981', TRUE),
        (NEW.id, 'Groceries', 'shopping-cart', '#14B8A6', TRUE),
        (NEW.id, 'Other', 'more-horizontal', '#6B7280', TRUE)
    ON CONFLICT DO NOTHING;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- STORED PROCEDURE: GENERATE DUE FIXED EXPENSE OCCURRENCES
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.generate_due_fixed_expense_occurrences(
    p_user_id UUID DEFAULT NULL,
    p_target_date DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE (
    inserted_count INT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_count INT := 0;
BEGIN
    WITH candidate_rules AS (
        SELECT fe.*
        FROM public.fixed_expenses fe
        WHERE fe.active = TRUE
          AND fe.start_date <= p_target_date
          AND (fe.end_date IS NULL OR fe.end_date >= p_target_date)
          AND (p_user_id IS NULL OR fe.user_id = p_user_id)
          AND (
              -- Daily
              fe.frequency = 'daily'
              -- Weekly (same day of week as start date)
              OR (fe.frequency = 'weekly' AND EXTRACT(DOW FROM fe.start_date) = EXTRACT(DOW FROM p_target_date))
              -- Monthly (same day of month as start date or last day of month if shorter)
              OR (fe.frequency = 'monthly' AND EXTRACT(DAY FROM fe.start_date) = EXTRACT(DAY FROM p_target_date))
              -- Yearly (same month and day)
              OR (fe.frequency = 'yearly' AND EXTRACT(MONTH FROM fe.start_date) = EXTRACT(MONTH FROM p_target_date) AND EXTRACT(DAY FROM fe.start_date) = EXTRACT(DAY FROM p_target_date))
          )
    ),
    inserted_rows AS (
        INSERT INTO public.fixed_expense_occurrences (
            fixed_expense_id,
            user_id,
            occurrence_date,
            amount,
            status
        )
        SELECT 
            cr.id,
            cr.user_id,
            p_target_date,
            cr.amount,
            'pending'
        FROM candidate_rules cr
        ON CONFLICT (fixed_expense_id, occurrence_date) DO NOTHING
        RETURNING id
    )
    SELECT COUNT(*)::INT INTO v_count FROM inserted_rows;

    RETURN QUERY SELECT v_count;
END;
$$;
