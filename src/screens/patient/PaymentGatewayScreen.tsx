import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import RazorpayCheckout from 'react-native-razorpay';
import { COLORS, SPACING, BORDER_RADIUS } from '../../utils/constants';
import { useAuth } from '../../context/AuthContext';
import {
  createPaymentOrder,
  verifyPayment,
  PaymentOrderResponse,
} from '../../services/paymentService';

type PaymentMethod = 'UPI' | 'CARD' | 'NETBANKING' | null;
type PaymentStatus = 'idle' | 'creating' | 'processing' | 'verifying' | 'success' | 'failed' | 'cancelled';

interface RouteParams {
  PID: number;
  PatRegID: number;
  amount?: number;
  patientName: string;
  billNo?: string;
  BranchId?: number;
  invoiceNumber?: string;
  outstandingAmount?: number;
}

export default function PaymentGatewayScreen({ navigation, route }: any) {
  const { user } = useAuth();
  const routeParams = route.params || {};
  const params: RouteParams = routeParams;

  // Use either amount or outstandingAmount for flexibility
  const paymentAmount = params.outstandingAmount || params.amount || 0;
  const invoiceNo = params.invoiceNumber || params.billNo || `LIMS-2025-${String(params.PatRegID).padStart(5, '0')}`;

  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>(null);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('idle');
  const [orderData, setOrderData] = useState<PaymentOrderResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Security: Validate required params
  useEffect(() => {
    if (!params.PID || !params.PatRegID || !paymentAmount || paymentAmount <= 0) {
      Alert.alert('Invalid Payment', 'Missing required payment information', [
        { text: 'Go Back', onPress: () => navigation.goBack() },
      ]);
    }
  }, [params, paymentAmount]);

  const handlePaymentMethodSelect = (method: PaymentMethod) => {
    setSelectedMethod(method);
    setError(null);
  };

  const handlePayNow = async () => {
    if (!selectedMethod) {
      Alert.alert('Select Payment Method', 'Please select a payment method to continue');
      return;
    }

    // Prevent double-tap
    if (paymentStatus !== 'idle') {
      return;
    }

    setPaymentStatus('creating');
    setError(null);

    try {
      // Step 1: Create payment order on backend (backend validates amount from database)
      const order = await createPaymentOrder({
        PID: params.PID,
        PatRegID: params.PatRegID,
        amount: paymentAmount, // Backend will fetch and validate actual amount from database
        currency: 'INR',
        BranchId: params.BranchId || 1,
      });

      setOrderData(order);

      // Step 2: Launch native Razorpay checkout with method-specific configuration
      await launchRazorpayCheckout(order);
    } catch (err: any) {
      console.error('Payment order creation failed:', err);
      setPaymentStatus('failed');
      const errorMessage = err.message || 'Failed to create payment order';
      setError(errorMessage);
      
      Alert.alert(
        'Payment Failed',
        errorMessage + '. Please try again.',
        [
          { text: 'Retry', onPress: () => setPaymentStatus('idle') },
          { text: 'Cancel', style: 'cancel', onPress: () => navigation.goBack() },
        ]
      );
    }
  };

  const launchRazorpayCheckout = async (order: PaymentOrderResponse) => {
    setPaymentStatus('processing');

    // Configure Razorpay options with method-specific settings
    const options = {
      description: `Payment for Invoice ${invoiceNo}`,
      currency: order.currency,
      key: order.razorpayKeyId,
      amount: Math.round(order.amount * 100), // Convert to paise
      order_id: order.orderId,
      name: 'Life Relier LIMS',
      prefill: {
        name: order.patientName,
        email: order.patientEmail || '',
        contact: order.patientPhone || '',
      },
      theme: {
        color: COLORS.primary,
      },
      // Method-specific configuration to open the correct UI
      method: getMethodConfig(selectedMethod),
    };

    try {
      const data = await RazorpayCheckout.open(options);
      
      // Payment successful - verify on backend
      console.log('Razorpay success:', data);
      setPaymentStatus('verifying');
      
      await verifyPaymentOnBackend({
        razorpay_order_id: order.orderId,
        razorpay_payment_id: data.razorpay_payment_id,
        razorpay_signature: data.razorpay_signature,
      });
    } catch (error: any) {
      console.error('Razorpay error:', error);
      
      if (error.code === RazorpayCheckout.PAYMENT_CANCELLED) {
        // User cancelled payment
        setPaymentStatus('cancelled');
        Alert.alert(
          'Payment Cancelled',
          'You cancelled the payment. The invoice is still pending.',
          [
            { text: 'Try Again', onPress: () => setPaymentStatus('idle') },
            { text: 'Go Back', style: 'cancel', onPress: () => navigation.goBack() },
          ]
        );
      } else {
        // Payment failed
        setPaymentStatus('failed');
        const errorMessage = error.description || error.message || 'Payment failed';
        setError(errorMessage);
        
        Alert.alert(
          'Payment Failed',
          errorMessage,
          [
            { text: 'Retry', onPress: () => setPaymentStatus('idle') },
            { text: 'Cancel', style: 'cancel', onPress: () => navigation.goBack() },
          ]
        );
      }
    }
  };

  const getMethodConfig = (method: PaymentMethod): { [key: string]: boolean } => {
    // Configure which payment methods to show in Razorpay UI
    const config: { [key: string]: boolean } = {
      upi: false,
      card: false,
      netbanking: false,
      wallet: false,
    };

    if (method === 'UPI') {
      config.upi = true;
    } else if (method === 'CARD') {
      config.card = true;
    } else if (method === 'NETBANKING') {
      config.netbanking = true;
    }

    return config;
  };

  const verifyPaymentOnBackend = async (razorpayData: any) => {
    try {
      // Backend verifies payment signature and updates database
      const verification = await verifyPayment({
        PID: params.PID,
        PatRegID: params.PatRegID,
        razorpay_order_id: razorpayData.razorpay_order_id,
        razorpay_payment_id: razorpayData.razorpay_payment_id,
        razorpay_signature: razorpayData.razorpay_signature,
        amount: paymentAmount,
        paymentMethod: selectedMethod || 'UNKNOWN',
        BranchId: params.BranchId || 1,
      });

      if (verification.success && verification.paymentStatus === 'SUCCESS') {
        setPaymentStatus('success');
        
        // Show success message with actual amount paid
        Alert.alert(
          'Payment Successful',
          `₹${paymentAmount.toFixed(2)} paid successfully\nInvoice: ${invoiceNo}`,
          [
            {
              text: 'OK',
              onPress: () => {
                // Navigate to success screen
                navigation.replace('PaymentSuccess', {
                  transactionId: verification.transactionId,
                  receiptNo: verification.receiptNo,
                  amount: paymentAmount,
                  paymentMethod: selectedMethod,
                  patientName: params.patientName,
                  invoiceNumber: invoiceNo,
                });
              },
            },
          ]
        );
      } else {
        throw new Error(verification.message || 'Payment verification failed');
      }
    } catch (err: any) {
      console.error('Payment verification failed:', err);
      setPaymentStatus('failed');
      setError(err.message);
      
      Alert.alert(
        'Payment Verification Failed',
        err.message || 'Could not verify your payment. Please contact support with your transaction ID.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    }
  };

  const handleCancel = () => {
    if (paymentStatus === 'processing' || paymentStatus === 'creating') {
      Alert.alert(
        'Cancel Payment?',
        'Are you sure you want to cancel this payment?',
        [
          { text: 'No', style: 'cancel' },
          {
            text: 'Yes, Cancel',
            style: 'destructive',
            onPress: () => {
              setPaymentStatus('cancelled');
              navigation.goBack();
            },
          },
        ]
      );
    } else {
      navigation.goBack();
    }
  };

  const renderPaymentMethodCard = (
    method: PaymentMethod,
    icon: string,
    title: string,
    subtitle: string
  ) => {
    const isSelected = selectedMethod === method;
    const isDisabled = paymentStatus !== 'idle';
    
    return (
      <TouchableOpacity
        style={[
          styles.methodCard,
          isSelected && styles.methodCardSelected,
          isDisabled && styles.methodCardDisabled,
        ]}
        onPress={() => handlePaymentMethodSelect(method)}
        disabled={isDisabled}
        activeOpacity={0.7}
      >
        <View style={[styles.methodIcon, isSelected && styles.methodIconSelected]}>
          <MaterialCommunityIcons
            name={icon as any}
            size={28}
            color={isSelected ? '#FFF' : COLORS.primary}
          />
        </View>
        <View style={styles.methodInfo}>
          <Text style={[styles.methodTitle, isSelected && styles.methodTitleSelected]}>
            {title}
          </Text>
          <Text style={styles.methodSubtitle}>{subtitle}</Text>
        </View>
        <View style={[styles.radioOuter, isSelected && styles.radioOuterSelected]}>
          {isSelected && <View style={styles.radioInner} />}
        </View>
      </TouchableOpacity>
    );
  };

  const isProcessing = paymentStatus === 'creating' || paymentStatus === 'processing' || paymentStatus === 'verifying';

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleCancel} style={styles.backBtn} disabled={isProcessing}>
          <Feather name="arrow-left" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Outstanding Invoice Payment</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Bill Summary */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <MaterialCommunityIcons name="receipt-text" size={24} color={COLORS.primary} />
            <Text style={styles.summaryTitle}>Payment Summary</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Patient Name:</Text>
            <Text style={styles.summaryValue}>{params.patientName}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Invoice:</Text>
            <Text style={styles.summaryValue}>{invoiceNo}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.amountRow}>
            <Text style={styles.amountLabel}>OUTSTANDING AMOUNT</Text>
            <Text style={styles.amountValue}>₹{paymentAmount.toFixed(2)}</Text>
          </View>
        </View>

        {/* Payment Methods */}
        <Text style={styles.sectionTitle}>Select Payment Method</Text>

        {renderPaymentMethodCard(
          'UPI',
          'qrcode-scan',
          'UPI / GooglePay / PhonePe',
          'Instant payment via UPI apps'
        )}

        {renderPaymentMethodCard(
          'CARD',
          'credit-card-outline',
          'Debit / Credit Card',
          'Visa, Mastercard, RuPay, Amex'
        )}

        {renderPaymentMethodCard(
          'NETBANKING',
          'bank',
          'Net Banking',
          'All major banks supported'
        )}

        {error && (
          <View style={styles.errorBox}>
            <MaterialCommunityIcons name="alert-circle" size={20} color={COLORS.error} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Security Info */}
        <View style={styles.securityInfo}>
          <MaterialCommunityIcons name="shield-check" size={16} color={COLORS.success} />
          <Text style={styles.securityText}>
            🔒 Secure Checkout - Your payment details are encrypted and not stored on our servers.
          </Text>
        </View>
      </ScrollView>

      {/* Pay Now Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.payBtn,
            (!selectedMethod || isProcessing) && styles.payBtnDisabled,
          ]}
          onPress={handlePayNow}
          disabled={!selectedMethod || isProcessing}
          activeOpacity={0.8}
        >
          {isProcessing ? (
            <>
              <ActivityIndicator size="small" color="#FFF" style={{ marginRight: 8 }} />
              <Text style={styles.payBtnText}>
                {paymentStatus === 'creating' && 'Creating Order...'}
                {paymentStatus === 'processing' && 'Processing Payment...'}
                {paymentStatus === 'verifying' && 'Verifying Payment...'}
              </Text>
            </>
          ) : (
            <>
              <MaterialCommunityIcons name="check-circle" size={20} color="#FFF" />
              <Text style={styles.payBtnText}>Pay ₹{paymentAmount.toFixed(2)} Securely</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: COLORS.textPrimary, flex: 1, textAlign: 'center', marginLeft: -24 },
  content: { padding: SPACING.md, paddingBottom: 100 },

  // Summary Card
  summaryCard: {
    backgroundColor: '#FFF5F5',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: '#FFE5E5',
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginLeft: SPACING.sm,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  summaryLabel: { fontSize: 14, color: COLORS.textSecondary },
  summaryValue: { fontSize: 14, fontWeight: '600', color: COLORS.textPrimary },
  divider: {
    height: 1,
    backgroundColor: COLORS.divider,
    marginVertical: SPACING.md,
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  amountLabel: { fontSize: 14, fontWeight: '700', color: '#EF4444', letterSpacing: 0.5 },
  amountValue: { fontSize: 24, fontWeight: '800', color: '#EF4444' },

  // Section
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },

  // Payment Method Cards
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 2,
    borderColor: COLORS.cardBorder,
  },
  methodCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: '#F0FDFA',
  },
  methodCardDisabled: {
    opacity: 0.6,
  },
  methodIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#F0FDFA',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  methodIconSelected: {
    backgroundColor: COLORS.primary,
  },
  methodInfo: { flex: 1 },
  methodTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  methodTitleSelected: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  methodSubtitle: { fontSize: 12, color: COLORS.textMuted },
  radioOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.cardBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuterSelected: {
    borderColor: COLORS.primary,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.primary,
  },

  // Error Box
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.dangerBg,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.error,
  },
  errorText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.error,
    marginLeft: SPACING.sm,
  },

  // Security Info
  securityInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.successBg,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginTop: SPACING.md,
  },
  securityText: {
    flex: 1,
    fontSize: 12,
    color: COLORS.textSecondary,
    marginLeft: SPACING.sm,
    lineHeight: 18,
  },

  // Footer
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.card,
    padding: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
  },
  payBtn: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary,
    height: 56,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
  },
  payBtnDisabled: {
    opacity: 0.5,
  },
  payBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
  },
});
