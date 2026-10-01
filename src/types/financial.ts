// Financial Domain Models & Computation Result Types

export type TransactionType = 'money_added' | 'manual_expense' | 'fixed_expense' | 'skipped_fixed_expense';

export interface UnifiedTransaction {
  id: string;
  name: string;
  amount: number;
  category: string;
  date: string; // ISO or YYYY-MM-DD
  type: TransactionType;
  rawType: 'income' | 'expense' | 'skipped';
  notes?: string | null;
  meta?: Record<string, any>;
}

export interface FinancialSummary {
  totalMoneyAdded: number;
  totalManualExpenses: number;
  totalCompletedFixedExpenses: number;
  totalExpenses: number; // totalManualExpenses + totalCompletedFixedExpenses
  currentBalance: number; // totalMoneyAdded - totalExpenses
  upcomingFixedExpenses: number;
  safeToSpend: number; // currentBalance - upcomingFixedExpenses
  daysRemaining: number;
  safeDailySpending: number; // safeToSpend / daysRemaining
  periodType: 'weekly' | 'monthly' | 'custom';
  periodStartFormatted?: string;
  periodEndFormatted?: string;
  totalCycleDays?: number;
  cycleStartDay?: number;
  customStartDate?: string | null;
  customEndDate?: string | null;
  lowBalanceThreshold: number;
  isLowBalance: boolean;
  isFixedExpenseWarning: boolean;
  isSafeToSpendNegative: boolean;
  isFiveDaysRemaining: boolean;
}

export interface FixedExpenseForecastItem {
  id: string;
  name: string;
  amount: number;
  frequency: string;
  expectedOccurrencesCount: number;
  expectedTotalAmount: number;
}

export interface TodayFixedExpenseItem {
  occurrenceId: string;
  fixedExpenseId: string;
  name: string;
  amount: number;
  category: string;
  frequency: string;
  status: 'pending' | 'completed' | 'skipped';
  occurrenceDate: string;
}

export interface CategorySpending {
  name: string;
  amount: number;
  percentage: number;
  color: string;
  icon: string;
}

export interface SpendingTrendPoint {
  label: string;
  value: number;
  date: string;
}
