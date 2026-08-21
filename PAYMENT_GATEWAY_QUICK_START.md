# Payment Gateway - Quick Start Guide

## For Frontend Developers

### Test the Payment Flow (Without Backend)

The payment UI is complete and can be tested by navigating directly to the screens:

```typescript
// In any screen, test navigation:
navigation.navigate('PaymentGateway', {
  PID: 123,
  PatRegID: 456,
  amount: 1500,
  patientName: 'Test Patient',
  billNo: '456789',
  BranchId: 1,
});
```

### Check Files

1. Open `src/screens/patient/PaymentGatewayScreen.tsx` - Main payment screen
2. Open `src/screens/patient/PaymentSuccessScreen.tsx` - Success screen
3. Open `src/services/paymentService.ts` - API client

---

## For Backend Developers

### Step 1: Install Razorpay SDK

```bash
npm install razorpay
```

### Step 2: Get Test Credentials

1. Go to https://dashboard.razorpay.com/signup
2. Sign up / Log in
3. Switch to **Test Mode** (toggle in dashboard)
4. Go to Settings → API Keys
5. Copy:
   - **Key ID**: `rzp_test_...`
   - **Key Secret**: `...`

### Step 3: Configure Environment

Create/update `.env`:
```env
RAZORPAY_KEY_ID=rzp_test_YOUR_KEY_HERE
RAZORPAY_KEY_SECRET=YOUR_SECRET_KEY_HERE
```

### Step 4: Create Database Table

```sql
CREATE TABLE PaymentTransactions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    PID INT NOT NULL,
    PatRegID INT NOT NULL,
    BranchId INT NOT NULL DEFAULT 1,
    gatewayOrderId VARCHAR(100) NOT NULL UNIQUE,
    gatewayPaymentId VARCHAR(100),
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'INR',
    paymentMethod VARCHAR(50),
    status ENUM('CREATED', 'PENDING', 'SUCCESS', 'FAILED', 'CANCELLED', 'REFUNDED') DEFAULT 'CREATED',
    failureReason TEXT,
    razorpaySignature VARCHAR(255),
    receiptNo INT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_pid (PID),
    INDEX idx_patreg (PatRegID),
    INDEX idx_gateway_order (gatewayOrderId),
    INDEX idx_status (status)
);
```

### Step 5: Implement 3 APIs

See complete code examples in `PAYMENT_GATEWAY_BACKEND_API.md`:

1. **POST /api/payments/create-order** - Create Razorpay order
2. **POST /api/payments/verify** - Verify and process payment
3. **POST /api/payments/:transactionId/status** - Get payment status

### Step 6: Test with Frontend

1. Run backend server
2. Run React Native app: `npm start`
3. Navigate to Payments screen
4. Click "Pay Now" on a bill with outstanding amount
5. Select payment method
6. Use test card: `4111 1111 1111 1111`
7. Complete payment
8. Verify success screen appears
9. Check database for payment record

---

## Test Credentials

### Test Cards (Razorpay)

**Success**:
```
Card Number: 4111 1111 1111 1111
CVV: 123
Expiry: 12/25
```

**Failure**:
```
Card Number: 4000 0000 0000 0002
CVV: 123
Expiry: 12/25
```

### Test UPI

- **Success**: `success@razorpay`
- **Failure**: `failure@razorpay`

### Test Net Banking

Select any test bank from dropdown in test mode.

---

## Quick Debug Checklist

### Frontend Issues

- [ ] Check `API_BASE_URL` in `src/utils/constants.ts`
- [ ] Verify navigation routes in `PatientNavigator.tsx`
- [ ] Check console for network errors
- [ ] Verify bill data passed correctly to PaymentGatewayScreen

### Backend Issues

- [ ] Razorpay keys configured in `.env`
- [ ] PaymentTransactions table exists
- [ ] APIs return correct JSON format
- [ ] CORS enabled for React Native app
- [ ] Database connection working
- [ ] Verify signature calculation correct

### Payment Fails

- [ ] Check Razorpay dashboard for payment attempts
- [ ] Verify backend logs for error messages
- [ ] Check database for payment record with status
- [ ] Test with different payment method
- [ ] Verify amount is > 0

---

## Common Errors & Solutions

### Error: "Failed to create payment order"
**Solution**: Check backend API is running and accessible

### Error: "Payment verification failed"
**Solution**: Check Razorpay signature calculation in backend

### Error: "Bill not found"
**Solution**: Verify PID and PatRegID exist in database

### Error: "No outstanding amount"
**Solution**: Bill is already paid or amount is ₹0

### Payment succeeds but bill not updated
**Solution**: Check database transaction in verify API

---

## Minimum Viable Test

1. **Backend**: Implement `create-order` API (returns mock order)
2. **Frontend**: Test payment screen opens and displays correctly
3. **Backend**: Implement `verify` API (marks payment success)
4. **Frontend**: Test complete flow end-to-end

---

## Production Checklist

- [ ] Switch Razorpay to Live mode
- [ ] Use live API keys (not test keys)
- [ ] Test with real ₹1 transaction
- [ ] Verify webhooks configured
- [ ] Check payment confirmation emails/SMS
- [ ] Monitor first 10 transactions closely
- [ ] Set up payment alerts/monitoring

---

## Support

- **Razorpay Docs**: https://razorpay.com/docs/
- **Test Mode Guide**: https://razorpay.com/docs/payments/test-mode/
- **API Postman Collection**: https://razorpay.com/docs/api/

---

**Quick Start Time**: 30-45 minutes (backend) + 5 minutes (frontend test)  
**Full Implementation Time**: 12-16 hours (backend) + Testing  
**Status**: Ready to Start 🚀
