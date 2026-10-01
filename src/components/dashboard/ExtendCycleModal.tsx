// ExtendCycleModal: Modal to extend current budget period by custom days or specific date
import React, { useState, useEffect } from 'react';
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
import { X, Calendar, Clock, ArrowRight, CheckCircle2 } from 'lucide-react-native';
import { THEME } from '../../constants/theme';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { CalendarPicker } from '../common/CalendarPicker';
import { addDays, format, parseISO } from 'date-fns';
import { getTodayDateString } from '../../utils/dateUtils';

interface ExtendCycleModalProps {
  visible: boolean;
  onClose: () => void;
  currentEndDate?: string;
  onExtend: (days: number, customDate?: string) => Promise<{ error: Error | null; newEndDate?: string }>;
}

export const ExtendCycleModal: React.FC<ExtendCycleModalProps> = ({
  visible,
  onClose,
  currentEndDate,
  onExtend,
}) => {
  const [selectedDays, setSelectedDays] = useState<number>(5);
  const [customDate, setCustomDate] = useState<string>('');
  const [useCustomDate, setUseCustomDate] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Compute preview end date
  const computePreviewEndDate = () => {
    if (useCustomDate && customDate) {
      return customDate;
    }
    const today = new Date();
    let baseDate = today;
    if (currentEndDate) {
      try {
        const parsed = parseISO(currentEndDate);
        if (parsed > today) {
          baseDate = parsed;
        }
      } catch {
        baseDate = today;
      }
    }
    return format(addDays(baseDate, selectedDays), 'yyyy-MM-dd');
  };

  const previewEnd = computePreviewEndDate();

  useEffect(() => {
    if (visible) {
      setSelectedDays(5);
      setUseCustomDate(false);
      setCustomDate('');
      setSuccessMsg(null);
      setErrorMsg(null);
    }
  }, [visible]);

  const handleConfirm = async () => {
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await onExtend(
        useCustomDate ? 0 : selectedDays,
        useCustomDate ? customDate : undefined
      );

      if (res.error) {
        setErrorMsg(res.error.message || 'Failed to extend period.');
      } else {
        setSuccessMsg(`Period extended successfully to ${res.newEndDate || previewEnd}!`);
        setTimeout(() => {
          onClose();
        }, 1400);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error extending cycle');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.overlay}
      >
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <View style={styles.iconCircle}>
                <Clock size={20} color={THEME.colors.primary} />
              </View>
              <View>
                <Text style={styles.title}>Extend Budget Period</Text>
                <Text style={styles.subtitle}>Add more days to your active spending cycle</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={20} color={THEME.colors.textMuted} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Cycle Preview Comparison Card */}
            <View style={styles.comparisonCard}>
              <View style={styles.dateCol}>
                <Text style={styles.dateLabel}>CURRENT END DATE</Text>
                <Text style={styles.dateValue}>{currentEndDate || getTodayDateString()}</Text>
              </View>
              <ArrowRight size={20} color={THEME.colors.primary} />
              <View style={styles.dateCol}>
                <Text style={[styles.dateLabel, { color: THEME.colors.primary }]}>NEW EXTENDED END</Text>
                <Text style={[styles.dateValue, { color: THEME.colors.primary }]}>{previewEnd}</Text>
              </View>
            </View>

            {/* Quick Extension Presets */}
            <Text style={styles.sectionLabel}>Choose Extension Days</Text>
            <View style={styles.presetsGrid}>
              {[3, 5, 7, 10, 15].map((days) => {
                const isSelected = !useCustomDate && selectedDays === days;
                return (
                  <TouchableOpacity
                    key={days}
                    style={[styles.presetBtn, isSelected && styles.presetBtnActive]}
                    onPress={() => {
                      setUseCustomDate(false);
                      setSelectedDays(days);
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.presetText, isSelected && styles.presetTextActive]}>
                      +{days} Days
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Or Specific Date Option */}
            <TouchableOpacity
              style={styles.customDateToggle}
              onPress={() => {
                const next = !useCustomDate;
                setUseCustomDate(next);
                if (next && !customDate) {
                  setCustomDate(previewEnd);
                }
              }}
              activeOpacity={0.8}
            >
              <Calendar size={16} color={useCustomDate ? THEME.colors.primary : THEME.colors.textMuted} />
              <Text style={[styles.customDateToggleText, useCustomDate && { color: THEME.colors.primary }]}>
                {useCustomDate ? '📅 Selected Custom Target Date (Click to Hide Calendar)' : '📅 Or pick a specific target date from calendar'}
              </Text>
            </TouchableOpacity>

            {useCustomDate && (
              <View style={styles.calendarSection}>
                <CalendarPicker
                  title="Pick Target Cycle End Date"
                  selectedDate={customDate || previewEnd}
                  minDate={getTodayDateString()}
                  onSelectDate={(date) => {
                    setCustomDate(date);
                    setErrorMsg(null);
                  }}
                />
              </View>
            )}

            {/* Explanation Note */}
            <View style={styles.noteBox}>
              <Text style={styles.noteTitle}>How does extending work?</Text>
              <Text style={styles.noteText}>
                • Extends your current cycle by {useCustomDate ? 'custom date' : `${selectedDays} days`}{'\n'}
                • Safe-to-spend daily budget is re-divided over the remaining days{'\n'}
                • You can close the month at any time whenever you decide to end the cycle
              </Text>
            </View>

            {/* Feedback Messages */}
            {successMsg && (
              <View style={styles.successCard}>
                <CheckCircle2 size={18} color="#059669" />
                <Text style={styles.successText}>{successMsg}</Text>
              </View>
            )}

            {errorMsg && (
              <View style={styles.errorCard}>
                <Text style={styles.errorText}>{errorMsg}</Text>
              </View>
            )}

            {/* Action Buttons */}
            <View style={styles.actionRow}>
              <Button
                title={loading ? 'Extending Cycle...' : `Extend Cycle to ${previewEnd}`}
                onPress={handleConfirm}
                loading={loading}
                variant="primary"
                style={styles.confirmBtn}
              />
            </View>
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
    maxHeight: '90%',
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
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: THEME.colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
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
  comparisonCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: THEME.borderRadius.xl,
    padding: THEME.spacing.md,
    marginBottom: THEME.spacing.md,
  },
  dateCol: {
    alignItems: 'center',
  },
  dateLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: THEME.colors.textMuted,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  dateValue: {
    fontSize: 15,
    fontWeight: '800',
    color: THEME.colors.textPrimary,
  },
  sectionLabel: {
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
    marginBottom: THEME.spacing.md,
  },
  presetBtn: {
    flex: 1,
    minWidth: 58,
    backgroundColor: THEME.colors.background,
    borderWidth: 1.5,
    borderColor: THEME.colors.border,
    paddingVertical: 10,
    borderRadius: THEME.borderRadius.lg,
    alignItems: 'center',
  },
  presetBtnActive: {
    borderColor: THEME.colors.primary,
    backgroundColor: THEME.colors.primaryLight,
  },
  presetText: {
    fontSize: 13,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
  },
  presetTextActive: {
    color: THEME.colors.primary,
  },
  customDateToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    marginBottom: 8,
  },
  customDateToggleText: {
    fontSize: 13,
    fontWeight: '600',
    color: THEME.colors.textSecondary,
  },
  customInputWrapper: {
    marginBottom: THEME.spacing.md,
  },
  calendarSection: {
    marginBottom: THEME.spacing.md,
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: THEME.colors.textMuted,
    marginBottom: 4,
  },
  noteBox: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: THEME.borderRadius.lg,
    padding: THEME.spacing.md,
    marginBottom: THEME.spacing.md,
  },
  noteTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E40AF',
    marginBottom: 4,
  },
  noteText: {
    fontSize: 11,
    lineHeight: 16,
    color: '#1E3A8A',
  },
  successCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    padding: 10,
    borderRadius: THEME.borderRadius.md,
    marginBottom: THEME.spacing.md,
  },
  successText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#065F46',
  },
  errorCard: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    padding: 10,
    borderRadius: THEME.borderRadius.md,
    marginBottom: THEME.spacing.md,
  },
  errorText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#991B1B',
  },
  actionRow: {
    marginBottom: THEME.spacing.lg,
  },
  confirmBtn: {
    backgroundColor: THEME.colors.primary,
  },
});
