// Pure financial computation functions for SmartSpend

import {
  MoneyAdditionRow,
  ExpenseRow,
  FixedExpenseRow,
  FixedExpenseOccurrenceRow,
} from '../types/database';
import { FinancialSummary, FixedExpenseForecastItem } from '../types/financial';
import { getDaysRemainingInPeriod, getTodayDateString } from './dateUtils';
import { differenceInCalendarDays, parseISO, addDays, getDay, getDate, getMonth } from 'date-fns';

/**
 * Calculate the total money added across all top-up transactions
 */
export function calculateTotalMoneyAdded(additions: MoneyAdditionRow[]): number {
  return additions.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
}

/**
 * Calculate the total manual expenses
 */
export function calculateTotalManualExpenses(expenses: ExpenseRow[]): number {
  return expenses.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
}

/**
 * Calculate total completed fixed expense deductions.
 * Skipped and pending occurrences do NOT count as deductions.
 */
export function calculateTotalCompletedFixedExpenses(
  occurrences: FixedExpenseOccurrenceRow[]
): number {
  return occurrences
    .filter((occ) => occ.status === 'completed')
    .reduce((sum, occ) => sum + (Number(occ.amount) || 0), 0);
}

/**
 * Strict Transaction-Based Current Balance Formula:
 * Balance = SUM(money_additions) - (SUM(manual_expenses) + SUM(completed_fixed_occurrences))
 */
export function calculateCurrentBalance(
  additions: MoneyAdditionRow[],
  manualExpenses: ExpenseRow[],
  occurrences: FixedExpenseOccurrenceRow[]
): {
  totalMoneyAdded: number;
  totalManualExpenses: number;
  totalCompletedFixedExpenses: number;
  totalExpenses: number;
  currentBalance: number;
} {
  const totalMoneyAdded = calculateTotalMoneyAdded(additions);
  const totalManualExpenses = calculateTotalManualExpenses(manualExpenses);
  const totalCompletedFixedExpenses = calculateTotalCompletedFixedExpenses(occurrences);
  const totalExpenses = totalManualExpenses + totalCompletedFixedExpenses;
  const currentBalance = totalMoneyAdded - totalExpenses;

  return {
    totalMoneyAdded,
    totalManualExpenses,
    totalCompletedFixedExpenses,
    totalExpenses,
    currentBalance,
  };
}

/**
 * Forecast upcoming fixed expenses for the remainder of the active budget period.
 * Takes into account today's status (completed/skipped vs pending) and future calendar days.
 */
