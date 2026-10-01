// ConfirmationDialog: Clean modal dialog for sensitive actions (deleting/pausing/resetting)

import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native';
import { AlertCircle } from 'lucide-react-native';
import { THEME } from '../../constants/theme';
import { Button } from './Button';

interface ConfirmationDialogProps {
  visible: boolean;
  title: string;
  message: string;
  confirmTitle?: string;
  cancelTitle?: string;
  confirmVariant?: 'danger' | 'primary' | 'warning';
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  visible,
  title,
  message,
  confirmTitle = 'Confirm',
  cancelTitle = 'Cancel',
  confirmVariant = 'danger',
  loading = false,
  onConfirm,
  onCancel,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <TouchableWithoutFeedback onPress={onCancel}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.dialogCard}>
              <View style={styles.headerRow}>
                <View
                  style={[
                    styles.iconCircle,
                    confirmVariant === 'danger' && styles.iconCircleDanger,
                  ]}
                >
                  <AlertCircle
                    size={24}
                    color={
                      confirmVariant === 'danger'
                        ? THEME.colors.danger
                        : THEME.colors.primary
                    }
                  />
                </View>
                <Text style={styles.title}>{title}</Text>
              </View>

              <Text style={styles.message}>{message}</Text>

              <View style={styles.buttonsRow}>
                <Button
                  title={cancelTitle}
                  variant="subtle"
                  size="md"
                  onPress={onCancel}
                  style={styles.actionBtn}
                  disabled={loading}
                />
                <Button
                  title={confirmTitle}
                  variant={confirmVariant}
                  size="md"
                  onPress={onConfirm}
                  loading={loading}
                  style={styles.actionBtn}
                />
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: THEME.spacing.lg,
  },
  dialogCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.borderRadius.xxl,
    padding: THEME.spacing.xl,
    ...THEME.shadows.elevated,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: THEME.spacing.sm,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: THEME.borderRadius.full,
    backgroundColor: THEME.colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: THEME.spacing.md,
  },
  iconCircleDanger: {
    backgroundColor: THEME.colors.roseLight,
  },
  title: {
    fontSize: THEME.typography.sizes.lg,
    fontWeight: THEME.typography.weights.bold,
    color: THEME.colors.textPrimary,
    flex: 1,
  },
  message: {
    fontSize: THEME.typography.sizes.sm,
    color: THEME.colors.textSecondary,
    lineHeight: 22,
    marginBottom: THEME.spacing.xl,
  },
  buttonsRow: {
    flexDirection: 'row',
    gap: THEME.spacing.sm,
  },
  actionBtn: {
    flex: 1,
  },
});
