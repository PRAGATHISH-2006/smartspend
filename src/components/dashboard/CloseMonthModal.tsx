// CloseMonthModal: Modal to close active month and rollover surplus balance to next cycle
import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import {
  X,
  FolderArchive,
  CheckCircle2,
  AlertTriangle,
  Coins,
  ShieldCheck,
} from 'lucide-react-native';
import { THEME } from '../../constants/theme';
import { Button } from '../common/Button';
import { formatINR } from '../../utils/currency';

interface CloseMonthModalProps {
  visible: boolean;
  onClose: () => void;
  periodStartFormatted?: string;
  periodEndFormatted?: string;
  totalMoneyAdded: number;
  totalExpenses: number;
  currentBalance: number;
  todayFixedExpenses?: any[];
  onPayFixedExpense?: any;
  onSkipFixedExpense?: any;
  onConfirmClose: () => Promise<{
    success: boolean;
    rolloverAmount: number;
    message?: string;
    error?: string;
    [key: string]: any;
  }>;
}

export const CloseMonthModal: React.FC<CloseMonthModalProps> = ({
  visible,
  onClose,
  periodStartFormatted,
  periodEndFormatted,
  totalMoneyAdded,
  totalExpenses,
  currentBalance,
  onConfirmClose,
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [closedResult, setClosedResult] = useState<{
    success: boolean;
    rolloverAmount: number;
    message?: string;
  } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const rolloverAmount = Math.max(0, currentBalance);

  const handleCloseMonth = async () => {
    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await onConfirmClose();
      if (!res.success) {
        setErrorMsg(res.error || 'Failed to close month.');
      } else {
        setClosedResult(res);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error occurred while closing month.');
    } finally {
      setLoading(false);
    }
  };

  const handleModalClose = () => {
    setClosedResult(null);
    setErrorMsg(null);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleModalClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.overlay}
      >
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <View style={[styles.iconCircle, closedResult && styles.iconCircleSuccess]}>
                {closedResult ? (
                  <CheckCircle2 size={22} color="#059669" />
                ) : (
                  <FolderArchive size={22} color={THEME.colors.primary} />
                )}
              </View>
              <View>
                <Text style={styles.title}>
                  {closedResult ? 'Month Successfully Closed' : 'Close This Month'}
                </Text>
                <Text style={styles.subtitle}>
                  {closedResult
                    ? 'Active data cleared & surplus rolled over'
                    : 'Clear active data, rollover surplus & advance cycle'}
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={handleModalClose} style={styles.closeBtn}>
              <X size={20} color={THEME.colors.textMuted} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* 1. SUCCESS VIEW (After Month Closed) */}
            {closedResult ? (
              <View style={styles.successWrapper}>
                <View style={styles.successBanner}>
                  <Text style={styles.successBannerTitle}>🎉 Cycle Successfully Closed!</Text>
                  <Text style={styles.successBannerSub}>{closedResult.message}</Text>
                </View>

                {/* Rollover Card */}
                {closedResult.rolloverAmount > 0 && (
                  <View style={styles.rolloverHighlightCard}>
                    <Coins size={22} color="#047857" />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.rolloverHighlightLabel}>Unspent Balance Carried Forward</Text>
                      <Text style={styles.rolloverHighlightAmount}>
                        {formatINR(closedResult.rolloverAmount)}
                      </Text>
                      <Text style={styles.rolloverHighlightDesc}>
                        This exact amount remains available as your starting funds in your next cycle wallet.
                      </Text>
                    </View>
                  </View>
                )}

                <Button
                  title="Done & Return to Dashboard"
                  onPress={handleModalClose}
                  variant="primary"
                  style={styles.doneBtn}
                />
              </View>
            ) : (
              /* 2. CONFIRMATION VIEW (Before Closing) */
              <View>
                {/* Financial Cycle Summary Table */}
                <View style={styles.summaryCard}>
                  <Text style={styles.summaryTitle}>
                    Cycle: {periodStartFormatted || 'Current Period'} – {periodEndFormatted || 'Today'}
                  </Text>
                  <View style={styles.summaryDivider} />

                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryRowLabel}>Total Money Added:</Text>
                    <Text style={[styles.summaryRowVal, { color: '#059669' }]}>
                      +{formatINR(totalMoneyAdded)}
                    </Text>
                  </View>

                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryRowLabel}>Total Expenses Incurred:</Text>
                    <Text style={[styles.summaryRowVal, { color: '#DC2626' }]}>
                      -{formatINR(totalExpenses)}
                    </Text>
                  </View>

                  <View style={styles.summaryDivider} />

                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryBalanceLabel}>Closing Net Balance:</Text>
                    <Text style={styles.summaryBalanceVal}>{formatINR(currentBalance)}</Text>
                  </View>
                </View>

                {/* Rollover Surplus Preview Box */}
                {rolloverAmount > 0 ? (
                  <View style={styles.rolloverBox}>
                    <View style={styles.rolloverHeader}>
                      <Coins size={20} color="#047857" />
                      <Text style={styles.rolloverTitle}>💰 Unspent Balance Carried Forward</Text>
                    </View>
                    <Text style={styles.rolloverAmount}>{formatINR(rolloverAmount)}</Text>
                    <Text style={styles.rolloverText}>
                      Your remaining balance of {formatINR(rolloverAmount)} will carry over directly into your next cycle wallet so you can continue spending smoothly!
                    </Text>
                  </View>
                ) : (
                  <View style={styles.noRolloverBox}>
                    <AlertTriangle size={18} color="#B45309" />
                    <Text style={styles.noRolloverText}>
                      Your balance is currently {formatINR(currentBalance)}. No surplus balance will be rolled over.
                    </Text>
                  </View>
                )}

                {errorMsg && (
                  <View style={styles.errorBox}>
                    <Text style={styles.errorText}>{errorMsg}</Text>
                  </View>
                )}

                {/* Action Buttons */}
                <View style={styles.actionRow}>
                  <Button
                    title={loading ? 'Closing Month...' : 'Confirm & Close This Month'}
                    onPress={handleCloseMonth}
                    loading={loading}
                    disabled={loading}
                    variant="primary"
                    icon={<ShieldCheck size={16} color="#FFF" />}
                    style={styles.confirmBtn}
                  />

                  <Button
                    title="Cancel"
                    onPress={handleModalClose}
                    variant="subtle"
                    style={{ marginTop: 8 }}
                  />
                </View>
              </View>
            )}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: THEME.colors.surface,
    borderTopLeftRadius: THEME.borderRadius.xxl,
    borderTopRightRadius: THEME.borderRadius.xxl,
    maxHeight: '92%',
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
    ...THEME.shadows.elevated,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: THEME.spacing.xl,
    paddingTop: THEME.spacing.lg,
    paddingBottom: THEME.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.border,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: THEME.colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircleSuccess: {
    backgroundColor: '#ECFDF5',
  },
  title: {
    fontSize: THEME.typography.sizes.lg,
    fontWeight: THEME.typography.weights.bold,
    color: THEME.colors.textPrimary,
  },
  subtitle: {
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
  content: {
    paddingHorizontal: THEME.spacing.xl,
    paddingTop: THEME.spacing.md,
  },
  summaryCard: {
    backgroundColor: THEME.colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    borderRadius: THEME.borderRadius.xl,
    padding: THEME.spacing.md,
    marginBottom: THEME.spacing.md,
  },
  summaryTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#EAB308',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: THEME.colors.border,
    marginVertical: 10,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 4,
  },
  summaryRowLabel: {
    fontSize: 13,
    color: THEME.colors.textSecondary,
  },
  summaryRowVal: {
    fontSize: 14,
    fontWeight: '700',
  },
  summaryBalanceLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: THEME.colors.textPrimary,
  },
  summaryBalanceVal: {
    fontSize: 17,
    fontWeight: '800',
    color: '#EAB308',
  },
  rolloverBox: {
    backgroundColor: 'rgba(234, 179, 8, 0.12)',
    borderWidth: 1.5,
    borderColor: 'rgba(234, 179, 8, 0.35)',
    borderRadius: THEME.borderRadius.xl,
    padding: THEME.spacing.md,
    marginBottom: THEME.spacing.md,
  },
  rolloverHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rolloverTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FACC15',
  },
  rolloverAmount: {
    fontSize: 24,
    fontWeight: '800',
    color: '#EAB308',
    marginVertical: 4,
  },
  rolloverText: {
    fontSize: 12,
    color: '#FEF08A',
    lineHeight: 17,
  },
  noRolloverBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderRadius: THEME.borderRadius.lg,
    padding: 12,
    marginBottom: THEME.spacing.md,
  },
  noRolloverText: {
    fontSize: 12,
    color: '#FCA5A5',
    flex: 1,
  },
  errorBox: {
    backgroundColor: 'rgba(220, 38, 38, 0.15)',
    borderWidth: 1,
    borderColor: '#DC2626',
    padding: 10,
    borderRadius: THEME.borderRadius.md,
    marginBottom: THEME.spacing.md,
  },
  errorText: {
    fontSize: 12,
    color: '#FCA5A5',
    fontWeight: '600',
  },
  actionRow: {
    marginBottom: THEME.spacing.lg,
  },
  confirmBtn: {
    backgroundColor: '#DC2626',
  },
  successWrapper: {
    paddingBottom: THEME.spacing.lg,
  },
  successBanner: {
    backgroundColor: 'rgba(234, 179, 8, 0.15)',
    borderWidth: 1.5,
    borderColor: '#EAB308',
    padding: THEME.spacing.lg,
    borderRadius: THEME.borderRadius.xl,
    alignItems: 'center',
    marginBottom: THEME.spacing.md,
  },
  successBannerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FACC15',
    marginBottom: 4,
  },
  successBannerSub: {
    fontSize: 13,
    color: '#FEF08A',
    textAlign: 'center',
  },
  rolloverHighlightCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: 'rgba(234, 179, 8, 0.12)',
    borderWidth: 1,
    borderColor: '#EAB308',
    borderRadius: THEME.borderRadius.lg,
    padding: THEME.spacing.md,
    marginBottom: THEME.spacing.md,
  },
  rolloverHighlightLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FACC15',
    textTransform: 'uppercase',
  },
  rolloverHighlightAmount: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FACC15',
    marginVertical: 2,
  },
  rolloverHighlightDesc: {
    fontSize: 11,
    color: '#FEF08A',
  },
  doneBtn: {
    marginTop: THEME.spacing.md,
  },
});
