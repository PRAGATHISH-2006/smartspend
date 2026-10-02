// CloseMonthModal: Modal to close active month, rollover surplus to next month, and archive to Google Drive
import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Linking,
  ActivityIndicator,
} from 'react-native';
import {
  X,
  FolderArchive,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Coins,
  Mail,
  ShieldCheck,
  Cloud,
  UploadCloud,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  XCircle,
  Repeat,
} from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { THEME } from '../../constants/theme';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Badge } from '../common/Badge';
import { formatINR } from '../../utils/currency';
import { uploadPdfToGoogleDrive, GoogleDriveUploadResult } from '../../services/pdfReportService';
import { TodayFixedExpenseItem } from '../../types/financial';
import { getCategoryMeta } from '../../constants/categories';

interface CloseMonthModalProps {
  visible: boolean;
  onClose: () => void;
  periodStartFormatted?: string;
  periodEndFormatted?: string;
  totalMoneyAdded: number;
  totalExpenses: number;
  currentBalance: number;
  todayFixedExpenses?: TodayFixedExpenseItem[];
  onPayFixedExpense?: (occurrenceId: string, customAmount?: number) => Promise<{ error: Error | null }>;
  onSkipFixedExpense?: (occurrenceId: string) => Promise<{ error: Error | null }>;
  onConfirmClose: () => Promise<{
    success: boolean;
    rolloverAmount: number;
    driveFolderUrl: string;
    pdfFilename?: string;
    pdfBase64?: string;
    driveUploadSuccess?: boolean;
    message?: string;
    error?: string;
  }>;
}

