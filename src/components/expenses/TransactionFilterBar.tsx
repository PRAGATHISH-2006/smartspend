// TransactionFilterBar: Search and filtering controls for transaction feeds

import React from 'react';
import { View, TextInput, StyleSheet, ScrollView, TouchableOpacity, Text } from 'react-native';
import { Search, X } from 'lucide-react-native';
import { THEME } from '../../constants/theme';

export type FilterTab = 'all' | 'expense' | 'income' | 'fixed' | 'skipped';

interface TransactionFilterBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedTab: FilterTab;
  onSelectTab: (tab: FilterTab) => void;
  selectedCategory: string | null;
  onSelectCategory: (cat: string | null) => void;
  availableCategories: string[];
}

export const TransactionFilterBar: React.FC<TransactionFilterBarProps> = ({
  searchQuery,
  onSearchChange,
  selectedTab,
  onSelectTab,
  selectedCategory,
  onSelectCategory,
  availableCategories,
}) => {
  const tabs: { id: FilterTab; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'expense', label: 'Manual' },
    { id: 'fixed', label: 'Fixed' },
    { id: 'income', label: 'Top-ups' },
    { id: 'skipped', label: 'Skipped' },
  ];

  return (
    <View style={styles.container}>
      {/* Search Input */}
      <View style={styles.searchBox}>
        <Search size={18} color={THEME.colors.textMuted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by description or category..."
          placeholderTextColor={THEME.colors.textMuted}
          value={searchQuery}
          onChangeText={onSearchChange}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => onSearchChange('')} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <X size={16} color={THEME.colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {/* Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsRow}>
        {tabs.map((tab) => {
          const isSelected = selectedTab === tab.id;
          return (
            <TouchableOpacity
              key={tab.id}
              style={[styles.tabChip, isSelected && styles.tabChipSelected]}
              onPress={() => onSelectTab(tab.id)}
              activeOpacity={0.7}
            >
              <Text style={[styles.tabText, isSelected && styles.tabTextSelected]}>{tab.label}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Categories Filter (if available) */}
      {availableCategories.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesRow}>
          <TouchableOpacity
            style={[styles.categoryChip, !selectedCategory && styles.categoryChipSelected]}
            onPress={() => onSelectCategory(null)}
          >
            <Text style={[styles.categoryText, !selectedCategory && styles.categoryTextSelected]}>
              All Categories
            </Text>
          </TouchableOpacity>

          {availableCategories.map((cat) => {
            const isCatSelected = selectedCategory === cat;
            return (
              <TouchableOpacity
                key={cat}
                style={[styles.categoryChip, isCatSelected && styles.categoryChipSelected]}
                onPress={() => onSelectCategory(isCatSelected ? null : cat)}
              >
                <Text style={[styles.categoryText, isCatSelected && styles.categoryTextSelected]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: THEME.spacing.lg,
    paddingVertical: THEME.spacing.sm,
    backgroundColor: THEME.colors.background,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.surface,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    borderRadius: THEME.borderRadius.xl,
    paddingHorizontal: 12,
    height: 44,
    marginBottom: THEME.spacing.sm,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: THEME.typography.sizes.sm,
    color: THEME.colors.textPrimary,
  },
  tabsRow: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 2,
  },
  tabChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: THEME.borderRadius.full,
    backgroundColor: THEME.colors.surface,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  tabChipSelected: {
    backgroundColor: THEME.colors.primary,
    borderColor: THEME.colors.primary,
  },
  tabText: {
    fontSize: THEME.typography.sizes.xs,
    fontWeight: THEME.typography.weights.semibold,
    color: THEME.colors.textSecondary,
  },
  tabTextSelected: {
    color: '#FFFFFF',
  },
  categoriesRow: {
    flexDirection: 'row',
    gap: 6,
    paddingTop: 8,
  },
  categoryChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: THEME.borderRadius.md,
    backgroundColor: THEME.colors.surfaceSubtle,
  },
  categoryChipSelected: {
    backgroundColor: THEME.colors.indigoLight,
  },
  categoryText: {
    fontSize: 11,
    color: THEME.colors.textSecondary,
    fontWeight: THEME.typography.weights.medium,
  },
  categoryTextSelected: {
    color: THEME.colors.indigo,
    fontWeight: THEME.typography.weights.bold,
  },
});
