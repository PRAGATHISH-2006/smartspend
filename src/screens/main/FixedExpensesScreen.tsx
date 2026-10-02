// FixedExpensesScreen: Dedicated management of recurring expense rules, today's occurrences (with Pay/Edit Amount/Skip), and Automated 8 AM & 6 PM Email Reminders

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  SafeAreaView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import {
  Plus,
  Repeat,
  CalendarCheck,
  Lock,
  Bell,
  Clock,
  Send,
  CheckCircle2,
} from 'lucide-react-native';
import { THEME } from '../../constants/theme';
import { MainTabParamList } from '../../types/navigation';
import { useAuth } from '../../context/AuthContext';
import { useFinancial } from '../../context/FinancialContext';
import { AppHeader } from '../../components/common/AppHeader';
import { FixedExpenseCard } from '../../components/fixed/FixedExpenseCard';
import { TodayOccurrenceCard } from '../../components/fixed/TodayOccurrenceCard';
import { AddEditFixedExpenseModal } from '../../components/fixed/AddEditFixedExpenseModal';
import { EditTodayAmountModal } from '../../components/fixed/EditTodayAmountModal';
import { ConfirmationDialog } from '../../components/common/ConfirmationDialog';
import { NotificationsModal } from '../modals/NotificationsModal';
import { EmptyState } from '../../components/common/EmptyState';
import { FixedExpenseRow } from '../../types/database';
import { TodayFixedExpenseItem } from '../../types/financial';
import { formatINR } from '../../utils/currency';
import { getProxyEndpoints } from '../../services/emailReportService';

type Props = BottomTabScreenProps<MainTabParamList, 'FixedTab'>;

