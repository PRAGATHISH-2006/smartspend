// ExpensesScreen: Complete transaction history with search, filters, and logging actions

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { Plus, Wallet, Receipt, FileSpreadsheet, Mail } from 'lucide-react-native';
import { THEME } from '../../constants/theme';
import { MainTabParamList } from '../../types/navigation';
import { useFinancial } from '../../context/FinancialContext';
import { AppHeader } from '../../components/common/AppHeader';
import { ExpenseCard } from '../../components/expenses/ExpenseCard';
import { TransactionFilterBar, FilterTab } from '../../components/expenses/TransactionFilterBar';
import { AddExpenseModal } from '../../components/expenses/AddExpenseModal';
import { AddMoneyModal } from '../../components/expenses/AddMoneyModal';
import { GenerateReportModal } from '../../components/expenses/GenerateReportModal';
import { NotificationsModal } from '../modals/NotificationsModal';
import { EmptyState } from '../../components/common/EmptyState';
import { UnifiedTransaction } from '../../types/financial';

type Props = BottomTabScreenProps<MainTabParamList, 'ExpensesTab'>;

export const ExpensesScreen: React.FC<Props> = () => {
  const {
    refreshing,
    refreshData,
    unifiedTransactions,
    categories,
    addExpense,
    addMoney,
    addCustomCategory,
  } = useFinancial();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTab, setSelectedTab] = useState<FilterTab>('all');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const [showAddExpense, setShowAddExpense] = useState<boolean>(false);
  const [showAddMoney, setShowAddMoney] = useState<boolean>(false);
  const [showGenerateReport, setShowGenerateReport] = useState<boolean>(false);
  const [showNotifications, setShowNotifications] = useState<boolean>(false);

  // Available unique categories in user's transactions
  const availableCategories = useMemo(() => {
    return Array.from(new Set(unifiedTransactions.map((tx) => tx.category))).filter(Boolean);
  }, [unifiedTransactions]);

  // Filtered transactions
  const filteredTransactions = useMemo(() => {
    return unifiedTransactions.filter((tx) => {
      // 1. Tab filter
      if (selectedTab === 'expense' && tx.type !== 'manual_expense') return false;
      if (selectedTab === 'income' && tx.type !== 'money_added') return false;
      if (selectedTab === 'fixed' && tx.type !== 'fixed_expense') return false;
      if (selectedTab === 'skipped' && tx.type !== 'skipped_fixed_expense') return false;

      // 2. Category filter
      if (selectedCategory && tx.category !== selectedCategory) return false;

      // 3. Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchName = tx.name.toLowerCase().includes(query);
        const matchCategory = tx.category.toLowerCase().includes(query);
        const matchNotes = tx.notes ? tx.notes.toLowerCase().includes(query) : false;
        if (!matchName && !matchCategory && !matchNotes) return false;
      }

      return true;
    });
  }, [unifiedTransactions, selectedTab, selectedCategory, searchQuery]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppHeader
        title="Transaction Log"
        subtitle="Complete history of additions & expenses"
        onNotificationPress={() => setShowNotifications(true)}
        rightElement={
          <View style={styles.headerBtnRow}>
            <TouchableOpacity
              style={[styles.headerIconBtn, styles.headerReportBtn]}
              onPress={() => setShowGenerateReport(true)}
              activeOpacity={0.8}
              accessibilityLabel="Generate Report"
            >
              <FileSpreadsheet size={16} color="#FFF" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.headerIconBtn, styles.headerMoneyBtn]}
              onPress={() => setShowAddMoney(true)}
              activeOpacity={0.8}
            >
              <Wallet size={16} color="#FFF" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.headerIconBtn, styles.headerExpenseBtn]}
              onPress={() => setShowAddExpense(true)}
              activeOpacity={0.8}
            >
              <Plus size={18} color="#FFF" />
            </TouchableOpacity>
          </View>
        }
      />

      <TransactionFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedTab={selectedTab}
        onSelectTab={setSelectedTab}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        availableCategories={availableCategories}
      />

      {/* Quick Generate Report Bar */}
      <View style={styles.reportBarContainer}>
        <View style={styles.reportBarLeft}>
          <FileSpreadsheet size={16} color={THEME.colors.primary} />
          <View>
            <Text style={styles.reportBarTitle}>Generate Custom Report</Text>
            <Text style={styles.reportBarSub}>Email audit report to selvanpragathish@gmail.com</Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.generateReportBtn}
          onPress={() => setShowGenerateReport(true)}
          activeOpacity={0.8}
        >
          <Mail size={13} color="#FFF" />
          <Text style={styles.generateReportBtnText}>Generate</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredTransactions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ExpenseCard transaction={item} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refreshData}
            tintColor={THEME.colors.primary}
            colors={[THEME.colors.primary]}
          />
        }
        ListEmptyComponent={
          <EmptyState
            icon={<Receipt size={32} color={THEME.colors.primary} />}
            title="No transactions found"
            description={
              searchQuery || selectedCategory || selectedTab !== 'all'
                ? 'Try adjusting your search or filters.'
                : 'Start by recording your first expense or adding money to your wallet.'
            }
            actionTitle="Add Expense"
            onAction={() => setShowAddExpense(true)}
          />
        }
      />

      {/* Modals */}
      <AddExpenseModal
        visible={showAddExpense}
        categories={categories}
        onClose={() => setShowAddExpense(false)}
        onSubmit={addExpense}
        onAddCustomCategory={addCustomCategory}
      />

      <AddMoneyModal
        visible={showAddMoney}
        onClose={() => setShowAddMoney(false)}
        onSubmit={addMoney}
      />

      <GenerateReportModal
        visible={showGenerateReport}
        onClose={() => setShowGenerateReport(false)}
      />

      <NotificationsModal
        visible={showNotifications}
        onClose={() => setShowNotifications(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  headerBtnRow: {
    flexDirection: 'row',
    gap: 8,
    marginRight: 6,
  },
  headerIconBtn: {
    width: 36,
    height: 36,
    borderRadius: THEME.borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    ...THEME.shadows.subtle,
  },
  headerReportBtn: {
    backgroundColor: THEME.colors.primaryDark,
  },
  headerMoneyBtn: {
    backgroundColor: THEME.colors.indigo,
  },
  headerExpenseBtn: {
    backgroundColor: THEME.colors.primary,
  },
  reportBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: THEME.colors.surface,
    marginHorizontal: THEME.spacing.lg,
    marginBottom: THEME.spacing.sm,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: THEME.borderRadius.lg,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    ...THEME.shadows.subtle,
  },
  reportBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  reportBarTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
  },
  reportBarSub: {
    fontSize: 10,
    color: THEME.colors.textMuted,
    marginTop: 1,
  },
  generateReportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.primary,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: THEME.borderRadius.full,
    gap: 6,
  },
  generateReportBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFF',
  },
  listContent: {
    paddingHorizontal: THEME.spacing.lg,
    paddingTop: THEME.spacing.xs,
    paddingBottom: THEME.spacing.huge,
  },
});
