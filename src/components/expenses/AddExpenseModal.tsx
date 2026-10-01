// AddExpenseModal: Modal for logging manual expenses

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
import { X, Calendar } from 'lucide-react-native';
import { THEME } from '../../constants/theme';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { CategorySelector } from '../common/CategorySelector';
import { CategoryRow } from '../../types/database';
import { getTodayDateString } from '../../utils/dateUtils';
import { parseCurrencyInput } from '../../utils/currency';

interface AddExpenseModalProps {
  visible: boolean;
  categories: CategoryRow[];
  onClose: () => void;
  onSubmit: (data: {
    amount: number;
    categoryId?: string;
    categoryName: string;
    description: string;
    expenseDate: string;
    notes?: string;
  }) => Promise<{ error: Error | null }>;
  onAddCustomCategory?: (name: string, icon?: string, color?: string) => Promise<any>;
}

export const AddExpenseModal: React.FC<AddExpenseModalProps> = ({
  visible,
  categories,
  onClose,
  onSubmit,
  onAddCustomCategory,
}) => {
  const [amountStr, setAmountStr] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Food');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | undefined>();
  const [description, setDescription] = useState<string>('');
  const [expenseDate, setExpenseDate] = useState<string>(getTodayDateString());
  const [notes, setNotes] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const quickAmounts = [50, 100, 250, 500, 1000];

  const handleReset = () => {
    setAmountStr('');
    setSelectedCategory('Food');
    setSelectedCategoryId(undefined);
    setDescription('');
    setExpenseDate(getTodayDateString());
    setNotes('');
    setError(null);
    setLoading(false);
  };

  const handleSubmit = async () => {
    const amount = parseCurrencyInput(amountStr);
    if (amount <= 0) {
      setError('Please enter an amount greater than 0');
      return;
    }
    if (!description.trim()) {
      setError('Please enter an expense description');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const res = await onSubmit({
        amount,
        categoryId: selectedCategoryId,
        categoryName: selectedCategory,
        description: description.trim(),
        expenseDate,
        notes: notes.trim() || undefined,
      });

      if (res.error) {
        setError(res.error.message || 'Failed to save expense');
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
            <Text style={styles.headerTitle}>Add Expense</Text>
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeBtn}
              activeOpacity={0.7}
            >
              <X size={20} color={THEME.colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>
            {/* Amount Input */}
            <Input
              label="Amount (₹)"
              placeholder="0.00"
              prefix="₹"
              keyboardType="decimal-pad"
              value={amountStr}
              onChangeText={(text) => {
                setAmountStr(text);
                setError(null);
              }}
              inputStyle={styles.amountInput}
            />

            {/* Quick Amount Chips */}
            <View style={styles.quickChipsRow}>
              {quickAmounts.map((q) => (
                <TouchableOpacity
                  key={q}
                  style={styles.quickChip}
                  onPress={() => setAmountStr(String(q))}
                  activeOpacity={0.8}
                >
                  <Text style={styles.quickChipText}>+₹{q}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Category Selector */}
            <CategorySelector
              selectedCategoryName={selectedCategory}
              onSelectCategory={(name, id) => {
                setSelectedCategory(name);
                setSelectedCategoryId(id);
              }}
              categories={categories}
              onAddCustomCategory={onAddCustomCategory}
            />

            {/* Description */}
            <Input
              label="Description"
              placeholder="e.g. Lunch with team, Groceries"
              value={description}
              onChangeText={(text) => {
                setDescription(text);
                setError(null);
              }}
            />

            {/* Date */}
            <Input
              label="Date"
              placeholder="YYYY-MM-DD"
              value={expenseDate}
              onChangeText={setExpenseDate}
              leftIcon={<Calendar size={18} color={THEME.colors.textMuted} />}
              helperText="Defaults to today"
            />

            {/* Notes */}
            <Input
              label="Optional Notes"
              placeholder="Additional details (optional)"
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={2}
            />

            {error && <Text style={styles.errorBanner}>{error}</Text>}
          </ScrollView>

          {/* Footer Submit Button */}
          <View style={styles.footer}>
            <Button
              title="Save Expense"
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
  quickChipsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: THEME.spacing.md,
    marginTop: -4,
  },
  quickChip: {
    backgroundColor: THEME.colors.primaryMuted,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: THEME.borderRadius.full,
    borderWidth: 1,
    borderColor: THEME.colors.primaryBorder,
  },
  quickChipText: {
    fontSize: THEME.typography.sizes.xs,
    fontWeight: THEME.typography.weights.semibold,
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
