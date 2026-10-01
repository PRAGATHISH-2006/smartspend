// EditTodayAmountModal: Modal to adjust and pay a custom amount for today's occurrence
// (e.g. Travel is ₹40/day, but only morning travel happened = pay ₹15)

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  TextInput,
} from 'react-native';
import { X, Edit3, Check, DollarSign } from 'lucide-react-native';
import { THEME } from '../../constants/theme';
import { TodayFixedExpenseItem } from '../../types/financial';
import { formatINR } from '../../utils/currency';

interface EditTodayAmountModalProps {
  visible: boolean;
  item: TodayFixedExpenseItem | null;
  onClose: () => void;
  onConfirmPay: (occurrenceId: string, customAmount: number) => Promise<void>;
}

export const EditTodayAmountModal: React.FC<EditTodayAmountModalProps> = ({
  visible,
  item,
  onClose,
  onConfirmPay,
}) => {
  const [amountStr, setAmountStr] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (item) {
      setAmountStr(String(item.amount));
      setError(null);
    }
  }, [item, visible]);

  if (!item) return null;

  const handlePay = async () => {
    const val = parseFloat(amountStr);
    if (isNaN(val) || val < 0) {
      setError('Please enter a valid amount (₹0 or more).');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await onConfirmPay(item.occurrenceId, val);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to update occurrence');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.overlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.keyboardView}
          >
            <View style={styles.modalCard}>
              {/* Header */}
              <View style={styles.headerRow}>
                <View style={styles.titleIconRow}>
                  <View style={styles.iconCircle}>
                    <Edit3 size={18} color={THEME.colors.primary} />
                  </View>
                  <View>
                    <Text style={styles.modalTitle}>Adjust Today's Amount</Text>
                    <Text style={styles.modalSub}>{item.name}</Text>
                  </View>
                </View>
                <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                  <X size={20} color={THEME.colors.textSecondary} />
                </TouchableOpacity>
              </View>

              {/* Context Box */}
              <View style={styles.ruleBox}>
                <Text style={styles.ruleLabel}>Standard Rule:</Text>
                <Text style={styles.ruleValue}>
                  {formatINR(item.amount)} / {item.frequency}
                </Text>
              </View>

              <Text style={styles.helpText}>
                Example: If your fixed travel is ₹40/day but you only traveled in the morning (costing ₹15), enter ₹15 below to deduct only what you actually spent today.
              </Text>

              {/* Amount Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Amount to Deduct for Today (₹)</Text>
                <View style={styles.inputRow}>
                  <Text style={styles.currencySymbol}>₹</Text>
                  <TextInput
                    style={styles.textInput}
                    keyboardType="numeric"
                    value={amountStr}
                    onChangeText={(txt) => {
                      setAmountStr(txt);
                      setError(null);
                    }}
                    placeholder="Enter amount"
                    placeholderTextColor={THEME.colors.textMuted}
                    autoFocus
                  />
                </View>
              </View>

              {error && <Text style={styles.errorText}>{error}</Text>}

              {/* Action Buttons */}
              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={[styles.btn, styles.cancelBtn]}
                  onPress={onClose}
                  disabled={loading}
                >
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.btn, styles.payBtn]}
                  onPress={handlePay}
                  disabled={loading}
                  activeOpacity={0.8}
                >
                  <Check size={16} color="#FFF" />
                  <Text style={styles.payBtnText}>
                    {loading
                      ? 'Saving...'
                      : `Pay ${amountStr ? `₹${amountStr}` : 'Amount'}`}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: THEME.spacing.lg,
  },
  keyboardView: {
    width: '100%',
    maxWidth: 420,
  },
  modalCard: {
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.borderRadius.xxl,
    padding: THEME.spacing.xl,
    ...THEME.shadows.card,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: THEME.spacing.md,
  },
  titleIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: THEME.borderRadius.lg,
    backgroundColor: THEME.colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: THEME.typography.sizes.md,
    fontWeight: THEME.typography.weights.bold,
    color: THEME.colors.textPrimary,
  },
  modalSub: {
    fontSize: THEME.typography.sizes.xs,
    color: THEME.colors.textSecondary,
    fontWeight: THEME.typography.weights.medium,
  },
  closeBtn: {
    padding: 6,
    borderRadius: THEME.borderRadius.full,
  },
  ruleBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: THEME.colors.surfaceSubtle,
    padding: 10,
    borderRadius: THEME.borderRadius.lg,
    marginBottom: THEME.spacing.sm,
  },
  ruleLabel: {
    fontSize: THEME.typography.sizes.xs,
    color: THEME.colors.textSecondary,
    fontWeight: THEME.typography.weights.medium,
  },
  ruleValue: {
    fontSize: THEME.typography.sizes.xs,
    fontWeight: THEME.typography.weights.bold,
    color: THEME.colors.textPrimary,
  },
  helpText: {
    fontSize: 11,
    color: THEME.colors.textMuted,
    lineHeight: 16,
    marginBottom: THEME.spacing.md,
  },
  inputGroup: {
    marginBottom: THEME.spacing.md,
  },
  inputLabel: {
    fontSize: THEME.typography.sizes.xs,
    fontWeight: THEME.typography.weights.semibold,
    color: THEME.colors.textPrimary,
    marginBottom: 6,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: THEME.colors.primary,
    borderRadius: THEME.borderRadius.xl,
    paddingHorizontal: 14,
    backgroundColor: THEME.colors.surface,
  },
  currencySymbol: {
    fontSize: 18,
    fontWeight: THEME.typography.weights.bold,
    color: THEME.colors.primary,
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 18,
    fontWeight: THEME.typography.weights.bold,
    color: THEME.colors.textPrimary,
    paddingVertical: 12,
  },
  errorText: {
    fontSize: THEME.typography.sizes.xs,
    color: THEME.colors.danger,
    marginBottom: THEME.spacing.sm,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: THEME.spacing.sm,
  },
  btn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: THEME.borderRadius.xl,
  },
  cancelBtn: {
    backgroundColor: THEME.colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  cancelBtnText: {
    fontSize: THEME.typography.sizes.sm,
    fontWeight: THEME.typography.weights.semibold,
    color: THEME.colors.textSecondary,
  },
  payBtn: {
    backgroundColor: THEME.colors.primary,
  },
  payBtnText: {
    fontSize: THEME.typography.sizes.sm,
    fontWeight: THEME.typography.weights.bold,
    color: '#FFFFFF',
  },
});
