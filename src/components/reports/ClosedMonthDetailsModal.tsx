// ClosedMonthDetailsModal: Modal displaying the entire transaction history and breakdown of a closed month

import React, { useState, useMemo } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  SafeAreaView,
  Platform,
  Linking,
} from 'react-native';
import {
  X,
  FolderArchive,
  ArrowDownLeft,
  ArrowUpRight,
  Search,
  Calendar,
  Wallet,
  Receipt,
  FileSpreadsheet,
  ExternalLink,
  ChevronRight,
  Filter,
} from 'lucide-react-native';
import { THEME } from '../../constants/theme';
import { ClosedMonthRecord, UnifiedTransaction } from '../../types/financial';
import { formatINR } from '../../utils/currency';
import { formatFriendlyDate } from '../../utils/dateUtils';
import { getCategoryMeta } from '../../constants/categories';
import { Badge } from '../common/Badge';
import { ExpenseCard } from '../expenses/ExpenseCard';

interface ClosedMonthDetailsModalProps {
  visible: boolean;
  onClose: () => void;
  record: ClosedMonthRecord | null;
}

export const ClosedMonthDetailsModal: React.FC<ClosedMonthDetailsModalProps> = ({
  visible,
  onClose,
  record,
}) => {
  const [filterTab, setFilterTab] = useState<'all' | 'added' | 'withdrawn'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  if (!record) return null;

  const totalAdded = record.totalMoneyAdded;
  const totalWithdrawn = record.totalWithdrawn;
  const netBalance = record.closingBalance;

  // Filter transactions
  const transactions: UnifiedTransaction[] = record.transactions || [];

  const addedTransactions = useMemo(
    () => transactions.filter((tx) => tx.rawType === 'income'),
    [transactions]
  );
  const withdrawnTransactions = useMemo(
    () => transactions.filter((tx) => tx.rawType === 'expense' || tx.rawType === 'skipped'),
    [transactions]
  );

  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      // Tab filter
      if (filterTab === 'added' && tx.rawType !== 'income') return false;
      if (filterTab === 'withdrawn' && tx.rawType !== 'expense' && tx.rawType !== 'skipped') {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchName = (tx.name || '').toLowerCase().includes(query);
        const matchCategory = (tx.category || '').toLowerCase().includes(query);
        const matchNotes = (tx.notes || '').toLowerCase().includes(query);
        if (!matchName && !matchCategory && !matchNotes) return false;
      }

      return true;
    });
  }, [transactions, filterTab, searchQuery]);

  const handleOpenDrive = () => {
    if (record.driveFolderUrl) {
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        window.open(record.driveFolderUrl, '_blank');
      } else {
        Linking.openURL(record.driveFolderUrl);
      }
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTitleRow}>
            <View style={styles.headerIconCircle}>
              <FolderArchive size={22} color={THEME.colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <View style={styles.titleBadgeRow}>
                <Text style={styles.headerTitle}>{record.monthName}</Text>
                <Badge label="Closed Month" variant="neutral" size="sm" />
              </View>
              <Text style={styles.headerSubtitle}>
                Period: {record.periodStart} to {record.periodEnd}
              </Text>
            </View>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
            <X size={20} color={THEME.colors.textMuted} />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollArea}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Summary Cards */}
          <View style={styles.summaryGrid}>
            {/* Money Added Card */}
            <View style={[styles.summaryCard, styles.addedCard]}>
              <View style={styles.summaryTopRow}>
                <View style={[styles.summaryIconWrap, { backgroundColor: '#DCFCE7' }]}>
                  <ArrowUpRight size={18} color="#15803D" />
                </View>
                <Text style={styles.summaryCardLabel}>Money Added</Text>
              </View>
              <Text style={[styles.summaryAmount, { color: '#15803D' }]}>
                +{formatINR(totalAdded)}
              </Text>
              <Text style={styles.summarySubtext}>
                {addedTransactions.length} top-up / deposit transaction{addedTransactions.length === 1 ? '' : 's'}
              </Text>
            </View>

            {/* Money Withdrawn Card */}
            <View style={[styles.summaryCard, styles.withdrawnCard]}>
              <View style={styles.summaryTopRow}>
                <View style={[styles.summaryIconWrap, { backgroundColor: '#FEE2E2' }]}>
                  <ArrowDownLeft size={18} color="#B91C1C" />
                </View>
                <Text style={styles.summaryCardLabel}>Money Withdrawn</Text>
              </View>
              <Text style={[styles.summaryAmount, { color: '#B91C1C' }]}>
                -{formatINR(totalWithdrawn)}
              </Text>
              <Text style={styles.summarySubtext}>
                {withdrawnTransactions.length} expense{withdrawnTransactions.length === 1 ? '' : 's'} & deductions
              </Text>
            </View>
          </View>

          {/* Net Closing Balance Banner */}
          <View style={styles.netBalanceBanner}>
            <View style={styles.netBalanceLeft}>
              <Text style={styles.netBalanceLabel}>Closing Net Balance</Text>
              <Text style={styles.netBalanceAmount}>{formatINR(netBalance)}</Text>
            </View>
            <View style={styles.netBalanceRight}>
              <Text style={styles.netBalanceSub}>
                {netBalance >= 0 ? 'Surplus Recorded' : 'Deficit Recorded'}
              </Text>
              {record.closedAt && (
                <Text style={styles.closedAtText}>
                  Closed: {formatFriendlyDate(record.closedAt)}
                </Text>
              )}
            </View>
          </View>

          {/* Category Breakdown (if available) */}
          {record.categoryBreakdown && record.categoryBreakdown.length > 0 && (
            <View style={styles.categorySection}>
              <Text style={styles.sectionTitle}>Spending by Category</Text>
              <View style={styles.categoryChipsWrap}>
                {record.categoryBreakdown.map((cat, idx) => {
                  const meta = getCategoryMeta(cat.name);
                  return (
                    <View key={idx} style={styles.categoryChip}>
                      <View
                        style={[
                          styles.categoryColorDot,
                          { backgroundColor: cat.color || meta.color || THEME.colors.primary },
                        ]}
                      />
                      <Text style={styles.categoryChipName}>{cat.name}</Text>
                      <Text style={styles.categoryChipAmount}>{formatINR(cat.amount)}</Text>
                      {cat.percentage > 0 && (
                        <Text style={styles.categoryChipPct}>({cat.percentage}%)</Text>
                      )}
                    </View>
                  );
                })}
              </View>
            </View>
          )}

          {/* Google Drive Link if exists */}
          {record.driveFolderUrl && (
            <TouchableOpacity
              style={styles.driveBanner}
              onPress={handleOpenDrive}
              activeOpacity={0.8}
            >
              <View style={styles.driveBannerLeft}>
                <FileSpreadsheet size={18} color="#1D4ED8" />
                <View>
                  <Text style={styles.driveBannerTitle}>
                    {record.pdfFilename || `${record.monthName} Transactions PDF`}
                  </Text>
                  <Text style={styles.driveBannerSub}>Archived in Google Drive</Text>
                </View>
              </View>
              <ExternalLink size={16} color="#1D4ED8" />
            </TouchableOpacity>
          )}

          {/* Entire Transactions Title & Filters */}
          <View style={styles.transactionsHeaderSection}>
            <View style={styles.transactionsTitleRow}>
              <Text style={styles.sectionTitle}>Entire Transaction Details</Text>
              <View style={styles.countBadge}>
                <Text style={styles.countBadgeText}>
                  {filteredTransactions.length} of {transactions.length}
                </Text>
              </View>
            </View>

            {/* Filter Tabs */}
            <View style={styles.filterTabsRow}>
              <TouchableOpacity
                style={[styles.filterTabBtn, filterTab === 'all' && styles.filterTabBtnActive]}
                onPress={() => setFilterTab('all')}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.filterTabBtnText,
                    filterTab === 'all' && styles.filterTabBtnTextActive,
                  ]}
                >
                  All ({transactions.length})
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.filterTabBtn, filterTab === 'added' && styles.filterTabBtnActive]}
                onPress={() => setFilterTab('added')}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.filterTabBtnText,
                    filterTab === 'added' && styles.filterTabBtnTextActive,
                  ]}
                >
                  Added ({addedTransactions.length})
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.filterTabBtn,
                  filterTab === 'withdrawn' && styles.filterTabBtnActive,
                ]}
                onPress={() => setFilterTab('withdrawn')}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.filterTabBtnText,
                    filterTab === 'withdrawn' && styles.filterTabBtnTextActive,
                  ]}
                >
                  Withdrawn ({withdrawnTransactions.length})
                </Text>
              </TouchableOpacity>
            </View>

            {/* Search Input */}
            <View style={styles.searchBox}>
              <Search size={16} color={THEME.colors.textMuted} />
              <TextInput
                style={styles.searchInput}
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search by title, category, or notes..."
                placeholderTextColor={THEME.colors.textMuted}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')} activeOpacity={0.7}>
                  <X size={16} color={THEME.colors.textMuted} />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Transaction List */}
          {filteredTransactions.length > 0 ? (
            <View style={styles.transactionsList}>
              {filteredTransactions.map((tx) => (
                <ExpenseCard key={tx.id} transaction={tx} />
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Receipt size={32} color={THEME.colors.textMuted} />
              <Text style={styles.emptyStateTitle}>No matching transactions found</Text>
              <Text style={styles.emptyStateSub}>
                {searchQuery
                  ? `No transactions matching "${searchQuery}"`
                  : 'No transactions logged under this filter.'}
              </Text>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: THEME.spacing.lg,
    paddingVertical: THEME.spacing.md,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.border,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: THEME.spacing.sm,
  },
  headerIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: THEME.colors.primaryMuted,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: THEME.typography.sizes.lg,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
  },
  headerSubtitle: {
    fontSize: THEME.typography.sizes.xs,
    color: THEME.colors.textMuted,
    marginTop: 2,
  },
  closeBtn: {
    padding: THEME.spacing.sm,
    borderRadius: 20,
    backgroundColor: THEME.colors.surfaceSubtle,
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    padding: THEME.spacing.md,
    paddingBottom: THEME.spacing.huge,
  },
  summaryGrid: {
    flexDirection: 'row',
    gap: THEME.spacing.md,
    marginBottom: THEME.spacing.md,
  },
  summaryCard: {
    flex: 1,
    padding: THEME.spacing.md,
    borderRadius: THEME.borderRadius.lg,
    borderWidth: 1,
  },
  addedCard: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
  },
  withdrawnCard: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  summaryTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  summaryIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  summaryCardLabel: {
    fontSize: THEME.typography.sizes.xs,
    fontWeight: '600',
    color: THEME.colors.textSecondary,
  },
  summaryAmount: {
    fontSize: THEME.typography.sizes.xl,
    fontWeight: '800',
    marginBottom: 4,
  },
  summarySubtext: {
    fontSize: 11,
    color: THEME.colors.textMuted,
  },
  netBalanceBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: THEME.spacing.md,
    borderRadius: THEME.borderRadius.lg,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    marginBottom: THEME.spacing.md,
  },
  netBalanceLeft: {
    flex: 1,
  },
  netBalanceLabel: {
    fontSize: THEME.typography.sizes.xs,
    color: THEME.colors.textSecondary,
    fontWeight: '600',
  },
  netBalanceAmount: {
    fontSize: THEME.typography.sizes.lg,
    fontWeight: '800',
    color: THEME.colors.textPrimary,
    marginTop: 2,
  },
  netBalanceRight: {
    alignItems: 'flex-end',
  },
  netBalanceSub: {
    fontSize: THEME.typography.sizes.xs,
    fontWeight: '700',
    color: THEME.colors.primaryDark,
  },
  closedAtText: {
    fontSize: 11,
    color: THEME.colors.textMuted,
    marginTop: 2,
  },
  categorySection: {
    backgroundColor: '#FFF',
    padding: THEME.spacing.md,
    borderRadius: THEME.borderRadius.lg,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    marginBottom: THEME.spacing.md,
  },
  sectionTitle: {
    fontSize: THEME.typography.sizes.sm,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
    marginBottom: THEME.spacing.sm,
  },
  categoryChipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.surfaceSubtle,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: THEME.borderRadius.full,
    gap: 6,
  },
  categoryColorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  categoryChipName: {
    fontSize: 12,
    fontWeight: '600',
    color: THEME.colors.textPrimary,
  },
  categoryChipAmount: {
    fontSize: 12,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
  },
  categoryChipPct: {
    fontSize: 11,
    color: THEME.colors.textMuted,
  },
  driveBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
    borderWidth: 1,
    padding: THEME.spacing.md,
    borderRadius: THEME.borderRadius.lg,
    marginBottom: THEME.spacing.md,
  },
  driveBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  driveBannerTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E40AF',
  },
  driveBannerSub: {
    fontSize: 11,
    color: '#3B82F6',
  },
  transactionsHeaderSection: {
    marginTop: THEME.spacing.sm,
    marginBottom: THEME.spacing.sm,
  },
  transactionsTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: THEME.spacing.xs,
  },
  countBadge: {
    backgroundColor: THEME.colors.primaryMuted,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  countBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: THEME.colors.primaryDark,
  },
  filterTabsRow: {
    flexDirection: 'row',
    backgroundColor: THEME.colors.surfaceSubtle,
    borderRadius: THEME.borderRadius.md,
    padding: 3,
    marginBottom: THEME.spacing.sm,
    marginTop: 4,
  },
  filterTabBtn: {
    flex: 1,
    paddingVertical: 6,
    alignItems: 'center',
    borderRadius: THEME.borderRadius.sm,
  },
  filterTabBtnActive: {
    backgroundColor: '#FFF',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    elevation: 1,
  },
  filterTabBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: THEME.colors.textSecondary,
  },
  filterTabBtnTextActive: {
    color: THEME.colors.primary,
    fontWeight: '700',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: THEME.colors.border,
    borderRadius: THEME.borderRadius.md,
    paddingHorizontal: THEME.spacing.sm,
    paddingVertical: Platform.OS === 'ios' ? 8 : 4,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: THEME.colors.textPrimary,
  },
  transactionsList: {
    marginTop: THEME.spacing.xs,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    backgroundColor: '#FFF',
    borderRadius: THEME.borderRadius.lg,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    marginTop: THEME.spacing.sm,
  },
  emptyStateTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
    marginTop: 8,
  },
  emptyStateSub: {
    fontSize: 12,
    color: THEME.colors.textMuted,
    marginTop: 4,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});
