// Sidebar: Sleek responsive Sidebar Navigation component with Yellow and Red theme, person portrait, and Close Month action

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Platform,
  Modal,
} from 'react-native';
import {
  Home,
  Receipt,
  Repeat,
  BarChart3,
  FolderArchive,
  Settings,
  Sparkles,
  X,
  ChevronRight,
  LogIn,
  User,
} from 'lucide-react-native';
import { THEME } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { useFinancial } from '../../context/FinancialContext';
import { useSidebar } from '../../context/SidebarContext';
import { CloseMonthModal } from '../dashboard/CloseMonthModal';

interface NavItem {
  id: string;
  tabKey: 'HomeTab' | 'ExpensesTab' | 'FixedTab' | 'ReportsTab' | 'PreviousDetailsTab' | 'SettingsTab';
  label: string;
  tamilLabel: string;
  icon: (color: string) => React.ReactNode;
}

const NAV_ITEMS: NavItem[] = [
  {
    id: 'home',
    tabKey: 'HomeTab',
    label: 'Home Dashboard',
    tamilLabel: 'முகப்பு',
    icon: (color) => <Home size={19} color={color} />,
  },
  {
    id: 'expenses',
    tabKey: 'ExpensesTab',
    label: 'Expenses & Income',
    tamilLabel: 'செலவுகள்',
    icon: (color) => <Receipt size={19} color={color} />,
  },
  {
    id: 'fixed',
    tabKey: 'FixedTab',
    label: 'Recurring Rules',
    tamilLabel: 'நிலையானவை',
    icon: (color) => <Repeat size={19} color={color} />,
  },
  {
    id: 'reports',
    tabKey: 'ReportsTab',
    label: 'Reports & Analytics',
    tamilLabel: 'அறிக்கைகள்',
    icon: (color) => <BarChart3 size={19} color={color} />,
  },
  {
    id: 'previous',
    tabKey: 'PreviousDetailsTab',
    label: 'Previous Details',
    tamilLabel: 'முந்தைய விவரங்கள்',
    icon: (color) => <FolderArchive size={19} color={color} />,
  },
  {
    id: 'settings',
    tabKey: 'SettingsTab',
    label: 'Settings & Account',
    tamilLabel: 'அமைப்புகள்',
    icon: (color) => <Settings size={19} color={color} />,
  },
];

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tabName: any) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
}) => {
  const { session, profile, user } = useAuth();
  const { isDesktop, mobileMenuVisible, closeMobileMenu } = useSidebar();
  const { summary, closeCurrentMonth } = useFinancial();
  const [showCloseModal, setShowCloseModal] = useState<boolean>(false);

  const handleNavPress = (tabKey: any) => {
    onSelectTab(tabKey);
    if (!isDesktop) {
      closeMobileMenu();
    }
  };

  const renderSidebarContent = () => (
    <View style={styles.sidebarInner}>
      {/* 1. Brand Logo & Name */}
      <View style={styles.brandContainer}>
        <View style={styles.brandRow}>
          <Image
            source={require('../../../assets/brand/emblem.png')}
            style={styles.emblem}
            resizeMode="contain"
          />
          <View style={styles.brandTextCol}>
            <Text style={styles.brandTitle}>வெற்றி நிதி</Text>
            <Text style={styles.brandSubtitle}>மேலாண்மை</Text>
          </View>
        </View>
        <Text style={styles.brandTagline}>FINANCE MANAGEMENT FOR ALL</Text>
      </View>

      {/* 2. Designated Person's Photo (Thalapathy Vijay) */}
      <View style={styles.leaderCard}>
        <View style={styles.leaderPhotoFrame}>
          <Image
            source={require('../../../assets/brand/leader_square.png')}
            style={styles.leaderPhoto}
            resizeMode="cover"
          />
        </View>
        <View style={styles.leaderInfo}>
          <View style={styles.leaderPill}>
            <Sparkles size={10} color="#EAB308" />
            <Text style={styles.leaderPillText}>நமது உத்வேகம்</Text>
          </View>
          <Text style={styles.leaderName}>தளபதி விஜய்</Text>
        </View>
      </View>

      {/* User Status / Login Action in Sidebar */}
      {!session ? (
        <TouchableOpacity
          style={styles.sidebarLoginBtn}
          onPress={() => handleNavPress('Login')}
          activeOpacity={0.85}
        >
          <View style={styles.sidebarLoginIconCircle}>
            <LogIn size={13} color="#090D16" />
          </View>
          <View style={styles.sidebarLoginTextCol}>
            <Text style={styles.sidebarLoginTitle}>Sign In / Login</Text>
            <Text style={styles.sidebarLoginSub}>Access your account</Text>
          </View>
          <ChevronRight size={14} color="#090D16" />
        </TouchableOpacity>
      ) : (
        <View style={styles.sidebarUserRow}>
          <View style={styles.sidebarUserStatusDot} />
          <Text style={styles.sidebarUserName} numberOfLines={1}>
            {profile?.name || user?.email?.split('@')[0] || 'Active Member'}
          </Text>
        </View>
      )}

      {/* 3. Navigation Links List */}
      <ScrollView showsVerticalScrollIndicator={false} style={styles.navScroll}>
        <Text style={styles.navSectionHeading}>NAVIGATION</Text>
        {NAV_ITEMS.map((item) => {
          const isActive = currentTab === item.tabKey;
          const iconColor = isActive ? '#FACC15' : '#94A3B8';

          return (
            <TouchableOpacity
              key={item.id}
              style={[styles.navItem, isActive && styles.navItemActive]}
              onPress={() => handleNavPress(item.tabKey)}
              activeOpacity={0.8}
            >
              <View style={[styles.navIconBox, isActive && styles.navIconBoxActive]}>
                {item.icon(iconColor)}
              </View>
              <View style={styles.navLabelCol}>
                <Text style={[styles.navLabel, isActive && styles.navLabelActive]}>
                  {item.label}
                </Text>
                <Text style={[styles.navSubLabel, isActive && styles.navSubLabelActive]}>
                  {item.tamilLabel}
                </Text>
              </View>
              {isActive && (
                <View style={styles.activePillIndicator} />
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* 4. Prominent "Close Month" Action in Sidebar */}
      <View style={styles.bottomActionContainer}>
        <TouchableOpacity
          style={styles.closeMonthActionBtn}
          onPress={() => setShowCloseModal(true)}
          activeOpacity={0.85}
        >
          <View style={styles.closeMonthIconCircle}>
            <Sparkles size={15} color="#DC2626" />
          </View>
          <View style={styles.closeMonthTextCol}>
            <Text style={styles.closeMonthTitle}>Close Month</Text>
            <Text style={styles.closeMonthSub}>Archive & Rollover</Text>
          </View>
          <ChevronRight size={16} color="#090D16" />
        </TouchableOpacity>
      </View>

      {/* Close Month Modal */}
      <CloseMonthModal
        visible={showCloseModal}
        onClose={() => setShowCloseModal(false)}
        currentBalance={summary.currentBalance}
        totalMoneyAdded={summary.totalMoneyAdded}
        totalExpenses={summary.totalExpenses}
        onConfirmClose={closeCurrentMonth}
      />
    </View>
  );

  // Desktop Permanent Sidebar
  if (isDesktop) {
    return (
      <View style={styles.desktopContainer}>
        {renderSidebarContent()}
      </View>
    );
  }

  // Mobile Slide-out Drawer Modal
  return (
    <Modal
      visible={mobileMenuVisible}
      transparent
      animationType="fade"
      onRequestClose={closeMobileMenu}
    >
      <View style={styles.mobileOverlay}>
        <TouchableOpacity
          style={styles.mobileBackdrop}
          activeOpacity={1}
          onPress={closeMobileMenu}
        />
        <View style={styles.mobileDrawer}>
          <TouchableOpacity
            style={styles.closeDrawerBtn}
            onPress={closeMobileMenu}
            activeOpacity={0.7}
          >
            <X size={20} color="#F8FAFC" />
          </TouchableOpacity>
          {renderSidebarContent()}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  desktopContainer: {
    width: 260,
    backgroundColor: '#070A12',
    borderRightWidth: 1.5,
    borderRightColor: '#1E293B',
    height: '100%',
  },
  sidebarInner: {
    flex: 1,
    paddingVertical: 18,
    paddingHorizontal: 16,
    justifyContent: 'space-between',
  },
  brandContainer: {
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
    marginBottom: 12,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  emblem: {
    width: 38,
    height: 38,
  },
  brandTextCol: {
    flex: 1,
  },
  brandTitle: {
    fontSize: 16,
    fontWeight: THEME.typography.weights.heavy,
    color: '#DC2626', // Vibrant Red
    letterSpacing: -0.3,
    lineHeight: 18,
  },
  brandSubtitle: {
    fontSize: 13,
    fontWeight: THEME.typography.weights.bold,
    color: '#EAB308', // Warm Gold
    lineHeight: 16,
  },
  brandTagline: {
    fontSize: 9,
    fontWeight: THEME.typography.weights.bold,
    color: '#64748B',
    letterSpacing: 1.2,
    marginTop: 6,
  },
  leaderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(220, 38, 38, 0.08)',
    borderRadius: THEME.borderRadius.lg,
    padding: 10,
    marginBottom: 14,
    borderWidth: 1.5,
    borderColor: '#DC2626',
    gap: 10,
  },
  leaderPhotoFrame: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: '#EAB308',
    backgroundColor: '#0F172A',
    overflow: 'hidden',
    shadowColor: '#EAB308',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 4,
    elevation: 4,
  },
  leaderPhoto: {
    width: '100%',
    height: '100%',
  },
  leaderInfo: {
    flex: 1,
  },
  leaderPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(234, 179, 8, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginBottom: 3,
  },
  leaderPillText: {
    color: '#FACC15',
    fontSize: 9,
    fontWeight: THEME.typography.weights.bold,
  },
  leaderName: {
    color: '#F8FAFC',
    fontSize: 13,
    fontWeight: THEME.typography.weights.bold,
  },
  sidebarLoginBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EAB308',
    borderRadius: THEME.borderRadius.lg,
    paddingVertical: 9,
    paddingHorizontal: 10,
    marginBottom: 10,
    gap: 8,
    shadowColor: '#EAB308',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  sidebarLoginIconCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sidebarLoginTextCol: {
    flex: 1,
  },
  sidebarLoginTitle: {
    color: '#090D16',
    fontSize: 12,
    fontWeight: THEME.typography.weights.heavy,
  },
  sidebarLoginSub: {
    color: '#451A03',
    fontSize: 9,
    fontWeight: THEME.typography.weights.semibold,
  },
  sidebarUserRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(220, 38, 38, 0.12)',
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRadius: THEME.borderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(220, 38, 38, 0.25)',
    marginBottom: 10,
  },
  sidebarUserStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },
  sidebarUserName: {
    color: '#F8FAFC',
    fontSize: 12,
    fontWeight: THEME.typography.weights.bold,
    flex: 1,
  },
  navScroll: {
    flex: 1,
    marginVertical: 4,
  },
  navSectionHeading: {
    fontSize: 10,
    fontWeight: THEME.typography.weights.bold,
    color: '#64748B',
    letterSpacing: 1.5,
    marginBottom: 8,
    paddingHorizontal: 6,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: THEME.borderRadius.lg,
    marginBottom: 5,
    gap: 10,
  },
  navItemActive: {
    backgroundColor: 'rgba(220, 38, 38, 0.16)',
    borderLeftWidth: 3.5,
    borderLeftColor: '#EAB308', // Gold active indicator
  },
  navIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navIconBoxActive: {
    backgroundColor: '#DC2626',
  },
  navLabelCol: {
    flex: 1,
  },
  navLabel: {
    fontSize: 13,
    fontWeight: THEME.typography.weights.semibold,
    color: '#94A3B8',
  },
  navLabelActive: {
    color: '#F8FAFC',
    fontWeight: THEME.typography.weights.bold,
  },
  navSubLabel: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 1,
  },
  navSubLabelActive: {
    color: '#FACC15',
  },
  activePillIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#EAB308',
  },
  bottomActionContainer: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
  },
  closeMonthActionBtn: {
    backgroundColor: '#EAB308', // Warm Gold
    borderRadius: THEME.borderRadius.lg,
    paddingVertical: 11,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#EAB308',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 4,
  },
  closeMonthIconCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeMonthTextCol: {
    flex: 1,
    paddingHorizontal: 8,
  },
  closeMonthTitle: {
    color: '#090D16',
    fontSize: 12,
    fontWeight: THEME.typography.weights.heavy,
  },
  closeMonthSub: {
    color: '#451A03',
    fontSize: 10,
    fontWeight: THEME.typography.weights.semibold,
  },
  // Mobile Drawer
  mobileOverlay: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
  },
  mobileBackdrop: {
    flex: 1,
  },
  mobileDrawer: {
    width: 280,
    height: '100%',
    backgroundColor: '#070A12',
    borderRightWidth: 1.5,
    borderRightColor: '#1E293B',
    paddingTop: Platform.OS === 'ios' ? 44 : 20,
  },
  closeDrawerBtn: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 48 : 20,
    right: 14,
    zIndex: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
