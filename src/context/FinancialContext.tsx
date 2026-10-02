// FinancialContext: Real-Time Transaction-Based Financial Engine

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Linking } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { addDays, format, endOfMonth, addMonths, parseISO } from 'date-fns';
import { useAuth } from './AuthContext';
import { supabase } from '../services/supabase';
import {
  MoneyAdditionRow,
  ExpenseRow,
  FixedExpenseRow,
  FixedExpenseOccurrenceRow,
  CategoryRow,
  BudgetSettingsRow,
  FrequencyType,
} from '../types/database';
import {
  FinancialSummary,
  UnifiedTransaction,
  TodayFixedExpenseItem,
  CategorySpending,
} from '../types/financial';
import { evaluateFinancialSummary } from '../utils/financialCalculations';
import { getTodayDateString, getDaysRemainingInPeriod } from '../utils/dateUtils';
import { createInAppNotification } from '../services/notificationService';
import { getCategoryMeta, DEFAULT_CATEGORIES } from '../constants/categories';
import {
  triggerMonthCloseStatementEmail,
  generateTransactionsCsv,
  downloadFile,
} from '../services/emailReportService';
import {
  generateMonthStatementPdf,
  downloadPdfDocument,
  uploadPdfToGoogleDrive,
} from '../services/pdfReportService';

interface FinancialContextType {
  loading: boolean;
  refreshing: boolean;
  summary: FinancialSummary;
  moneyAdditions: MoneyAdditionRow[];
  manualExpenses: ExpenseRow[];
  fixedExpenses: FixedExpenseRow[];
  occurrences: FixedExpenseOccurrenceRow[];
  categories: CategoryRow[];
  budgetSettings: BudgetSettingsRow | null;
  todayFixedExpenses: TodayFixedExpenseItem[];
  unifiedTransactions: UnifiedTransaction[];
  categoryBreakdown: CategorySpending[];
  refreshData: () => Promise<void>;
  addMoney: (amount: number, description?: string) => Promise<{ error: Error | null }>;
  addExpense: (params: {
    amount: number;
    categoryId?: string;
    categoryName: string;
    description: string;
    expenseDate?: string;
    notes?: string;
  }) => Promise<{ error: Error | null }>;
  addFixedExpense: (params: {
    name: string;
    amount: number;
    categoryId?: string;
    categoryName: string;
    frequency: FrequencyType;
    startDate?: string;
    endDate?: string | null;
  }) => Promise<{ error: Error | null }>;
  updateFixedExpense: (
    id: string,
    updates: Partial<FixedExpenseRow>
  ) => Promise<{ error: Error | null }>;
  deleteFixedExpense: (id: string) => Promise<{ error: Error | null }>;
  toggleFixedExpenseActive: (id: string, active: boolean) => Promise<{ error: Error | null }>;
  payFixedExpense: (occurrenceId: string, customAmount?: number) => Promise<{ error: Error | null }>;
  skipFixedExpense: (occurrenceId: string) => Promise<{ error: Error | null }>;
  addCustomCategory: (name: string, icon?: string, color?: string) => Promise<{ error: Error | null }>;
  updateBudgetSettings: (updates: Partial<BudgetSettingsRow>) => Promise<{ error: Error | null }>;
  extendBudgetPeriod: (days?: number, customDate?: string) => Promise<{ error: Error | null; newEndDate?: string }>;
  closeCurrentMonth: () => Promise<{
    success: boolean;
    rolloverAmount: number;
    driveFolderUrl: string;
    pdfFilename?: string;
    pdfBase64?: string;
    driveUploadSuccess?: boolean;
    message?: string;
    error?: string;
  }>;
  loadDemoData: () => Promise<{ success: boolean; error?: string }>;
  resetUserData: () => Promise<{ success: boolean; error?: string }>;
}

const defaultSummary: FinancialSummary = {
  totalMoneyAdded: 0,
  totalManualExpenses: 0,
  totalCompletedFixedExpenses: 0,
  totalExpenses: 0,
  currentBalance: 0,
  upcomingFixedExpenses: 0,
  safeToSpend: 0,
  daysRemaining: 1,
  safeDailySpending: 0,
  periodType: 'monthly',
  lowBalanceThreshold: 2000,
  isLowBalance: false,
  isFixedExpenseWarning: false,
  isSafeToSpendNegative: false,
  isFiveDaysRemaining: false,
};

const FinancialContext = createContext<FinancialContextType | undefined>(undefined);

