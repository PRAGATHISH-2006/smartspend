-- Migration: Add custom budget period and cycle start day to budget_settings
-- Created for SmartSpend

ALTER TABLE public.budget_settings 
  DROP CONSTRAINT IF EXISTS budget_settings_period_type_check;

ALTER TABLE public.budget_settings 
  ADD CONSTRAINT budget_settings_period_type_check 
  CHECK (period_type IN ('weekly', 'monthly', 'custom'));

ALTER TABLE public.budget_settings 
  ADD COLUMN IF NOT EXISTS cycle_start_day INTEGER DEFAULT 1 CHECK (cycle_start_day >= 1 AND cycle_start_day <= 31),
  ADD COLUMN IF NOT EXISTS custom_start_date DATE,
  ADD COLUMN IF NOT EXISTS custom_end_date DATE;
