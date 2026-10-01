// ReportsScreen: Analytics and financial reports with charts, instant preview, and email dispatcher

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
  Linking,
  Platform,
} from 'react-native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import {
  Mail,
  Send,
  Calendar,
  CheckCircle2,
  Sparkles,
  AlertCircle,
  Eye,
  Share2,
} from 'lucide-react-native';
import { THEME } from '../../constants/theme';
import { MainTabParamList } from '../../types/navigation';
import { useAuth } from '../../context/AuthContext';
import { useFinancial } from '../../context/FinancialContext';
import { AppHeader } from '../../components/common/AppHeader';
import { FinancialSummaryCards } from '../../components/reports/FinancialSummaryCards';
import { CategoryPieChart } from '../../components/reports/CategoryPieChart';
import { ExpenseComparisonBar } from '../../components/reports/ExpenseComparisonBar';
import { SpendingTrendChart } from '../../components/reports/SpendingTrendChart';
import { RecurringPerformanceTable } from '../../components/reports/RecurringPerformanceTable';
import { NotificationsModal } from '../modals/NotificationsModal';
import { Button } from '../../components/common/Button';
import {
  triggerWeeklyReportEmail,
  triggerMonthlyReportEmail,
  compileUserReport,
  createMailtoUrl,
} from '../../services/emailReportService';
import { format, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';

type Props = BottomTabScreenProps<MainTabParamList, 'ReportsTab'>;

export const ReportsScreen: React.FC<Props> = () => {
  const { user, profile } = useAuth();
  const {
    refreshing,
    refreshData,
    summary,
    moneyAdditions,
    manualExpenses,
    fixedExpenses,
    occurrences,
    categoryBreakdown,
  } = useFinancial();

  const [periodTab, setPeriodTab] = useState<'week' | 'month'>('week');
  const [showNotifications, setShowNotifications] = useState<boolean>(false);
  const [emailSuccessMsg, setEmailSuccessMsg] = useState<string | null>(null);
  const [emailErrorMsg, setEmailErrorMsg] = useState<string | null>(null);
  const [sendingWeekly, setSendingWeekly] = useState<boolean>(false);
  const [sendingMonthly, setSendingMonthly] = useState<boolean>(false);
  const [previewLoading, setPreviewLoading] = useState<boolean>(false);

  const registeredEmail = (user?.email || profile?.email || '').trim();

  // Filter data according to selected tab (week or month)
  const now = new Date();
  const dateRange = useMemo(() => {
    if (periodTab === 'week') {
      const start = startOfWeek(now, { weekStartsOn: 1 });
      const end = endOfWeek(now, { weekStartsOn: 1 });
      return {
        startStr: format(start, 'yyyy-MM-dd'),
        endStr: format(end, 'yyyy-MM-dd'),
        label: `${format(start, 'd MMM')} - ${format(end, 'd MMM yyyy')}`,
      };
    } else {
      const start = startOfMonth(now);
      const end = endOfMonth(now);
      return {
        startStr: format(start, 'yyyy-MM-dd'),
        endStr: format(end, 'yyyy-MM-dd'),
        label: format(now, 'MMMM yyyy'),
      };
    }
  }, [periodTab]);

  // Period-filtered additions
  const periodAdditions = useMemo(() => {
    return moneyAdditions.filter((a) => {
      const d = a.added_at.split('T')[0];
      return d >= dateRange.startStr && d <= dateRange.endStr;
    });
  }, [moneyAdditions, dateRange]);

  const periodMoneyAdded = periodAdditions.reduce((sum, a) => sum + Number(a.amount), 0);

  // Period-filtered manual expenses
  const periodManual = useMemo(() => {
    return manualExpenses.filter((e) => {
      return e.expense_date >= dateRange.startStr && e.expense_date <= dateRange.endStr;
    });
  }, [manualExpenses, dateRange]);

  const periodManualTotal = periodManual.reduce((sum, e) => sum + Number(e.amount), 0);

  // Period-filtered fixed occurrences
  const periodOccurrences = useMemo(() => {
    return occurrences.filter((o) => {
      return o.occurrence_date >= dateRange.startStr && o.occurrence_date <= dateRange.endStr;
    });
  }, [occurrences, dateRange]);

  const periodFixedCompleted = periodOccurrences
    .filter((o) => o.status === 'completed')
    .reduce((sum, o) => sum + Number(o.amount), 0);

  const periodTotalExpenses = periodManualTotal + periodFixedCompleted;
  const startingBalance = summary.currentBalance + periodTotalExpenses - periodMoneyAdded;

  // 7-day trend calculation
  const trendData = useMemo(() => {
    const days: { date: string; dayLabel: string; amount: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = subDays(now, i);
      const dStr = format(d, 'yyyy-MM-dd');
      const dayLabel = format(d, 'EEE');

      const manualDay = manualExpenses
        .filter((e) => e.expense_date === dStr)
        .reduce((sum, e) => sum + Number(e.amount), 0);

      const fixedDay = occurrences
        .filter((o) => o.occurrence_date === dStr && o.status === 'completed')
        .reduce((sum, o) => sum + Number(o.amount), 0);

      days.push({
        date: dStr,
        dayLabel,
        amount: manualDay + fixedDay,
      });
    }
    return days;
  }, [manualExpenses, occurrences]);

  // Recurring performance summary
  const recurringPerformance = useMemo(() => {
    return fixedExpenses
      .map((rule) => {
        const ruleOccs = periodOccurrences.filter((o) => o.fixed_expense_id === rule.id);
        const paidDays = ruleOccs.filter((o) => o.status === 'completed').length;
        const skippedDays = ruleOccs.filter((o) => o.status === 'skipped').length;
        const totalPaid = ruleOccs
          .filter((o) => o.status === 'completed')
          .reduce((sum, o) => sum + Number(o.amount), 0);

        return {
          name: rule.name,
          paidDays,
          skippedDays,
          amountPaid: totalPaid,
        };
      })
      .filter((item) => item.paidDays > 0 || item.skippedDays > 0);
  }, [fixedExpenses, periodOccurrences]);

  // Trigger Instant Email Report to the logged-in user's email
  const handleSendReport = async (type: 'weekly' | 'monthly') => {
    if (!user?.id) return;
    if (type === 'weekly') setSendingWeekly(true);
    else setSendingMonthly(true);

    setEmailSuccessMsg(null);
    setEmailErrorMsg(null);

    try {
      let res;
      if (type === 'weekly') {
        res = await triggerWeeklyReportEmail({ userId: user.id });
      } else {
        res = await triggerMonthlyReportEmail({ userId: user.id });
      }

      if (res.success) {
        setEmailSuccessMsg(res.message);
        Alert.alert('Report Dispatched! 🚀', res.message);
      } else {
        setEmailErrorMsg(res.message);
        Alert.alert(
          'Email Dispatch Notice',
          res.message,
          [
            { text: 'Preview Report', onPress: () => handlePreviewReport(type) },
            { text: 'Open in Mail App', onPress: () => handleOpenMailApp(type) },
            { text: 'OK', style: 'cancel' },
          ]
        );
      }
    } catch (err: any) {
      const errMsg = err.message || 'Failed to dispatch report.';
      setEmailErrorMsg(errMsg);
      Alert.alert('Error', errMsg);
    } finally {
      setSendingWeekly(false);
      setSendingMonthly(false);
    }
  };

  // Preview or Print Full HTML Report directly
  const handlePreviewReport = async (type: 'weekly' | 'monthly') => {
    if (!user?.id) return;
    setPreviewLoading(true);
    try {
      const compiled = await compileUserReport({
        userId: user.id,
        startDate: dateRange.startStr,
        endDate: dateRange.endStr,
        reportType: type,
      });

      if (!compiled) {
        Alert.alert('Error', 'Unable to compile financial report data.');
        return;
      }

      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        const blob = new Blob([compiled.htmlContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const win = window.open(url, '_blank');
        if (!win) {
          Alert.alert('Popup Blocked', 'Please allow popups to view the full report.');
        }
      } else {
        // Mobile fallback: open mail app with summary
        handleOpenMailApp(type);
      }
    } catch (err: any) {
      Alert.alert('Preview Error', err.message || 'Failed to preview report');
    } finally {
      setPreviewLoading(false);
    }
  };

  // Open User's default Email Client (Gmail/Outlook/Apple Mail)
  const handleOpenMailApp = async (type: 'weekly' | 'monthly') => {
    if (!user?.id) return;
    try {
      const compiled = await compileUserReport({
        userId: user.id,
        startDate: dateRange.startStr,
        endDate: dateRange.endStr,
        reportType: type,
      });

      if (!compiled) return;

      const subject = `SmartSpend ${type === 'monthly' ? 'Monthly' : 'Weekly'} Expense Report (${dateRange.label})`;
      const mailtoUrl = createMailtoUrl({
        to: registeredEmail,
        subject,
        reportData: compiled.reportData,
      });

      await Linking.openURL(mailtoUrl);
    } catch (err: any) {
      console.warn('Error opening mail client:', err);
      Alert.alert('Mail App', 'Unable to open your email client automatically.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppHeader
        title="Financial Reports"
        subtitle={dateRange.label}
        onNotificationPress={() => setShowNotifications(true)}
      />

      {/* Period Toggle */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tabBtn, periodTab === 'week' && styles.tabBtnActive]}
          onPress={() => setPeriodTab('week')}
          activeOpacity={0.7}
        >
          <Text style={[styles.tabBtnText, periodTab === 'week' && styles.tabBtnTextActive]}>
            This Week
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, periodTab === 'month' && styles.tabBtnActive]}
          onPress={() => setPeriodTab('month')}
          activeOpacity={0.7}
        >
          <Text style={[styles.tabBtnText, periodTab === 'month' && styles.tabBtnTextActive]}>
            This Month
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refreshData}
            colors={[THEME.colors.primary]}
            tintColor={THEME.colors.primary}
          />
        }
      >
        {/* 1. Summary Cards */}
        <FinancialSummaryCards
          startingBalance={startingBalance}
          moneyAdded={periodMoneyAdded}
          manualExpenses={periodManualTotal}
          fixedExpenses={periodFixedCompleted}
          totalExpenses={periodTotalExpenses}
          remainingBalance={summary.currentBalance}
          upcomingFixedExpenses={summary.upcomingFixedExpenses}
          safeToSpend={summary.safeToSpend}
        />

        {/* 2. Category Breakdown Donut / Progress */}
        <CategoryPieChart
          categories={categoryBreakdown}
          totalExpenses={summary.totalExpenses}
        />

        {/* 3. Fixed vs Manual Spending Comparison */}
        <ExpenseComparisonBar
          manualExpenses={periodManualTotal}
          fixedExpenses={periodFixedCompleted}
        />

        {/* 4. 7-Day Spending Trend */}
        <SpendingTrendChart data={trendData} />

        {/* 5. Recurring Performance Table */}
        <RecurringPerformanceTable items={recurringPerformance} />

        {/* 6. Instant Email Report Card (Sent to Logged-in User's Email) */}
        <View style={styles.emailCard}>
          <View style={styles.emailTopRow}>
            <View style={styles.emailIconCircle}>
              <Mail size={22} color={THEME.colors.indigo} />
            </View>
            <View style={styles.emailTextCol}>
              <View style={styles.emailHeaderRow}>
                <Text style={styles.emailTitle}>
                  {periodTab === 'week' ? 'Instant Weekly Report' : 'Instant Monthly Report'}
                </Text>
                <View style={styles.resendBadge}>
                  <Text style={styles.resendBadgeText}>To Your Email</Text>
                </View>
              </View>
              <Text style={styles.emailDesc}>
                {periodTab === 'week'
                  ? 'Dispatch your 7-day spending summary and expense breakdown directly to:'
                  : 'Dispatch your full monthly financial digest and category breakdown directly to:'}{' '}
                <Text style={{ fontWeight: 'bold', color: THEME.colors.primaryDark }}>
                  {registeredEmail || 'your registered email'}
                </Text>
              </Text>
            </View>
          </View>

          {/* Success Message Banner */}
          {emailSuccessMsg && (
            <View style={styles.successBanner}>
              <CheckCircle2 size={16} color={THEME.colors.primaryDark} />
              <Text style={styles.successText}>{emailSuccessMsg}</Text>
            </View>
          )}

          {/* Notice / Limitation Banner */}
          {emailErrorMsg && (
            <View style={styles.errorBanner}>
              <AlertCircle size={16} color={THEME.colors.warning} />
              <Text style={styles.errorText}>{emailErrorMsg}</Text>
            </View>
          )}

          {/* Main Action Buttons */}
          <View style={styles.actionButtonsCol}>
            {periodTab === 'week' ? (
              <Button
                title="Send Instant Report for This Week"
                onPress={() => handleSendReport('weekly')}
                variant="primary"
                size="md"
                loading={sendingWeekly}
                icon={<Send size={16} color="#FFF" />}
                fullWidth
              />
            ) : (
              <Button
                title="Send Instant Report for This Month"
                onPress={() => handleSendReport('monthly')}
                variant="primary"
                size="md"
                loading={sendingMonthly}
                icon={<Send size={16} color="#FFF" />}
                fullWidth
              />
            )}

            {/* Instant Preview & Print Option */}
            <View style={styles.secondaryActionsRow}>
              <TouchableOpacity
                style={styles.secondaryBtn}
                onPress={() => handlePreviewReport(periodTab === 'week' ? 'weekly' : 'monthly')}
                disabled={previewLoading}
                activeOpacity={0.7}
              >
                <Eye size={16} color={THEME.colors.primary} />
                <Text style={styles.secondaryBtnText}>
                  {previewLoading ? 'Loading...' : 'Preview & Print Report'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.secondaryBtn}
                onPress={() => handleOpenMailApp(periodTab === 'week' ? 'weekly' : 'monthly')}
                activeOpacity={0.7}
              >
                <Share2 size={16} color={THEME.colors.primary} />
                <Text style={styles.secondaryBtnText}>Open in Mail App</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

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
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: THEME.colors.surfaceSubtle,
    marginHorizontal: THEME.spacing.lg,
    marginVertical: THEME.spacing.md,
    borderRadius: THEME.borderRadius.xl,
    padding: 4,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: THEME.borderRadius.lg,
  },
  tabBtnActive: {
    backgroundColor: THEME.colors.surface,
    ...THEME.shadows.card,
  },
  tabBtnText: {
    fontSize: THEME.typography.sizes.sm,
    fontWeight: THEME.typography.weights.medium,
    color: THEME.colors.textSecondary,
  },
  tabBtnTextActive: {
    color: THEME.colors.textPrimary,
    fontWeight: THEME.typography.weights.bold,
  },
  scrollContent: {
    paddingHorizontal: THEME.spacing.lg,
    paddingBottom: 40,
  },
  emailCard: {
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.borderRadius.xxl,
    padding: THEME.spacing.lg,
    marginBottom: THEME.spacing.md,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    ...THEME.shadows.card,
  },
  emailTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: THEME.spacing.md,
  },
  emailIconCircle: {
    width: 44,
    height: 44,
    borderRadius: THEME.borderRadius.xl,
    backgroundColor: THEME.colors.indigoLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emailTextCol: {
    flex: 1,
  },
  emailHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  resendBadge: {
    backgroundColor: THEME.colors.primaryMuted,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: THEME.borderRadius.full,
    borderWidth: 1,
    borderColor: THEME.colors.primary,
  },
  resendBadgeText: {
    fontSize: 10,
    fontWeight: THEME.typography.weights.bold,
    color: THEME.colors.primaryDark,
  },
  emailTitle: {
    fontSize: THEME.typography.sizes.md,
    fontWeight: THEME.typography.weights.bold,
    color: THEME.colors.textPrimary,
  },
  emailDesc: {
    fontSize: THEME.typography.sizes.xs,
    color: THEME.colors.textSecondary,
    lineHeight: 18,
    marginTop: 4,
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.primaryMuted,
    padding: 10,
    borderRadius: THEME.borderRadius.lg,
    gap: 8,
    marginBottom: THEME.spacing.md,
  },
  successText: {
    fontSize: THEME.typography.sizes.xs,
    color: THEME.colors.primaryDark,
    fontWeight: THEME.typography.weights.semibold,
    flex: 1,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    padding: 10,
    borderRadius: THEME.borderRadius.lg,
    gap: 8,
    marginBottom: THEME.spacing.md,
    borderWidth: 1,
    borderColor: '#FCD34D',
  },
  errorText: {
    fontSize: THEME.typography.sizes.xs,
    color: '#92400E',
    fontWeight: THEME.typography.weights.medium,
    flex: 1,
    lineHeight: 16,
  },
  actionButtonsCol: {
    gap: 10,
  },
  secondaryActionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  secondaryBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: THEME.borderRadius.lg,
    backgroundColor: THEME.colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  secondaryBtnText: {
    fontSize: THEME.typography.sizes.xs,
    fontWeight: THEME.typography.weights.semibold,
    color: THEME.colors.textPrimary,
  },
});
