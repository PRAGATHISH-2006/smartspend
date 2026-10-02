// Pure financial computation functions for SmartSpend

import {
  MoneyAdditionRow,
  ExpenseRow,
  FixedExpenseRow,
  FixedExpenseOccurrenceRow,
} from '../types/database';
import { FinancialSummary, FixedExpenseForecastItem } from '../types/financial';
import { getDaysRemainingInPeriod, getTodayDateString } from './dateUtils';
import { differenceInCalendarDays, parseISO, addDays, addMonths, getDay, getDate, getMonth } from 'date-fns';

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
  const { daysRemaining, periodEnd, totalCycleDays } = getDaysRemainingInPeriod(
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

      // Count calendar occurrences from today to periodEnd
      let rawCalendarCount = 0;
      for (let i = 0; i < daysRemaining; i++) {
        const checkDate = addDays(currentDate, i);
        if (getDay(checkDate) === targetDayOfWeek) {
          if (i === 0) {
            if (todayPending) rawCalendarCount++;
          } else {
            rawCalendarCount++;
          }
        }
      }

      // In a 1-month budget cycle (periodType === 'monthly', or custom range <= 35 days like 28-32 days):
      // Monthly budget allocates exactly 4 weeks per month.
      if (periodType === 'monthly' || (periodType === 'custom' && totalCycleDays <= 35)) {
        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth();

        const resolvedCountThisMonth = occurrences.filter((o) => {
          if (o.fixed_expense_id !== rule.id) return false;
          if (o.status !== 'completed' && o.status !== 'skipped') return false;
          const occDate = parseISO(o.occurrence_date);
          return occDate.getFullYear() === currentYear && occDate.getMonth() === currentMonth;
        }).length;

        const maxRemainingForMonth = Math.max(0, 4 - resolvedCountThisMonth);
        expectedCount = Math.min(rawCalendarCount, maxRemainingForMonth);
      } else if (periodType === 'custom' && totalCycleDays > 35) {
        // Multi-month custom period: 4 weeks per 30 days
        const monthCycles = Math.max(1, Math.round(totalCycleDays / 30.4375));
        const totalBudgetedWeeks = monthCycles * 4;
        const totalResolvedCount = occurrences.filter((o) => {
          return (
            o.fixed_expense_id === rule.id &&
            (o.status === 'completed' || o.status === 'skipped')
          );
        }).length;
        const maxRemaining = Math.max(0, totalBudgetedWeeks - totalResolvedCount);
        expectedCount = Math.min(rawCalendarCount, maxRemaining);
      } else {
        // Weekly period (7 days)
        expectedCount = rawCalendarCount;
      }
    } else if (rule.frequency === 'monthly') {
      const ruleStartDate = parseISO(rule.start_date);
      const ruleEndDate = rule.end_date ? parseISO(rule.end_date) : null;
      const targetDayOfMonth = getDate(ruleStartDate);

      const currentYear = currentDate.getFullYear();
      const currentMonth = currentDate.getMonth();

      // Check if this rule has already been paid or skipped in the active cycle for current calendar month
      const hasResolvedThisMonth = occurrences.some((o) => {
        if (o.fixed_expense_id !== rule.id) return false;
        if (o.status !== 'completed' && o.status !== 'skipped') return false;
        const occDate = parseISO(o.occurrence_date);
        return occDate.getFullYear() === currentYear && occDate.getMonth() === currentMonth;
      });

      // Is the monthly expense active and eligible in the current month / period?
      const isEligibleThisMonth =
        ruleStartDate <= periodEnd &&
        (!ruleEndDate || ruleEndDate >= currentDate);

      let currentMonthCount = 0;
      if (isEligibleThisMonth) {
        currentMonthCount = hasResolvedThisMonth ? 0 : 1;
      }

      // If period is monthly, weekly, or a standard 1-month custom cycle (<= 35 days),
      // there is exactly 1 monthly cycle (max 1 occurrence)
      if (periodType === 'monthly' || periodType === 'weekly' || totalCycleDays <= 35) {
        expectedCount = currentMonthCount;
      } else {
        // Multi-month custom period (> 35 days): evaluate current month + future distinct months
        expectedCount = currentMonthCount;
        let nextCheck = addMonths(currentDate, 1);
        while (nextCheck <= periodEnd) {
          const nextYear = nextCheck.getFullYear();
          const nextMonth = nextCheck.getMonth();
          const dueDateInNextMonth = new Date(nextYear, nextMonth, targetDayOfMonth);

          const isNextEligible =
            dueDateInNextMonth >= ruleStartDate &&
            (!ruleEndDate || dueDateInNextMonth <= ruleEndDate) &&
            dueDateInNextMonth <= periodEnd;

          if (isNextEligible) {
            const hasResolvedNext = occurrences.some((o) => {
              if (o.fixed_expense_id !== rule.id) return false;
              if (o.status !== 'completed' && o.status !== 'skipped') return false;
              const occDate = parseISO(o.occurrence_date);
              return occDate.getFullYear() === nextYear && occDate.getMonth() === nextMonth;
            });
            if (!hasResolvedNext) {
              expectedCount++;
            }
          }
          nextCheck = addMonths(nextCheck, 1);
        }
      }
    } else if (rule.frequency === 'yearly') {
      const ruleStartDate = parseISO(rule.start_date);
      const targetMonth = getMonth(ruleStartDate);
      const targetDayOfMonth = getDate(ruleStartDate);

      for (let i = 0; i < daysRemaining; i++) {
        const checkDate = addDays(currentDate, i);
        if (getMonth(checkDate) === targetMonth && getDate(checkDate) === targetDayOfMonth) {
          if (i === 0) {
            if (todayPending) expectedCount++;
          } else {
            const occThisYear = occurrences.some(
              (o) =>
                o.fixed_expense_id === rule.id &&
                parseISO(o.occurrence_date).getFullYear() === checkDate.getFullYear() &&
                (o.status === 'completed' || o.status === 'skipped')
            );
            if (!occThisYear) expectedCount++;
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
