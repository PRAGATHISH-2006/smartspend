// ReportsScreen: Complete Redesign — High-End Financial Analytics Dashboard with Yellow and Red Theme

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import {
  BarChart3,
  Calendar,
  Sparkles,
  Mail,
  Send,
  Eye,
  FileSpreadsheet,
  Layers,
  ArrowRight,
  TrendingUp,
  Receipt,
  FolderArchive,
} from 'lucide-react-native';
import { THEME } from '../../constants/theme';
import { MainTabParamList } from '../../types/navigation';
import { useAuth } from '../../context/AuthContext';
import { useFinancial } from '../../context/FinancialContext';
import { AppHeader } from '../../components/common/AppHeader';
import {
  AnalyticsHeader,
  MonthOption,
} from '../../components/analytics/AnalyticsHeader';
import { AnalyticsSummaryCards } from '../../components/analytics/AnalyticsSummaryCards';
import {
  DailyCashFlowLineChart,
  DayCashFlowPoint,
} from '../../components/analytics/DailyCashFlowLineChart';
import { CategoryDonutChart } from '../../components/analytics/CategoryDonutChart';
import {
  HistoricalComparisonBarChart,
  MonthComparisonItem,
} from '../../components/analytics/HistoricalComparisonBarChart';
import { ExpenseCard } from '../../components/expenses/ExpenseCard';
import { NotificationsModal } from '../modals/NotificationsModal';
import { ClosedMonthDetailsModal } from '../../components/reports/ClosedMonthDetailsModal';
import {
  triggerMonthlyReportEmail,
  compileUserReport,
} from '../../services/emailReportService';
import { format, subDays, startOfMonth, endOfMonth, parseISO } from 'date-fns';
import { formatINR } from '../../utils/currency';
import { CategorySpending, UnifiedTransaction, ClosedMonthRecord } from '../../types/financial';

type Props = BottomTabScreenProps<MainTabParamList, 'ReportsTab'>;