export const FixedExpensesScreen: React.FC<Props> = () => {
  const { user } = useAuth();
  const {
    refreshing,
    refreshData,
    fixedExpenses,
    todayFixedExpenses,
    categories,
    addFixedExpense,
    updateFixedExpense,
    deleteFixedExpense,
    toggleFixedExpenseActive,
    payFixedExpense,
    skipFixedExpense,
    addCustomCategory,
  } = useFinancial();

  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [editingRule, setEditingRule] = useState<FixedExpenseRow | null>(null);
  const [deletingRuleId, setDeletingRuleId] = useState<string | null>(null);
  const [showNotifications, setShowNotifications] = useState<boolean>(false);
  const [editingOccurrence, setEditingOccurrence] = useState<TodayFixedExpenseItem | null>(null);

  // Reminders state
  const [sendingReminder, setSendingReminder] = useState<boolean>(false);
  const [reminderSentMsg, setReminderSentMsg] = useState<string | null>(null);

  const recipientEmail = (user?.email || 'selvanpragathish@gmail.com').trim();

  // Compute monthly equivalent commitment
  const totalMonthlyCommitment = fixedExpenses
    .filter((r) => r.active)
    .reduce((sum, r) => {
      const amt = Number(r.amount);
      if (r.frequency === 'daily') return sum + amt * 30;
      if (r.frequency === 'weekly') return sum + amt * 4;
      if (r.frequency === 'monthly') return sum + amt;
      if (r.frequency === 'yearly') return sum + amt / 12;
      return sum;
    }, 0);

  const activeRulesCount = fixedExpenses.filter((r) => r.active).length;

  const handleDeleteConfirm = async () => {
    if (!deletingRuleId) return;
    await deleteFixedExpense(deletingRuleId);
    setDeletingRuleId(null);
  };

  const handleSendTestReminder = async () => {
    setSendingReminder(true);
    setReminderSentMsg(null);
    let sentSuccess = false;
    let successMessage = '';
    let lastError = '';

    const endpoints = getProxyEndpoints('/api/send-reminder');

    for (const endpoint of endpoints) {
      try {
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            slot: new Date().getHours() < 12 ? 'morning' : 'evening',
            to: recipientEmail,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            sentSuccess = true;
            successMessage = data.message || `Reminder email dispatched to ${recipientEmail}!`;
            break;
          } else {
            lastError = data.message || data.error || 'Failed to dispatch reminder';
          }
        }
      } catch (err: any) {
        lastError = err.message || 'Unable to connect to reminder service';
      }
    }

    if (sentSuccess) {
      setReminderSentMsg(successMessage);
      Alert.alert(
        'Reminder Dispatched! ⏰',
        `Test reminder email successfully sent to ${recipientEmail}! Please check your Gmail Inbox & Spam folder.`
      );
    } else {
      Alert.alert('Notice', lastError || 'Unable to connect to reminder service on port 3001');
    }

    setSendingReminder(false);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppHeader
        title="Recurring Expenses"
        subtitle="Manage daily, weekly and monthly fixed costs"
        onNotificationPress={() => setShowNotifications(true)}
        rightElement={
          <TouchableOpacity
            style={styles.headerAddBtn}
            onPress={() => {
              setEditingRule(null);
              setShowAddModal(true);
            }}
            activeOpacity={0.8}
          >
            <Plus size={18} color="#FFF" />
          </TouchableOpacity>
        }
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
        {/* Top KPI Card */}
        <View style={styles.kpiCard}>
          <View style={styles.kpiLeft}>
            <View style={styles.kpiIconCircle}>
              <Lock size={20} color={THEME.colors.indigo} />
            </View>
            <View>
              <Text style={styles.kpiLabel}>Est. Monthly Commitment</Text>
              <Text style={styles.kpiValue}>{formatINR(totalMonthlyCommitment)}</Text>
            </View>
          </View>
          <View style={styles.kpiBadge}>
            <Text style={styles.kpiBadgeText}>{activeRulesCount} Active</Text>
          </View>
        </View>

        {/* Daily Email Reminders Card */}
        <View style={styles.remindersCard}>
          <View style={styles.remindersHeader}>
            <View style={styles.reminderIconCircle}>
              <Bell size={18} color={THEME.colors.primary} />
            </View>
            <View style={styles.reminderHeaderText}>
              <View style={styles.reminderTitleRow}>
                <Text style={styles.reminderTitle}>Daily Email Reminders</Text>
                <View style={styles.activePill}>
                  <Text style={styles.activePillText}>8:00 AM & 6:00 PM</Text>
                </View>
              </View>
              <Text style={styles.reminderSub}>
                Automated email reminders sent to <Text style={{ fontWeight: 'bold', color: THEME.colors.textPrimary }}>{recipientEmail}</Text> so you never forget to log or skip fixed commitments.
              </Text>
            </View>
          </View>

          <View style={styles.slotsRow}>
            <View style={styles.slotBox}>
              <Clock size={15} color={THEME.colors.primary} />
              <View>
                <Text style={styles.slotTime}>08:00 AM</Text>
                <Text style={styles.slotLabel}>Morning Checklist</Text>
              </View>
            </View>
            <View style={styles.slotBox}>
              <Clock size={15} color={THEME.colors.indigo} />
              <View>
                <Text style={styles.slotTime}>06:00 PM</Text>
                <Text style={styles.slotLabel}>Evening Check-In</Text>
              </View>
            </View>
          </View>

          {reminderSentMsg && (
            <View style={styles.reminderSuccessBox}>
              <CheckCircle2 size={15} color={THEME.colors.primaryDark} />
              <Text style={styles.reminderSuccessText}>{reminderSentMsg}</Text>
            </View>
          )}

          <TouchableOpacity
            style={styles.testReminderBtn}
            onPress={handleSendTestReminder}
            disabled={sendingReminder}
            activeOpacity={0.8}
          >
            <Send size={14} color="#FFF" />
            <Text style={styles.testReminderBtnText}>
              {sendingReminder ? 'Sending Reminder Email...' : 'Send Test Reminder Email Now'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Section 1: Today's Occurrences */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <CalendarCheck size={18} color={THEME.colors.textPrimary} />
              <Text style={styles.sectionTitle}>Today's Schedule</Text>
            </View>
            <Text style={styles.sectionSub}>Pay full, edit amount, or skip</Text>
          </View>

          {todayFixedExpenses.length === 0 ? (
            <View style={styles.emptyOccurrenceBox}>
              <Text style={styles.emptyText}>No fixed expenses due for today.</Text>
            </View>
          ) : (
            todayFixedExpenses.map((item) => (
              <TodayOccurrenceCard
                key={item.occurrenceId}
                item={item}
                onPay={payFixedExpense}
                onEdit={(it) => setEditingOccurrence(it)}
                onSkip={skipFixedExpense}
              />
            ))
          )}
        </View>

        {/* Section 2: All Configured Recurring Rules */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <Repeat size={18} color={THEME.colors.textPrimary} />
              <Text style={styles.sectionTitle}>Recurring Rules</Text>
            </View>
            <Text style={styles.sectionSub}>{fixedExpenses.length} rules configured</Text>
          </View>

          {fixedExpenses.length === 0 ? (
            <EmptyState
              icon={<Repeat size={32} color={THEME.colors.primary} />}
              title="No recurring expenses"
              description="Add recurring rules like Milk (₹60/day), Travel (₹40/day), or Rent (₹5,000/month)."
              actionTitle="Add Recurring Expense"
              onAction={() => {
                setEditingRule(null);
                setShowAddModal(true);
              }}
            />
          ) : (
            fixedExpenses.map((rule) => (
              <FixedExpenseCard
                key={rule.id}
                rule={rule}
                onEdit={() => {
                  setEditingRule(rule);
                  setShowAddModal(true);
                }}
                onToggleActive={(active) => toggleFixedExpenseActive(rule.id, active)}
                onDelete={() => setDeletingRuleId(rule.id)}
              />
            ))
          )}
        </View>
      </ScrollView>

      {/* Add / Edit Fixed Expense Rule Modal */}
      <AddEditFixedExpenseModal
        visible={showAddModal}
        initialData={editingRule}
        categories={categories}
        onClose={() => {
          setShowAddModal(false);
          setEditingRule(null);
        }}
        onSubmit={async (params) => {
          if (editingRule) {
            return await updateFixedExpense(editingRule.id, params);
          } else {
            return await addFixedExpense(params);
          }
        }}
        onAddCustomCategory={addCustomCategory}
      />

      {/* Edit Today's Occurrence Amount Modal (e.g. Pay ₹15 instead of ₹40) */}
      <EditTodayAmountModal
        visible={!!editingOccurrence}
        item={editingOccurrence}
        onClose={() => setEditingOccurrence(null)}
        onConfirmPay={async (id, amt) => {
          await payFixedExpense(id, amt);
        }}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        visible={!!deletingRuleId}
        title="Delete Recurring Rule"
        message="Are you sure you want to delete this recurring expense? Past transaction history will be preserved."
        confirmTitle="Delete"
        confirmVariant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeletingRuleId(null)}
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
    paddingBottom: 40,
  },
  headerAddBtn: {
    width: 36,
    height: 36,
    borderRadius: THEME.borderRadius.full,
    backgroundColor: THEME.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...THEME.shadows.subtle,
  },
  kpiCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.borderRadius.xl,
    padding: THEME.spacing.md,
    marginTop: THEME.spacing.sm,
    marginBottom: THEME.spacing.md,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    ...THEME.shadows.card,
  },
  kpiLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  kpiIconCircle: {
    width: 44,
    height: 44,
    borderRadius: THEME.borderRadius.xl,
    backgroundColor: THEME.colors.indigoLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  kpiLabel: {
    fontSize: THEME.typography.sizes.xs,
    color: THEME.colors.textSecondary,
    fontWeight: THEME.typography.weights.medium,
  },
  kpiValue: {
    fontSize: THEME.typography.sizes.lg,
    fontWeight: THEME.typography.weights.heavy,
    color: THEME.colors.textPrimary,
  },
  kpiBadge: {
    backgroundColor: THEME.colors.primaryMuted,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: THEME.borderRadius.full,
  },
  kpiBadgeText: {
    fontSize: THEME.typography.sizes.xs,
    fontWeight: THEME.typography.weights.bold,
    color: THEME.colors.primaryDark,
  },
  remindersCard: {
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.borderRadius.xxl,
    padding: THEME.spacing.md,
    marginBottom: THEME.spacing.lg,
    borderWidth: 1.5,
    borderColor: THEME.colors.primaryBorder,
    ...THEME.shadows.card,
  },
  remindersHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: THEME.spacing.sm,
  },
  reminderIconCircle: {
    width: 38,
    height: 38,
    borderRadius: THEME.borderRadius.lg,
    backgroundColor: THEME.colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reminderHeaderText: {
    flex: 1,
  },
  reminderTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  reminderTitle: {
    fontSize: THEME.typography.sizes.sm,
    fontWeight: THEME.typography.weights.bold,
    color: THEME.colors.textPrimary,
  },
  activePill: {
    backgroundColor: THEME.colors.primaryMuted,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: THEME.borderRadius.full,
  },
  activePillText: {
    fontSize: 10,
    fontWeight: THEME.typography.weights.bold,
    color: THEME.colors.primaryDark,
  },
  reminderSub: {
    fontSize: 11,
    color: THEME.colors.textSecondary,
    lineHeight: 16,
    marginTop: 3,
  },
  slotsRow: {
    flexDirection: 'row',
    gap: 10,
    marginVertical: THEME.spacing.sm,
  },
  slotBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: THEME.colors.surfaceSubtle,
    padding: 10,
    borderRadius: THEME.borderRadius.lg,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  slotTime: {
    fontSize: THEME.typography.sizes.xs,
    fontWeight: THEME.typography.weights.bold,
    color: THEME.colors.textPrimary,
  },
  slotLabel: {
    fontSize: 10,
    color: THEME.colors.textSecondary,
  },
  reminderSuccessBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.primaryMuted,
    padding: 8,
    borderRadius: THEME.borderRadius.md,
    gap: 6,
    marginBottom: THEME.spacing.sm,
  },
  reminderSuccessText: {
    fontSize: 11,
    color: THEME.colors.primaryDark,
    fontWeight: THEME.typography.weights.semibold,
    flex: 1,
  },
  testReminderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: THEME.colors.primary,
    paddingVertical: 10,
    borderRadius: THEME.borderRadius.lg,
  },
  testReminderBtnText: {
    fontSize: THEME.typography.sizes.xs,
    fontWeight: THEME.typography.weights.bold,
    color: '#FFF',
  },
  section: {
    marginBottom: THEME.spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: THEME.spacing.sm,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: THEME.typography.sizes.sm,
    fontWeight: THEME.typography.weights.bold,
    color: THEME.colors.textPrimary,
  },
  sectionSub: {
    fontSize: THEME.typography.sizes.xs,
    color: THEME.colors.textMuted,
  },
  emptyOccurrenceBox: {
    backgroundColor: THEME.colors.surface,
    padding: THEME.spacing.lg,
    borderRadius: THEME.borderRadius.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  emptyText: {
    fontSize: THEME.typography.sizes.xs,
    color: THEME.colors.textMuted,
    fontStyle: 'italic',
  },
});