export const CloseMonthModal: React.FC<CloseMonthModalProps> = ({
  visible,
  onClose,
  periodStartFormatted,
  periodEndFormatted,
  totalMoneyAdded,
  totalExpenses,
  currentBalance,
  todayFixedExpenses = [],
  onPayFixedExpense,
  onSkipFixedExpense,
  onConfirmClose,
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [actionInProgressId, setActionInProgressId] = useState<string | null>(null);
  const [closedResult, setClosedResult] = useState<{
    success: boolean;
    rolloverAmount: number;
    driveFolderUrl: string;
    pdfFilename?: string;
    pdfBase64?: string;
    driveUploadSuccess?: boolean;
    message?: string;
  } | null>(null);
  const [webhookUrl, setWebhookUrl] = useState<string>('');
  const [uploadingDrive, setUploadingDrive] = useState<boolean>(false);
  const [driveUploadResult, setDriveUploadResult] = useState<GoogleDriveUploadResult | null>(null);
  const [showScriptGuide, setShowScriptGuide] = useState<boolean>(false);
  const [copiedScript, setCopiedScript] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const DRIVE_FOLDER_URL =
    'https://drive.google.com/drive/folders/1AJzY39IKyCTR0d7HspLN0bMk609kITT2?usp=sharing';

  const rolloverAmount = Math.max(0, currentBalance);

  // Load saved webhook URL on mount
  React.useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem('gdrive_webhook_url');
        if (saved) setWebhookUrl(saved);
      } catch {}
    })();
  }, []);

  const SCRIPT_SNIPPET = `function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var folder = DriveApp.getFolderById("1AJzY39IKyCTR0d7HspLN0bMk609kITT2");
    var decoded = Utilities.base64Decode(data.base64);
    var blob = Utilities.newBlob(decoded, "application/pdf", data.filename);
    var file = folder.createFile(blob);
    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      fileId: file.getId(),
      fileUrl: file.getUrl()
    })).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}`;

  const handleCopyScript = () => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        navigator.clipboard.writeText(SCRIPT_SNIPPET);
        setCopiedScript(true);
        setTimeout(() => setCopiedScript(false), 2000);
      }
    } catch {}
  };

  const handlePayItem = async (item: TodayFixedExpenseItem) => {
    if (!onPayFixedExpense) return;
    setActionInProgressId(item.occurrenceId);
    try {
      await onPayFixedExpense(item.occurrenceId, item.amount);
    } catch (e) {
      console.warn('Pay item error:', e);
    } finally {
      setActionInProgressId(null);
    }
  };

  const handleSkipItem = async (item: TodayFixedExpenseItem) => {
    if (!onSkipFixedExpense) return;
    setActionInProgressId(item.occurrenceId);
    try {
      await onSkipFixedExpense(item.occurrenceId);
    } catch (e) {
      console.warn('Skip item error:', e);
    } finally {
      setActionInProgressId(null);
    }
  };

  const handleCloseMonth = async () => {
    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await onConfirmClose();
      if (!res.success) {
        setErrorMsg(res.error || 'Failed to close month.');
      } else {
        setClosedResult(res);

        if (res.driveUploadSuccess) {
          setDriveUploadResult({
            success: true,
            message: `Successfully uploaded ${res.pdfFilename || 'Transactions.pdf'} to Google Drive!`,
            fileUrl: DRIVE_FOLDER_URL,
          });
        } else {
          // Attempt automatic Google Drive upload if webhook is available
          const currentWebhook = webhookUrl || (await AsyncStorage.getItem('gdrive_webhook_url')) || '';
          if (currentWebhook && res.pdfFilename && res.pdfBase64) {
            setUploadingDrive(true);
            try {
              const uploadRes = await uploadPdfToGoogleDrive({
                filename: res.pdfFilename,
                base64: res.pdfBase64,
                webhookUrl: currentWebhook,
              });
              setDriveUploadResult(uploadRes);
            } catch (upErr: any) {
              console.warn('Auto upload error:', upErr);
            } finally {
              setUploadingDrive(false);
            }
          }
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error occurred while closing month.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAndUploadDrive = async () => {
    if (!webhookUrl.trim()) return;
    setUploadingDrive(true);
    try {
      await AsyncStorage.setItem('gdrive_webhook_url', webhookUrl.trim());
      const filename = closedResult?.pdfFilename || 'October_2026_Transactions.pdf';
      const base64 = closedResult?.pdfBase64 || '';
      const upRes = await uploadPdfToGoogleDrive({
        filename,
        base64,
        webhookUrl: webhookUrl.trim(),
      });
      setDriveUploadResult(upRes);
    } catch (err: any) {
      console.warn('Drive upload error:', err);
    } finally {
      setUploadingDrive(false);
    }
  };

  const handleOpenDrive = () => {
    try {
      if (typeof window !== 'undefined') {
        window.open(DRIVE_FOLDER_URL, '_blank');
      } else {
        Linking.openURL(DRIVE_FOLDER_URL);
      }
    } catch {
      // Fallback
    }
  };

  const handleModalClose = () => {
    setClosedResult(null);
    setDriveUploadResult(null);
    setErrorMsg(null);
    onClose();
  };

  const pendingFixedExpenses = todayFixedExpenses.filter((item) => item.status === 'pending');

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleModalClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.overlay}
      >
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <View style={[styles.iconCircle, closedResult && styles.iconCircleSuccess]}>
                {closedResult ? (
                  <CheckCircle2 size={22} color="#059669" />
                ) : (
                  <FolderArchive size={22} color={THEME.colors.primary} />
                )}
              </View>
              <View>
                <Text style={styles.title}>
                  {closedResult ? 'Month Successfully Closed' : 'Close This Month'}
                </Text>
                <Text style={styles.subtitle}>
                  {closedResult
                    ? 'Surplus rolled over & cycle archived'
                    : 'Review recurring expenses, rollover surplus & archive'}
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={handleModalClose} style={styles.closeBtn}>
              <X size={20} color={THEME.colors.textMuted} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* 1. SUCCESS VIEW (After Month Closed) */}
            {closedResult ? (
              <View style={styles.successWrapper}>
                <View style={styles.successBanner}>
                  <Text style={styles.successBannerTitle}>🎉 Cycle Successfully Closed!</Text>
                  <Text style={styles.successBannerSub}>{closedResult.message}</Text>
                </View>

                {/* Rollover Card */}
                {closedResult.rolloverAmount > 0 && (
                  <View style={styles.rolloverHighlightCard}>
                    <Coins size={22} color="#047857" />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.rolloverHighlightLabel}>Unspent Balance Carried Forward</Text>
                      <Text style={styles.rolloverHighlightAmount}>
                        {formatINR(closedResult.rolloverAmount)}
                      </Text>
                      <Text style={styles.rolloverHighlightDesc}>
                        This exact amount remains available as your starting funds in your next cycle wallet.
                      </Text>
                    </View>
                  </View>
                )}

                {/* Automatic Drive Upload Result or Setup */}
                {driveUploadResult?.success ? (
                  <View style={styles.autoUploadSuccessBox}>
                    <CheckCircle2 size={20} color="#059669" />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.autoUploadTitle}>✅ Automatically Uploaded to Google Drive!</Text>
                      <Text style={styles.autoUploadDesc}>
                        {closedResult.pdfFilename || 'Transactions.pdf'} is now stored in your Drive folder.
                      </Text>
                      {driveUploadResult.fileUrl && (
                        <TouchableOpacity
                          style={{ marginTop: 6 }}
                          onPress={() => window.open(driveUploadResult.fileUrl, '_blank')}
                        >
                          <Text style={styles.fileLinkText}>View File in Google Drive →</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                ) : (
                  <View style={styles.autoUploadSetupBox}>
                    <View style={styles.autoUploadHeaderRow}>
                      <UploadCloud size={20} color={THEME.colors.primary} />
                      <Text style={styles.autoUploadBoxTitle}>Automatic Google Drive Upload</Text>
                    </View>
                    <Text style={styles.autoUploadBoxDesc}>
                      Paste your Google Apps Script Web App URL below to automatically push{' '}
                      <Text style={{ fontWeight: '700' }}>
                        {closedResult.pdfFilename || 'October_2026_Transactions.pdf'}
                      </Text>{' '}
                      directly into folder <Text style={{ fontWeight: '700' }}>1AJzY39IKyCTR0d7HspLN0bMk609kITT2</Text>:
                    </Text>

                    <Input
                      value={webhookUrl}
                      onChangeText={setWebhookUrl}
                      placeholder="https://script.google.com/macros/s/.../exec"
                      leftIcon={<Cloud size={16} color={THEME.colors.textMuted} />}
                    />

                    <Button
                      title={uploadingDrive ? 'Uploading to Drive...' : 'Save URL & Upload to Google Drive Now'}
                      onPress={handleSaveAndUploadDrive}
                      loading={uploadingDrive}
                      disabled={!webhookUrl.trim()}
                      variant="primary"
                      icon={<UploadCloud size={16} color="#FFF" />}
                      style={{ marginTop: 8 }}
                    />

                    {/* How to get URL collapsible */}
                    <TouchableOpacity
                      style={styles.guideToggle}
                      onPress={() => setShowScriptGuide(!showScriptGuide)}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.guideToggleText}>
                        {showScriptGuide ? 'Hide 1-Minute Setup Guide' : 'Show 1-Minute Setup Guide (10 Lines of Code)'}
                      </Text>
                      {showScriptGuide ? (
                        <ChevronUp size={16} color={THEME.colors.primary} />
                      ) : (
                        <ChevronDown size={16} color={THEME.colors.primary} />
                      )}
                    </TouchableOpacity>

                    {showScriptGuide && (
                      <View style={styles.scriptGuideContent}>
                        <Text style={styles.scriptGuideStep}>
                          1. Open <Text style={{ fontWeight: '700' }}>script.google.com/home</Text> and click <Text style={{ fontWeight: '700' }}>+ New project</Text>.
                        </Text>
                        <Text style={styles.scriptGuideStep}>
                          2. Replace the code with the script below and click <Text style={{ fontWeight: '700' }}>Save</Text>:
                        </Text>

                        <View style={styles.codeSnippetBox}>
                          <TouchableOpacity
                            style={styles.copyBtn}
                            onPress={handleCopyScript}
                            activeOpacity={0.7}
                          >
                            {copiedScript ? <Check size={14} color="#059669" /> : <Copy size={14} color="#475569" />}
                            <Text style={styles.copyBtnText}>{copiedScript ? 'Copied!' : 'Copy Script'}</Text>
                          </TouchableOpacity>
                          <Text style={styles.codeText}>{SCRIPT_SNIPPET}</Text>
                        </View>

                        <Text style={styles.scriptGuideStep}>
                          3. Click <Text style={{ fontWeight: '700' }}>Deploy</Text> ➔ <Text style={{ fontWeight: '700' }}>New deployment</Text> ➔ Select type <Text style={{ fontWeight: '700' }}>Web app</Text>.
                        </Text>
                        <Text style={styles.scriptGuideStep}>
                          4. Set <Text style={{ fontWeight: '700' }}>Execute as: Me</Text> and <Text style={{ fontWeight: '700' }}>Who has access: Anyone</Text>.
                        </Text>
                        <Text style={styles.scriptGuideStep}>
                          5. Click <Text style={{ fontWeight: '700' }}>Deploy</Text>, copy the <Text style={{ fontWeight: '700' }}>Web app URL</Text> and paste it above!
                        </Text>
                      </View>
                    )}
                  </View>
                )}

                {/* PDF & Drive Link Box */}
                <View style={styles.driveCard}>
                  <Text style={styles.driveCardTitle}>📁 Google Drive Archival Statement</Text>
                  <Text style={styles.driveCardDesc}>
                    Your ledger statement <Text style={{ fontWeight: '700', color: '#1E40AF' }}>{closedResult.pdfFilename || 'October_2026_Transactions.pdf'}</Text> is preserved for your Google Drive records.
                  </Text>
                  <TouchableOpacity
                    style={styles.openDriveBtn}
                    onPress={handleOpenDrive}
                    activeOpacity={0.8}
                  >
                    <ExternalLink size={16} color="#FFF" />
                    <Text style={styles.openDriveBtnText}>Open Google Drive Folder</Text>
                  </TouchableOpacity>
                </View>

                {/* Email Notice */}
                <View style={styles.emailNoticeCard}>
                  <Mail size={16} color="#4F46E5" />
                  <Text style={styles.emailNoticeText}>
                    A complete closing digest with the Google Drive backup link has also been emailed to <Text style={{ fontWeight: '700' }}>selvanpragathish@gmail.com</Text>.
                  </Text>
                </View>

                <Button
                  title="Done & Return to Dashboard"
                  onPress={handleModalClose}
                  variant="primary"
                  style={styles.doneBtn}
                />
              </View>
            ) : (
              /* 2. CONFIRMATION VIEW (Before Closing) */
              <View>
                {/* 2A. Recurring Fixed Expenses Settle / Review Section */}
                {todayFixedExpenses && todayFixedExpenses.length > 0 && (
                  <View style={styles.fixedReviewCard}>
                    <View style={styles.fixedReviewHeader}>
                      <View style={styles.fixedReviewTitleRow}>
                        <Repeat size={16} color={THEME.colors.primary} />
                        <Text style={styles.fixedReviewTitle}>Fixed Expenses for this Period</Text>
                      </View>
                      {pendingFixedExpenses.length > 0 ? (
                        <View style={styles.pendingBadge}>
                          <Text style={styles.pendingBadgeText}>
                            {pendingFixedExpenses.length} Pending
                          </Text>
                        </View>
                      ) : (
                        <View style={styles.settledBadge}>
                          <Text style={styles.settledBadgeText}>All Settled ✓</Text>
                        </View>
                      )}
                    </View>

                    <Text style={styles.fixedReviewSub}>
                      With your permission, choose to <Text style={{ fontWeight: '700' }}>Pay</Text> or <Text style={{ fontWeight: '700' }}>Skip</Text> any fixed expense before closing. Paid amounts will be deducted from your closing balance.
                    </Text>

                    <View style={styles.fixedItemsList}>
                      {todayFixedExpenses.map((item) => {
                        const meta = getCategoryMeta(item.category);
                        const isPending = item.status === 'pending';
                        const isCompleted = item.status === 'completed';
                        const isSkipped = item.status === 'skipped';
                        const isWorking = actionInProgressId === item.occurrenceId;

                        return (
                          <View key={item.occurrenceId} style={styles.fixedItemRow}>
                            <View style={styles.fixedItemLeft}>
                              <View
                                style={[
                                  styles.fixedCategoryDot,
                                  { backgroundColor: meta.color || THEME.colors.primary },
                                ]}
                              />
                              <View style={{ flex: 1 }}>
                                <Text style={styles.fixedItemName}>{item.name}</Text>
                                <Text style={styles.fixedItemCategory}>
                                  {item.category} • <Text style={styles.freqTag}>{item.frequency.toUpperCase()}</Text>
                                </Text>
                              </View>
                            </View>

                            <View style={styles.fixedItemRight}>
                              <Text
                                style={[
                                  styles.fixedItemAmount,
                                  isCompleted && styles.amountCompleted,
                                  isSkipped && styles.amountSkipped,
                                ]}
                              >
                                {formatINR(item.amount)}
                              </Text>

                              {isWorking ? (
                                <ActivityIndicator size="small" color={THEME.colors.primary} />
                              ) : isPending ? (
                                <View style={styles.fixedActionsRow}>
                                  <TouchableOpacity
                                    style={[styles.fixedBtnAction, styles.fixedBtnPay]}
                                    onPress={() => handlePayItem(item)}
                                    activeOpacity={0.8}
                                  >
                                    <CheckCircle2 size={13} color="#FFF" />
                                    <Text style={styles.fixedBtnPayText}>Pay</Text>
                                  </TouchableOpacity>

                                  <TouchableOpacity
                                    style={[styles.fixedBtnAction, styles.fixedBtnSkip]}
                                    onPress={() => handleSkipItem(item)}
                                    activeOpacity={0.8}
                                  >
                                    <XCircle size={13} color={THEME.colors.textSecondary} />
                                    <Text style={styles.fixedBtnSkipText}>Skip</Text>
                                  </TouchableOpacity>
                                </View>
                              ) : isCompleted ? (
                                <Badge label={`Paid ${formatINR(item.amount)}`} variant="success" size="sm" />
                              ) : (
                                <Badge label="Skipped" variant="warning" size="sm" />
                              )}
                            </View>
                          </View>
                        );
                      })}
                    </View>
                  </View>
                )}

                {/* Financial Cycle Summary Table */}
                <View style={styles.summaryCard}>
                  <Text style={styles.summaryTitle}>
                    Cycle: {periodStartFormatted || 'Current Period'} – {periodEndFormatted || 'Today'}
                  </Text>
                  <View style={styles.summaryDivider} />

                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryRowLabel}>Total Money Added:</Text>
                    <Text style={[styles.summaryRowVal, { color: '#059669' }]}>
                      +{formatINR(totalMoneyAdded)}
                    </Text>
                  </View>

                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryRowLabel}>Total Expenses Incurred:</Text>
                    <Text style={[styles.summaryRowVal, { color: '#DC2626' }]}>
                      -{formatINR(totalExpenses)}
                    </Text>
                  </View>

                  <View style={styles.summaryDivider} />

                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryBalanceLabel}>Closing Net Balance:</Text>
                    <Text style={styles.summaryBalanceVal}>{formatINR(currentBalance)}</Text>
                  </View>
                </View>

                {/* Rollover Surplus Preview Box */}
                {rolloverAmount > 0 ? (
                  <View style={styles.rolloverBox}>
                    <View style={styles.rolloverHeader}>
                      <Coins size={20} color="#047857" />
                      <Text style={styles.rolloverTitle}>💰 Unspent Balance Carried Forward</Text>
                    </View>
                    <Text style={styles.rolloverAmount}>{formatINR(rolloverAmount)}</Text>
                    <Text style={styles.rolloverText}>
                      Your remaining balance of {formatINR(rolloverAmount)} will carry over directly into your next cycle wallet so you can continue spending smoothly!
                    </Text>
                  </View>
                ) : (
                  <View style={styles.noRolloverBox}>
                    <AlertTriangle size={18} color="#B45309" />
                    <Text style={styles.noRolloverText}>
                      Your balance is currently {formatINR(currentBalance)}. No surplus balance will be rolled over.
                    </Text>
                  </View>
                )}

                {/* Google Drive Storage Location */}
                <View style={styles.driveInfoBox}>
                  <Text style={styles.driveInfoTitle}>☁️ Backup to Google Drive as PDF</Text>
                  <Text style={styles.driveInfoText}>
                    All transaction logs will be compiled into a <Text style={{ fontWeight: '700' }}>PDF document named with the month</Text> (e.g. <Text style={{ fontWeight: '700', color: '#1E40AF' }}>October_2026_Transactions.pdf</Text>) and stored in your Google Drive archival folder:
                  </Text>
                  <TouchableOpacity
                    style={styles.driveUrlPreview}
                    onPress={handleOpenDrive}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.driveUrlText} numberOfLines={1}>
                      drive.google.com/.../1AJzY39IKyCTR0d7HspLN0bMk609kITT2
                    </Text>
                    <ExternalLink size={14} color={THEME.colors.primary} />
                  </TouchableOpacity>
                </View>

                {/* Email Delivery Notice */}
                <View style={styles.emailNoticeCard}>
                  <Mail size={16} color="#4F46E5" />
                  <Text style={styles.emailNoticeText}>
                    Full statement will be dispatched to <Text style={{ fontWeight: '700' }}>selvanpragathish@gmail.com</Text>.
                  </Text>
                </View>

                {errorMsg && (
                  <View style={styles.errorBox}>
                    <Text style={styles.errorText}>{errorMsg}</Text>
                  </View>
                )}

                {/* Compulsory Settlement Notice */}
                {pendingFixedExpenses.length > 0 && (
                  <View style={styles.compulsoryBanner}>
                    <AlertTriangle size={18} color="#B45309" />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.compulsoryBannerTitle}>Action Required Before Closing</Text>
                      <Text style={styles.compulsoryBannerText}>
                        You have {pendingFixedExpenses.length} pending recurring expense{pendingFixedExpenses.length > 1 ? 's' : ''}. Please click <Text style={{ fontWeight: '700' }}>Pay</Text> or <Text style={{ fontWeight: '700' }}>Skip</Text> for each item above before you can close this month.
                      </Text>
                    </View>
                  </View>
                )}

                {/* Action Buttons */}
                <View style={styles.actionRow}>
                  <Button
                    title={
                      loading
                        ? 'Closing Month & Archiving...'
                        : pendingFixedExpenses.length > 0
                        ? `Settle ${pendingFixedExpenses.length} Pending Item${pendingFixedExpenses.length > 1 ? 's' : ''} to Close Month`
                        : 'Confirm & Close This Month'
                    }
                    onPress={handleCloseMonth}
                    loading={loading}
                    disabled={pendingFixedExpenses.length > 0 || loading}
                    variant={pendingFixedExpenses.length > 0 ? 'secondary' : 'primary'}
                    icon={<ShieldCheck size={16} color="#FFF" />}
                    style={styles.confirmBtn}
                  />

                  <Button
                    title="Cancel"
                    onPress={handleModalClose}
                    variant="subtle"
                    style={{ marginTop: 6 }}
                  />
                </View>
              </View>
            )}
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
    maxHeight: '92%',
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
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: THEME.colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircleSuccess: {
    backgroundColor: '#ECFDF5',
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
  fixedReviewCard: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: THEME.borderRadius.xl,
    padding: THEME.spacing.md,
    marginBottom: THEME.spacing.md,
  },
  fixedReviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  fixedReviewTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  fixedReviewTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
  },
  pendingBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  pendingBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#92400E',
  },
  settledBadge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  settledBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#059669',
  },
  fixedReviewSub: {
    fontSize: 11,
    color: THEME.colors.textSecondary,
    lineHeight: 15,
    marginBottom: 10,
  },
  fixedItemsList: {
    gap: 8,
  },
  fixedItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: THEME.borderRadius.md,
    padding: 10,
  },
  fixedItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  fixedCategoryDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  fixedItemName: {
    fontSize: 13,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
  },
  fixedItemCategory: {
    fontSize: 11,
    color: THEME.colors.textMuted,
  },
  freqTag: {
    fontWeight: '700',
    color: THEME.colors.primary,
  },
  fixedItemRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  fixedItemAmount: {
    fontSize: 13,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
  },
  amountCompleted: {
    color: '#059669',
  },
  amountSkipped: {
    color: THEME.colors.textMuted,
    textDecorationLine: 'line-through',
  },
  fixedActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  fixedBtnAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  fixedBtnPay: {
    backgroundColor: '#059669',
  },
  fixedBtnPayText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  fixedBtnSkip: {
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  fixedBtnSkipText: {
    fontSize: 11,
    fontWeight: '600',
    color: THEME.colors.textSecondary,
  },
  summaryCard: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: THEME.borderRadius.xl,
    padding: THEME.spacing.md,
    marginBottom: THEME.spacing.md,
  },
  summaryTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: THEME.colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 10,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 4,
  },
  summaryRowLabel: {
    fontSize: 13,
    color: THEME.colors.textSecondary,
  },
  summaryRowVal: {
    fontSize: 14,
    fontWeight: '700',
  },
  summaryBalanceLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: THEME.colors.textPrimary,
  },
  summaryBalanceVal: {
    fontSize: 17,
    fontWeight: '800',
    color: THEME.colors.primary,
  },
  rolloverBox: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1.5,
    borderColor: '#10B981',
    borderRadius: THEME.borderRadius.xl,
    padding: THEME.spacing.md,
    marginBottom: THEME.spacing.md,
  },
  rolloverHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rolloverTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#065F46',
  },
  rolloverAmount: {
    fontSize: 24,
    fontWeight: '800',
    color: '#047857',
    marginVertical: 4,
  },
  rolloverText: {
    fontSize: 12,
    color: '#047857',
    lineHeight: 17,
  },
  noRolloverBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FCD34D',
    borderRadius: THEME.borderRadius.lg,
    padding: 12,
    marginBottom: THEME.spacing.md,
  },
  noRolloverText: {
    fontSize: 12,
    color: '#92400E',
    flex: 1,
  },
  driveInfoBox: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1.5,
    borderColor: '#93C5FD',
    borderRadius: THEME.borderRadius.xl,
    padding: THEME.spacing.md,
    marginBottom: THEME.spacing.md,
  },
  driveInfoTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E40AF',
    marginBottom: 4,
  },
  driveInfoText: {
    fontSize: 12,
    lineHeight: 17,
    color: '#1E3A8A',
    marginBottom: 10,
  },
  driveUrlPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#DBEAFE',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: THEME.borderRadius.md,
  },
  driveUrlText: {
    fontSize: 11,
    color: '#1D4ED8',
    fontWeight: '600',
    flex: 1,
    marginRight: 6,
  },
  emailNoticeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#EEF2FF',
    borderWidth: 1,
    borderColor: '#C7D2FE',
    borderRadius: THEME.borderRadius.lg,
    padding: 12,
    marginBottom: THEME.spacing.lg,
  },
  emailNoticeText: {
    fontSize: 12,
    color: '#312E81',
    flex: 1,
    lineHeight: 17,
  },
  errorBox: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    padding: 10,
    borderRadius: THEME.borderRadius.md,
    marginBottom: THEME.spacing.md,
  },
  errorText: {
    fontSize: 12,
    color: '#991B1B',
    fontWeight: '600',
  },
  actionRow: {
    marginBottom: THEME.spacing.lg,
  },
  confirmBtn: {
    backgroundColor: THEME.colors.primary,
  },
  successWrapper: {
    paddingBottom: THEME.spacing.lg,
  },
  successBanner: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1.5,
    borderColor: '#A7F3D0',
    padding: THEME.spacing.lg,
    borderRadius: THEME.borderRadius.xl,
    alignItems: 'center',
    marginBottom: THEME.spacing.md,
  },
  successBannerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#065F46',
    marginBottom: 4,
  },
  successBannerSub: {
    fontSize: 13,
    color: '#047857',
    textAlign: 'center',
  },
  rolloverHighlightCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#86EFAC',
    borderRadius: THEME.borderRadius.lg,
    padding: THEME.spacing.md,
    marginBottom: THEME.spacing.md,
  },
  rolloverHighlightLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#166534',
    textTransform: 'uppercase',
  },
  rolloverHighlightAmount: {
    fontSize: 22,
    fontWeight: '800',
    color: '#15803D',
    marginVertical: 2,
  },
  rolloverHighlightDesc: {
    fontSize: 11,
    color: '#166534',
  },
  driveCard: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1.5,
    borderColor: '#93C5FD',
    borderRadius: THEME.borderRadius.xl,
    padding: THEME.spacing.md,
    marginBottom: THEME.spacing.md,
  },
  driveCardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E40AF',
    marginBottom: 4,
  },
  driveCardDesc: {
    fontSize: 12,
    color: '#1E3A8A',
    lineHeight: 17,
    marginBottom: 12,
  },
  openDriveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#2563EB',
    paddingVertical: 10,
    borderRadius: THEME.borderRadius.lg,
  },
  openDriveBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFF',
  },
  doneBtn: {
    marginTop: THEME.spacing.md,
  },
  autoUploadSuccessBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: '#ECFDF5',
    borderWidth: 1.5,
    borderColor: '#10B981',
    borderRadius: THEME.borderRadius.xl,
    padding: THEME.spacing.md,
    marginBottom: THEME.spacing.md,
  },
  autoUploadTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#065F46',
    marginBottom: 2,
  },
  autoUploadDesc: {
    fontSize: 12,
    color: '#047857',
  },
  fileLinkText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#059669',
    textDecorationLine: 'underline',
  },
  autoUploadSetupBox: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderRadius: THEME.borderRadius.xl,
    padding: THEME.spacing.md,
    marginBottom: THEME.spacing.md,
  },
  autoUploadHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  autoUploadBoxTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: THEME.colors.textPrimary,
  },
  autoUploadBoxDesc: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
    lineHeight: 17,
    marginBottom: 10,
  },
  guideToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    marginTop: 4,
  },
  guideToggleText: {
    fontSize: 12,
    fontWeight: '700',
    color: THEME.colors.primary,
  },
  scriptGuideContent: {
    backgroundColor: '#F1F5F9',
    padding: 12,
    borderRadius: THEME.borderRadius.lg,
    marginTop: 6,
  },
  scriptGuideStep: {
    fontSize: 11,
    color: '#334155',
    lineHeight: 16,
    marginBottom: 6,
  },
  codeSnippetBox: {
    position: 'relative',
    backgroundColor: '#0F172A',
    borderRadius: 8,
    padding: 12,
    marginVertical: 6,
  },
  copyBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    zIndex: 10,
  },
  copyBtnText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#0F172A',
  },
  codeText: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: 10,
    color: '#38BDF8',
    lineHeight: 14,
  },
  compulsoryBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: '#FEF3C7',
    borderWidth: 1.5,
    borderColor: '#F59E0B',
    borderRadius: THEME.borderRadius.lg,
    padding: 12,
    marginBottom: THEME.spacing.md,
  },
  compulsoryBannerTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#92400E',
    marginBottom: 2,
  },
  compulsoryBannerText: {
    fontSize: 11,
    color: '#78350F',
    lineHeight: 16,
  },
});