export const ReportsScreen: React.FC<Props> = ({ navigation }) => {
  const { user, profile } = useAuth();
  const {
    refreshing,
    refreshData,
    summary,
    moneyAdditions,
    manualExpenses,
    occurrences,
    categoryBreakdown,
    closedMonths,
    unifiedTransactions,
  } = useFinancial();

  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;

  // Selected Month: 'current' or closedMonth.id
  const [selectedMonthId, setSelectedMonthId] = useState<string>('current');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [timelineFilter, setTimelineFilter] = useState<'all' | '7d' | '14d'>('all');

  const [showNotifications, setShowNotifications] = useState<boolean>(false);
  const [selectedArchiveForModal, setSelectedArchiveForModal] = useState<ClosedMonthRecord | null>(null);
  const [emailSending, setEmailSending] = useState<boolean>(false);
  const [emailStatusMsg, setEmailStatusMsg] = useState<string | null>(null);

  const registeredEmail = (user?.email || profile?.email || '').trim();

  // 1. Month Options for dropdown
  const monthOptions: MonthOption[] = useMemo(() => {
    const activeMonthName = format(new Date(), 'MMMM yyyy');
    const options: MonthOption[] = [
      {
        id: 'current',
        label: `${activeMonthName} (Active Cycle)`,
        isArchived: false,
        periodText: 'Live real-time financial tracking',
      },
    ];

    closedMonths.forEach((m) => {
      options.push({
        id: m.id,
        label: m.monthName,
        isArchived: true,
        periodText: `${m.periodStart} to ${m.periodEnd}`,
      });
    });

    return options;
  }, [closedMonths]);

  // 2. Active Month Data Resolver (resolves either Current Live Cycle or Archived Month)
  const isCurrentMonth = selectedMonthId === 'current';
  const selectedArchive = useMemo(() => {
    return closedMonths.find((m) => m.id === selectedMonthId) || null;
  }, [closedMonths, selectedMonthId]);

  const monthLabel = isCurrentMonth
    ? format(new Date(), 'MMMM yyyy')
    : selectedArchive?.monthName || 'Selected Month';

  // Metrics for Top Cards
  const totalIncome = isCurrentMonth
    ? summary.totalMoneyAdded
    : selectedArchive?.totalMoneyAdded || 0;

  const totalExpenses = isCurrentMonth
    ? summary.totalExpenses
    : selectedArchive?.totalWithdrawn || 0;

  const netSavings = isCurrentMonth
    ? summary.currentBalance
    : selectedArchive?.closingBalance || 0;

  const activeDaysCount = useMemo(() => {
    if (isCurrentMonth) {
      return Math.max(1, new Date().getDate());
    }
    return 30; // standard month cycle
  }, [isCurrentMonth]);

  const dailyAverageSpend = activeDaysCount > 0 ? totalExpenses / activeDaysCount : 0;

  const inflowCount = isCurrentMonth
    ? moneyAdditions.length
    : selectedArchive?.transactions?.filter((t) => t.rawType === 'income').length || 0;

  const outflowCount = isCurrentMonth
    ? manualExpenses.length + occurrences.filter((o) => o.status === 'completed').length
    : selectedArchive?.transactions?.filter((t) => t.rawType === 'expense' || t.rawType === 'skipped').length || 0;

  // 3. Transactions of the selected month
  const monthTransactions: UnifiedTransaction[] = useMemo(() => {
    if (isCurrentMonth) {
      return unifiedTransactions;
    }
    return selectedArchive?.transactions || [];
  }, [isCurrentMonth, unifiedTransactions, selectedArchive]);

  // Available unique categories in this month
  const availableCategories = useMemo(() => {
    return Array.from(
      new Set(monthTransactions.map((tx) => tx.category).filter(Boolean))
    );
  }, [monthTransactions]);

  // Filtered transactions by category
  const filteredTransactions = useMemo(() => {
    if (!selectedCategory) return monthTransactions;
    return monthTransactions.filter((tx) => tx.category === selectedCategory);
  }, [monthTransactions, selectedCategory]);

  // 4. Daily Cash Flow Data Generation
  const cashFlowTrendData: DayCashFlowPoint[] = useMemo(() => {
    const today = new Date();
    const daysInMonth = isCurrentMonth
      ? today.getDate()
      : 30;

    const points: DayCashFlowPoint[] = [];

    // Base date
    const monthStart = isCurrentMonth
      ? startOfMonth(today)
      : selectedArchive
      ? parseISO(selectedArchive.periodStart)
      : startOfMonth(today);

    for (let day = 1; day <= daysInMonth; day++) {
      const d = new Date(monthStart.getFullYear(), monthStart.getMonth(), day);
      const dStr = format(d, 'yyyy-MM-dd');
      const dayLabel = format(d, 'd MMM');

      let dayIncome = 0;
      let dayExpense = 0;

      if (isCurrentMonth) {
        dayIncome = moneyAdditions
          .filter((a) => a.added_at.startsWith(dStr))
          .reduce((sum, a) => sum + Number(a.amount), 0);

        const manualDay = manualExpenses
          .filter((e) => e.expense_date === dStr)
          .reduce((sum, e) => sum + Number(e.amount), 0);

        const fixedDay = occurrences
          .filter((o) => o.occurrence_date === dStr && o.status === 'completed')
          .reduce((sum, o) => sum + Number(o.amount), 0);

        dayExpense = manualDay + fixedDay;
      } else if (selectedArchive?.transactions) {
        dayIncome = selectedArchive.transactions
          .filter((t) => t.date.startsWith(dStr) && t.rawType === 'income')
          .reduce((sum, t) => sum + Number(t.amount), 0);

        dayExpense = selectedArchive.transactions
          .filter(
            (t) =>
              t.date.startsWith(dStr) &&
              (t.rawType === 'expense' || t.rawType === 'skipped')
          )
          .reduce((sum, t) => sum + Number(t.amount), 0);
      }

      // If category filter is applied, only consider transactions in that category for expenses
      if (selectedCategory) {
        if (isCurrentMonth) {
          const manualCat = manualExpenses
            .filter((e) => e.expense_date === dStr && e.category_name === selectedCategory)
            .reduce((sum, e) => sum + Number(e.amount), 0);

          const fixedCat = occurrences
            .filter((o) => o.occurrence_date === dStr && o.status === 'completed' && (o as any).category === selectedCategory)
            .reduce((sum, o) => sum + Number(o.amount), 0);

          dayExpense = manualCat + fixedCat;
        } else if (selectedArchive?.transactions) {
          dayExpense = selectedArchive.transactions
            .filter((t) => t.date.startsWith(dStr) && t.category === selectedCategory && (t.rawType === 'expense' || t.rawType === 'skipped'))
            .reduce((sum, t) => sum + Number(t.amount), 0);
        }
      }

      points.push({
        day,
        dateStr: dStr,
        dayLabel,
        income: dayIncome,
        expense: dayExpense,
      });
    }

    // Apply Timeline Filter
    if (timelineFilter === '7d') {
      return points.slice(-7);
    } else if (timelineFilter === '14d') {
      return points.slice(-14);
    }
    return points;
  }, [
    isCurrentMonth,
    selectedArchive,
    moneyAdditions,
    manualExpenses,
    occurrences,
    selectedCategory,
    timelineFilter,
  ]);

  // 5. Category Spending Breakdown for Donut Chart
  const activeCategoryBreakdown: CategorySpending[] = useMemo(() => {
    if (isCurrentMonth) {
      return categoryBreakdown;
    }
    if (selectedArchive?.categoryBreakdown && selectedArchive.categoryBreakdown.length > 0) {
      return selectedArchive.categoryBreakdown;
    }

    // Derive breakdown from archived transactions if needed
    const catMap: Record<string, number> = {};
    const txs = selectedArchive?.transactions || [];
    let total = 0;

    txs.forEach((t) => {
      if (t.rawType === 'expense' || t.rawType === 'skipped') {
        const cat = t.category || 'Other';
        catMap[cat] = (catMap[cat] || 0) + Number(t.amount);
        total += Number(t.amount);
      }
    });

    return Object.entries(catMap).map(([name, amount]) => ({
      name,
      amount,
      percentage: total > 0 ? Math.round((amount / total) * 100) : 0,
      color: '',
      icon: '',
    }));
  }, [isCurrentMonth, categoryBreakdown, selectedArchive]);

  // 6. Historical Multi-Month Comparison Bar Chart Data
  const historicalBarData: MonthComparisonItem[] = useMemo(() => {
    const list: MonthComparisonItem[] = [];

    // Chronological archived months (up to last 5)
    const sortedArchives = [...closedMonths].reverse().slice(-5);
    sortedArchives.forEach((m) => {
      const parts = m.monthName.split(' ');
      list.push({
        id: m.id,
        monthName: m.monthName,
        shortName: parts[0] ? parts[0].substring(0, 3) : m.monthName,
        totalIncome: m.totalMoneyAdded,
        totalExpense: m.totalWithdrawn,
        netSurplus: m.closingBalance,
        isCurrent: false,
      });
    });

    // Append Current active cycle
    const currentName = format(new Date(), 'MMM yyyy');
    list.push({
      id: 'current',
      monthName: `${currentName} (Active)`,
      shortName: `${format(new Date(), 'MMM')}*`,
      totalIncome: summary.totalMoneyAdded,
      totalExpense: summary.totalExpenses,
      netSurplus: summary.currentBalance,
      isCurrent: true,
    });

    return list;
  }, [closedMonths, summary]);

  // 7. Email Report Dispatcher Handler
  const handleDispatchEmail = async () => {
    if (!registeredEmail) {
      Alert.alert('Email Missing', 'Please update your email in Settings to dispatch reports.');
      return;
    }

    setEmailSending(true);
    setEmailStatusMsg(null);

    try {
      const res = await triggerMonthlyReportEmail();
      if (res.success) {
        setEmailStatusMsg(`Monthly statement sent successfully to ${registeredEmail}`);
      } else {
        setEmailStatusMsg(res.error || 'Failed to dispatch email statement.');
      }
    } catch (err: any) {
      setEmailStatusMsg(err.message || 'Error dispatching email.');
    } finally {
      setEmailSending(false);
    }
  };

  const handlePreviewReport = async () => {
    if (!user?.id) return;
    try {
      const compiled = await compileUserReport({
        userId: user.id,
        startDate: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
        endDate: format(endOfMonth(new Date()), 'yyyy-MM-dd'),
        reportType: 'monthly',
      });

      if (!compiled?.htmlContent) return;

      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        const blob = new Blob([compiled.htmlContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
      } else {
        Alert.alert('Report Preview', 'Full visual report prepared.');
      }
    } catch (err: any) {
      Alert.alert('Preview Error', err.message || 'Failed to generate preview.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppHeader
        title="Reports & Analytics"
        subtitle={`நிதியியல் அறிக்கைகள் • ${monthLabel}`}
        onNotificationPress={() => setShowNotifications(true)}
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
        {/* 1. Month Selector & Filters Header */}
        <AnalyticsHeader
          selectedMonthId={selectedMonthId}
          onSelectMonthId={setSelectedMonthId}
          monthOptions={monthOptions}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          availableCategories={availableCategories}
          timelineFilter={timelineFilter}
          onSelectTimeline={setTimelineFilter}
        />

        {/* 2. Top-Level Summary Metric Cards */}
        <AnalyticsSummaryCards
          totalIncome={totalIncome}
          totalExpenses={totalExpenses}
          netSavings={netSavings}
          dailyAverage={dailyAverageSpend}
          daysCount={activeDaysCount}
          inflowCount={inflowCount}
          outflowCount={outflowCount}
        />

        {/* 3. Main Dashboard Charts Grid */}
        <View style={isDesktop ? styles.desktopChartsRow : styles.mobileChartsCol}>
          {/* Daily Cash Flow Trend Line Chart */}
          <View style={isDesktop ? styles.chartColLeft : styles.chartColFull}>
            <DailyCashFlowLineChart
              data={cashFlowTrendData}
              monthLabel={monthLabel}
            />
          </View>

          {/* Spending Category Breakdown Donut Chart */}
          <View style={isDesktop ? styles.chartColRight : styles.chartColFull}>
            <CategoryDonutChart
              categories={activeCategoryBreakdown}
              totalExpenses={totalExpenses}
            />
          </View>
        </View>

        {/* 4. Historical Multi-Month Comparison Bar Chart */}
        <HistoricalComparisonBarChart
          data={historicalBarData}
          selectedMonthId={selectedMonthId}
          onSelectMonth={(id) => setSelectedMonthId(id)}
        />

        {/* 5. Statement Export & Email Audit Dispatcher */}
        <View style={styles.exportBarCard}>
          <View style={styles.exportBarLeft}>
            <View style={styles.mailIconCircle}>
              <Mail size={18} color="#EAB308" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.exportBarTitle}>Monthly Statement & Audit Dispatcher</Text>
              <Text style={styles.exportBarSub}>
                Send complete monthly financial statement to {registeredEmail || 'your email'}
              </Text>
            </View>
          </View>

          <View style={styles.exportActionRow}>
            <TouchableOpacity
              style={styles.previewBtn}
              onPress={handlePreviewReport}
              activeOpacity={0.8}
            >
              <Eye size={14} color="#CBD5E1" />
              <Text style={styles.previewBtnText}>Preview HTML</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.sendEmailBtn}
              onPress={handleDispatchEmail}
              activeOpacity={0.8}
              disabled={emailSending}
            >
              <Send size={14} color="#090D16" />
              <Text style={styles.sendEmailBtnText}>
                {emailSending ? 'Sending...' : 'Email Statement'}
              </Text>
            </TouchableOpacity>
          </View>

          {emailStatusMsg && (
            <View style={styles.statusBanner}>
              <Text style={styles.statusText}>{emailStatusMsg}</Text>
            </View>
          )}
        </View>

        {/* 6. Drill-Down Transactions List for Selected Month */}
        <View style={styles.transactionsSection}>
          <View style={styles.txHeaderRow}>
            <View style={styles.txHeaderLeft}>
              <Receipt size={17} color="#EAB308" />
              <Text style={styles.txSectionTitle}>
                Month Transactions ({filteredTransactions.length})
              </Text>
            </View>
            {selectedArchive && (
              <TouchableOpacity
                style={styles.fullArchiveLink}
                onPress={() => setSelectedArchiveForModal(selectedArchive)}
                activeOpacity={0.7}
              >
                <Text style={styles.fullArchiveLinkText}>Detailed Statement View →</Text>
              </TouchableOpacity>
            )}
          </View>

          {filteredTransactions.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>
                No transactions found for the selected month or category filter.
              </Text>
            </View>
          ) : (
            filteredTransactions.slice(0, 10).map((tx) => (
              <ExpenseCard key={tx.id} transaction={tx} />
            ))
          )}

          {filteredTransactions.length > 10 && (
            <TouchableOpacity
              style={styles.viewAllBtn}
              onPress={() => {
                if (isCurrentMonth) {
                  navigation.navigate('ExpensesTab');
                } else if (selectedArchive) {
                  setSelectedArchiveForModal(selectedArchive);
                }
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.viewAllBtnText}>
                View all {filteredTransactions.length} transactions
              </Text>
              <ArrowRight size={14} color="#FACC15" />
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      {/* Notifications Modal */}
      <NotificationsModal
        visible={showNotifications}
        onClose={() => setShowNotifications(false)}
      />

      {/* Full Statement Details Modal for Archived Month */}
      <ClosedMonthDetailsModal
        visible={!!selectedArchiveForModal}
        record={selectedArchiveForModal}
        onClose={() => setSelectedArchiveForModal(null)}
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
    paddingHorizontal: THEME.spacing.lg,
    paddingTop: THEME.spacing.sm,
    paddingBottom: 40,
  },
  desktopChartsRow: {
    flexDirection: 'row',
    gap: 14,
  },
  mobileChartsCol: {
    flexDirection: 'column',
  },
  chartColLeft: {
    flex: 3,
  },
  chartColRight: {
    flex: 2,
  },
  chartColFull: {
    width: '100%',
  },
  exportBarCard: {
    backgroundColor: '#111726',
    borderRadius: THEME.borderRadius.xxl,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#1E293B',
    marginBottom: THEME.spacing.md,
    gap: 12,
  },
  exportBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  mailIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(234, 179, 8, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  exportBarTitle: {
    fontSize: 14,
    fontWeight: THEME.typography.weights.heavy,
    color: '#F8FAFC',
  },
  exportBarSub: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  exportActionRow: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'flex-end',
  },
  previewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: THEME.borderRadius.lg,
    backgroundColor: '#090D16',
    borderWidth: 1,
    borderColor: '#334155',
  },
  previewBtnText: {
    color: '#CBD5E1',
    fontSize: 12,
    fontWeight: THEME.typography.weights.semibold,
  },
  sendEmailBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: THEME.borderRadius.lg,
    backgroundColor: '#EAB308', // Warm Gold
    shadowColor: '#EAB308',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  sendEmailBtnText: {
    color: '#090D16',
    fontSize: 12,
    fontWeight: THEME.typography.weights.heavy,
  },
  statusBanner: {
    backgroundColor: 'rgba(234, 179, 8, 0.12)',
    padding: 10,
    borderRadius: THEME.borderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(234, 179, 8, 0.3)',
  },
  statusText: {
    color: '#FACC15',
    fontSize: 11,
    fontWeight: THEME.typography.weights.semibold,
  },
  transactionsSection: {
    marginTop: 6,
    marginBottom: 20,
  },
  txHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    flexWrap: 'wrap',
    gap: 8,
  },
  txHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  txSectionTitle: {
    fontSize: 15,
    fontWeight: THEME.typography.weights.heavy,
    color: '#F8FAFC',
  },
  fullArchiveLink: {
    backgroundColor: 'rgba(234, 179, 8, 0.12)',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  fullArchiveLinkText: {
    color: '#FACC15',
    fontSize: 11,
    fontWeight: THEME.typography.weights.bold,
  },
  emptyCard: {
    backgroundColor: '#111726',
    borderRadius: THEME.borderRadius.lg,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  emptyText: {
    color: '#64748B',
    fontSize: 12,
    textAlign: 'center',
  },
  viewAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    marginTop: 8,
    backgroundColor: 'rgba(234, 179, 8, 0.1)',
    borderRadius: THEME.borderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(234, 179, 8, 0.25)',
  },
  viewAllBtnText: {
    color: '#FACC15',
    fontSize: 12,
    fontWeight: THEME.typography.weights.heavy,
  },
});
