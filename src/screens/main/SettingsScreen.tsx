// SettingsScreen: Configuration for Budget Period, Low Balance Alerts, and Notifications

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
  Image,
} from 'react-native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import {
  Sliders,
  Bell,
  Sparkles,
  LogOut,
  Calendar,
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

type Props = BottomTabScreenProps<MainTabParamList, 'SettingsTab'>;

export const SettingsScreen: React.FC<Props> = () => {
  const { user, profile, signOut } = useAuth();
  const {
    summary,
    budgetSettings,
    updateBudgetSettings,
  } = useFinancial();
  const { settings, updateSettings } = useNotification();

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

  const [showLogoutConfirm, setShowLogoutConfirm] = useState<boolean>(false);
  const [showNotifications, setShowNotifications] = useState<boolean>(false);

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
              <Image
                source={require('../../../assets/brand/leader_square.png')}
                style={styles.profileAvatarImg}
                resizeMode="cover"
              />
            </View>
            <View style={styles.profileText}>
              <Text style={styles.profileName}>{profile?.name || user?.email?.split('@')[0] || 'User'}</Text>
              <Text style={styles.profileEmail}>{user?.email}</Text>
              <Text style={styles.currencyBadge}>Currency: INR (₹)</Text>
            </View>
          </View>
        </View>

        {/* Leadership & Brand Inspiration Card */}
        <View style={[styles.card, styles.leaderCard]}>
          <View style={styles.leaderRow}>
            <View style={styles.leaderPhotoWrapper}>
              <Image
                source={require('../../../assets/brand/leader.png')}
                style={styles.leaderPhoto}
                resizeMode="cover"
              />
            </View>
            <View style={styles.leaderDetails}>
              <View style={styles.leaderBadge}>
                <Sparkles size={11} color="#EAB308" />
                <Text style={styles.leaderBadgeText}>நமது உத்வேகம்</Text>
              </View>
              <Text style={styles.leaderName}>தளபதி விஜய்</Text>
              <Text style={styles.leaderQuote}>
                "திட்டமிட்ட சேமிப்பும், சரியான நிதி ஒழுக்கமுமே வாழ்வின் உண்மையான வெற்றி!"
              </Text>
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

          <View style={[styles.switchRow, { borderBottomWidth: 0 }]}>
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
        </View>

        {/* PWA Mobile App Installation Banner */}
        <PWAInstallBanner />

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

        <Text style={styles.versionText}>வெற்றி நிதி மேலாண்மை v1.0.0</Text>
      </ScrollView>

      {/* Confirmation Dialogs */}
      <ConfirmationDialog
        visible={showLogoutConfirm}
        title="Sign Out of வெற்றி நிதி மேலாண்மை?"
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
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#0F172A',
    borderWidth: 2,
    borderColor: '#EAB308',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileAvatarImg: {
    width: '100%',
    height: '100%',
  },
  leaderCard: {
    backgroundColor: '#0F172A',
    borderColor: '#EAB308',
    borderWidth: 1.5,
  },
  leaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  leaderPhotoWrapper: {
    width: 60,
    height: 76,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#EAB308',
    overflow: 'hidden',
    backgroundColor: '#1E293B',
  },
  leaderPhoto: {
    width: '100%',
    height: '100%',
  },
  leaderDetails: {
    flex: 1,
  },
  leaderBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(234, 179, 8, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: THEME.borderRadius.full,
    alignSelf: 'flex-start',
    marginBottom: 4,
    borderWidth: 1,
    borderColor: 'rgba(234, 179, 8, 0.3)',
  },
  leaderBadgeText: {
    color: '#FACC15',
    fontSize: 10,
    fontWeight: THEME.typography.weights.bold,
  },
  leaderName: {
    color: '#EAB308',
    fontSize: 15,
    fontWeight: THEME.typography.weights.bold,
    marginBottom: 4,
  },
  leaderQuote: {
    color: '#CBD5E1',
    fontSize: 11,
    lineHeight: 16,
    fontStyle: 'italic',
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
