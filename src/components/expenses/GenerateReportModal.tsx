// GenerateReportModal: Modal to pick date range and email financial report to user
import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import {
  X,
  Calendar,
  Mail,
  Send,
  Download,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
} from 'lucide-react-native';
import { THEME } from '../../constants/theme';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { CalendarPicker } from '../common/CalendarPicker';
import { useAuth } from '../../context/AuthContext';
import { useFinancial } from '../../context/FinancialContext';
import {
  triggerCustomDateRangeEmail,
  generateTransactionsCsv,
  downloadFile,
} from '../../services/emailReportService';
import {
  getTodayDateString,
  getLastWeekRange,
  getCurrentMonthRange,
} from '../../utils/dateUtils';
import { subDays, format, parseISO, startOfMonth, endOfMonth, subMonths } from 'date-fns';

interface GenerateReportModalProps {
  visible: boolean;
  onClose: () => void;
}

export const GenerateReportModal: React.FC<GenerateReportModalProps> = ({
  visible,
  onClose,
}) => {
  const { user, profile } = useAuth();
  const { unifiedTransactions } = useFinancial();

  const recipientEmail = 'selvanpragathish@gmail.com';

  const todayStr = getTodayDateString();
  const monthRange = getCurrentMonthRange();

  const [startDate, setStartDate] = useState<string>(monthRange.monthStart);
  const [endDate, setEndDate] = useState<string>(todayStr);
  const [activePicker, setActivePicker] = useState<'start' | 'end' | null>(null);
  const [sending, setSending] = useState<boolean>(false);
  const [downloading, setDownloading] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  // Set default dates on open
  useEffect(() => {
    if (visible) {
      const current = getCurrentMonthRange();
      setStartDate(current.monthStart);
      setEndDate(getTodayDateString());
      setStatusMessage(null);
    }
  }, [visible]);

  // Preset handlers
  const applyPreset = (preset: '7days' | '30days' | 'thisMonth' | 'lastMonth') => {
    const today = new Date();
    setStatusMessage(null);

    if (preset === '7days') {
      const { weekStart, weekEnd } = getLastWeekRange(today);
      setStartDate(weekStart);
      setEndDate(weekEnd);
    } else if (preset === '30days') {
      setStartDate(format(subDays(today, 29), 'yyyy-MM-dd'));
      setEndDate(format(today, 'yyyy-MM-dd'));
    } else if (preset === 'thisMonth') {
      const range = getCurrentMonthRange(today);
      setStartDate(range.monthStart);
      setEndDate(format(today, 'yyyy-MM-dd'));
    } else if (preset === 'lastMonth') {
      const prevMonth = subMonths(today, 1);
      setStartDate(format(startOfMonth(prevMonth), 'yyyy-MM-dd'));
      setEndDate(format(endOfMonth(prevMonth), 'yyyy-MM-dd'));
    }
  };

  // Handle Send Report
  const handleSendReport = async () => {
    if (!user?.id) {
      setStatusMessage({ type: 'error', text: 'You must be logged in to send reports.' });
      return;
    }

    if (!startDate || !endDate) {
      setStatusMessage({ type: 'error', text: 'Please select both start and end dates.' });
      return;
    }

    if (startDate > endDate) {
      setStatusMessage({ type: 'error', text: 'Start date cannot be after end date.' });
      return;
    }

    setSending(true);
    setStatusMessage(null);

    try {
      const result = await triggerCustomDateRangeEmail({
        userId: user.id,
        startDate,
        endDate,
      });

      if (result.success) {
        setStatusMessage({
          type: 'success',
          text: `Report for ${startDate} to ${endDate} has been dispatched to ${recipientEmail}! Please check your Inbox.`,
        });
      } else {
        setStatusMessage({
          type: 'error',
          text: result.message || 'Failed to dispatch report. Please check proxy or internet connection.',
        });
      }
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err.message || 'An error occurred while compiling your report.',
      });
    } finally {
      setSending(false);
    }
  };

  // Handle Download CSV
  const handleDownloadCsv = () => {
    setDownloading(true);
    try {
      // Filter transactions within range
      const inRange = unifiedTransactions.filter(
        (tx) => tx.date >= startDate && tx.date <= endDate
      );
      const csv = generateTransactionsCsv(inRange.length > 0 ? inRange : unifiedTransactions);
      downloadFile(`SmartSpend_Transactions_${startDate}_to_${endDate}.csv`, csv, 'text/csv');
      setStatusMessage({
        type: 'success',
        text: `CSV ledger downloaded for ${startDate} to ${endDate}!`,
      });
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: 'Failed to generate CSV.' });
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.modalOverlay}
      >
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <View style={styles.headerTitleRow}>
              <View style={styles.iconCircle}>
                <FileSpreadsheet size={20} color={THEME.colors.primary} />
              </View>
              <View>
                <Text style={styles.modalTitle}>Generate Report</Text>
                <Text style={styles.modalSubtitle}>Select dates to email your transaction report</Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeBtn}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <X size={20} color={THEME.colors.textMuted} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {/* Recipient Notice */}
            <View style={styles.recipientCard}>
              <Mail size={16} color={THEME.colors.indigo} />
              <View style={styles.recipientInfo}>
                <Text style={styles.recipientLabel}>Report will be sent to:</Text>
                <Text style={styles.recipientEmail}>{recipientEmail}</Text>
              </View>
            </View>

            {/* Quick Presets */}
            <Text style={styles.fieldLabel}>Quick Date Presets</Text>
            <View style={styles.presetRow}>
              <TouchableOpacity
                style={styles.presetChip}
                onPress={() => applyPreset('7days')}
                activeOpacity={0.7}
              >
                <Text style={styles.presetChipText}>Last 7 Days</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.presetChip}
                onPress={() => applyPreset('30days')}
                activeOpacity={0.7}
              >
                <Text style={styles.presetChipText}>Last 30 Days</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.presetChip}
                onPress={() => applyPreset('thisMonth')}
                activeOpacity={0.7}
              >
                <Text style={styles.presetChipText}>This Month</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.presetChip}
                onPress={() => applyPreset('lastMonth')}
                activeOpacity={0.7}
              >
                <Text style={styles.presetChipText}>Last Month</Text>
              </TouchableOpacity>
            </View>

            {/* Date Range Inputs */}
            <View style={styles.dateInputsRow}>
              <View style={styles.dateInputCol}>
                <Text style={styles.fieldLabel}>Start Date</Text>
                <TouchableOpacity
                  style={[
                    styles.dateSelectBtn,
                    activePicker === 'start' && styles.dateSelectBtnActive,
                  ]}
                  onPress={() => setActivePicker(activePicker === 'start' ? null : 'start')}
                  activeOpacity={0.7}
                >
                  <Calendar size={16} color={activePicker === 'start' ? THEME.colors.primary : THEME.colors.textMuted} />
                  <Text style={[styles.dateSelectBtnText, activePicker === 'start' && { color: THEME.colors.primary }]}>
                    {startDate || 'Select Start'}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.dateInputCol}>
                <Text style={styles.fieldLabel}>End Date</Text>
                <TouchableOpacity
                  style={[
                    styles.dateSelectBtn,
                    activePicker === 'end' && styles.dateSelectBtnActive,
                  ]}
                  onPress={() => setActivePicker(activePicker === 'end' ? null : 'end')}
                  activeOpacity={0.7}
                >
                  <Calendar size={16} color={activePicker === 'end' ? THEME.colors.primary : THEME.colors.textMuted} />
                  <Text style={[styles.dateSelectBtnText, activePicker === 'end' && { color: THEME.colors.primary }]}>
                    {endDate || 'Select End'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Active Calendar Picker */}
            {activePicker === 'start' && (
              <View style={{ marginBottom: 16 }}>
                <CalendarPicker
                  title="Pick Report Start Date"
                  selectedDate={startDate}
                  maxDate={endDate || todayStr}
                  onSelectDate={(date) => {
                    setStartDate(date);
                    setActivePicker(null);
                    setStatusMessage(null);
                  }}
                />
              </View>
            )}

            {activePicker === 'end' && (
              <View style={{ marginBottom: 16 }}>
                <CalendarPicker
                  title="Pick Report End Date"
                  selectedDate={endDate}
                  minDate={startDate}
                  maxDate={todayStr}
                  onSelectDate={(date) => {
                    setEndDate(date);
                    setActivePicker(null);
                    setStatusMessage(null);
                  }}
                />
              </View>
            )}

            {/* Status Feedback Message */}
            {statusMessage && (
              <View
                style={[
                  styles.statusCard,
                  statusMessage.type === 'success' ? styles.statusSuccess : styles.statusError,
                ]}
              >
                {statusMessage.type === 'success' ? (
                  <CheckCircle2 size={18} color="#059669" />
                ) : (
                  <AlertCircle size={18} color={THEME.colors.danger} />
                )}
                <Text
                  style={[
                    styles.statusText,
                    statusMessage.type === 'success'
                      ? styles.statusTextSuccess
                      : styles.statusTextError,
                  ]}
                >
                  {statusMessage.text}
                </Text>
              </View>
            )}

            {/* Detailed Description */}
            <View style={styles.infoBox}>
              <Text style={styles.infoBoxTitle}>What will be included in the report?</Text>
              <Text style={styles.infoBoxText}>
                • Starting balance, wallet additions, manual expenses & fixed expenses{'\n'}
                • Category-wise expense breakdown with visual percentage charts{'\n'}
                • Full chronological transaction ledger during this date window{'\n'}
                • Safe-to-spend balance and daily spending guidance
              </Text>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <Button
                title={sending ? 'Sending to Mail...' : 'Send Report to My Mail (OK)'}
                onPress={handleSendReport}
                loading={sending}
                variant="primary"
                icon={<Send size={16} color="#FFF" />}
                style={styles.sendBtn}
              />

              <Button
                title={downloading ? 'Preparing CSV...' : 'Download CSV Backup'}
                onPress={handleDownloadCsv}
                loading={downloading}
                variant="outline"
                icon={<Download size={16} color={THEME.colors.primary} />}
                style={styles.downloadBtn}
              />
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: THEME.colors.surface,
    borderTopLeftRadius: THEME.borderRadius.xxl,
    borderTopRightRadius: THEME.borderRadius.xxl,
    maxHeight: '90%',
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
    ...THEME.shadows.elevated,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: THEME.spacing.xl,
    paddingTop: THEME.spacing.lg,
    paddingBottom: THEME.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.border,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: THEME.colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: THEME.typography.sizes.lg,
    fontWeight: THEME.typography.weights.bold,
    color: THEME.colors.textPrimary,
  },
  modalSubtitle: {
    fontSize: THEME.typography.sizes.xs,
    color: THEME.colors.textMuted,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: THEME.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: THEME.spacing.xl,
    paddingTop: THEME.spacing.md,
  },
  recipientCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    borderWidth: 1,
    borderColor: '#C7D2FE',
    borderRadius: THEME.borderRadius.lg,
    padding: THEME.spacing.md,
    gap: 12,
    marginBottom: THEME.spacing.md,
  },
  recipientInfo: {
    flex: 1,
  },
  recipientLabel: {
    fontSize: 11,
    color: '#4F46E5',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  recipientEmail: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E1B4B',
    marginTop: 2,
  },
  fieldLabel: {
    fontSize: THEME.typography.sizes.xs,
    fontWeight: THEME.typography.weights.semibold,
    color: THEME.colors.textSecondary,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  presetRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: THEME.spacing.md,
  },
  presetChip: {
    backgroundColor: THEME.colors.background,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: THEME.borderRadius.full,
  },
  presetChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: THEME.colors.textPrimary,
  },
  dateInputsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: THEME.spacing.md,
  },
  dateInputCol: {
    flex: 1,
  },
  dateSelectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
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
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: THEME.borderRadius.md,
    gap: 10,
    marginBottom: THEME.spacing.md,
  },
  statusSuccess: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  statusError: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  statusText: {
    fontSize: 13,
    flex: 1,
    lineHeight: 18,
  },
  statusTextSuccess: {
    color: '#065F46',
    fontWeight: '600',
  },
  statusTextError: {
    color: '#991B1B',
    fontWeight: '600',
  },
  infoBox: {
    backgroundColor: THEME.colors.background,
    borderRadius: THEME.borderRadius.lg,
    padding: THEME.spacing.md,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    marginBottom: THEME.spacing.lg,
  },
  infoBoxTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
    marginBottom: 4,
  },
  infoBoxText: {
    fontSize: 12,
    lineHeight: 18,
    color: THEME.colors.textSecondary,
  },
  actionButtons: {
    gap: 10,
    marginBottom: THEME.spacing.lg,
  },
  sendBtn: {
    backgroundColor: THEME.colors.primary,
  },
  downloadBtn: {
    borderColor: THEME.colors.primary,
  },
});
