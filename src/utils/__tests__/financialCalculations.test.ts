// Unit tests verifying accounting integrity, idempotency, recurring forecasts and warning triggers

import { describe, test, expect } from '@jest/globals';
import {
  calculateCurrentBalance,
  calculateUpcomingFixedExpenses,
  calculateSafeToSpend,
  calculateSafeDailySpending,
  evaluateFinancialSummary,
} from '../financialCalculations';
import {
  MoneyAdditionRow,
  ExpenseRow,
  FixedExpenseRow,
  FixedExpenseOccurrenceRow,
} from '../../types/database';

describe('SmartSpend Financial Accounting Engine', () => {
  const mockUserId = 'user-123';

  // TEST 1: Add ₹10,000 -> Balance = ₹10,000
  test('TEST 1: Add ₹10,000 results in Balance = ₹10,000', () => {
    const additions: MoneyAdditionRow[] = [
      {
        id: '1',
        user_id: mockUserId,
        wallet_id: null,
        amount: 10000,
        description: 'Initial Deposit',
        added_at: '2026-09-30T10:00:00Z',
        created_at: '2026-09-30T10:00:00Z',
      },
    ];
    const expenses: ExpenseRow[] = [];
    const occurrences: FixedExpenseOccurrenceRow[] = [];

    const result = calculateCurrentBalance(additions, expenses, occurrences);
    expect(result.totalMoneyAdded).toBe(10000);
    expect(result.totalExpenses).toBe(0);
    expect(result.currentBalance).toBe(10000);
  });

  // TEST 2: Add manual expense ₹500 -> Balance = ₹9,500
  test('TEST 2: Add manual expense ₹500 results in Balance = ₹9,500', () => {
    const additions: MoneyAdditionRow[] = [
      {
        id: '1',
        user_id: mockUserId,
        wallet_id: null,
        amount: 10000,
        description: 'Initial Deposit',
        added_at: '2026-09-30T10:00:00Z',
        created_at: '2026-09-30T10:00:00Z',
      },
    ];
    const expenses: ExpenseRow[] = [
      {
        id: 'e1',
        user_id: mockUserId,
        amount: 500,
        category_id: null,
        category_name: 'Food',
        description: 'Team Lunch',
        notes: null,
        expense_date: '2026-09-30',
        expense_type: 'manual',
        created_at: '2026-09-30T12:00:00Z',
        updated_at: '2026-09-30T12:00:00Z',
      },
    ];
    const occurrences: FixedExpenseOccurrenceRow[] = [];

    const result = calculateCurrentBalance(additions, expenses, occurrences);
    expect(result.totalMoneyAdded).toBe(10000);
    expect(result.totalManualExpenses).toBe(500);
    expect(result.currentBalance).toBe(9500);
  });

  // TEST 3 & 4: Pay Milk ₹60 -> Balance decreases by ₹60. Skip Bus ₹40 -> 0 deduction.
  test('TEST 3 & 4: Pay Milk ₹60 deducts ₹60, Skip Bus ₹40 does NOT deduct', () => {
    const additions: MoneyAdditionRow[] = [
      {
        id: '1',
        user_id: mockUserId,
        wallet_id: null,
        amount: 10000,
        description: 'Initial Deposit',
        added_at: '2026-09-30T10:00:00Z',
        created_at: '2026-09-30T10:00:00Z',
      },
    ];
    const expenses: ExpenseRow[] = [];
    const occurrences: FixedExpenseOccurrenceRow[] = [
      {
        id: 'occ-milk-1',
        fixed_expense_id: 'rule-milk',
        user_id: mockUserId,
        occurrence_date: '2026-09-30',
        amount: 60,
        status: 'completed', // Paid Milk
        processed_at: '2026-09-30T08:00:00Z',
        created_at: '2026-09-30T00:00:00Z',
      },
      {
        id: 'occ-bus-1',
        fixed_expense_id: 'rule-bus',
        user_id: mockUserId,
        occurrence_date: '2026-09-30',
        amount: 40,
        status: 'skipped', // Skipped Bus
        processed_at: '2026-09-30T08:30:00Z',
        created_at: '2026-09-30T00:00:00Z',
      },
    ];

    const result = calculateCurrentBalance(additions, expenses, occurrences);
    expect(result.totalCompletedFixedExpenses).toBe(60);
    expect(result.totalExpenses).toBe(60);
    expect(result.currentBalance).toBe(9940); // 10000 - 60
  });

  // TEST 5: Idempotent accounting - No duplicate deductions for same completed occurrence
  test('TEST 5: Idempotency ensures no double deductions', () => {
    const additions: MoneyAdditionRow[] = [
      {
        id: '1',
        user_id: mockUserId,
        wallet_id: null,
        amount: 5000,
        description: 'Deposit',
        added_at: '2026-09-30T10:00:00Z',
        created_at: '2026-09-30T10:00:00Z',
      },
    ];
    const occurrences: FixedExpenseOccurrenceRow[] = [
      {
        id: 'occ-1',
        fixed_expense_id: 'rule-milk',
        user_id: mockUserId,
        occurrence_date: '2026-09-30',
        amount: 60,
        status: 'completed',
        processed_at: '2026-09-30T08:00:00Z',
        created_at: '2026-09-30T00:00:00Z',
      },
    ];

    const result1 = calculateCurrentBalance(additions, [], occurrences);
    expect(result1.currentBalance).toBe(4940);

    // If an action triggers again, unique occurrences array maintains exact balance
    const result2 = calculateCurrentBalance(additions, [], occurrences);
    expect(result2.currentBalance).toBe(4940);
  });

  // TEST 6: Section 51 Comprehensive Accounting Workflow Test
  test('TEST 6: Complete section 51 multi-day accounting scenario', () => {
    // 1. User adds ₹5,000
    const additions: MoneyAdditionRow[] = [
      {
        id: 'add-1',
        user_id: mockUserId,
        wallet_id: null,
        amount: 5000,
        description: 'Top-up',
        added_at: '2026-09-29T10:00:00Z',
        created_at: '2026-09-29T10:00:00Z',
      },
    ];

    // 2. Day 1: Milk paid = ₹60, Bus paid = ₹40
    let occurrences: FixedExpenseOccurrenceRow[] = [
      {
        id: 'occ-1',
        fixed_expense_id: 'rule-milk',
        user_id: mockUserId,
        occurrence_date: '2026-09-29',
        amount: 60,
        status: 'completed',
        processed_at: '2026-09-29T08:00:00Z',
        created_at: '2026-09-29T00:00:00Z',
      },
      {
        id: 'occ-2',
        fixed_expense_id: 'rule-bus',
        user_id: mockUserId,
        occurrence_date: '2026-09-29',
        amount: 40,
        status: 'completed',
        processed_at: '2026-09-29T08:30:00Z',
        created_at: '2026-09-29T00:00:00Z',
      },
    ];

    let bal = calculateCurrentBalance(additions, [], occurrences);
    expect(bal.currentBalance).toBe(4900); // 5000 - 100

    // 3. User manually spends Lunch = ₹200
    const expenses: ExpenseRow[] = [
      {
        id: 'exp-1',
        user_id: mockUserId,
        amount: 200,
        category_id: null,
        category_name: 'Food',
        description: 'Lunch',
        notes: null,
        expense_date: '2026-09-29',
        expense_type: 'manual',
        created_at: '2026-09-29T13:00:00Z',
        updated_at: '2026-09-29T13:00:00Z',
      },
    ];

    bal = calculateCurrentBalance(additions, expenses, occurrences);
    expect(bal.currentBalance).toBe(4700); // 4900 - 200

    // 4. Day 2 (Tomorrow): User skips Milk (₹0) and pays Bus (₹40)
    occurrences = [
      ...occurrences,
      {
        id: 'occ-3',
        fixed_expense_id: 'rule-milk',
        user_id: mockUserId,
        occurrence_date: '2026-09-30',
        amount: 60,
        status: 'skipped', // Skipped
        processed_at: '2026-09-30T08:00:00Z',
        created_at: '2026-09-30T00:00:00Z',
      },
      {
        id: 'occ-4',
        fixed_expense_id: 'rule-bus',
        user_id: mockUserId,
        occurrence_date: '2026-09-30',
        amount: 40,
        status: 'completed', // Paid
        processed_at: '2026-09-30T08:30:00Z',
        created_at: '2026-09-30T00:00:00Z',
      },
    ];

    bal = calculateCurrentBalance(additions, expenses, occurrences);
    // Day 2 Balance: 4700 - 40 = 4660
    expect(bal.currentBalance).toBe(4660);
  });

  // TEST 7: Safe-to-Spend & Daily Allowance
  test('TEST 7: Safe to spend and daily allowance calculation', () => {
    const currentBalance = 2000;
    const upcomingFixed = 500;
    const daysRemaining = 5;

    const safeToSpend = calculateSafeToSpend(currentBalance, upcomingFixed);
    expect(safeToSpend).toBe(1500);

    const safeDailySpending = calculateSafeDailySpending(safeToSpend, daysRemaining);
    expect(safeDailySpending).toBe(300);
  });

  // TEST 8: Warnings evaluation
  test('TEST 8: Low Balance and Fixed Expense Warnings Triggering', () => {
    const summary = evaluateFinancialSummary({
      additions: [
        {
          id: '1',
          user_id: mockUserId,
          wallet_id: null,
          amount: 600,
          description: 'Top-up',
          added_at: '2026-09-30T10:00:00Z',
          created_at: '2026-09-30T10:00:00Z',
        },
      ],
      manualExpenses: [],
      fixedRules: [
        {
          id: 'r1',
          user_id: mockUserId,
          name: 'Daily Pass',
          amount: 100,
          category_id: null,
          category_name: 'Transport',
          frequency: 'daily',
          start_date: '2026-09-01',
          end_date: null,
          active: true,
          created_at: '2026-09-01T00:00:00Z',
          updated_at: '2026-09-01T00:00:00Z',
        },
      ],
      occurrences: [],
      periodType: 'monthly',
      lowBalanceThreshold: 2000,
      currentDate: new Date(2026, 8, 26), // 5 days remaining (26, 27, 28, 29, 30 Sep)
    });

    expect(summary.currentBalance).toBe(600);
    expect(summary.upcomingFixedExpenses).toBe(500); // 5 days * 100
    expect(summary.safeToSpend).toBe(100); // 600 - 500
    expect(summary.isLowBalance).toBe(true); // 600 <= 2000
    expect(summary.isFixedExpenseWarning).toBe(true); // 500 > 600 * 0.7 (420)
  });

  // TEST 9: Monthly fixed expense in 32-day custom range must not double (6000 rent -> exactly 6000)
  test('TEST 9: Monthly fixed expense in 32-day custom date range evaluates to single month amount', () => {
    const summary = evaluateFinancialSummary({
      additions: [
        {
          id: '1',
          user_id: mockUserId,
          wallet_id: null,
          amount: 20000,
          description: 'Monthly Salary',
          added_at: '2026-10-02T10:00:00Z',
          created_at: '2026-10-02T10:00:00Z',
        },
      ],
      manualExpenses: [],
      fixedRules: [
        {
          id: 'rule-rent',
          user_id: mockUserId,
          name: 'House Rent',
          amount: 6000,
          category_id: null,
          category_name: 'Rent',
          frequency: 'monthly',
          start_date: '2026-10-02',
          end_date: null,
          active: true,
          created_at: '2026-10-02T00:00:00Z',
          updated_at: '2026-10-02T00:00:00Z',
        },
      ],
      occurrences: [
        {
          id: 'occ-rent-today',
          fixed_expense_id: 'rule-rent',
          user_id: mockUserId,
          occurrence_date: '2026-10-02',
          amount: 6000,
          status: 'pending',
          processed_at: null,
          created_at: '2026-10-02T00:00:00Z',
        },
      ],
      periodType: 'custom',
      customStartDate: '2026-10-02',
      customEndDate: '2026-11-02', // 32 days
      currentDate: new Date(2026, 9, 2), // 2 Oct 2026
    });

    expect(summary.daysRemaining).toBe(32);
    expect(summary.currentBalance).toBe(20000);
    expect(summary.upcomingFixedExpenses).toBe(6000); // Exactly 6,000, NOT 12,000!
    expect(summary.safeToSpend).toBe(14000); // 20000 - 6000
  });

  // TEST 10: Daily fixed expense in 32-day custom range is 32 * amount
  test('TEST 10: Daily fixed expense in 32-day custom range evaluates to 32 * amount', () => {
    const summary = evaluateFinancialSummary({
      additions: [
        {
          id: '1',
          user_id: mockUserId,
          wallet_id: null,
          amount: 1000,
          description: 'Top-up',
          added_at: '2026-10-02T10:00:00Z',
          created_at: '2026-10-02T10:00:00Z',
        },
      ],
      manualExpenses: [],
      fixedRules: [
        {
          id: 'rule-daily-1',
          user_id: mockUserId,
          name: 'Daily 1 Re',
          amount: 1,
          category_id: null,
          category_name: 'Bills',
          frequency: 'daily',
          start_date: '2026-10-02',
          end_date: null,
          active: true,
          created_at: '2026-10-02T00:00:00Z',
          updated_at: '2026-10-02T00:00:00Z',
        },
      ],
      occurrences: [
        {
          id: 'occ-daily-1',
          fixed_expense_id: 'rule-daily-1',
          user_id: mockUserId,
          occurrence_date: '2026-10-02',
          amount: 1,
          status: 'pending',
          processed_at: null,
          created_at: '2026-10-02T00:00:00Z',
        },
      ],
      periodType: 'custom',
      customStartDate: '2026-10-02',
      customEndDate: '2026-11-02', // 32 days
      currentDate: new Date(2026, 9, 2),
    });

    expect(summary.daysRemaining).toBe(32);
    expect(summary.upcomingFixedExpenses).toBe(32); // 32 * 1 = 32
    expect(summary.safeToSpend).toBe(968); // 1000 - 32
  });
});