export function calculateUpcomingFixedExpenses(
  fixedRules: FixedExpenseRow[],
  occurrences: FixedExpenseOccurrenceRow[],
  periodType: 'weekly' | 'monthly' | 'custom' = 'monthly',
  currentDate: Date = new Date(),
  cycleStartDay: number = 1,
  customStartDate?: string | null,
  customEndDate?: string | null
): {
  totalUpcoming: number;
  forecastItems: FixedExpenseForecastItem[];
} {
  const todayStr = getTodayDateString(currentDate);
  const { daysRemaining, periodEnd } = getDaysRemainingInPeriod(
    periodType,
    currentDate,
    cycleStartDay,
    customStartDate,
    customEndDate
  );

  const activeRules = fixedRules.filter((rule) => {
    if (!rule.active) return false;
    const ruleStart = rule.start_date;
    if (ruleStart > todayStr && parseISO(ruleStart) > periodEnd) return false;
    if (rule.end_date && rule.end_date < todayStr) return false;
    return true;
  });

  const forecastItems: FixedExpenseForecastItem[] = [];
  let totalUpcoming = 0;

  for (const rule of activeRules) {
    const ruleAmount = Number(rule.amount) || 0;
    let expectedCount = 0;

    // Check today's occurrence status for this rule
    const todayOcc = occurrences.find(
      (o) => o.fixed_expense_id === rule.id && o.occurrence_date === todayStr
    );

    // If today's occurrence is pending (unpaid & unskipped), we include it
    // If it's already completed or skipped today, today's amount is not part of upcoming
    const todayPending = !todayOcc || todayOcc.status === 'pending';

    if (rule.frequency === 'daily') {
      // Future days in period = daysRemaining - 1
      const futureDays = Math.max(0, daysRemaining - 1);
      expectedCount = (todayPending ? 1 : 0) + futureDays;
    } else if (rule.frequency === 'weekly') {
      const ruleStartDate = parseISO(rule.start_date);
      const targetDayOfWeek = getDay(ruleStartDate);

      // Count occurrences from today to periodEnd
      for (let i = 0; i < daysRemaining; i++) {
        const checkDate = addDays(currentDate, i);
        if (getDay(checkDate) === targetDayOfWeek) {
          if (i === 0) {
            if (todayPending) expectedCount++;
          } else {
            expectedCount++;
          }
        }
      }
    } else if (rule.frequency === 'monthly') {
      const ruleStartDate = parseISO(rule.start_date);
      const targetDayOfMonth = getDate(ruleStartDate);

      for (let i = 0; i < daysRemaining; i++) {
        const checkDate = addDays(currentDate, i);
        if (getDate(checkDate) === targetDayOfMonth) {
          if (i === 0) {
            if (todayPending) expectedCount++;
          } else {
            // Check if not already occurred this month
            const occThisMonth = occurrences.find(
              (o) =>
                o.fixed_expense_id === rule.id &&
                getMonth(parseISO(o.occurrence_date)) === getMonth(checkDate) &&
                (o.status === 'completed' || o.status === 'skipped')
            );
            if (!occThisMonth) expectedCount++;
          }
        }
      }
    } else if (rule.frequency === 'yearly') {
      const ruleStartDate = parseISO(rule.start_date);
      const targetMonth = getMonth(ruleStartDate);
      const targetDayOfMonth = getDate(ruleStartDate);

      for (let i = 0; i < daysRemaining; i++) {
        const checkDate = addDays(currentDate, i);
        if (getMonth(checkDate) === targetMonth && getDate(checkDate) === targetDayOfMonth) {
          if (i === 0 ? todayPending : true) {
            expectedCount++;
          }
        }
      }
    }

    const expectedTotalAmount = expectedCount * ruleAmount;
    if (expectedCount > 0) {
      forecastItems.push({
        id: rule.id,
        name: rule.name,
        amount: ruleAmount,
        frequency: rule.frequency,
        expectedOccurrencesCount: expectedCount,
        expectedTotalAmount,
      });
      totalUpcoming += expectedTotalAmount;
    }
  }

  return {
    totalUpcoming,
    forecastItems,
  };
}

/**
 * Calculate Safe to Spend:
 * Safe-to-Spend = Current Balance - Expected Upcoming Fixed Expenses
 */
export function calculateSafeToSpend(
  currentBalance: number,
  upcomingFixedExpenses: number
): number {
  return currentBalance - upcomingFixedExpenses;
}

/**
 * Calculate Recommended Daily Spending:
 * Safe Daily Spending = Safe-to-Spend / Days Remaining
 */
export function calculateSafeDailySpending(
  safeToSpend: number,
  daysRemaining: number
): number {
  if (daysRemaining <= 0) return Math.max(0, safeToSpend);
  const daily = safeToSpend / daysRemaining;
  return Math.max(0, Math.round(daily * 100) / 100);
}

/**
 * Full Financial Summary Evaluator
 */
