// SettingsScreen: Configuration for Budget Period, Low Balance Alerts, Notifications, and Demo Data

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import {
  User,
  Sliders,
  Bell,
  Sparkles,
  RotateCcw,
  LogOut,
  ChevronRight,
  Shield,
  HelpCircle,
  Calendar,
  Mail,
  Send,
  CheckCircle,
} from 'lucide-react-native';
import { THEME } from '../../constants/theme';
import { MainTabParamList } from '../../types/navigation';
import { useAuth } from '../../context/AuthContext';
import { useFinancial } from '../../context/FinancialContext';
import { useNotification } from '../../context/NotificationContext';
import { AppHeader } from '../../components/common/AppHeader';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { CalendarPicker } from '../../components/common/CalendarPicker';
import { PWAInstallBanner } from '../../components/common/PWAInstallBanner';
import { ConfirmationDialog } from '../../components/common/ConfirmationDialog';
import { NotificationsModal } from '../modals/NotificationsModal';
import { formatINR } from '../../utils/currency';
import { triggerWeeklyReportEmail } from '../../services/emailReportService';

type Props = BottomTabScreenProps<MainTabParamList, 'SettingsTab'>;

export const SettingsScreen: React.FC<Props> = () => {
  const { user, profile, signOut } = useAuth();
  const {
    summary,
    budgetSettings,
    updateBudgetSettings,
    loadDemoData,
    resetUserData,
    sendFixedRemindersEmail,
    sendLowBalanceEmailAlertNow,
    sendCycleEndingEmailAlertNow,
  } = useFinancial();
  const { settings, updateSettings } = useNotification();

  const [emailTestLoading, setEmailTestLoading] = useState<string | null>(null);
  const [emailTestResult, setEmailTestResult] = useState<string | null>(null);

  const [thresholdStr, setThresholdStr] = useState<string>(
    String(budgetSettings?.low_balance_threshold ?? 2000)
  );
  const [periodType, setPeriodType] = useState<'weekly' | 'monthly' | 'custom'>(
    budgetSettings?.period_type ?? 'monthly'
  );
  const [cycleStartDayStr, setCycleStartDayStr] = useState<string>(
    String(budgetSettings?.cycle_start_day ?? 1)
  );
  const [customStartDate, setCustomStartDate] = useState<string>(
    budgetSettings?.custom_start_date || new Date().toISOString().split('T')[0]
  );
  const [customEndDate, setCustomEndDate] = useState<string>(
    budgetSettings?.custom_end_date || new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]
  );
  const [activeCalendarPicker, setActiveCalendarPicker] = useState<'start' | 'end' | null>(null);

  const [showResetConfirm, setShowResetConfirm] = useState<boolean>(false);
  const [showDemoConfirm, setShowDemoConfirm] = useState<boolean>(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState<boolean>(false);
  const [showNotifications, setShowNotifications] = useState<boolean>(false);

  const [demoLoading, setDemoLoading] = useState<boolean>(false);
  const [resetLoading, setResetLoading] = useState<boolean>(false);
  const [savingBudget, setSavingBudget] = useState<boolean>(false);

  useEffect(() => {
    if (budgetSettings) {
      setThresholdStr(String(budgetSettings.low_balance_threshold));
      setPeriodType(budgetSettings.period_type || 'monthly');
      setCycleStartDayStr(String(budgetSettings.cycle_start_day || 1));
      if (budgetSettings.custom_start_date) setCustomStartDate(budgetSettings.custom_start_date);
      if (budgetSettings.custom_end_date) setCustomEndDate(budgetSettings.custom_end_date);
    }
  }, [budgetSettings]);

  const handleSaveBudget = async () => {
    const val = parseFloat(thresholdStr);
    if (isNaN(val) || val < 0) {
      Alert.alert('Invalid Threshold', 'Please enter a valid amount.');
      return;
    }

    const startDay = parseInt(cycleStartDayStr, 10);
    if (isNaN(startDay) || startDay < 1 || startDay > 31) {
      Alert.alert('Invalid Cycle Day', 'Please enter a valid start day between 1 and 31.');
      return;
    }

    setSavingBudget(true);
    try {
      await updateBudgetSettings({
        period_type: periodType,
        low_balance_threshold: val,
        cycle_start_day: startDay,
        custom_start_date: periodType === 'custom' ? customStartDate : null,
        custom_end_date: periodType === 'custom' ? customEndDate : null,
      });
      Alert.alert('Success 🎉', 'Budget lifecycle and settings updated successfully!');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to update settings');
    } finally {
      setSavingBudget(false);
    }
  };

  const handleLoadDemo = async () => {
    setDemoLoading(true);
    try {
      const res = await loadDemoData();
      if (res.success) {
        setShowDemoConfirm(false);
        Alert.alert(
          'Demo Dataset Loaded! 🎉',
          'Added ₹10,000 to wallet, Milk ₹60/day, Bus ₹40/day, Netflix ₹199/month, Lunch ₹200, Shopping ₹500.'
        );
      } else {
        Alert.alert('Notice', res.error || 'Demo data loaded.');
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to load demo data');
    } finally {
      setDemoLoading(false);
    }
  };

  const handleResetData = async () => {
    setResetLoading(true);
    try {
      const res = await resetUserData();
      if (res.success) {
        setShowResetConfirm(false);
        Alert.alert('Data Cleared', 'All your test transactions and recurring rules have been reset.');
      } else {
        Alert.alert('Notice', res.error || 'Data reset completed.');
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to reset data');
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppHeader
        title="Settings"
        subtitle="Preferences and account configuration"
        onNotificationPress={() => setShowNotifications(true)}
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Profile Card */}
        <View style={styles.card}>
          <View style={styles.profileRow}>
            <View style={styles.avatarCircle}>
              <User size={24} color="#FFF" />
            </View>
            <View style={styles.profileText}>
              <Text style={styles.profileName}>{profile?.name || user?.email?.split('@')[0] || 'User'}</Text>
              <Text style={styles.profileEmail}>{user?.email}</Text>
              <Text style={styles.currencyBadge}>Currency: INR (₹)</Text>
            </View>
          </View>
        </View>

        {/* Budget Period & Threshold Configuration */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.iconCircle}>
              <Sliders size={18} color={THEME.colors.primary} />
            </View>
            <Text style={styles.cardTitle}>Budget Lifecycle & Thresholds</Text>
          </View>

          <Text style={styles.fieldLabel}>Budget Tracking Mode</Text>
          <View style={styles.periodRowGrid}>
            <TouchableOpacity
              style={[styles.periodOption, periodType === 'monthly' && styles.periodOptionActive]}
              onPress={() => setPeriodType('monthly')}
              activeOpacity={0.8}
            >
              <Text style={[styles.periodText, periodType === 'monthly' && styles.periodTextActive]}>
                Monthly Cycle
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.periodOption, periodType === 'custom' && styles.periodOptionActive]}
              onPress={() => setPeriodType('custom')}
              activeOpacity={0.8}
            >
              <Text style={[styles.periodText, periodType === 'custom' && styles.periodTextActive]}>
                Custom Date Range
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.periodOption, periodType === 'weekly' && styles.periodOptionActive]}
              onPress={() => setPeriodType('weekly')}
              activeOpacity={0.8}
            >
              <Text style={[styles.periodText, periodType === 'weekly' && styles.periodTextActive]}>
                Weekly (7 Days)
              </Text>
            </TouchableOpacity>
          </View>

          {/* Monthly Cycle Start Day Option */}
          {periodType === 'monthly' && (
            <View style={styles.customConfigBox}>
              <Input
                label="Monthly Cycle Start Day"
                placeholder="1 (e.g. 1 for 1st-End, or 5 for Salary cycle 5th-4th)"
                keyboardType="numeric"
                value={cycleStartDayStr}
                onChangeText={setCycleStartDayStr}
                helperText="Set to 1 for standard month (1st - End), or your salary date (e.g. 5 for 5th to 4th next month)."
              />
            </View>
          )}

          {/* Custom Date Range Option */}
          {periodType === 'custom' && (
            <View style={styles.customConfigBox}>
              <Text style={styles.configSubtitle}>Custom Project / Budget Period</Text>
              <View style={styles.dateInputsRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.dateFieldLabel}>Start Date</Text>
                  <TouchableOpacity
                    style={[
                      styles.dateSelectBtn,
                      activeCalendarPicker === 'start' && styles.dateSelectBtnActive,
                    ]}
                    onPress={() =>
                      setActiveCalendarPicker(activeCalendarPicker === 'start' ? null : 'start')
                    }
                    activeOpacity={0.7}
                  >
                    <Calendar
                      size={16}
                      color={
                        activeCalendarPicker === 'start'
                          ? THEME.colors.primary
                          : THEME.colors.textMuted
                      }
                    />
                    <Text
                      style={[
                        styles.dateSelectBtnText,
                        activeCalendarPicker === 'start' && { color: THEME.colors.primary },
                      ]}
                    >
                      {customStartDate || 'Select Start Date'}
                    </Text>
                  </TouchableOpacity>
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={styles.dateFieldLabel}>End Date</Text>
                  <TouchableOpacity
                    style={[
                      styles.dateSelectBtn,
                      activeCalendarPicker === 'end' && styles.dateSelectBtnActive,
                    ]}
                    onPress={() =>
                      setActiveCalendarPicker(activeCalendarPicker === 'end' ? null : 'end')
                    }
                    activeOpacity={0.7}
                  >
                    <Calendar
                      size={16}
                      color={
                        activeCalendarPicker === 'end'
                          ? THEME.colors.primary
                          : THEME.colors.textMuted
                      }
                    />
                    <Text
                      style={[
                        styles.dateSelectBtnText,
                        activeCalendarPicker === 'end' && { color: THEME.colors.primary },
                      ]}
                    >
                      {customEndDate || 'Select End Date'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Interactive Calendar Dropdown */}
              {activeCalendarPicker === 'start' && (
                <View style={{ marginTop: 10, marginBottom: 8 }}>
                  <CalendarPicker
                    title="Select Budget Cycle Start Date"
                    selectedDate={customStartDate}
                    maxDate={customEndDate}
                    onSelectDate={(date) => {
                      setCustomStartDate(date);
                      setActiveCalendarPicker(null);
                    }}
                  />
                </View>
              )}

              {activeCalendarPicker === 'end' && (
                <View style={{ marginTop: 10, marginBottom: 8 }}>
                  <CalendarPicker
                    title="Select Budget Cycle End Date"
                    selectedDate={customEndDate}
                    minDate={customStartDate}
                    onSelectDate={(date) => {
                      setCustomEndDate(date);
                      setActiveCalendarPicker(null);
                    }}
                  />
                </View>
              )}

              <Text style={styles.configHint}>
                Click Start or End Date above to select directly from the visual calendar. Tracks a specific trip, project, or custom timeframe.
              </Text>
            </View>
          )}

          {/* Active Period Live Info Banner */}
          <View style={styles.periodPreviewBanner}>
            <View style={styles.periodPreviewRow}>
              <Text style={styles.periodPreviewTitle}>📅 Current Active Period:</Text>
              <Text style={styles.periodPreviewValue}>
                {summary.periodStartFormatted || 'Today'} – {summary.periodEndFormatted || 'Period End'}
              </Text>
            </View>
            <View style={styles.periodPreviewRow}>
              <Text style={styles.periodPreviewTitle}>⏳ Days Remaining:</Text>
              <Text style={styles.periodPreviewValueBadge}>{summary.daysRemaining} days remaining</Text>
            </View>
          </View>

          <Input
            label="Low Balance Warning Threshold (₹)"
            placeholder="2000"
            prefix="₹"
            keyboardType="numeric"
            value={thresholdStr}
            onChangeText={setThresholdStr}
            helperText="An alert triggers when your balance drops below this amount."
          />

          <Button
            title="Save Budget Settings"
            onPress={handleSaveBudget}
            variant="primary"
            size="md"
            loading={savingBudget}
            style={styles.saveBudgetBtn}
            fullWidth
          />
        </View>

        {/* Notification Preferences */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.iconCircle, { backgroundColor: THEME.colors.indigoLight }]}>
              <Bell size={18} color={THEME.colors.indigo} />
            </View>
            <Text style={styles.cardTitle}>Notification Preferences</Text>
          </View>

          <View style={styles.switchRow}>
            <View style={styles.switchTextCol}>
              <Text style={styles.switchTitle}>Low Balance Alerts</Text>
              <Text style={styles.switchDesc}>Notify when balance drops below threshold</Text>
            </View>
            <Switch
              value={settings?.low_balance_enabled ?? true}
              onValueChange={(val) => updateSettings({ low_balance_enabled: val })}
              trackColor={{ false: THEME.colors.border, true: THEME.colors.primaryBorder }}
              thumbColor={THEME.colors.primary}
            />
          </View>

          <View style={styles.switchRow}>
            <View style={styles.switchTextCol}>
              <Text style={styles.switchTitle}>Recurring Expense Reminders</Text>
              <Text style={styles.switchDesc}>Daily fixed deductions and skip updates</Text>
            </View>
            <Switch
              value={settings?.fixed_expense_enabled ?? true}
              onValueChange={(val) => updateSettings({ fixed_expense_enabled: val })}
              trackColor={{ false: THEME.colors.border, true: THEME.colors.primaryBorder }}
              thumbColor={THEME.colors.primary}
            />
          </View>

          <View style={styles.switchRow}>
            <View style={styles.switchTextCol}>
              <Text style={styles.switchTitle}>5-Day Remaining Alert</Text>
              <Text style={styles.switchDesc}>Alert when 5 days remain in budget cycle</Text>
            </View>
            <Switch
              value={settings?.five_day_warning_enabled ?? true}
              onValueChange={(val) => updateSettings({ five_day_warning_enabled: val })}
              trackColor={{ false: THEME.colors.border, true: THEME.colors.primaryBorder }}
              thumbColor={THEME.colors.primary}
            />
          </View>

          <View style={styles.switchRow}>
            <View style={styles.switchTextCol}>
              <Text style={styles.switchTitle}>Weekly Email Reports</Text>
              <Text style={styles.switchDesc}>Send weekly Resend summary emails</Text>
            </View>
            <Switch
              value={settings?.weekly_report_enabled ?? true}
              onValueChange={(val) => updateSettings({ weekly_report_enabled: val })}
              trackColor={{ false: THEME.colors.border, true: THEME.colors.primaryBorder }}
              thumbColor={THEME.colors.primary}
            />
          </View>

          {/* Live Email Diagnostic & Test Center */}
          <View style={{ marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: THEME.colors.border }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              <Mail size={16} color={THEME.colors.primary} style={{ marginRight: 6 }} />
              <Text style={{ fontSize: 13, fontWeight: '700', color: THEME.colors.textPrimary }}>
                Instant Email Verification & Diagnostics
              </Text>
            </View>
            <Text style={{ fontSize: 12, color: THEME.colors.textSecondary, marginBottom: 12 }}>
              Trigger and verify any alert directly to <Text style={{ fontWeight: '700', color: THEME.colors.textPrimary }}>{user?.email || 'selvanpragathish@gmail.com'}</Text>:
            </Text>

            {emailTestResult ? (
              <View style={{ backgroundColor: '#ecfdf5', padding: 10, borderRadius: 8, marginBottom: 12, borderWidth: 1, borderColor: '#a7f3d0' }}>
                <Text style={{ fontSize: 12, color: '#065f46', fontWeight: '600' }}>
                  {emailTestResult}
                </Text>
              </View>
            ) : null}

            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              <TouchableOpacity
                onPress={async () => {
                  setEmailTestLoading('fixed');
                  setEmailTestResult(null);
                  try {
                    const res = await sendFixedRemindersEmail('morning');
                    setEmailTestResult(res.message || 'Fixed expenses reminder sent!');
                  } catch (e: any) {
                    setEmailTestResult(`Error: ${e.message}`);
                  } finally {
                    setEmailTestLoading(null);
                  }
                }}
                disabled={emailTestLoading !== null}
                style={{
                  backgroundColor: '#f1f5f9',
                  paddingVertical: 8,
                  paddingHorizontal: 12,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: '#cbd5e1',
                  flexDirection: 'row',
                  alignItems: 'center',
                }}
              >
                <Send size={12} color="#0f172a" style={{ marginRight: 6 }} />
                <Text style={{ fontSize: 12, fontWeight: '600', color: '#0f172a' }}>
                  {emailTestLoading === 'fixed' ? 'Sending...' : 'Fixed Expense Alert'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={async () => {
                  setEmailTestLoading('low_balance');
                  setEmailTestResult(null);
                  try {
                    const res = await sendLowBalanceEmailAlertNow();
                    setEmailTestResult(res.message || 'Low balance alert sent!');
                  } catch (e: any) {
                    setEmailTestResult(`Error: ${e.message}`);
                  } finally {
                    setEmailTestLoading(null);
                  }
                }}
                disabled={emailTestLoading !== null}
                style={{
                  backgroundColor: '#fef2f2',
                  paddingVertical: 8,
                  paddingHorizontal: 12,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: '#fca5a5',
                  flexDirection: 'row',
                  alignItems: 'center',
                }}
              >
                <Send size={12} color="#dc2626" style={{ marginRight: 6 }} />
                <Text style={{ fontSize: 12, fontWeight: '600', color: '#dc2626' }}>
                  {emailTestLoading === 'low_balance' ? 'Sending...' : 'Low Balance Alert'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={async () => {
                  setEmailTestLoading('5day');
                  setEmailTestResult(null);
                  try {
                    const res = await sendCycleEndingEmailAlertNow();
                    setEmailTestResult(res.message || '5-Day cycle alert sent!');
                  } catch (e: any) {
                    setEmailTestResult(`Error: ${e.message}`);
                  } finally {
                    setEmailTestLoading(null);
                  }
                }}
                disabled={emailTestLoading !== null}
                style={{
                  backgroundColor: '#fff7ed',
                  paddingVertical: 8,
                  paddingHorizontal: 12,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: '#fdba74',
                  flexDirection: 'row',
                  alignItems: 'center',
                }}
              >
                <Send size={12} color="#c2410c" style={{ marginRight: 6 }} />
                <Text style={{ fontSize: 12, fontWeight: '600', color: '#c2410c' }}>
                  {emailTestLoading === '5day' ? 'Sending...' : '5-Day Cycle Alert'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={async () => {
                  if (!user?.id) return;
                  setEmailTestLoading('weekly');
                  setEmailTestResult(null);
                  try {
                    const res = await triggerWeeklyReportEmail({ userId: user.id });
                    setEmailTestResult(res.message || 'Weekly report digest sent!');
                  } catch (e: any) {
                    setEmailTestResult(`Error: ${e.message}`);
                  } finally {
                    setEmailTestLoading(null);
                  }
                }}
                disabled={emailTestLoading !== null}
                style={{
                  backgroundColor: '#ecfdf5',
                  paddingVertical: 8,
                  paddingHorizontal: 12,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: '#6ee7b7',
                  flexDirection: 'row',
                  alignItems: 'center',
                }}
              >
                <Send size={12} color="#047857" style={{ marginRight: 6 }} />
                <Text style={{ fontSize: 12, fontWeight: '600', color: '#047857' }}>
                  {emailTestLoading === 'weekly' ? 'Sending...' : 'Weekly Digest Report'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* PWA Mobile App Installation Banner */}
        <PWAInstallBanner />

        {/* Development & Demo Testing Controls */}
        <View style={[styles.card, styles.demoCard]}>
          <View style={styles.cardHeader}>
            <View style={[styles.iconCircle, { backgroundColor: '#FEF3C7' }]}>
              <Sparkles size={18} color="#B45309" />
            </View>
            <Text style={styles.cardTitle}>Demo & Test Suite</Text>
          </View>
          <Text style={styles.demoDesc}>
            Quickly test scenarios from the spec: loads ₹10,000 wallet top-up, Milk (₹60/day), Bus (₹40/day), Netflix (₹199/month), and manual expenses.
          </Text>

          <View style={styles.demoButtonsRow}>
            <Button
              title="Load Demo Dataset"
              onPress={() => setShowDemoConfirm(true)}
              variant="primary"
              size="sm"
              icon={<Sparkles size={14} color="#FFF" />}
              style={styles.demoBtn}
            />
            <Button
              title="Reset My Data"
              onPress={() => setShowResetConfirm(true)}
              variant="danger"
              size="sm"
              icon={<RotateCcw size={14} color="#FFF" />}
              style={styles.demoBtn}
            />
          </View>
        </View>

        {/* Logout Button */}
        <Button
          title="Sign Out"
          onPress={() => setShowLogoutConfirm(true)}
          variant="subtle"
          size="lg"
          icon={<LogOut size={18} color={THEME.colors.danger} />}
          textStyle={{ color: THEME.colors.danger }}
          style={styles.logoutBtn}
          fullWidth
        />

        <Text style={styles.versionText}>SmartSpend v1.0.0 • Supabase + Resend Powered</Text>
      </ScrollView>

      {/* Confirmation Dialogs */}
      <ConfirmationDialog
        visible={showDemoConfirm}
        title="Load Demo Dataset?"
        message="This will add ₹10,000 wallet balance, Milk ₹60 daily, Bus ₹40 daily, Netflix ₹199 monthly, Lunch ₹200, and Shopping ₹500 for testing."
        confirmTitle="Load Demo"
        confirmVariant="primary"
        loading={demoLoading}
        onConfirm={handleLoadDemo}
        onCancel={() => setShowDemoConfirm(false)}
      />

      <ConfirmationDialog
        visible={showResetConfirm}
        title="Reset All Financial Data?"
        message="This will remove all your money additions, manual expenses, recurring rules and occurrences. This cannot be undone."
        confirmTitle="Reset All Data"
        confirmVariant="danger"
        loading={resetLoading}
        onConfirm={handleResetData}
        onCancel={() => setShowResetConfirm(false)}
      />

      <ConfirmationDialog
        visible={showLogoutConfirm}
        title="Sign Out of SmartSpend?"
        message="Are you sure you want to end your session?"
        confirmTitle="Sign Out"
        confirmVariant="danger"
        onConfirm={() => {
          setShowLogoutConfirm(false);
          signOut();
        }}
        onCancel={() => setShowLogoutConfirm(false)}
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
    paddingHorizontal: THEME.spacing.lg,
    paddingTop: THEME.spacing.sm,
    paddingBottom: THEME.spacing.huge,
  },
  card: {
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.borderRadius.xxl,
    padding: THEME.spacing.lg,
    marginBottom: THEME.spacing.md,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    ...THEME.shadows.card,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  avatarCircle: {
    width: 52,
    height: 52,
    borderRadius: THEME.borderRadius.full,
    backgroundColor: THEME.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileText: {
    flex: 1,
  },
  profileName: {
    fontSize: THEME.typography.sizes.lg,
    fontWeight: THEME.typography.weights.bold,
    color: THEME.colors.textPrimary,
  },
  profileEmail: {
    fontSize: THEME.typography.sizes.xs,
    color: THEME.colors.textSecondary,
    marginTop: 2,
  },
  currencyBadge: {
    fontSize: 11,
    color: THEME.colors.primaryDark,
    fontWeight: THEME.typography.weights.semibold,
    backgroundColor: THEME.colors.primaryMuted,
    alignSelf: 'flex-start',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: THEME.borderRadius.xs,
    marginTop: 6,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: THEME.spacing.md,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: THEME.borderRadius.lg,
    backgroundColor: THEME.colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: THEME.typography.sizes.md,
    fontWeight: THEME.typography.weights.bold,
    color: THEME.colors.textPrimary,
  },
  fieldLabel: {
    fontSize: THEME.typography.sizes.sm,
    fontWeight: THEME.typography.weights.semibold,
    color: THEME.colors.textSecondary,
    marginBottom: 8,
  },
  periodRowGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: THEME.spacing.md,
  },
  periodOption: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: THEME.borderRadius.lg,
    backgroundColor: THEME.colors.surfaceSubtle,
    borderWidth: 1.5,
    borderColor: THEME.colors.border,
  },
  periodOptionActive: {
    backgroundColor: THEME.colors.primaryMuted,
    borderColor: THEME.colors.primary,
  },
  periodText: {
    fontSize: THEME.typography.sizes.xs,
    fontWeight: THEME.typography.weights.medium,
    color: THEME.colors.textSecondary,
    textAlign: 'center',
  },
  periodTextActive: {
    color: THEME.colors.primaryDark,
    fontWeight: THEME.typography.weights.bold,
  },
  customConfigBox: {
    backgroundColor: THEME.colors.surfaceSubtle,
    borderRadius: THEME.borderRadius.xl,
    padding: THEME.spacing.md,
    marginBottom: THEME.spacing.md,
    borderWidth: 1,
    borderColor: THEME.colors.borderLight,
  },
  configSubtitle: {
    fontSize: THEME.typography.sizes.sm,
    fontWeight: THEME.typography.weights.bold,
    color: THEME.colors.textPrimary,
    marginBottom: 8,
  },
  configHint: {
    fontSize: 11,
    color: THEME.colors.textMuted,
    marginTop: -4,
  },
  dateInputsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 8,
  },
  dateFieldLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: THEME.colors.textSecondary,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  dateSelectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    borderRadius: THEME.borderRadius.lg,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  dateSelectBtnActive: {
    borderColor: THEME.colors.primary,
    backgroundColor: THEME.colors.primaryLight,
  },
  dateSelectBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
  },
  periodPreviewBanner: {
    backgroundColor: THEME.colors.primaryMuted,
    borderRadius: THEME.borderRadius.xl,
    padding: THEME.spacing.md,
    marginBottom: THEME.spacing.md,
    borderWidth: 1,
    borderColor: THEME.colors.primaryBorder,
  },
  periodPreviewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 3,
  },
  periodPreviewTitle: {
    fontSize: THEME.typography.sizes.xs,
    fontWeight: THEME.typography.weights.semibold,
    color: THEME.colors.primaryDark,
  },
  periodPreviewValue: {
    fontSize: THEME.typography.sizes.xs,
    fontWeight: THEME.typography.weights.bold,
    color: THEME.colors.textPrimary,
  },
  periodPreviewValueBadge: {
    fontSize: 11,
    fontWeight: THEME.typography.weights.bold,
    color: '#FFF',
    backgroundColor: THEME.colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: THEME.borderRadius.full,
  },
  saveBudgetBtn: {
    marginTop: THEME.spacing.sm,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.borderLight,
  },
  switchTextCol: {
    flex: 1,
    marginRight: 12,
  },
  switchTitle: {
    fontSize: THEME.typography.sizes.sm,
    fontWeight: THEME.typography.weights.semibold,
    color: THEME.colors.textPrimary,
  },
  switchDesc: {
    fontSize: THEME.typography.sizes.xs,
    color: THEME.colors.textMuted,
    marginTop: 2,
  },
  demoCard: {
    borderColor: THEME.colors.amberBorder,
    backgroundColor: '#FFFDF5',
  },
  demoDesc: {
    fontSize: THEME.typography.sizes.xs,
    color: THEME.colors.textSecondary,
    lineHeight: 18,
    marginBottom: THEME.spacing.md,
  },
  demoButtonsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  demoBtn: {
    flex: 1,
  },
  logoutBtn: {
    backgroundColor: THEME.colors.roseLight,
    borderWidth: 1,
    borderColor: THEME.colors.roseBorder,
    marginTop: THEME.spacing.sm,
  },
  versionText: {
    textAlign: 'center',
    fontSize: 11,
    color: THEME.colors.textMuted,
    marginTop: THEME.spacing.lg,
  },
});
