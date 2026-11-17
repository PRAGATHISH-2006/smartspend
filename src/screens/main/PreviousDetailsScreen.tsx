// PreviousDetailsScreen: Dedicated Historical Archive section listing all closed months with detailed breakdowns

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Platform,
  Alert,
} from 'react-native';
import {
  FolderArchive,
  Calendar,
  ArrowDownLeft,
  ArrowUpRight,
  Eye,
  Trash2,
  Sparkles,
  Layers,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react-native';
import { THEME } from '../../constants/theme';
import { useFinancial } from '../../context/FinancialContext';
import { ClosedMonthRecord } from '../../types/financial';
import { formatINR } from '../../utils/currency';
import { AppHeader } from '../../components/common/AppHeader';
import { Button } from '../../components/common/Button';
import { ClosedMonthDetailsModal } from '../../components/reports/ClosedMonthDetailsModal';
import { CloseMonthModal } from '../../components/dashboard/CloseMonthModal';

export const PreviousDetailsScreen: React.FC = () => {
  const {
    closedMonths,
    deleteClosedMonth,
    summary,
    closeCurrentMonth,
  } = useFinancial();

  const [selectedRecord, setSelectedRecord] = useState<ClosedMonthRecord | null>(null);
  const [showCloseMonthModal, setShowCloseMonthModal] = useState<boolean>(false);

  const handleDelete = (id: string, monthName: string) => {
    if (!deleteClosedMonth) return;

    if (Platform.OS === 'web') {
      if (window.confirm(`Delete archived statement for ${monthName}?`)) {
        deleteClosedMonth(id);
      }
    } else {
      Alert.alert(
        'Delete Archive?',
        `Are you sure you want to delete the records for ${monthName}? This cannot be undone.`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: () => deleteClosedMonth(id),
          },
        ]
      );
    }
  };

  // Aggregated historical totals
  const totalArchivedInflow = closedMonths.reduce((sum, m) => sum + (m.totalMoneyAdded || 0), 0);
  const totalArchivedOutflow = closedMonths.reduce((sum, m) => sum + (m.totalWithdrawn || 0), 0);
  const totalArchivedRollover = closedMonths.reduce((sum, m) => sum + (m.rolloverAmount || 0), 0);

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppHeader
        title="Previous Details"
        subtitle="முந்தைய விவரங்கள் • Historical Archives"
        showLeaderPhoto={true}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Banner with Close Month trigger */}
        <View style={styles.heroBanner}>
          <View style={styles.heroLeft}>
            <View style={styles.badgeRow}>
              <FolderArchive size={14} color="#EAB308" />
              <Text style={styles.badgeText}>மாதாந்திர காப்பகம் • ARCHIVE</Text>
            </View>
            <Text style={styles.heroTitle}>Monthly Closing Records</Text>
            <Text style={styles.heroSubtitle}>
              All past monthly workspaces and transactions are safely archived here.
            </Text>
          </View>
          <TouchableOpacity
            style={styles.closeMonthBtn}
            onPress={() => setShowCloseMonthModal(true)}
            activeOpacity={0.8}
          >
            <Sparkles size={14} color="#090D16" />
            <Text style={styles.closeMonthBtnText}>Close Month</Text>
          </TouchableOpacity>
        </View>

        {/* Aggregate Stats Cards */}
        {closedMonths.length > 0 && (
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Archived Cycles</Text>
              <Text style={styles.statValue}>{closedMonths.length}</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Total Saved</Text>
              <Text style={[styles.statValue, { color: '#EAB308' }]}>
                {formatINR(totalArchivedRollover)}
              </Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Total Outflow</Text>
              <Text style={[styles.statValue, { color: '#EF4444' }]}>
                {formatINR(totalArchivedOutflow)}
              </Text>
            </View>
          </View>
        )}

        {/* List of Closed Months */}
        <View style={styles.listHeaderRow}>
          <Text style={styles.sectionTitle}>Archived Months ({closedMonths.length})</Text>
          <Text style={styles.sectionSubtitle}>Click on any month to view full itemized breakdown</Text>
        </View>

        {closedMonths.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <FolderArchive size={38} color="#EAB308" />
            </View>
            <Text style={styles.emptyTitle}>No Closed Months Yet</Text>
            <Text style={styles.emptyDesc}>
              When you finish your monthly financial cycle, click "Close Month" to archive all records into this dedicated section and start fresh with your surplus balance.
            </Text>
            <Button
              title="Close Current Month Now"
              onPress={() => setShowCloseMonthModal(true)}
              variant="primary"
              size="md"
              icon={<Sparkles size={16} color="#FFF" />}
              style={styles.emptyActionBtn}
            />
          </View>
        ) : (
          closedMonths.map((record, index) => {
            const netSurplus = (record.closingBalance ?? 0);
            return (
              <TouchableOpacity
                key={record.id || index}
                style={styles.monthCard}
                onPress={() => setSelectedRecord(record)}
                activeOpacity={0.85}
              >
                {/* Top Row: Month Name & Date */}
                <View style={styles.monthCardHeader}>
                  <View style={styles.monthBadge}>
                    <Calendar size={15} color="#EAB308" />
                    <Text style={styles.monthBadgeText}>{record.monthName}</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.trashBtn}
                    onPress={() => handleDelete(record.id, record.monthName)}
                    activeOpacity={0.7}
                  >
                    <Trash2 size={16} color="#94A3B8" />
                  </TouchableOpacity>
                </View>

                {/* Date range */}
                <Text style={styles.dateRangeText}>
                  {record.periodStart} to {record.periodEnd} • {record.transactionsCount || (record.transactions?.length ?? 0)} transactions
                </Text>

                {/* Financial Metric Columns */}
                <View style={styles.metricsRow}>
                  <View style={styles.metricCol}>
                    <View style={styles.metricIconLabel}>
                      <ArrowDownLeft size={13} color="#10B981" />
                      <Text style={styles.metricLabel}>Money Added</Text>
                    </View>
                    <Text style={[styles.metricValue, { color: '#10B981' }]}>
                      {formatINR(record.totalMoneyAdded)}
                    </Text>
                  </View>

                  <View style={styles.metricCol}>
                    <View style={styles.metricIconLabel}>
                      <ArrowUpRight size={13} color="#EF4444" />
                      <Text style={styles.metricLabel}>Spent</Text>
                    </View>
                    <Text style={[styles.metricValue, { color: '#EF4444' }]}>
                      {formatINR(record.totalWithdrawn)}
                    </Text>
                  </View>

                  <View style={styles.metricCol}>
                    <View style={styles.metricIconLabel}>
                      <Sparkles size={13} color="#EAB308" />
                      <Text style={styles.metricLabel}>Surplus</Text>
                    </View>
                    <Text style={[styles.metricValue, { color: '#EAB308' }]}>
                      {formatINR(netSurplus)}
                    </Text>
                  </View>
                </View>

                {/* Bottom Action Footer */}
                <View style={styles.cardFooter}>
                  <Text style={styles.viewDetailsText}>Click to view complete transactions</Text>
                  <View style={styles.viewDetailsBtn}>
                    <Eye size={14} color="#EAB308" />
                    <Text style={styles.viewDetailsBtnText}>View Breakdown</Text>
                    <ChevronRight size={14} color="#EAB308" />
                  </View>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      {/* Complete Historical Breakdown Modal */}
      <ClosedMonthDetailsModal
        visible={!!selectedRecord}
        record={selectedRecord}
        onClose={() => setSelectedRecord(null)}
      />

      {/* Close Month Modal */}
      <CloseMonthModal
        visible={showCloseMonthModal}
        onClose={() => setShowCloseMonthModal(false)}
        currentBalance={summary.currentBalance}
        totalMoneyAdded={summary.totalMoneyAdded}
        totalExpenses={summary.totalExpenses}
        onConfirmClose={closeCurrentMonth}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  scrollContent: {
    paddingHorizontal: THEME.spacing.lg,
    paddingTop: THEME.spacing.md,
    paddingBottom: 40,
  },
  heroBanner: {
    backgroundColor: '#111726',
    borderRadius: THEME.borderRadius.xl,
    padding: THEME.spacing.lg,
    borderWidth: 1.5,
    borderColor: '#DC2626', // Red accent border
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: THEME.spacing.lg,
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  heroLeft: {
    flex: 1,
    paddingRight: 12,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(234, 179, 8, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: THEME.borderRadius.full,
    alignSelf: 'flex-start',
    marginBottom: 6,
    borderWidth: 1,
    borderColor: 'rgba(234, 179, 8, 0.25)',
  },
  badgeText: {
    color: '#EAB308',
    fontSize: 10,
    fontWeight: THEME.typography.weights.bold,
    letterSpacing: 0.5,
  },
  heroTitle: {
    fontSize: THEME.typography.sizes.lg,
    fontWeight: THEME.typography.weights.heavy,
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  heroSubtitle: {
    fontSize: THEME.typography.sizes.xs,
    color: '#94A3B8',
    marginTop: 4,
  },
  closeMonthBtn: {
    backgroundColor: '#EAB308', // Warm Gold button
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: THEME.borderRadius.lg,
    shadowColor: '#EAB308',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 5,
    elevation: 4,
  },
  closeMonthBtnText: {
    color: '#090D16',
    fontSize: 13,
    fontWeight: THEME.typography.weights.bold,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: THEME.spacing.lg,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#111726',
    borderRadius: THEME.borderRadius.lg,
    padding: 12,
    borderWidth: 1,
    borderColor: '#1E293B',
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 11,
    color: '#94A3B8',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: THEME.typography.weights.bold,
    color: '#FFFFFF',
  },
  listHeaderRow: {
    marginBottom: THEME.spacing.md,
  },
  sectionTitle: {
    fontSize: THEME.typography.sizes.md,
    fontWeight: THEME.typography.weights.bold,
    color: '#FFFFFF',
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
  },
  monthCard: {
    backgroundColor: '#111726',
    borderRadius: THEME.borderRadius.xl,
    padding: THEME.spacing.lg,
    marginBottom: THEME.spacing.md,
    borderWidth: 1.5,
    borderColor: '#1E293B',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  monthCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  monthBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(234, 179, 8, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: THEME.borderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(234, 179, 8, 0.25)',
  },
  monthBadgeText: {
    color: '#FACC15',
    fontSize: 14,
    fontWeight: THEME.typography.weights.bold,
  },
  trashBtn: {
    padding: 6,
  },
  dateRangeText: {
    fontSize: 12,
    color: '#94A3B8',
    marginBottom: 14,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    borderRadius: THEME.borderRadius.lg,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  metricCol: {
    alignItems: 'center',
  },
  metricIconLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 11,
    color: '#94A3B8',
  },
  metricValue: {
    fontSize: 14,
    fontWeight: THEME.typography.weights.bold,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
  },
  viewDetailsText: {
    fontSize: 11,
    color: '#64748B',
  },
  viewDetailsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewDetailsBtnText: {
    color: '#EAB308',
    fontSize: 12,
    fontWeight: THEME.typography.weights.bold,
  },
  emptyContainer: {
    backgroundColor: '#111726',
    borderRadius: THEME.borderRadius.xl,
    padding: 30,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#1E293B',
    marginTop: 10,
  },
  emptyIconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: 'rgba(234, 179, 8, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(234, 179, 8, 0.3)',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: THEME.typography.weights.bold,
    color: '#FFFFFF',
    marginBottom: 8,
  },
  emptyDesc: {
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 20,
  },
  emptyActionBtn: {
    minWidth: 200,
  },
});

