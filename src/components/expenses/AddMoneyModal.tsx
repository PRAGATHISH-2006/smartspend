// AddMoneyModal: Modal for topping up wallet balance

import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { X, Wallet, ArrowUpRight } from 'lucide-react-native';
import { THEME } from '../../constants/theme';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { parseCurrencyInput, formatINR } from '../../utils/currency';

interface AddMoneyModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (amount: number, description?: string) => Promise<{ error: Error | null }>;
}

export const AddMoneyModal: React.FC<AddMoneyModalProps> = ({
  visible,
  onClose,
  onSubmit,
}) => {
  const [amountStr, setAmountStr] = useState<string>('');
  const [description, setDescription] = useState<string>('Salary / Wallet Top-up');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const presets = [1000, 2000, 5000, 10000, 20000];

  const handleReset = () => {
    setAmountStr('');
    setDescription('Salary / Wallet Top-up');
    setError(null);
    setLoading(false);
  };

  const handleSubmit = async () => {
    const amount = parseCurrencyInput(amountStr);
    if (amount <= 0) {
      setError('Please enter a valid deposit amount greater than 0');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const res = await onSubmit(amount, description.trim());
      if (res.error) {
        setError(res.error.message || 'Failed to add money');
      } else {
        handleReset();
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
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
        style={styles.overlay}
      >
        <View style={styles.sheetContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <View style={styles.iconCircle}>
                <Wallet size={18} color="#FFF" />
              </View>
              <Text style={styles.headerTitle}>Add Money to Wallet</Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeBtn}
              activeOpacity={0.7}
            >
              <X size={20} color={THEME.colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>
            {/* Amount */}
            <Input
              label="Amount to Add (₹)"
              placeholder="e.g. 20000"
              prefix="₹"
              keyboardType="decimal-pad"
              value={amountStr}
              onChangeText={(text) => {
                setAmountStr(text);
                setError(null);
              }}
              inputStyle={styles.amountInput}
            />

            {/* Quick Presets */}
            <Text style={styles.presetLabel}>Quick Presets</Text>
            <View style={styles.presetsGrid}>
              {presets.map((p) => (
                <TouchableOpacity
                  key={p}
                  style={styles.presetChip}
                  onPress={() => setAmountStr(String(p))}
                  activeOpacity={0.8}
                >
                  <ArrowUpRight size={14} color={THEME.colors.primaryDark} />
                  <Text style={styles.presetChipText}>{formatINR(p)}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Description */}
            <Input
              label="Source / Description"
              placeholder="e.g. Monthly Salary, Bank Transfer"
              value={description}
              onChangeText={setDescription}
              helperText="This top-up will be recorded in your transaction history"
            />

            {error && <Text style={styles.errorBanner}>{error}</Text>}
          </ScrollView>

          {/* Footer Submit Button */}
          <View style={styles.footer}>
            <Button
              title="Add Money"
              onPress={handleSubmit}
              variant="primary"
              size="lg"
              loading={loading}
              fullWidth
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: THEME.colors.surface,
    borderTopLeftRadius: THEME.borderRadius.xxl,
    borderTopRightRadius: THEME.borderRadius.xxl,
    maxHeight: '90%',
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    ...THEME.shadows.elevated,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: THEME.spacing.lg,
    paddingTop: THEME.spacing.lg,
    paddingBottom: THEME.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.border,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: THEME.borderRadius.full,
    backgroundColor: THEME.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: THEME.typography.sizes.lg,
    fontWeight: THEME.typography.weights.bold,
    color: THEME.colors.textPrimary,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: THEME.borderRadius.full,
    backgroundColor: THEME.colors.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollBody: {
    paddingHorizontal: THEME.spacing.lg,
    paddingVertical: THEME.spacing.md,
  },
  amountInput: {
    fontSize: THEME.typography.sizes.xl,
    fontWeight: THEME.typography.weights.bold,
  },
  presetLabel: {
    fontSize: THEME.typography.sizes.xs,
    fontWeight: THEME.typography.weights.semibold,
    color: THEME.colors.textSecondary,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  presetsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: THEME.spacing.lg,
  },
  presetChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.primaryMuted,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: THEME.borderRadius.lg,
    borderWidth: 1,
    borderColor: THEME.colors.primaryBorder,
    gap: 4,
  },
  presetChipText: {
    fontSize: THEME.typography.sizes.sm,
    fontWeight: THEME.typography.weights.bold,
    color: THEME.colors.primaryDark,
  },
  errorBanner: {
    backgroundColor: THEME.colors.roseLight,
    color: THEME.colors.danger,
    padding: 10,
    borderRadius: THEME.borderRadius.md,
    fontSize: THEME.typography.sizes.xs,
    fontWeight: THEME.typography.weights.semibold,
    marginVertical: 8,
    textAlign: 'center',
  },
  footer: {
    paddingHorizontal: THEME.spacing.lg,
    paddingTop: THEME.spacing.sm,
  },
});
