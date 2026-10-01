// CategorySelector: Select from categories or create a custom category

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { Plus, Check, X } from 'lucide-react-native';
import { THEME } from '../../constants/theme';
import { CategoryRow } from '../../types/database';
import { getCategoryMeta, DEFAULT_CATEGORIES } from '../../constants/categories';

interface CategorySelectorProps {
  selectedCategoryName: string;
  onSelectCategory: (name: string, categoryId?: string) => void;
  categories: CategoryRow[];
  onAddCustomCategory?: (name: string, icon?: string, color?: string) => Promise<any>;
}

export const CategorySelector: React.FC<CategorySelectorProps> = ({
  selectedCategoryName,
  onSelectCategory,
  categories,
  onAddCustomCategory,
}) => {
  const [showAddCustom, setShowAddCustom] = useState<boolean>(false);
  const [customName, setCustomName] = useState<string>('');
  const [savingCustom, setSavingCustom] = useState<boolean>(false);

  // Combine default categories with DB categories without duplicates
  const categoryNames = Array.from(
    new Set([
      ...DEFAULT_CATEGORIES.map((c) => c.name),
      ...categories.map((c) => c.name),
    ])
  );

  const handleSaveCustom = async () => {
    if (!customName.trim() || !onAddCustomCategory) return;
    setSavingCustom(true);
    try {
      await onAddCustomCategory(customName.trim());
      onSelectCategory(customName.trim());
      setCustomName('');
      setShowAddCustom(false);
    } catch (err) {
      console.warn('Error saving custom category:', err);
    } finally {
      setSavingCustom(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Category</Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipsContainer}
      >
        {categoryNames.map((name) => {
          const isSelected = selectedCategoryName === name;
          const meta = getCategoryMeta(name);

          return (
            <TouchableOpacity
              key={name}
              style={[
                styles.chip,
                isSelected && {
                  backgroundColor: meta.color,
                  borderColor: meta.color,
                },
              ]}
              onPress={() => {
                const found = categories.find((c) => c.name === name);
                onSelectCategory(name, found?.id);
              }}
              activeOpacity={0.8}
            >
              {isSelected && <Check size={14} color="#FFF" style={styles.checkIcon} />}
              <Text
                style={[
                  styles.chipText,
                  isSelected && { color: '#FFF', fontWeight: THEME.typography.weights.bold },
                ]}
              >
                {name}
              </Text>
            </TouchableOpacity>
          );
        })}

        {onAddCustomCategory && !showAddCustom && (
          <TouchableOpacity
            style={styles.addChip}
            onPress={() => setShowAddCustom(true)}
            activeOpacity={0.8}
          >
            <Plus size={14} color={THEME.colors.primary} />
            <Text style={styles.addChipText}>Add Custom</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      {showAddCustom && (
        <View style={styles.customInputRow}>
          <TextInput
            style={styles.customInput}
            placeholder="e.g. Gym, Pet, Freelance"
            placeholderTextColor={THEME.colors.textMuted}
            value={customName}
            onChangeText={setCustomName}
            autoFocus
          />
          <TouchableOpacity
            style={[styles.customActionBtn, styles.customSaveBtn]}
            onPress={handleSaveCustom}
            disabled={savingCustom || !customName.trim()}
          >
            <Check size={16} color="#FFF" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.customActionBtn, styles.customCancelBtn]}
            onPress={() => {
              setShowAddCustom(false);
              setCustomName('');
            }}
          >
            <X size={16} color={THEME.colors.textSecondary} />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: THEME.spacing.md,
  },
  label: {
    fontSize: THEME.typography.sizes.sm,
    fontWeight: THEME.typography.weights.semibold,
    color: THEME.colors.textSecondary,
    marginBottom: 8,
  },
  chipsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: THEME.borderRadius.full,
    backgroundColor: THEME.colors.surface,
    borderWidth: 1.5,
    borderColor: THEME.colors.border,
  },
  checkIcon: {
    marginRight: 6,
  },
  chipText: {
    fontSize: THEME.typography.sizes.sm,
    fontWeight: THEME.typography.weights.medium,
    color: THEME.colors.textPrimary,
  },
  addChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: THEME.borderRadius.full,
    backgroundColor: THEME.colors.primaryMuted,
    borderWidth: 1.5,
    borderColor: THEME.colors.primaryBorder,
    borderStyle: 'dashed',
    gap: 4,
  },
  addChipText: {
    fontSize: THEME.typography.sizes.sm,
    fontWeight: THEME.typography.weights.semibold,
    color: THEME.colors.primary,
  },
  customInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    gap: 8,
  },
  customInput: {
    flex: 1,
    height: 40,
    backgroundColor: THEME.colors.surface,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    borderRadius: THEME.borderRadius.md,
    paddingHorizontal: 12,
    fontSize: THEME.typography.sizes.sm,
    color: THEME.colors.textPrimary,
  },
  customActionBtn: {
    width: 38,
    height: 38,
    borderRadius: THEME.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  customSaveBtn: {
    backgroundColor: THEME.colors.primary,
  },
  customCancelBtn: {
    backgroundColor: THEME.colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
});