export const FinancialProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const [moneyAdditions, setMoneyAdditions] = useState<MoneyAdditionRow[]>([]);
  const [manualExpenses, setManualExpenses] = useState<ExpenseRow[]>([]);
  const [fixedExpenses, setFixedExpenses] = useState<FixedExpenseRow[]>([]);
  const [occurrences, setOccurrences] = useState<FixedExpenseOccurrenceRow[]>([]);
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [budgetSettings, setBudgetSettings] = useState<BudgetSettingsRow | null>(null);

  /**
   * Sync and generate today's pending occurrences for active recurring rules
   */
  const ensureTodayOccurrences = async (
    userId: string,
    rules: FixedExpenseRow[],
    existingOccurrences: FixedExpenseOccurrenceRow[],
    rolloverCutoffTime: number = 0
  ) => {
    const today = new Date();
    const todayStr = getTodayDateString(today);
    const activeRules = rules.filter((r) => r.active && r.start_date <= todayStr);
    const missingRules: FixedExpenseRow[] = [];

    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth(); // 0-indexed (0 = Jan, 9 = Oct)

    // Filter occurrences belonging to current active cycle
    const activeCycleOccurrences = rolloverCutoffTime > 0
      ? existingOccurrences.filter((o) => {
          const occTime = new Date(o.created_at || o.occurrence_date).getTime();
          return occTime >= rolloverCutoffTime;
        })
      : existingOccurrences;

    for (const rule of activeRules) {
      if (rule.frequency === 'daily') {
        // Daily: Check if occurrence exists for today's exact date in active cycle
        const hasToday = activeCycleOccurrences.some(
          (o) => o.fixed_expense_id === rule.id && o.occurrence_date === todayStr
        );
        if (!hasToday) {
          missingRules.push(rule);
        }
      } else if (rule.frequency === 'weekly') {
        // Weekly: Check if occurrence exists for today when day of week matches
        const ruleStartDate = parseISO(rule.start_date);
        const isDayOfWeek = today.getDay() === ruleStartDate.getDay();
        const hasToday = activeCycleOccurrences.some(
          (o) => o.fixed_expense_id === rule.id && o.occurrence_date === todayStr
        );
        if (isDayOfWeek && !hasToday) {
          missingRules.push(rule);
        }
      } else if (rule.frequency === 'monthly') {
        // Monthly: Prompt once per calendar month / billing cycle
        const hasThisMonth = activeCycleOccurrences.some((o) => {
          if (o.fixed_expense_id !== rule.id) return false;
          const occDate = parseISO(o.occurrence_date);
          return occDate.getFullYear() === currentYear && occDate.getMonth() === currentMonth;
        });

        if (!hasThisMonth) {
          missingRules.push(rule);
        }
      } else if (rule.frequency === 'yearly') {
        // Yearly: Prompt once per 12-month calendar year
        const hasThisYear = activeCycleOccurrences.some((o) => {
          if (o.fixed_expense_id !== rule.id) return false;
          const occDate = parseISO(o.occurrence_date);
          return occDate.getFullYear() === currentYear;
        });

        if (!hasThisYear) {
          missingRules.push(rule);
        }
      }
    }

    if (missingRules.length > 0) {
      for (const rule of missingRules) {
        await supabase
          .from('fixed_expense_occurrences')
          .upsert(
            {
              fixed_expense_id: rule.id,
              user_id: userId,
              occurrence_date: todayStr,
              amount: rule.amount,
              status: 'pending' as const,
              processed_at: null,
              created_at: new Date().toISOString(),
            },
            { onConflict: 'fixed_expense_id,occurrence_date' }
          );
      }

      // Re-fetch all occurrences from Supabase to ensure in-memory state is synchronized
      const { data: freshOccs } = await supabase
        .from('fixed_expense_occurrences')
        .select('*')
        .eq('user_id', userId)
        .order('occurrence_date', { ascending: false });

      if (freshOccs && freshOccs.length > 0) {
        return freshOccs as FixedExpenseOccurrenceRow[];
      }
    }

    return existingOccurrences;
  };

  /**
   * Fetch all user financial data from Supabase
   */
  const fetchData = useCallback(async () => {
    if (!user?.id) {
      setMoneyAdditions([]);
      setManualExpenses([]);
      setFixedExpenses([]);
      setOccurrences([]);
      setCategories([]);
      setBudgetSettings(null);
      setLoading(false);
      return;
    }

    try {
      // 1. Parallel queries to Supabase
      const [
        additionsRes,
        expensesRes,
        fixedRulesRes,
        occurrencesRes,
        categoriesRes,
        budgetRes,
      ] = await Promise.all([
        supabase
          .from('money_additions')
          .select('*')
          .eq('user_id', user.id)
          .order('added_at', { ascending: false }),
        supabase
          .from('expenses')
          .select('*')
          .eq('user_id', user.id)
          .order('expense_date', { ascending: false }),
        supabase
          .from('fixed_expenses')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('fixed_expense_occurrences')
          .select('*')
          .eq('user_id', user.id)
          .order('occurrence_date', { ascending: false }),
        supabase
          .from('categories')
          .select('*')
          .or(`user_id.eq.${user.id},is_default.eq.true`)
          .order('created_at', { ascending: true }),
        supabase
          .from('budget_settings')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle(),
      ]);

      const fetchedAdditions = (additionsRes.data as MoneyAdditionRow[]) || [];
      const fetchedExpenses = (expensesRes.data as ExpenseRow[]) || [];
      const fetchedFixed = (fixedRulesRes.data as FixedExpenseRow[]) || [];
      let fetchedOccurrences = (occurrencesRes.data as FixedExpenseOccurrenceRow[]) || [];
      const fetchedCategories = (categoriesRes.data as CategoryRow[]) || [];
      let fetchedBudget = (budgetRes.data as BudgetSettingsRow) || null;

      // Merge with locally stored custom budget settings if available
      try {
        const cachedBudget = await AsyncStorage.getItem(`budget_settings_${user.id}`);
        if (cachedBudget) {
          const parsed = JSON.parse(cachedBudget);
          fetchedBudget = {
            ...(fetchedBudget || {
              id: 'local',
              user_id: user.id,
              period_type: 'monthly',
              low_balance_threshold: 2000,
              weekly_report_day: 'Sunday',
              last_five_day_warning_date: null,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            }),
            ...parsed,
          };
        }
      } catch (cacheErr) {
        console.warn('Error reading budget settings cache:', cacheErr);
      }

      // Identify active cycle rollover cutoff
      const latestRollover = fetchedAdditions
        .filter((a) => (a.description || '').toLowerCase().includes('rollover surplus'))
        .sort((a, b) => new Date(b.created_at || b.added_at).getTime() - new Date(a.created_at || a.added_at).getTime())[0];

      const rolloverCutoff = latestRollover
        ? new Date(latestRollover.created_at || latestRollover.added_at).getTime()
        : 0;

      // Ensure today's / active cycle occurrences exist idempotently
      fetchedOccurrences = await ensureTodayOccurrences(
        user.id,
        fetchedFixed,
        fetchedOccurrences,
        rolloverCutoff
      );

      setMoneyAdditions(fetchedAdditions);
      setManualExpenses(fetchedExpenses);
      setFixedExpenses(fetchedFixed);
      setOccurrences(fetchedOccurrences);
      setCategories(fetchedCategories);
      setBudgetSettings(fetchedBudget);
    } catch (err) {
      console.warn('Error fetching financial data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refreshData = async () => {
    setRefreshing(true);
    await fetchData();
  };

  // Compute reactive financial summary with custom period and cycle settings
  const summary: FinancialSummary = evaluateFinancialSummary({
    additions: moneyAdditions,
    manualExpenses,
    fixedRules: fixedExpenses,
    occurrences,
    periodType: budgetSettings?.period_type || 'monthly',
    cycleStartDay: budgetSettings?.cycle_start_day || 1,
    customStartDate: budgetSettings?.custom_start_date,
    customEndDate: budgetSettings?.custom_end_date,
    lowBalanceThreshold: Number(budgetSettings?.low_balance_threshold ?? 2000),
  });

  // Active Cycle Occurrences Filter:
  // Isolate occurrences to the current cycle (created on or after the latest Rollover Surplus)
  // Today's occurrences & pending cycle occurrences mapped with fixed expense rule details
  const todayStr = getTodayDateString();
  const todayFixedExpenses: TodayFixedExpenseItem[] = occurrences
    .filter((o) => {
      return o.occurrence_date === todayStr || o.status === 'pending';
    })
    .map((o) => {
      const rule = fixedExpenses.find((r) => r.id === o.fixed_expense_id);
      return {
        occurrenceId: o.id,
        fixedExpenseId: o.fixed_expense_id,
        name: rule?.name || 'Recurring Expense',
        amount: Number(o.amount),
        category: rule?.category_name || 'Bills',
        frequency: rule?.frequency || 'daily',
        status: o.status,
        occurrenceDate: o.occurrence_date,
      };
    });

  // Unified Chronological Transaction History
  const unifiedTransactions: UnifiedTransaction[] = [
    // 1. Money additions
    ...moneyAdditions.map((a) => ({
      id: `add_${a.id}`,
      name: a.description || 'Added money to wallet',
      amount: Number(a.amount),
      category: 'Top-up',
      date: a.added_at,
      type: 'money_added' as const,
      rawType: 'income' as const,
      notes: a.payment_method,
    })),
    // 2. Manual expenses
    ...manualExpenses.map((e) => ({
      id: `exp_${e.id}`,
      name: e.description,
      amount: Number(e.amount),
      category: e.category_name || 'Other',
      date: e.expense_date,
      type: 'manual_expense' as const,
      rawType: 'expense' as const,
      notes: e.notes,
    })),
    // 3. Fixed occurrences (both completed and skipped)
    ...occurrences.map((o) => {
      const rule = fixedExpenses.find((r) => r.id === o.fixed_expense_id);
      const isCompleted = o.status === 'completed';
      const isSkipped = o.status === 'skipped';
      return {
        id: `occ_${o.id}`,
        name: rule?.name || 'Fixed Expense',
        amount: Number(o.amount),
        category: rule?.category_name || 'Fixed',
        date: o.occurrence_date,
        type: isSkipped ? ('skipped_fixed_expense' as const) : ('fixed_expense' as const),
        rawType: isSkipped ? ('skipped' as const) : ('expense' as const),
        notes: isSkipped ? 'Occurrence skipped for today' : `Status: ${o.status}`,
      };
    }),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Category breakdown with icons and percentages
  const categoryMap: Record<string, number> = {};
  manualExpenses.forEach((e) => {
    const cat = e.category_name || 'Other';
    categoryMap[cat] = (categoryMap[cat] || 0) + Number(e.amount);
  });
  if (summary.totalCompletedFixedExpenses > 0) {
    categoryMap['Fixed Expenses'] =
      (categoryMap['Fixed Expenses'] || 0) + summary.totalCompletedFixedExpenses;
  }

  const categoryBreakdown: CategorySpending[] = Object.entries(categoryMap).map(
    ([name, amount]) => {
      const meta = getCategoryMeta(name);
      return {
        name,
        amount,
        percentage:
          summary.totalExpenses > 0 ? Math.round((amount / summary.totalExpenses) * 100) : 0,
        color: meta.color,
        icon: meta.icon,
      };
    }
  ).sort((a, b) => b.amount - a.amount);

  // ==========================================
  // ACTION HANDLERS
  // ==========================================

  const addMoney = async (amount: number, description?: string) => {
    if (!user?.id || amount <= 0) {
      return { error: new Error('Invalid amount or unauthenticated user') };
    }

    try {
      const { data, error } = await supabase
        .from('money_additions')
        .insert({
          user_id: user.id,
          amount,
          description: description || 'Added money to wallet',
        })
        .select('*')
        .single();

      if (error) throw error;

      setMoneyAdditions((prev) => [data as MoneyAdditionRow, ...prev]);
      return { error: null };
    } catch (err: any) {
      return { error: err };
    }
  };

  const addExpense = async (params: {
    amount: number;
    categoryId?: string;
    categoryName: string;
    description: string;
    expenseDate?: string;
    notes?: string;
  }) => {
    if (!user?.id || params.amount <= 0) {
      return { error: new Error('Invalid amount or unauthenticated user') };
    }

    try {
      const { data, error } = await supabase
        .from('expenses')
        .insert({
          user_id: user.id,
          amount: params.amount,
          category_id: params.categoryId || null,
          category_name: params.categoryName || 'Other',
          description: params.description.trim(),
          expense_date: params.expenseDate || getTodayDateString(),
          notes: params.notes || null,
        })
        .select('*')
        .single();

      if (error) throw error;

      setManualExpenses((prev) => [data as ExpenseRow, ...prev]);

      // Check if new balance triggers low balance alert
      const newBalance = summary.currentBalance - params.amount;
      if (newBalance <= summary.lowBalanceThreshold) {
        createInAppNotification({
          userId: user.id,
          type: 'LOW_BALANCE',
          title: '⚠️ Low Balance Alert',
          message: `Your balance is ₹${newBalance.toFixed(2)}, which is below your threshold of ₹${summary.lowBalanceThreshold}.`,
        });
      }

      return { error: null };
    } catch (err: any) {
      return { error: err };
    }
  };

  const addFixedExpense = async (params: {
    name: string;
    amount: number;
    categoryId?: string;
    categoryName: string;
    frequency: FrequencyType;
    startDate?: string;
    endDate?: string | null;
  }) => {
    if (!user?.id || params.amount <= 0) {
      return { error: new Error('Invalid amount or unauthenticated user') };
    }

    try {
      const { data, error } = await supabase
        .from('fixed_expenses')
        .insert({
          user_id: user.id,
          name: params.name.trim(),
          amount: params.amount,
          category_id: params.categoryId || null,
          category_name: params.categoryName || 'Bills',
          frequency: params.frequency,
          start_date: params.startDate || getTodayDateString(),
          end_date: params.endDate || null,
          active: true,
        })
        .select('*')
        .single();

      if (error) throw error;

      const newRule = data as FixedExpenseRow;
      setFixedExpenses((prev) => [newRule, ...prev]);

      // Immediately create today's pending occurrence if starting today
      const todayStr = getTodayDateString();
      if (newRule.start_date <= todayStr) {
        const { data: occData } = await supabase
          .from('fixed_expense_occurrences')
          .insert({
            fixed_expense_id: newRule.id,
            user_id: user.id,
            occurrence_date: todayStr,
            amount: newRule.amount,
            status: 'pending',
          })
          .select('*')
          .maybeSingle();

        if (occData) {
          setOccurrences((prev) => [occData as FixedExpenseOccurrenceRow, ...prev]);
        }
      }

      return { error: null };
    } catch (err: any) {
      return { error: err };
    }
  };

  const updateFixedExpense = async (id: string, updates: Partial<FixedExpenseRow>) => {
    try {
      const { data, error } = await supabase
        .from('fixed_expenses')
        .update(updates)
        .eq('id', id)
        .select('*')
        .single();

      if (error) throw error;

      setFixedExpenses((prev) =>
        prev.map((item) => (item.id === id ? (data as FixedExpenseRow) : item))
      );
      return { error: null };
    } catch (err: any) {
      return { error: err };
    }
  };

  const deleteFixedExpense = async (id: string) => {
    try {
      const { error } = await supabase.from('fixed_expenses').delete().eq('id', id);
      if (error) throw error;

      setFixedExpenses((prev) => prev.filter((item) => item.id !== id));
      return { error: null };
    } catch (err: any) {
      return { error: err };
    }
  };

  const toggleFixedExpenseActive = async (id: string, active: boolean) => {
    return updateFixedExpense(id, { active });
  };

  const payFixedExpense = async (occurrenceId: string, customAmount?: number) => {
    try {
      const targetOcc = occurrences.find((o) => o.id === occurrenceId);
      if (!targetOcc) {
        return { error: new Error('Occurrence not found') };
      }

      const hasCustomAmount = customAmount !== undefined && !isNaN(customAmount) && customAmount >= 0;
      // If already completed and no custom amount update requested, idempotent return
      if (targetOcc.status === 'completed' && !hasCustomAmount) {
        return { error: null };
      }

      const finalAmount = hasCustomAmount ? customAmount : Number(targetOcc.amount);

      const { data, error } = await supabase
        .from('fixed_expense_occurrences')
        .update({
          amount: finalAmount,
          status: 'completed',
          processed_at: new Date().toISOString(),
        })
        .eq('id', occurrenceId)
        .select('*')
        .single();

      if (error) throw error;

      setOccurrences((prev) =>
        prev.map((o) => (o.id === occurrenceId ? (data as FixedExpenseOccurrenceRow) : o))
      );

      const rule = fixedExpenses.find((r) => r.id === targetOcc.fixed_expense_id);
      createInAppNotification({
        userId: user!.id,
        type: 'FIXED_EXPENSE_DEDUCTED',
        title: 'Fixed Expense Paid',
        message: `₹${finalAmount.toFixed(0)} was paid for ${rule?.name || 'Fixed Expense'}.`,
      });

      return { error: null };
    } catch (err: any) {
      return { error: err };
    }
  };

  const skipFixedExpense = async (occurrenceId: string) => {
    try {
      const targetOcc = occurrences.find((o) => o.id === occurrenceId);
      if (!targetOcc || targetOcc.status === 'skipped') {
        return { error: null }; // Idempotent
      }

      const { data, error } = await supabase
        .from('fixed_expense_occurrences')
        .update({
          status: 'skipped',
          processed_at: new Date().toISOString(),
        })
        .eq('id', occurrenceId)
        .select('*')
        .single();

      if (error) throw error;

      setOccurrences((prev) =>
        prev.map((o) => (o.id === occurrenceId ? (data as FixedExpenseOccurrenceRow) : o))
      );

      const rule = fixedExpenses.find((r) => r.id === targetOcc.fixed_expense_id);
      createInAppNotification({
        userId: user!.id,
        type: 'FIXED_EXPENSE_SKIPPED',
        title: 'Fixed Expense Skipped',
        message: `${rule?.name || 'Expense'} was skipped for today (₹0 deducted).`,
      });

      return { error: null };
    } catch (err: any) {
      return { error: err };
    }
  };

  const addCustomCategory = async (name: string, icon?: string, color?: string) => {
    if (!user?.id || !name.trim()) {
      return { error: new Error('Category name required') };
    }

    try {
      const { data, error } = await supabase
        .from('categories')
        .insert({
          user_id: user.id,
          name: name.trim(),
          icon: icon || 'tag',
          color: color || '#10B981',
          is_default: false,
        })
        .select('*')
        .single();

      if (error) throw error;

      setCategories((prev) => [...prev, data as CategoryRow]);
      return { error: null };
    } catch (err: any) {
      return { error: err };
    }
  };

  const updateBudgetSettings = async (updates: Partial<BudgetSettingsRow>) => {
    if (!user?.id) return { error: new Error('Unauthenticated') };

    try {
      // 1. Try Supabase upsert
      const { data, error } = await supabase
        .from('budget_settings')
        .upsert(
          {
            user_id: user.id,
            ...updates,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id' }
        )
        .select('*')
        .single();

      if (!error && data) {
        setBudgetSettings(data as BudgetSettingsRow);
      } else {
        setBudgetSettings((prev) => ({
          ...(prev || {
            id: 'local',
            user_id: user.id,
            period_type: 'monthly',
            low_balance_threshold: 2000,
            weekly_report_day: 'Sunday',
            last_five_day_warning_date: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }),
          ...updates,
        }));
      }

      // 2. Cache locally in AsyncStorage
      try {
        const existing = await AsyncStorage.getItem(`budget_settings_${user.id}`);
        const merged = { ...(existing ? JSON.parse(existing) : {}), ...updates };
        await AsyncStorage.setItem(`budget_settings_${user.id}`, JSON.stringify(merged));
      } catch (cacheErr) {
        console.warn('Error writing budget settings cache:', cacheErr);
      }

      return { error: null };
    } catch (err: any) {
      setBudgetSettings((prev) => ({
        ...(prev || {
          id: 'local',
          user_id: user.id,
          period_type: 'monthly',
          low_balance_threshold: 2000,
          weekly_report_day: 'Sunday',
          last_five_day_warning_date: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }),
        ...updates,
      }));
      return { error: null };
    }
  };

  // Extend Budget Period by specified days (e.g. 5 days) or to a custom date
  const extendBudgetPeriod = async (
    days: number = 5,
    customEndDateStr?: string
  ): Promise<{ error: Error | null; newEndDate?: string }> => {
    if (!user?.id) return { error: new Error('User not logged in') };

    try {
      const today = new Date();
      const currentPeriod = getDaysRemainingInPeriod(
        budgetSettings?.period_type || 'monthly',
        today,
        budgetSettings?.cycle_start_day || 1,
        budgetSettings?.custom_start_date,
        budgetSettings?.custom_end_date
      );

      const startDateStr =
        budgetSettings?.custom_start_date || format(currentPeriod.periodStart, 'yyyy-MM-dd');
      let targetEndDateStr: string;

      if (customEndDateStr) {
        targetEndDateStr = customEndDateStr;
      } else {
        const baseEnd = currentPeriod.periodEnd > today ? currentPeriod.periodEnd : today;
        targetEndDateStr = format(addDays(baseEnd, days), 'yyyy-MM-dd');
      }

      await updateBudgetSettings({
        period_type: 'custom',
        custom_start_date: startDateStr,
        custom_end_date: targetEndDateStr,
      });

      await createInAppNotification({
        userId: user.id,
        type: 'INFO',
        title: 'Budget Period Extended 📅',
        message: `Your active spending cycle has been extended until ${targetEndDateStr}. Safe-to-spend has been recalculated!`,
      });

      await fetchData();
      return { error: null, newEndDate: targetEndDateStr };
    } catch (err: any) {
      return { error: err };
    }
  };

  // Close Current Month, Rollover Surplus, Backup to Google Drive, and Dispatch Statement
  const closeCurrentMonth = async (): Promise<{
    success: boolean;
    rolloverAmount: number;
    driveFolderUrl: string;
    pdfFilename?: string;
    pdfBase64?: string;
    driveUploadSuccess?: boolean;
    message?: string;
    error?: string;
  }> => {
    if (!user?.id) {
      return {
        success: false,
        rolloverAmount: 0,
        driveFolderUrl: '',
        error: 'User not logged in',
      };
    }

    const DRIVE_FOLDER_URL =
      'https://drive.google.com/drive/folders/1AJzY39IKyCTR0d7HspLN0bMk609kITT2?usp=sharing';

    try {
      const today = new Date();
      const currentPeriod = getDaysRemainingInPeriod(
        budgetSettings?.period_type || 'monthly',
        today,
        budgetSettings?.cycle_start_day || 1,
        budgetSettings?.custom_start_date,
        budgetSettings?.custom_end_date
      );

      const startDateStr =
        budgetSettings?.custom_start_date || format(currentPeriod.periodStart, 'yyyy-MM-dd');
      const endDateStr =
        budgetSettings?.custom_end_date || format(currentPeriod.periodEnd, 'yyyy-MM-dd');
      const closingBalance = summary.currentBalance;
      const rolloverAmount = Math.max(0, closingBalance);

      // 1. Transfer remaining surplus to next month's wallet and log transaction
      if (rolloverAmount > 0) {
        await supabase.from('money_additions').insert({
          user_id: user.id,
          amount: rolloverAmount,
          description: `Rollover Surplus from Closed Month (${startDateStr} to ${endDateStr})`,
          payment_method: 'Month-End Rollover',
          added_at: new Date().toISOString(),
        });
      }

      // 2. Generate transaction archive PDF with Month Name (e.g. October_2026_Transactions.pdf) for Drive and Email
      const monthName = format(today, 'MMMM_yyyy'); // e.g. "October_2026"
      const monthDisplay = format(today, 'MMMM yyyy'); // e.g. "October 2026"
      let pdfFilename = `${monthName}_Transactions.pdf`;
      let pdfBase64 = '';
      let driveUploadSuccess = false;

      try {
        const pdfResult = generateMonthStatementPdf({
          monthName,
          monthDisplay,
          startDate: startDateStr,
          endDate: endDateStr,
          startingBalance: summary.totalMoneyAdded,
          totalMoneyAdded: summary.totalMoneyAdded,
          totalExpenses: summary.totalExpenses,
          closingBalance,
          rolloverAmount,
          recipientEmail: user.email || 'selvanpragathish@gmail.com',
          transactions: unifiedTransactions,
          categoryBreakdown,
        });

        pdfFilename = pdfResult.filename;
        pdfBase64 = pdfResult.base64;

        // Auto-download of PDF is disabled as requested

        // Attempt automated background upload to Google Drive right away
        try {
          const savedWebhook = (await AsyncStorage.getItem('gdrive_webhook_url')) || undefined;
          const driveRes = await uploadPdfToGoogleDrive({
            filename: pdfResult.filename,
            base64: pdfResult.base64,
            webhookUrl: savedWebhook,
          });
          driveUploadSuccess = !!driveRes.success;
          console.log('[Drive Auto-Upload Result]', driveRes);
        } catch (upErr) {
          console.warn('Auto drive upload error:', upErr);
        }
      } catch (pdfErr) {
        console.warn('PDF generation error:', pdfErr);
      }

      // Auto-download of CSV is disabled as requested

      // 3. Dispatch Month-End Closed Statement to user's email with Drive Link & Attached PDF
      try {
        await triggerMonthCloseStatementEmail({
          userId: user.id,
          startDate: startDateStr,
          endDate: endDateStr,
          rolloverAmount,
          driveFolderUrl: DRIVE_FOLDER_URL,
          pdfFilename,
          pdfBase64,
        });
      } catch (emailErr) {
        console.warn('Statement email error:', emailErr);
      }

      // 4. Advance budget cycle: Start fresh from today through the end of next month
      const newStartDateStr = getTodayDateString(today);
      const newEndDateStr = format(endOfMonth(addMonths(today, 1)), 'yyyy-MM-dd');

      await updateBudgetSettings({
        period_type: 'custom',
        custom_start_date: newStartDateStr,
        custom_end_date: newEndDateStr,
      });

      // 5. Generate fresh pending occurrences for all active recurring expenses in the new cycle
      const activeRules = fixedExpenses.filter((r) => r.active);
      if (activeRules.length > 0) {
        for (const rule of activeRules) {
          await supabase
            .from('fixed_expense_occurrences')
            .upsert(
              {
                fixed_expense_id: rule.id,
                user_id: user.id,
                occurrence_date: newStartDateStr,
                amount: rule.amount,
                status: 'pending' as const,
                processed_at: null,
                created_at: new Date().toISOString(),
              },
              { onConflict: 'fixed_expense_id,occurrence_date' }
            );
        }
      }

      // 5. In-app notification
      await createInAppNotification({
        userId: user.id,
        type: 'INFO',
        title: 'Month Successfully Closed 📁',
        message:
          rolloverAmount > 0
            ? `Month closed! Unspent balance ₹${rolloverAmount.toLocaleString(
                'en-IN'
              )} remains available in your wallet for the next cycle.`
            : `Month closed successfully.`,
      });

      // 6. Open Drive link in browser
      try {
        if (typeof window !== 'undefined') {
          window.open(DRIVE_FOLDER_URL, '_blank');
        } else {
          Linking.openURL(DRIVE_FOLDER_URL);
        }
      } catch {
        // Fallback
      }

      await fetchData();

      return {
        success: true,
        rolloverAmount,
        driveFolderUrl: DRIVE_FOLDER_URL,
        pdfFilename,
        pdfBase64,
        driveUploadSuccess,
        message: `Month closed successfully! Surplus ₹${rolloverAmount.toLocaleString(
          'en-IN'
        )} carried forward.`,
      };
    } catch (err: any) {
      return {
        success: false,
        rolloverAmount: 0,
        driveFolderUrl: DRIVE_FOLDER_URL,
        error: err.message || String(err),
      };
    }
  };

  // Demo Dataset Loader (Milk ₹60/day, Bus ₹40/day, Netflix ₹199/month, Lunch ₹200, Shopping ₹500, Wallet ₹10,000)
  const loadDemoData = async (): Promise<{ success: boolean; error?: string }> => {
    if (!user?.id) return { success: false, error: 'User not logged in' };

    try {
      const todayStr = getTodayDateString();

      // 1. Add Wallet Money ₹10,000
      await supabase.from('money_additions').insert({
        user_id: user.id,
        amount: 10000,
        description: 'Initial Wallet Balance',
        payment_method: 'UPI / NetBanking',
      });

      // 2. Add Fixed Expenses (Milk ₹60 Daily, Bus ₹40 Daily, Netflix ₹199 Monthly)
      const { data: fixedCreated } = await supabase
        .from('fixed_expenses')
        .insert([
          {
            user_id: user.id,
            name: 'Milk',
            amount: 60,
            category_name: 'Groceries',
            frequency: 'daily',
            start_date: todayStr,
            active: true,
          },
          {
            user_id: user.id,
            name: 'Bus',
            amount: 40,
            category_name: 'Transport',
            frequency: 'daily',
            start_date: todayStr,
            active: true,
          },
          {
            user_id: user.id,
            name: 'Netflix Subscription',
            amount: 199,
            category_name: 'Entertainment',
            frequency: 'monthly',
            start_date: todayStr,
            active: true,
          },
        ])
        .select('*');

      // 3. Create today's occurrences for Milk and Bus
      if (fixedCreated) {
        const occInserts = fixedCreated.map((rule) => ({
          fixed_expense_id: rule.id,
          user_id: user.id,
          occurrence_date: todayStr,
          amount: rule.amount,
          status: 'pending' as const,
        }));

        await supabase
          .from('fixed_expense_occurrences')
          .insert(occInserts)
          .select('*');
      }

      // 4. Add Manual Expenses: Lunch ₹200, Shopping ₹500
      await supabase.from('expenses').insert([
        {
          user_id: user.id,
          amount: 200,
          category_name: 'Food',
          description: 'Lunch with colleagues',
          expense_date: todayStr,
        },
        {
          user_id: user.id,
          amount: 500,
          category_name: 'Shopping',
          description: 'Weekend Shopping Essentials',
          expense_date: todayStr,
        },
      ]);

      await fetchData();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || String(err) };
    }
  };

  // Reset all user data
  const resetUserData = async (): Promise<{ success: boolean; error?: string }> => {
    if (!user?.id) return { success: false, error: 'User not logged in' };

    try {
      await Promise.all([
        supabase.from('money_additions').delete().eq('user_id', user.id),
        supabase.from('expenses').delete().eq('user_id', user.id),
        supabase.from('fixed_expenses').delete().eq('user_id', user.id),
        supabase.from('fixed_expense_occurrences').delete().eq('user_id', user.id),
        supabase.from('notifications').delete().eq('user_id', user.id),
        supabase.from('weekly_reports').delete().eq('user_id', user.id),
        supabase.from('budget_settings').delete().eq('user_id', user.id),
      ]);

      try {
        await AsyncStorage.removeItem(`budget_settings_${user.id}`);
      } catch {}

      setMoneyAdditions([]);
      setManualExpenses([]);
      setFixedExpenses([]);
      setOccurrences([]);
      setBudgetSettings(null);

      await fetchData();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || String(err) };
    }
  };

  return (
    <FinancialContext.Provider
      value={{
        loading,
        refreshing,
        summary,
        moneyAdditions,
        manualExpenses,
        fixedExpenses,
        occurrences,
        categories,
        budgetSettings,
        todayFixedExpenses,
        unifiedTransactions,
        categoryBreakdown,
        refreshData,
        addMoney,
        addExpense,
        addFixedExpense,
        updateFixedExpense,
        deleteFixedExpense,
        toggleFixedExpenseActive,
        payFixedExpense,
        skipFixedExpense,
        addCustomCategory,
        updateBudgetSettings,
        extendBudgetPeriod,
        closeCurrentMonth,
        loadDemoData,
        resetUserData,
      }}
    >
      {children}
    </FinancialContext.Provider>
  );
};

export function useFinancial() {
  const context = useContext(FinancialContext);
  if (!context) {
    throw new Error('useFinancial must be used within a FinancialProvider');
  }
  return context;
}
