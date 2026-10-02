// HomeScreen: Main financial dashboard with dynamic balances, safe-to-spend, recurring widgets and warnings

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { ArrowRight, History } from 'lucide-react-native';
import { THEME } from '../../constants/theme';
import { MainTabParamList } from '../../types/navigation';
import { useAuth } from '../../context/AuthContext';
import { useFinancial } from '../../context/FinancialContext';
import { AppHeader } from '../../components/common/AppHeader';
import { BalanceCard } from '../../components/dashboard/BalanceCard';
import { SafeToSpendCard } from '../../components/dashboard/SafeToSpendCard';
import { WarningBanner } from '../../components/dashboard/WarningBanner';
import { CycleActionCard } from '../../components/dashboard/CycleActionCard';
import { ExtendCycleModal } from '../../components/dashboard/ExtendCycleModal';
import { CloseMonthModal } from '../../components/dashboard/CloseMonthModal';
import { TodayFixedWidget } from '../../components/dashboard/TodayFixedWidget';
import { QuickActionGrid } from '../../components/dashboard/QuickActionGrid';
import { ExpenseCard } from '../../components/expenses/ExpenseCard';
import { AddExpenseModal } from '../../components/expenses/AddExpenseModal';
import { AddMoneyModal } from '../../components/expenses/AddMoneyModal';
import { AddEditFixedExpenseModal } from '../../components/fixed/AddEditFixedExpenseModal';
import { EditTodayAmountModal } from '../../components/fixed/EditTodayAmountModal';
import { NotificationsModal } from '../modals/NotificationsModal';
import { LoadingState } from '../../components/common/LoadingState';
import { PWAInstallBanner } from '../../components/common/PWAInstallBanner';
import { TodayFixedExpenseItem } from '../../types/financial';

type Props = BottomTabScreenProps<MainTabParamList, 'HomeTab'>;

