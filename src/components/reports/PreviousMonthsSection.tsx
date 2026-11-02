// PreviousMonthsSection: Displays archived closed months with Money Added, Money Withdrawn, and More Details button to view full transactions

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Alert,
} from 'react-native';
import {
  FolderArchive,
  ArrowUpRight,
  ArrowDownLeft,
  ChevronDown,
  ChevronUp,
  FileText,
  Eye,
  Trash2,
  Calendar,
  Layers,
  Sparkles,
} from 'lucide-react-native';
import { THEME } from '../../constants/theme';
import { ClosedMonthRecord } from '../../types/financial';
import { formatINR } from '../../utils/currency';
import { formatFriendlyDate } from '../../utils/dateUtils';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { ClosedMonthDetailsModal } from './ClosedMonthDetailsModal';

interface PreviousMonthsSectionProps {
  closedMonths: ClosedMonthRecord[];
  onDeleteClosedMonth?: (id: string) => Promise<{ error: Error | null }>;
}

export const PreviousMonthsSection: React.FC<PreviousMonthsSectionProps> = ({
  closedMonths = [],
  onDeleteClosedMonth,
}) => {
  // Store expanded card IDs (defaults to first closed month expanded)
  const [expandedId, setExpandedId] = useState<string | null>(
    closedMonths.length > 0 ? closedMonths[0].id : null
  );
  const [selectedRecordForDetails, setSelectedRecordForDetails] = useState<ClosedMonthRecord | null>(
    null
  );

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const handleDelete = (id: string, monthName: string) => {
    if (!onDeleteClosedMonth) return;

    if (Platform.OS === 'web') {
      if (window.confirm(`Delete archived statement for ${monthName}?`)) {
        onDeleteClosedMonth(id);
      }
    } else {
      Alert.alert(
        'Delete Archived Month',
        `Are you sure you want to remove the archived record for ${monthName}?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: () => onDeleteClosedMonth(id),
          },
        ]
      );
    }
  };

  return (
    <View style={styles.container}>
      {/* Section Header */}
      <View style={styles.sectionHeader}>
        <View style={styles.titleRow}>
          <View style={styles.iconCircle}>
            <FolderArchive size={20} color={THEME.colors.primary} />
          </View>
          <View>
            <Text style={styles.sectionTitle}>Previous Month Details</Text>
            <Text style={styles.sectionSub}>
              Archived monthly records & transaction logs
            </Text>
          </View>
        </View>
        {closedMonths.length > 0 && (
          <View style={styles.badgeWrap}>
            <Badge
              label={`${closedMonths.length} Closed Month${closedMonths.length === 1 ? '' : 's'}`}
              variant="indigo"
              size="sm"
            />
          </View>
        )}
      </View>

      {/* List of Closed Months */}
      {closedMonths.length > 0 ? (
        <View style={styles.monthsList}>
          {closedMonths.map((record) => {
            const isExpanded = expandedId === record.id;
            const txCount = record.transactions?.length || record.transactionsCount || 0;

            return (
              <View key={record.id} style={styles.monthCard}>
                {/* Header Row (Always clickable) */}
                <TouchableOpacity
                  style={styles.cardHeader}
                  onPress={() => toggleExpand(record.id)}
                  activeOpacity={0.7}
                >
                  <View style={styles.cardHeaderLeft}>
                    <View style={styles.monthIconWrap}>
                      <Calendar size={18} color={THEME.colors.primary} />
                    </View>
                    <View>
                      <View style={styles.monthTitleRow}>
                        <Text style={styles.monthName}>{record.monthName}</Text>
                        <Badge label="Closed" variant="neutral" size="sm" />
                      </View>
                      <Text style={styles.periodText}>
                        {record.periodStart} – {record.periodEnd}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.cardHeaderRight}>
                    {isExpanded ? (
                      <ChevronUp size={20} color={THEME.colors.textMuted} />
                    ) : (
                      <View style={styles.collapsedSummaryRow}>
                        <View style={{ alignItems: 'flex-end', marginRight: 6 }}>
                          <Text style={styles.collapsedAdded}>
                            +{formatINR(record.totalMoneyAdded)}
                          </Text>
                          <Text style={styles.collapsedWithdrawn}>
                            -{formatINR(record.totalWithdrawn)}
                          </Text>
                        </View>
                        <ChevronDown size={20} color={THEME.colors.textMuted} />
                      </View>
                    )}
                  </View>
                </TouchableOpacity>

                {/* Expanded Details Body */}
                {isExpanded && (
                  <View style={styles.cardBody}>
                    <View style={styles.divider} />

                    {/* How much added and how much withdrawn */}
                    <View style={styles.statsGrid}>
                      {/* Money Added */}
                      <View style={[styles.statBox, styles.statBoxAdded]}>
                        <View style={styles.statLabelRow}>
                          <View style={[styles.statDot, { backgroundColor: '#15803D' }]}>
                            <ArrowUpRight size={12} color="#FFF" />
                          </View>
                          <Text style={styles.statLabel}>Money Added</Text>
                        </View>
                        <Text style={[styles.statAmount, { color: '#15803D' }]}>
                          +{formatINR(record.totalMoneyAdded)}
                        </Text>
                        <Text style={styles.statHint}>Total deposits / top-ups</Text>
                      </View>

                      {/* Money Withdrawn */}
                      <View style={[styles.statBox, styles.statBoxWithdrawn]}>
                        <View style={styles.statLabelRow}>
                          <View style={[styles.statDot, { backgroundColor: '#B91C1C' }]}>
                            <ArrowDownLeft size={12} color="#FFF" />
                          </View>
                          <Text style={styles.statLabel}>Money Withdrawn</Text>
                        </View>
                        <Text style={[styles.statAmount, { color: '#B91C1C' }]}>
                          -{formatINR(record.totalWithdrawn)}
                        </Text>
                        <Text style={styles.statHint}>Total expenses & fixed paid</Text>
                      </View>
                    </View>

                    {/* Balance & Overview Strip */}
                    <View style={styles.balanceStrip}>
                      <View>
                        <Text style={styles.balanceStripLabel}>Closing Balance</Text>
                        <Text style={styles.balanceStripAmount}>
                          {formatINR(record.closingBalance)}
                        </Text>
                      </View>
                      <View style={styles.txCountBox}>
                        <Layers size={14} color={THEME.colors.textMuted} />
                        <Text style={styles.txCountText}>{txCount} Total Transactions</Text>
                      </View>
                    </View>

                    {/* Action Row with "More Details" Button */}
                    <View style={styles.actionRow}>
                      <TouchableOpacity
                        style={styles.moreDetailsBtn}
                        onPress={() => setSelectedRecordForDetails(record)}
                        activeOpacity={0.8}
                      >
                        <Eye size={16} color="#FFF" />
                        <Text style={styles.moreDetailsBtnText}>
                          More Details (Entire Transactions)
                        </Text>
                      </TouchableOpacity>

                      {onDeleteClosedMonth && (
                        <TouchableOpacity
                          style={styles.deleteBtn}
                          onPress={() => handleDelete(record.id, record.monthName)}
                          activeOpacity={0.7}
                        >
                          <Trash2 size={16} color={THEME.colors.textMuted} />
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                )}
              </View>
            );
          })}
        </View>
      ) : (
        /* Empty State */
        <View style={styles.emptyCard}>
          <View style={styles.emptyIconCircle}>
            <FolderArchive size={28} color={THEME.colors.primary} />
          </View>
          <Text style={styles.emptyTitle}>No Closed Months Yet</Text>
          <Text style={styles.emptyDesc}>
            When you close a month from the Home screen, the current cycle data will clear to start
            fresh from first, and that closed month's total money added, money withdrawn, and entire
            transaction log will be stored here.
          </Text>
        </View>
      )}

      {/* Entire Transaction Details Modal */}
      <ClosedMonthDetailsModal
        visible={!!selectedRecordForDetails}
        onClose={() => setSelectedRecordForDetails(null)}
        record={selectedRecordForDetails}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: THEME.spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    marginBottom: THEME.spacing.sm,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: THEME.colors.primaryMuted,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: THEME.typography.sizes.md,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
  },
  sectionSub: {
    fontSize: THEME.typography.sizes.xs,
    color: THEME.colors.textMuted,
  },
  badgeWrap: {
    marginLeft: 8,
  },
  monthsList: {
    gap: THEME.spacing.md,
  },
  monthCard: {
    backgroundColor: '#FFF',
    borderRadius: THEME.borderRadius.lg,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: THEME.spacing.md,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  monthIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: THEME.colors.surfaceSubtle,
    justifyContent: 'center',
    alignItems: 'center',
  },
  monthTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  monthName: {
    fontSize: THEME.typography.sizes.sm,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
  },
  periodText: {
    fontSize: 11,
    color: THEME.colors.textMuted,
    marginTop: 2,
  },
  cardHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  collapsedSummaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  collapsedAdded: {
    fontSize: 11,
    fontWeight: '700',
    color: '#15803D',
  },
  collapsedWithdrawn: {
    fontSize: 11,
    fontWeight: '700',
    color: '#B91C1C',
  },
  cardBody: {
    paddingHorizontal: THEME.spacing.md,
    paddingBottom: THEME.spacing.md,
  },
  divider: {
    height: 1,
    backgroundColor: THEME.colors.border,
    marginBottom: THEME.spacing.md,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: THEME.spacing.sm,
    marginBottom: THEME.spacing.sm,
  },
  statBox: {
    flex: 1,
    padding: THEME.spacing.sm + 2,
    borderRadius: THEME.borderRadius.md,
    borderWidth: 1,
  },
  statBoxAdded: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
  },
  statBoxWithdrawn: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  statLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  statDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: THEME.colors.textSecondary,
  },
  statAmount: {
    fontSize: THEME.typography.sizes.md,
    fontWeight: '800',
    marginBottom: 2,
  },
  statHint: {
    fontSize: 10,
    color: THEME.colors.textMuted,
  },
  balanceStrip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: THEME.colors.surfaceSubtle,
    paddingHorizontal: THEME.spacing.md,
    paddingVertical: 10,
    borderRadius: THEME.borderRadius.md,
    marginBottom: THEME.spacing.md,
  },
  balanceStripLabel: {
    fontSize: 11,
    color: THEME.colors.textMuted,
    fontWeight: '600',
  },
  balanceStripAmount: {
    fontSize: 13,
    fontWeight: '800',
    color: THEME.colors.textPrimary,
  },
  txCountBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  txCountText: {
    fontSize: 11,
    fontWeight: '600',
    color: THEME.colors.textMuted,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  moreDetailsBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: THEME.colors.primary,
    paddingVertical: 11,
    paddingHorizontal: 16,
    borderRadius: THEME.borderRadius.md,
    gap: 8,
    shadowColor: THEME.colors.primary,
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  moreDetailsBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFF',
  },
  deleteBtn: {
    padding: 10,
    borderRadius: THEME.borderRadius.md,
    backgroundColor: THEME.colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  emptyCard: {
    backgroundColor: '#FFF',
    padding: THEME.spacing.lg,
    borderRadius: THEME.borderRadius.lg,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: THEME.colors.primaryMuted,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: THEME.spacing.sm,
  },
  emptyTitle: {
    fontSize: THEME.typography.sizes.sm,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
    marginBottom: 4,
  },
  emptyDesc: {
    fontSize: 12,
    color: THEME.colors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 12,
  },
});
