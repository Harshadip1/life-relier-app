import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS } from '../../utils/constants';

interface RouteParams {
  transactionId: string;
  receiptNo: number;
  amount: number;
  paymentMethod: string;
  patientName: string;
  paymentDate?: string;
}

export default function PaymentSuccessScreen({ navigation, route }: any) {
  const params: RouteParams = route.params || {};
  const paymentDate = params.paymentDate || new Date().toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  // Show success alert on mount
  React.useEffect(() => {
    // Display success alert
    setTimeout(() => {
      Alert.alert(
        '✅ Payment Successful!',
        `Amount of ₹${params.amount.toFixed(2)} for Invoice PT${String(params.receiptNo || '').padStart(6, '0')} has been paid successfully.`,
        [{ text: 'OK' }]
      );
    }, 500);
  }, []);

  const handleDownloadReceipt = () => {
    Alert.alert(
      'Receipt Download',
      'Receipt download will be available soon. You can view your payment history in the Payments section.',
      [{ text: 'OK' }]
    );
  };

  const handleBackToDashboard = () => {
    // Navigate back to home and reset navigation stack
    navigation.reset({
      index: 0,
      routes: [{ name: 'HomeMain' }],
    });
  };

  return (
    <SafeAreaView style={styles.root}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Success Icon */}
        <View style={styles.iconContainer}>
          <View style={styles.successCircle}>
            <MaterialCommunityIcons name="check" size={64} color="#FFF" />
          </View>
        </View>

        {/* Success Message */}
        <Text style={styles.title}>Payment Successful!</Text>
        <Text style={styles.subtitle}>
          Your payment has been processed successfully.
        </Text>

        {/* Payment Details Card */}
        <View style={styles.detailsCard}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Amount Paid:</Text>
            <Text style={styles.detailValueAmount}>₹{params.amount.toFixed(2)}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Transaction ID:</Text>
            <Text style={styles.detailValue}>{params.transactionId}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Receipt Number:</Text>
            <Text style={styles.detailValue}>
              RCP{String(params.receiptNo).padStart(6, '0')}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Payment Method:</Text>
            <Text style={styles.detailValue}>
              {params.paymentMethod === 'UPI'
                ? 'UPI Payment'
                : params.paymentMethod === 'CARD'
                ? 'Credit/Debit Card'
                : params.paymentMethod === 'NETBANKING'
                ? 'Net Banking'
                : params.paymentMethod}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Date & Time:</Text>
            <Text style={styles.detailValue}>{paymentDate}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Patient Name:</Text>
            <Text style={styles.detailValue}>{params.patientName}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Status:</Text>
            <View style={styles.statusBadge}>
              <MaterialCommunityIcons name="check-circle" size={14} color={COLORS.success} />
              <Text style={styles.statusText}>Completed</Text>
            </View>
          </View>
        </View>

        {/* Success Message */}
        <View style={styles.messageBox}>
          <MaterialCommunityIcons name="information" size={20} color={COLORS.primary} />
          <Text style={styles.messageText}>
            A payment confirmation has been sent to your registered mobile number and email.
          </Text>
        </View>

        {/* Action Buttons */}
        <TouchableOpacity style={styles.downloadBtn} onPress={handleDownloadReceipt}>
          <MaterialCommunityIcons name="download" size={20} color={COLORS.primary} />
          <Text style={styles.downloadBtnText}>View / Download Receipt</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.homeBtn} onPress={handleBackToDashboard}>
          <Text style={styles.homeBtnText}>Back to Dashboard</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background },
  content: {
    padding: SPACING.lg,
    alignItems: 'center',
    paddingBottom: 40,
  },

  // Success Icon
  iconContainer: {
    marginTop: SPACING.xl,
    marginBottom: SPACING.lg,
  },
  successCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.success,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.success,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },

  // Title
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.xl,
    paddingHorizontal: SPACING.lg,
  },

  // Details Card
  detailsCard: {
    width: '100%',
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  detailLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    color: COLORS.textPrimary,
    fontWeight: '600',
    textAlign: 'right',
    flex: 1,
    marginLeft: SPACING.md,
  },
  detailValueAmount: {
    fontSize: 20,
    color: COLORS.success,
    fontWeight: '800',
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.divider,
    marginVertical: SPACING.sm,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.successBg,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.sm,
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    color: COLORS.success,
    fontWeight: '700',
  },

  // Message Box
  messageBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F0FDFA',
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    width: '100%',
  },
  messageText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.textSecondary,
    marginLeft: SPACING.sm,
    lineHeight: 20,
  },

  // Buttons
  downloadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primaryLight,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    height: 52,
    borderRadius: BORDER_RADIUS.md,
    gap: SPACING.sm,
    width: '100%',
    marginBottom: SPACING.md,
  },
  downloadBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.primary,
  },
  homeBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    height: 52,
    borderRadius: BORDER_RADIUS.md,
    width: '100%',
  },
  homeBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFF',
  },
});