export const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const { profile } = useAuth();
  const {
    loading,
    refreshing,
    refreshData,
    summary,
    todayFixedExpenses,
    unifiedTransactions,
    categories,
    addMoney,
    addExpense,
    addFixedExpense,
    payFixedExpense,
    skipFixedExpense,
    addCustomCategory,
    extendBudgetPeriod,
    closeCurrentMonth,
  } = useFinancial();

  // Modals state
  const [showAddMoney, setShowAddMoney] = useState<boolean>(false);
  const [showAddExpense, setShowAddExpense] = useState<boolean>(false);
  const [showAddFixed, setShowAddFixed] = useState<boolean>(false);
  const [showExtendCycle, setShowExtendCycle] = useState<boolean>(false);
  const [showCloseMonth, setShowCloseMonth] = useState<boolean>(false);
  const [showNotifications, setShowNotifications] = useState<boolean>(false);
  const [editingOccurrence, setEditingOccurrence] = useState<TodayFixedExpenseItem | null>(null);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  if (loading && !refreshing) {
    return <LoadingState fullScreen message="Loading your dashboard..." />;
  }

  const firstName = profile?.name?.split(' ')[0] || 'there';
  const recentTransactions = unifiedTransactions.slice(0, 5);

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppHeader
        title={`${getGreeting()}, ${firstName} 👋`}
        subtitle="Here is your spending overview"
        onNotificationPress={() => setShowNotifications(true)}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refreshData}
            tintColor={THEME.colors.primary}
            colors={[THEME.colors.primary]}
          />
        }
      >
        {/* PWA Mobile Install Banner */}
        <PWAInstallBanner />

        {/* 1. Hero Balance Card */}
        <BalanceCard
          currentBalance={summary.currentBalance}
          totalMoneyAdded={summary.totalMoneyAdded}
          totalSpent={summary.totalExpenses}
          onAddMoneyPress={() => setShowAddMoney(true)}
        />

        {/* 2. Safe-to-Spend Card */}
        <SafeToSpendCard
          safeToSpend={summary.safeToSpend}
          upcomingFixedExpenses={summary.upcomingFixedExpenses}
          daysRemaining={summary.daysRemaining}
          safeDailySpending={summary.safeDailySpending}
          periodType={summary.periodType}
        />

        {/* 3. Actionable Warning Banners */}
        <WarningBanner
          isLowBalance={summary.isLowBalance}
          isFixedExpenseWarning={summary.isFixedExpenseWarning}
          isSafeToSpendNegative={summary.isSafeToSpendNegative}
          isFiveDaysRemaining={summary.isFiveDaysRemaining}
          currentBalance={summary.currentBalance}
          upcomingFixedExpenses={summary.upcomingFixedExpenses}
          safeToSpend={summary.safeToSpend}
          daysRemaining={summary.daysRemaining}
          lowBalanceThreshold={summary.lowBalanceThreshold}
        />

        {/* 4. Month-End Review, Cycle Extension & Rollover Management Widget */}
        <CycleActionCard
          daysRemaining={summary.daysRemaining}
          periodStartFormatted={summary.periodStartFormatted}
          periodEndFormatted={summary.periodEndFormatted}
          currentBalance={summary.currentBalance}
          onExtendPress={() => setShowExtendCycle(true)}
          onCloseMonthPress={() => setShowCloseMonth(true)}
        />

        {/* 5. Quick Action Grid */}
        <QuickActionGrid
          onAddExpensePress={() => setShowAddExpense(true)}
          onAddMoneyPress={() => setShowAddMoney(true)}
          onAddFixedPress={() => setShowAddFixed(true)}
          onReportsPress={() => navigation.navigate('ReportsTab')}
        />

        {/* 5. Today's Fixed Expenses Widget with Pay/Edit/Skip */}
        <TodayFixedWidget
          items={todayFixedExpenses}
          onPay={payFixedExpense}
          onEdit={(item) => setEditingOccurrence(item)}
          onSkip={skipFixedExpense}
          onViewAllPress={() => navigation.navigate('FixedTab')}
        />

        {/* 6. Recent Transactions Feed */}
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <History size={18} color={THEME.colors.textPrimary} />
            <Text style={styles.sectionTitle}>Recent Transactions</Text>
          </View>
          <TouchableOpacity
            style={styles.viewAllBtn}
            onPress={() => navigation.navigate('ExpensesTab')}
            activeOpacity={0.7}
          >
            <Text style={styles.viewAllText}>View All</Text>
            <ArrowRight size={14} color={THEME.colors.primary} />
          </TouchableOpacity>
        </View>

        <View style={styles.transactionsList}>
          {recentTransactions.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>No recent transactions yet.</Text>
            </View>
          ) : (
            recentTransactions.map((tx) => (
              <ExpenseCard key={tx.id} transaction={tx} />
            ))
          )}
        </View>
      </ScrollView>

      {/* Add Expense Modal */}
      <AddExpenseModal
        visible={showAddExpense}
        categories={categories}
        onClose={() => setShowAddExpense(false)}
        onSubmit={addExpense}
        onAddCustomCategory={addCustomCategory}
      />

      {/* Add Money Modal */}
      <AddMoneyModal
        visible={showAddMoney}
        onClose={() => setShowAddMoney(false)}
        onSubmit={addMoney}
      />

      {/* Add Fixed Expense Modal */}
      <AddEditFixedExpenseModal
        visible={showAddFixed}
        categories={categories}
        onClose={() => setShowAddFixed(false)}
        onSubmit={addFixedExpense}
        onAddCustomCategory={addCustomCategory}
      />

      {/* Edit Today Amount Modal */}
      <EditTodayAmountModal
        visible={!!editingOccurrence}
        item={editingOccurrence}
        onClose={() => setEditingOccurrence(null)}
        onConfirmPay={async (id, amt) => {
          await payFixedExpense(id, amt);
        }}
      />

      {/* Extend Cycle Modal */}
      <ExtendCycleModal
        visible={showExtendCycle}
        currentEndDate={summary.periodEndFormatted}
        onClose={() => setShowExtendCycle(false)}
        onExtend={async (days, customDate) => {
          return await extendBudgetPeriod(days, customDate);
        }}
      />

      {/* Close Month Modal */}
      <CloseMonthModal
        visible={showCloseMonth}
        periodStartFormatted={summary.periodStartFormatted}
        periodEndFormatted={summary.periodEndFormatted}
        totalMoneyAdded={summary.totalMoneyAdded}
        totalExpenses={summary.totalExpenses}
        currentBalance={summary.currentBalance}
        todayFixedExpenses={todayFixedExpenses}
        onPayFixedExpense={payFixedExpense}
        onSkipFixedExpense={skipFixedExpense}
        onClose={() => setShowCloseMonth(false)}
        onConfirmClose={async () => {
          return await closeCurrentMonth();
        }}
      />

      {/* Notifications Drawer */}
      <NotificationsModal
        visible={showNotifications}
        onClose={() => setShowNotifications(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  scrollContent: {
    paddingBottom: THEME.spacing.huge,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: THEME.spacing.lg,
    marginTop: THEME.spacing.sm,
    marginBottom: THEME.spacing.sm,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: THEME.typography.sizes.md,
    fontWeight: THEME.typography.weights.bold,
    color: THEME.colors.textPrimary,
  },
  viewAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewAllText: {
    fontSize: THEME.typography.sizes.xs,
    fontWeight: THEME.typography.weights.semibold,
    color: THEME.colors.primary,
  },
  transactionsList: {
    paddingHorizontal: THEME.spacing.lg,
  },
  emptyCard: {
    backgroundColor: THEME.colors.surface,
    padding: THEME.spacing.lg,
    borderRadius: THEME.borderRadius.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  emptyText: {
    fontSize: THEME.typography.sizes.sm,
    color: THEME.colors.textMuted,
    fontStyle: 'italic',
  },
});
