// AnalyticsHeader: Month Selector Dropdown, Category Filters, and Quick Timeline filters with Yellow & Red theme

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  Platform,
} from 'react-native';
import {
  Calendar,
  ChevronDown,
  Filter,
  Sparkles,
  FolderArchive,
  Check,
  CheckCircle2,
  Clock,
} from 'lucide-react-native';
import { THEME } from '../../constants/theme';
import { ClosedMonthRecord } from '../../types/financial';

export interface MonthOption {
  id: string; // 'current' or closedMonth.id
  label: string; // e.g. "November 2026 (Active Cycle)" or "October 2026"
  isArchived: boolean;
  periodText: string;
}

interface AnalyticsHeaderProps {
  selectedMonthId: string;
  onSelectMonthId: (id: string) => void;
  monthOptions: MonthOption[];
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
  availableCategories: string[];
  timelineFilter: 'all' | '7d' | '14d';
  onSelectTimeline: (timeline: 'all' | '7d' | '14d') => void;
  onOpenNotifications?: () => void;
}

export const AnalyticsHeader: React.FC<AnalyticsHeaderProps> = ({
  selectedMonthId,
  onSelectMonthId,
  monthOptions,
  selectedCategory,
  onSelectCategory,
  availableCategories,
  timelineFilter,
  onSelectTimeline,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);

  const currentOption =
    monthOptions.find((m) => m.id === selectedMonthId) || monthOptions[0];

  return (
    <View style={styles.container}>
      {/* 1. Month Selector Dropdown Trigger */}
      <View style={styles.topSelectorRow}>
        <View style={styles.selectorLeftCol}>
          <Text style={styles.selectorHeading}>ANALYTICS CYCLE</Text>
          <TouchableOpacity
            style={styles.dropdownTrigger}
            onPress={() => setDropdownOpen(true)}
            activeOpacity={0.8}
          >
            <View style={styles.triggerIconCircle}>
              {currentOption?.isArchived ? (
                <FolderArchive size={15} color="#EAB308" />
              ) : (
                <Sparkles size={15} color="#DC2626" />
              )}
            </View>
            <View style={styles.triggerTextCol}>
              <Text style={styles.triggerTitle} numberOfLines={1}>
                {currentOption?.label || 'Current Active Month'}
              </Text>
              <Text style={styles.triggerSub}>
                {currentOption?.periodText || 'Active live cycle'}
              </Text>
            </View>
            <ChevronDown size={16} color="#EAB308" />
          </TouchableOpacity>
        </View>

        {/* Quick Timeline Filter Pills */}
        <View style={styles.timelineRow}>
          <TouchableOpacity
            style={[styles.timelinePill, timelineFilter === 'all' && styles.timelinePillActive]}
            onPress={() => onSelectTimeline('all')}
            activeOpacity={0.7}
          >
            <Text style={[styles.timelineText, timelineFilter === 'all' && styles.timelineTextActive]}>
              Full
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.timelinePill, timelineFilter === '14d' && styles.timelinePillActive]}
            onPress={() => onSelectTimeline('14d')}
            activeOpacity={0.7}
          >
            <Text style={[styles.timelineText, timelineFilter === '14d' && styles.timelineTextActive]}>
              14D
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.timelinePill, timelineFilter === '7d' && styles.timelinePillActive]}
            onPress={() => onSelectTimeline('7d')}
            activeOpacity={0.7}
          >
            <Text style={[styles.timelineText, timelineFilter === '7d' && styles.timelineTextActive]}>
              7D
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 2. Category Filter Pills */}
      {availableCategories.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScrollContent}
        >
          <TouchableOpacity
            style={[
              styles.catChip,
              selectedCategory === null && styles.catChipActive,
            ]}
            onPress={() => onSelectCategory(null)}
            activeOpacity={0.7}
          >
            <Filter size={11} color={selectedCategory === null ? '#090D16' : '#94A3B8'} />
            <Text
              style={[
                styles.catChipText,
                selectedCategory === null && styles.catChipTextActive,
              ]}
            >
              All Categories
            </Text>
          </TouchableOpacity>

          {availableCategories.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <TouchableOpacity
                key={cat}
                style={[styles.catChip, isSelected && styles.catChipActive]}
                onPress={() => onSelectCategory(isSelected ? null : cat)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.catChipText,
                    isSelected && styles.catChipTextActive,
                  ]}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}

      {/* Month Selector Modal Dropdown */}
      <Modal
        visible={dropdownOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setDropdownOpen(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setDropdownOpen(false)}
        >
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderTitleRow}>
                <Calendar size={18} color="#EAB308" />
                <Text style={styles.modalTitle}>Select Reporting Month</Text>
              </View>
              <Text style={styles.modalSub}>
                Switch between live dashboard and archived statements
              </Text>
            </View>

            <ScrollView style={styles.optionsList} showsVerticalScrollIndicator={false}>
              {monthOptions.map((opt) => {
                const isSelected = opt.id === selectedMonthId;
                return (
                  <TouchableOpacity
                    key={opt.id}
                    style={[styles.optionItem, isSelected && styles.optionItemActive]}
                    onPress={() => {
                      onSelectMonthId(opt.id);
                      setDropdownOpen(false);
                    }}
                    activeOpacity={0.75}
                  >
                    <View style={styles.optionLeft}>
                      <View
                        style={[
                          styles.optionIconCircle,
                          opt.isArchived ? styles.optIconArchived : styles.optIconCurrent,
                        ]}
                      >
                        {opt.isArchived ? (
                          <FolderArchive size={14} color="#EAB308" />
                        ) : (
                          <Sparkles size={14} color="#DC2626" />
                        )}
                      </View>
                      <View>
                        <Text
                          style={[
                            styles.optionLabel,
                            isSelected && styles.optionLabelActive,
                          ]}
                        >
                          {opt.label}
                        </Text>
                        <Text style={styles.optionPeriod}>{opt.periodText}</Text>
                      </View>
                    </View>

                    {isSelected && (
                      <View style={styles.checkWrap}>
                        <Check size={16} color="#EAB308" />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: THEME.spacing.md,
  },
  topSelectorRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 12,
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  selectorLeftCol: {
    flex: 1,
    minWidth: 220,
  },
  selectorHeading: {
    fontSize: 10,
    fontWeight: THEME.typography.weights.heavy,
    color: '#94A3B8',
    letterSpacing: 1.2,
    marginBottom: 5,
  },
  dropdownTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111726',
    borderRadius: THEME.borderRadius.lg,
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderWidth: 1.5,
    borderColor: '#EAB308', // Warm Gold Border
    gap: 10,
    shadowColor: '#EAB308',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  triggerIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#090D16',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  triggerTextCol: {
    flex: 1,
  },
  triggerTitle: {
    fontSize: 13,
    fontWeight: THEME.typography.weights.heavy,
    color: '#F8FAFC',
  },
  triggerSub: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 1,
  },
  timelineRow: {
    flexDirection: 'row',
    backgroundColor: '#111726',
    borderRadius: THEME.borderRadius.md,
    padding: 3,
    borderWidth: 1,
    borderColor: '#1E293B',
    alignSelf: 'flex-end',
  },
  timelinePill: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  timelinePillActive: {
    backgroundColor: '#DC2626', // Vibrant Red Active
  },
  timelineText: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: THEME.typography.weights.bold,
  },
  timelineTextActive: {
    color: '#FFFFFF',
  },
  categoryScrollContent: {
    flexDirection: 'row',
    gap: 6,
    paddingVertical: 2,
  },
  catChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#111726',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: THEME.borderRadius.full,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  catChipActive: {
    backgroundColor: '#EAB308', // Warm Gold
    borderColor: '#FACC15',
  },
  catChipText: {
    fontSize: 11,
    fontWeight: THEME.typography.weights.semibold,
    color: '#CBD5E1',
  },
  catChipTextActive: {
    color: '#090D16',
    fontWeight: THEME.typography.weights.heavy,
  },
  // Modal Dropdown
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 440,
    backgroundColor: '#0F172A',
    borderRadius: THEME.borderRadius.xxl,
    borderWidth: 1.5,
    borderColor: '#EAB308',
    padding: 18,
    maxHeight: '80%',
    shadowColor: '#EAB308',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
  },
  modalHeader: {
    marginBottom: 14,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  modalHeaderTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: THEME.typography.weights.heavy,
    color: '#F8FAFC',
  },
  modalSub: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  optionsList: {
    maxHeight: 300,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: THEME.borderRadius.lg,
    marginBottom: 6,
    backgroundColor: '#111726',
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  optionItemActive: {
    borderColor: '#EAB308',
    backgroundColor: 'rgba(234, 179, 8, 0.1)',
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  optionIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optIconCurrent: {
    backgroundColor: 'rgba(220, 38, 38, 0.15)',
  },
  optIconArchived: {
    backgroundColor: 'rgba(234, 179, 8, 0.15)',
  },
  optionLabel: {
    color: '#F8FAFC',
    fontSize: 13,
    fontWeight: THEME.typography.weights.bold,
  },
  optionLabelActive: {
    color: '#FACC15',
  },
  optionPeriod: {
    color: '#64748B',
    fontSize: 10,
    marginTop: 1,
  },
  checkWrap: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(234, 179, 8, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

