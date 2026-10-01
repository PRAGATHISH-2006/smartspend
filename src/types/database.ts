// Database Types mirroring Supabase PostgreSQL Tables

export interface ProfileRow {
  id: string;
  name: string;
  email: string;
  currency: string;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface WalletRow {
  id: string;
  user_id: string;
  currency: string;
  created_at: string;
  updated_at: string;
}

export interface MoneyAdditionRow {
  id: string;
  user_id: string;
  wallet_id: string | null;
  amount: number;
  description: string;
  payment_method?: string;
  added_at: string;
  created_at: string;
}

export interface CategoryRow {
  id: string;
  user_id: string | null;
  name: string;
  icon: string;
  color: string;
  is_default: boolean;
  created_at: string;
}

export interface ExpenseRow {
  id: string;
  user_id: string;
  amount: number;
  category_id: string | null;
  category_name: string;
  description: string;
  notes: string | null;
  expense_date: string; // YYYY-MM-DD
  expense_type: 'manual';
  created_at: string;
  updated_at: string;
}

export type FrequencyType = 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface FixedExpenseRow {
  id: string;
  user_id: string;
  name: string;
  amount: number;
  category_id: string | null;
  category_name: string;
  frequency: FrequencyType;
  start_date: string; // YYYY-MM-DD
  end_date: string | null; // YYYY-MM-DD
  active: boolean;
  created_at: string;
  updated_at: string;
}

export type OccurrenceStatus = 'pending' | 'completed' | 'skipped';

export interface FixedExpenseOccurrenceRow {
  id: string;
  fixed_expense_id: string;
  user_id: string;
  occurrence_date: string; // YYYY-MM-DD
  amount: number;
  status: OccurrenceStatus;
  processed_at: string | null;
  created_at: string;
  fixed_expense?: FixedExpenseRow;
}

export type NotificationType =
  | 'DAILY_FIXED_EXPENSE'
  | 'FIXED_EXPENSE_DEDUCTED'
  | 'FIXED_EXPENSE_SKIPPED'
  | 'LOW_BALANCE'
  | 'FIXED_EXPENSE_WARNING'
  | 'FIVE_DAYS_REMAINING'
  | 'WEEKLY_REPORT'
  | 'INFO';

export interface NotificationRow {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  metadata: Record<string, any>;
  read: boolean;
  created_at: string;
}

export interface NotificationSettingsRow {
  id: string;
  user_id: string;
  notifications_enabled: boolean;
  low_balance_enabled: boolean;
  fixed_expense_enabled: boolean;
  five_day_warning_enabled: boolean;
  weekly_report_enabled: boolean;
  expo_push_token: string | null;
  created_at: string;
  updated_at: string;
}

export interface BudgetSettingsRow {
  id: string;
  user_id: string;
  period_type: 'weekly' | 'monthly' | 'custom';
  low_balance_threshold: number;
  weekly_report_day: string;
  cycle_start_day?: number;
  custom_start_date?: string | null;
  custom_end_date?: string | null;
  last_five_day_warning_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface WeeklyReportRow {
  id: string;
  user_id: string;
  week_start: string;
  week_end: string;
  starting_balance: number;
  money_added: number;
  manual_expenses: number;
  fixed_expenses: number;
  total_expenses: number;
  remaining_balance: number;
  upcoming_fixed_expenses: number;
  safe_to_spend: number;
  category_breakdown: Record<string, number>;
  fixed_breakdown: Array<{
    name: string;
    paidDays: number;
    skippedDays: number;
    amountPaid: number;
  }>;
  status: 'pending' | 'sent' | 'failed';
  resend_id: string | null;
  sent_at: string;
  created_at: string;
}
