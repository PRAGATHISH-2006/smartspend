// Date math and budget period utilities

import {
  endOfMonth,
  endOfWeek,
  differenceInCalendarDays,
  format,
  parseISO,
  isToday,
  isTomorrow,
  isYesterday,
  startOfMonth,
  startOfWeek,
  subDays,
  addDays,
  addMonths,
  subMonths,
  getDate,
} from 'date-fns';

/**
 * Get current date formatted as YYYY-MM-DD
 */
export function getTodayDateString(date: Date = new Date()): string {
  return format(date, 'yyyy-MM-dd');
}

/**
 * Calculate remaining days in the user's budget period:
 * - Weekly: Monday to Sunday
 * - Monthly (Default or Salary Cycle): e.g. 1st to 30th/31st or 5th to 4th of next month
 * - Custom: User-defined Start Date and End Date
 */
export function getDaysRemainingInPeriod(
  periodType: 'weekly' | 'monthly' | 'custom' = 'monthly',
  currentDate: Date = new Date(),
  cycleStartDay: number = 1,
  customStartDate?: string | null,
  customEndDate?: string | null
): {
  daysRemaining: number;
  periodStart: Date;
  periodEnd: Date;
  periodStartFormatted: string;
  periodEndFormatted: string;
  totalCycleDays: number;
} {
  let periodStart: Date;
  let periodEnd: Date;

  if (periodType === 'weekly') {
    periodStart = startOfWeek(currentDate, { weekStartsOn: 1 }); // Monday
    periodEnd = endOfWeek(currentDate, { weekStartsOn: 1 }); // Sunday
  } else if (periodType === 'custom' && customStartDate && customEndDate) {
    try {
      periodStart = parseISO(customStartDate);
      periodEnd = parseISO(customEndDate);
      if (periodEnd < periodStart) {
        periodEnd = addDays(periodStart, 30);
      }
    } catch {
      periodStart = startOfMonth(currentDate);
      periodEnd = endOfMonth(currentDate);
    }
  } else {
    // Monthly Cycle (Default 1st of month, or custom salary start day 1-28)
    const currentDay = getDate(currentDate);
    const validStartDay = Math.max(1, Math.min(28, Number(cycleStartDay) || 1));

    if (validStartDay === 1) {
      periodStart = startOfMonth(currentDate);
      periodEnd = endOfMonth(currentDate);
    } else {
      if (currentDay >= validStartDay) {
        // Current cycle started this month on validStartDay
        periodStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), validStartDay);
        const nextMonth = addMonths(periodStart, 1);
        periodEnd = subDays(new Date(nextMonth.getFullYear(), nextMonth.getMonth(), validStartDay), 1);
      } else {
        // Current cycle started last month on validStartDay
        const prevMonth = subMonths(currentDate, 1);
        periodStart = new Date(prevMonth.getFullYear(), prevMonth.getMonth(), validStartDay);
        periodEnd = subDays(new Date(currentDate.getFullYear(), currentDate.getMonth(), validStartDay), 1);
      }
    }
  }

  // Inclusive days remaining (today through periodEnd)
  const diffDays = differenceInCalendarDays(periodEnd, currentDate) + 1;
  const daysRemaining = Math.max(1, diffDays);
  const totalCycleDays = Math.max(1, differenceInCalendarDays(periodEnd, periodStart) + 1);

  return {
    daysRemaining,
    periodStart,
    periodEnd,
    periodStartFormatted: format(periodStart, 'd MMM yyyy'),
    periodEndFormatted: format(periodEnd, 'd MMM yyyy'),
    totalCycleDays,
  };
}

/**
 * Friendly relative date label (Today, Tomorrow, Yesterday, or "30 Sep")
 */
export function formatFriendlyDate(dateStr: string | Date): string {
  try {
    const d = typeof dateStr === 'string' ? parseISO(dateStr) : dateStr;
    if (isToday(d)) return 'Today';
    if (isTomorrow(d)) return 'Tomorrow';
    if (isYesterday(d)) return 'Yesterday';
    return format(d, 'd MMM');
  } catch {
    return String(dateStr);
  }
}

/**
 * Full friendly date with year (e.g. 30 Sep 2026)
 */
export function formatFullDate(dateStr: string | Date): string {
  try {
    const d = typeof dateStr === 'string' ? parseISO(dateStr) : dateStr;
    return format(d, 'd MMM yyyy');
  } catch {
    return String(dateStr);
  }
}

/**
 * Get date range for the last 7 days (for weekly reports)
 */
export function getLastWeekRange(refDate: Date = new Date()): {
  weekStart: string;
  weekEnd: string;
  formattedRange: string;
} {
  const weekEnd = refDate;
  const weekStart = subDays(weekEnd, 6);

  return {
    weekStart: format(weekStart, 'yyyy-MM-dd'),
    weekEnd: format(weekEnd, 'yyyy-MM-dd'),
    formattedRange: `${format(weekStart, 'd MMM')} - ${format(weekEnd, 'd MMM yyyy')}`,
  };
}

/**
 * Get date range for the current month to date (for monthly reports)
 */
export function getCurrentMonthRange(refDate: Date = new Date()): {
  monthStart: string;
  monthEnd: string;
  formattedRange: string;
} {
  const start = startOfMonth(refDate);
  const end = endOfMonth(refDate);

  return {
    monthStart: format(start, 'yyyy-MM-dd'),
    monthEnd: format(end, 'yyyy-MM-dd'),
    formattedRange: `${format(start, 'd MMM')} - ${format(end, 'd MMM yyyy')}`,
  };
}
