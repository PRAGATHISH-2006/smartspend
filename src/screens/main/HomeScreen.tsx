// HomeScreen: Main financial dashboard with dynamic balances, safe-to-spend, recurring widgets and warnings

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  SafeAreaView,
  TouchableOpacity,
  Animated,
  Platform,
} from 'react-native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { ArrowRight, History, FolderArchive, Sparkles, LogIn } from 'lucide-react-native';
import { THEME } from '../../constants/theme';
import { MainTabParamList } from '../../types/navigation';
import { useAuth } from '../../context/AuthContext';
import { useFinancial } from '../../context/FinancialContext';
import { AppHeader } from '../../components/common/AppHeader';
import { LeaderInspirationBanner } from '../../components/dashboard/LeaderInspirationBanner';
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
  const { session, profile, devQuickLogin } = useAuth();
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

  // Animation states for smooth entrance visual effects
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideUpAnim = useRef(new Animated.Value(18)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 650,
        useNativeDriver: Platform.OS !== 'web',
      }),
      Animated.timing(slideUpAnim, {
        toValue: 0,
        duration: 650,
        useNativeDriver: Platform.OS !== 'web',
      }),
    ]).start();
  }, []);

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
        title="வெற்றி நிதி மேலாண்மை"
        subtitle={
          session
            ? `${getGreeting()}, ${firstName}! உங்கள் நிதி மேலோட்டம்`
            : 'நாளைய வெற்றிக்கு இன்றைய நிதி மேலாண்மை • Finance for All'
        }
        showBrandLogo={true}
        showLeaderPhoto={true}
        onNotificationPress={() => setShowNotifications(true)}
        onLoginPress={() => {
          if (!session) {
            (navigation as any).navigate('Login');
          } else {
            navigation.navigate('SettingsTab');
          }
        }}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refreshData}
            tintColor="#DC2626"
            colors={['#DC2626', '#EAB308']}
          />
        }
      >
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideUpAnim }] }}>
          {/* Guest Welcome Banner when not authenticated */}
          {!session && (
            <View style={styles.guestBanner}>
              <View style={styles.guestBannerHeader}>
                <View style={styles.guestIconBadge}>
                  <Sparkles size={16} color="#EAB308" />
                </View>
                <View style={styles.guestHeaderTextCol}>
                  <Text style={styles.guestBannerTitle}>வெற்றி நிதி மேலாண்மைக்கு நல்வரவு</Text>
                  <Text style={styles.guestBannerSubtitle}>
                    Smart, disciplined finance management. Sign in to sync your active records, or test-drive with Fast Demo.
                  </Text>
                </View>
              </View>
              <View style={styles.guestActionRow}>
                <TouchableOpacity
                  style={styles.guestLoginBtn}
                  onPress={() => (navigation as any).navigate('Login')}
                  activeOpacity={0.8}
                >
                  <LogIn size={15} color="#090D16" />
                  <Text style={styles.guestLoginBtnText}>Sign In / Login</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.guestDemoBtn}
                  onPress={async () => {
                    await devQuickLogin();
                  }}
                  activeOpacity={0.8}
                >
                  <Sparkles size={14} color="#FACC15" />
                  <Text style={styles.guestDemoBtnText}>Fast Demo Access</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* PWA Mobile Install Banner */}
          <PWAInstallBanner />

          {/* Leader Inspiration Banner */}
          <LeaderInspirationBanner />

          {/* Quick Month Management Hub: Close Month & Previous Details */}
          <View style={styles.monthHubContainer}>
            <TouchableOpacity
              style={styles.closeMonthHubBtn}
              onPress={() => setShowCloseMonth(true)}
              activeOpacity={0.85}
            >
              <View style={styles.hubBtnIconRed}>
                <Sparkles size={16} color="#FFFFFF" />
              </View>
              <View style={styles.hubBtnTextCol}>
                <Text style={styles.hubBtnTitleRed}>Close Month</Text>
                <Text style={styles.hubBtnSubtitle}>Reset active & rollover</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.previousDetailsHubBtn}
              onPress={() => navigation.navigate('PreviousDetailsTab')}
              activeOpacity={0.85}
            >
              <View style={styles.hubBtnIconYellow}>
                <FolderArchive size={16} color="#090D16" />
              </View>
              <View style={styles.hubBtnTextCol}>
                <Text style={styles.hubBtnTitleYellow}>Previous Details</Text>
                <Text style={styles.hubBtnSubtitle}>Archived statements</Text>
              </View>
            </TouchableOpacity>
          </View>

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
        </Animated.View>
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
  monthHubContainer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: THEME.spacing.lg,
    marginBottom: THEME.spacing.md,
  },
  closeMonthHubBtn: {
    flex: 1,
    backgroundColor: '#111726',
    borderRadius: THEME.borderRadius.lg,
    padding: 12,
    borderWidth: 1.5,
    borderColor: '#DC2626', // Vibrant Red Accent
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 3,
  },
  previousDetailsHubBtn: {
    flex: 1,
    backgroundColor: '#111726',
    borderRadius: THEME.borderRadius.lg,
    padding: 12,
    borderWidth: 1.5,
    borderColor: '#EAB308', // Warm Gold Accent
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    shadowColor: '#EAB308',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 3,
  },
  hubBtnIconRed: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#DC2626',
    alignItems: 'center',
    justifyContent: 'center',
  },
  hubBtnIconYellow: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#EAB308',
    alignItems: 'center',
    justifyContent: 'center',
  },
  hubBtnTextCol: {
    flex: 1,
  },
  hubBtnTitleRed: {
    fontSize: 13,
    fontWeight: THEME.typography.weights.heavy,
    color: '#F87171',
  },
  hubBtnTitleYellow: {
    fontSize: 13,
    fontWeight: THEME.typography.weights.heavy,
    color: '#FACC15',
  },
  hubBtnSubtitle: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 2,
  },
  // Guest Banner Styles
  guestBanner: {
    backgroundColor: '#111726',
    borderRadius: THEME.borderRadius.xl,
    padding: THEME.spacing.md,
    marginHorizontal: THEME.spacing.lg,
    marginBottom: THEME.spacing.md,
    borderWidth: 1.5,
    borderColor: '#EAB308',
    shadowColor: '#EAB308',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  guestBannerHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 12,
  },
  guestIconBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(234, 179, 8, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(234, 179, 8, 0.35)',
  },
  guestHeaderTextCol: {
    flex: 1,
  },
  guestBannerTitle: {
    color: '#FACC15',
    fontSize: 14,
    fontWeight: THEME.typography.weights.heavy,
  },
  guestBannerSubtitle: {
    color: '#CBD5E1',
    fontSize: 11,
    lineHeight: 16,
    marginTop: 2,
  },
  guestActionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  guestLoginBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#EAB308', // Warm Gold
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: THEME.borderRadius.lg,
    shadowColor: '#EAB308',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  guestLoginBtnText: {
    color: '#090D16',
    fontSize: 12,
    fontWeight: THEME.typography.weights.heavy,
  },
  guestDemoBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: 'rgba(220, 38, 38, 0.15)',
    borderWidth: 1.5,
    borderColor: '#DC2626',
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: THEME.borderRadius.lg,
  },
  guestDemoBtnText: {
    color: '#F87171',
    fontSize: 12,
    fontWeight: THEME.typography.weights.bold,
  },
});
