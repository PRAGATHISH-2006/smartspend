// AddEditFixedExpenseModal: Modal for creating and editing recurring fixed expenses

import React, { useState, useEffect } from 'react';
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
import { X, Calendar, Repeat } from 'lucide-react-native';
import { THEME } from '../../constants/theme';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { CategorySelector } from '../common/CategorySelector';
import { CategoryRow, FixedExpenseRow, FrequencyType } from '../../types/database';
import { getTodayDateString } from '../../utils/dateUtils';
import { parseCurrencyInput } from '../../utils/currency';

interface AddEditFixedExpenseModalProps {
  visible: boolean;
  initialData?: FixedExpenseRow | null;
  categories: CategoryRow[];
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    amount: number;
    categoryId?: string;
    categoryName: string;
    frequency: FrequencyType;
    startDate: string;
    endDate?: string | null;
  }) => Promise<{ error: Error | null }>;
  onAddCustomCategory?: (name: string, icon?: string, color?: string) => Promise<any>;
}

export const AddEditFixedExpenseModal: React.FC<AddEditFixedExpenseModalProps> = ({
  visible,
  initialData,
  categories,
  onClose,
  onSubmit,
  onAddCustomCategory,
}) => {
  const [name, setName] = useState<string>('');
  const [amountStr, setAmountStr] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Bills');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | undefined>();
  const [frequency, setFrequency] = useState<FrequencyType>('daily');
  const [startDate, setStartDate] = useState<string>(getTodayDateString());
  const [endDate, setEndDate] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setAmountStr(String(initialData.amount));
      setSelectedCategory(initialData.category_name);
      setSelectedCategoryId(initialData.category_id || undefined);
      setFrequency(initialData.frequency);
      setStartDate(initialData.start_date);
      setEndDate(initialData.end_date || '');
    } else {
      setName('');
      setAmountStr('');
      setSelectedCategory('Bills');
      setSelectedCategoryId(undefined);
      setFrequency('daily');
      setStartDate(getTodayDateString());
      setEndDate('');
    }
    setError(null);
  }, [initialData, visible]);

  const frequencies: { id: FrequencyType; label: string; desc: string }[] = [
    { id: 'daily', label: 'Daily', desc: 'Every day (Milk, Bus, Breakfast)' },
    { id: 'weekly', label: 'Weekly', desc: 'Every week on same day' },
    { id: 'monthly', label: 'Monthly', desc: 'Every month (Rent, Mobile Recharge)' },
    { id: 'yearly', label: 'Yearly', desc: 'Every year (Insurance, Subscriptions)' },
  ];

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError('Please enter an expense name');
      return;
    }
    const amount = parseCurrencyInput(amountStr);
    if (amount <= 0) {
      setError('Please enter an amount greater than 0');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const res = await onSubmit({
        name: name.trim(),
        amount,
        categoryId: selectedCategoryId,
        categoryName: selectedCategory,
        frequency,
        startDate: startDate.trim() || getTodayDateString(),
        endDate: endDate.trim() || null,
      });

      if (res.error) {
        setError(res.error.message || 'Failed to save recurring expense');
      } else {
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
                <Repeat size={18} color="#FFF" />
              </View>
              <Text style={styles.headerTitle}>
                {initialData ? 'Edit Recurring Expense' : 'Add Recurring Expense'}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
              <X size={20} color={THEME.colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>
            {/* Name */}
            <Input
              label="Expense Name"
              placeholder="e.g. Milk, Bus, Rent, Mobile Recharge"
              value={name}
              onChangeText={(text) => {
                setName(text);
                setError(null);
              }}
            />

            {/* Amount */}
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

            {/* Frequency Selection */}
            <Text style={styles.sectionLabel}>Frequency</Text>
            <View style={styles.freqGrid}>
              {frequencies.map((f) => {
                const isSelected = frequency === f.id;
                return (
                  <TouchableOpacity
                    key={f.id}
                    style={[styles.freqCard, isSelected && styles.freqCardSelected]}
                    onPress={() => setFrequency(f.id)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.freqLabel, isSelected && styles.freqLabelSelected]}>
                      {f.label}
                    </Text>
                    <Text style={[styles.freqDesc, isSelected && styles.freqDescSelected]}>
                      {f.desc}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Category Selector */}
            <CategorySelector
              selectedCategoryName={selectedCategory}
              onSelectCategory={(catName, catId) => {
                setSelectedCategory(catName);
                setSelectedCategoryId(catId);
              }}
              categories={categories}
              onAddCustomCategory={onAddCustomCategory}
            />

            {/* Start Date */}
            <Input
              label="Start Date (YYYY-MM-DD)"
              placeholder="YYYY-MM-DD"
              value={startDate}
              onChangeText={setStartDate}
              leftIcon={<Calendar size={18} color={THEME.colors.textMuted} />}
              helperText="Occurrences will start from this date"
            />

            {/* End Date (Optional) */}
            <Input
              label="End Date (Optional)"
              placeholder="YYYY-MM-DD"
              value={endDate}
              onChangeText={setEndDate}
              leftIcon={<Calendar size={18} color={THEME.colors.textMuted} />}
              helperText="Leave empty to run indefinitely"
            />

            {error && <Text style={styles.errorBanner}>{error}</Text>}
          </ScrollView>

          {/* Footer Submit Button */}
          <View style={styles.footer}>
            <Button
              title={initialData ? 'Update Recurring Rule' : 'Create Recurring Rule'}
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
    backgroundColor: THEME.colors.indigo,
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
  sectionLabel: {
    fontSize: THEME.typography.sizes.sm,
    fontWeight: THEME.typography.weights.semibold,
    color: THEME.colors.textSecondary,
    marginBottom: 8,
  },
  freqGrid: {
    gap: 8,
    marginBottom: THEME.spacing.md,
  },
  freqCard: {
    padding: 12,
    borderRadius: THEME.borderRadius.lg,
    backgroundColor: THEME.colors.surface,
    borderWidth: 1.5,
    borderColor: THEME.colors.border,
  },
  freqCardSelected: {
    backgroundColor: THEME.colors.indigoLight,
    borderColor: THEME.colors.indigo,
  },
  freqLabel: {
    fontSize: THEME.typography.sizes.sm,
    fontWeight: THEME.typography.weights.bold,
    color: THEME.colors.textPrimary,
  },
  freqLabelSelected: {
    color: THEME.colors.indigo,
  },
  freqDesc: {
    fontSize: THEME.typography.sizes.xs,
    color: THEME.colors.textSecondary,
    marginTop: 2,
  },
  freqDescSelected: {
    color: '#3730A3',
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