export function evaluateFinancialSummary(params: {
  additions: MoneyAdditionRow[];
  manualExpenses: ExpenseRow[];
  fixedRules: FixedExpenseRow[];
  occurrences: FixedExpenseOccurrenceRow[];
  periodType?: 'weekly' | 'monthly' | 'custom';
  cycleStartDay?: number;
  customStartDate?: string | null;
  customEndDate?: string | null;
  lowBalanceThreshold?: number;
  currentDate?: Date;
}): FinancialSummary {
  const periodType = params.periodType || 'monthly';
  const cycleStartDay = params.cycleStartDay || 1;
  const customStartDate = params.customStartDate;
  const customEndDate = params.customEndDate;
  const lowBalanceThreshold = params.lowBalanceThreshold ?? 2000;
  const currentDate = params.currentDate || new Date();

  // Active Cycle Isolation:
  // If a month was closed, the latest Rollover Surplus addition marks the start of the active cycle.
  // Previous closed month additions and expenses must NOT be double-counted.
  const rolloverAdditions = params.additions
    .filter((a) => (a.description || '').toLowerCase().includes('rollover surplus'))
    .sort((a, b) => {
      const tb = new Date(b.created_at || b.added_at).getTime();
      const ta = new Date(a.created_at || a.added_at).getTime();
      return tb - ta;
    });

  const latestRollover = rolloverAdditions[0];

  let activeAdditions = params.additions;
  let activeManualExpenses = params.manualExpenses;
  let activeOccurrences = params.occurrences;

  if (latestRollover) {
    const cutoffTime = new Date(latestRollover.created_at || latestRollover.added_at).getTime();
    const cutoffDateStr = (latestRollover.added_at || latestRollover.created_at || '').substring(0, 10);

    // Active additions: The latest rollover itself + any new additions added in this cycle
    activeAdditions = params.additions.filter((a) => {
      const t = new Date(a.created_at || a.added_at).getTime();
      return t >= cutoffTime;
    });

    // Active manual expenses: Only expenses incurred after the rollover
    activeManualExpenses = params.manualExpenses.filter((e) => {
      const t = new Date(e.created_at || e.updated_at || e.expense_date).getTime();
      return t >= cutoffTime || e.expense_date > cutoffDateStr;
    });

    // Active occurrences: Only occurrences processed or created after the rollover cutoff
    activeOccurrences = params.occurrences.filter((o) => {
      const occTime = new Date(o.processed_at || o.created_at || o.occurrence_date).getTime();
      return occTime >= cutoffTime;
    });
  }

  const balanceResults = calculateCurrentBalance(
    activeAdditions,
    activeManualExpenses,
    activeOccurrences
  );

  const {
    daysRemaining,
    periodStartFormatted,
    periodEndFormatted,
    totalCycleDays,
  } = getDaysRemainingInPeriod(
    periodType,
    currentDate,
    cycleStartDay,
    customStartDate,
    customEndDate
  );

  const { totalUpcoming } = calculateUpcomingFixedExpenses(
    params.fixedRules,
    activeOccurrences,
    periodType,
    currentDate,
    cycleStartDay,
    customStartDate,
    customEndDate
  );

  const safeToSpend = calculateSafeToSpend(balanceResults.currentBalance, totalUpcoming);
  const safeDailySpending = calculateSafeDailySpending(safeToSpend, daysRemaining);

  const isLowBalance = balanceResults.currentBalance <= lowBalanceThreshold;
  const isFixedExpenseWarning =
    totalUpcoming > 0 &&
    (totalUpcoming > balanceResults.currentBalance * 0.7 || safeToSpend <= 0);
  const isSafeToSpendNegative = safeToSpend < 0;
  const isFiveDaysRemaining = daysRemaining === 5;

  return {
    totalMoneyAdded: balanceResults.totalMoneyAdded,
    totalManualExpenses: balanceResults.totalManualExpenses,
    totalCompletedFixedExpenses: balanceResults.totalCompletedFixedExpenses,
    totalExpenses: balanceResults.totalExpenses,
    currentBalance: balanceResults.currentBalance,
    upcomingFixedExpenses: totalUpcoming,
    safeToSpend,
    daysRemaining,
    safeDailySpending,
    periodType,
    periodStartFormatted,
    periodEndFormatted,
    totalCycleDays,
    cycleStartDay,
    customStartDate,
    customEndDate,
    lowBalanceThreshold,
    isLowBalance,
    isFixedExpenseWarning,
    isSafeToSpendNegative,
    isFiveDaysRemaining,
  };
}
