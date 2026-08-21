# Payment Gateway Backend API Implementation Guide

## Overview
This document provides complete specifications for backend APIs required to implement the Razorpay payment gateway integration for the LIMS application.

**CRITICAL**: These are NEW APIs. Do NOT modify existing billing/payment APIs. Create these as separate endpoints.

---

## Required NPM Packages (Backend)

```bash
npm install razorpay
npm install crypto
```

---

## Environment Variables (Backend .env)

```env
RAZORPAY_KEY_ID=rzp_test_your_key_id_here
RAZORPAY_KEY_SECRET=your_secret_key_here
```

**Test Credentials**: Get from https://dashboard.razorpay.com/app/keys (Test Mode)

---

## Database Schema

### New Table: `PaymentTransactions`

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
    INDEX idx_gateway_payment (gatewayPaymentId),
    INDEX idx_status (status),
    
    FOREIGN KEY (PID) REFERENCES Patient(PID) ON DELETE CASCADE
);
```

---

## API Endpoints

### 1. Create Payment Order

**Endpoint**: `POST /api/payments/create-order`

**Purpose**: 
- Validate patient authentication
- Retrieve actual bill amount from database
- Verify bill ownership and status
- Create Razorpay order
- Store transaction in database

**Request Body**:
```json
{
  "PID": 123,
  "PatRegID": 456,
  "amount": 1500.00,
  "currency": "INR",
  "BranchId": 1
}
```

**Backend Logic**:
```javascript
const Razorpay = require('razorpay');
const crypto = require('crypto');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

async function createPaymentOrder(req, res) {
  const { PID, PatRegID, amount, currency = 'INR', BranchId = 1 } = req.body;

  try {
    // Step 1: Authenticate patient (use existing auth middleware)
    const authenticatedPID = req.user?.PID; // From JWT token
    if (!authenticatedPID || authenticatedPID !== PID) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Step 2: Fetch actual bill amount from database
    const billQuery = `
      SELECT 
        p.PID, 
        p.PatRegID, 
        p.Patname,
        p.MobileNo,
        p.Pataddress,
        SUM(pts.TestCharges) as TestCharges,
        SUM(pts.PaidAmount) as PaidAmount,
        SUM(pts.DiscountAmount) as DiscountAmount,
        SUM(pts.OutstandingAmount) as OutstandingAmount
      FROM Patient p
      INNER JOIN PatientTestStatus pts ON p.PID = pts.PID AND p.PatRegID = pts.PatRegID
      WHERE p.PID = ? AND p.PatRegID = ? AND p.BranchId = ?
      GROUP BY p.PID, p.PatRegID
    `;
    
    const [billRows] = await db.query(billQuery, [PID, PatRegID, BranchId]);
    
    if (!billRows || billRows.length === 0) {
      return res.status(404).json({ message: 'Bill not found' });
    }

    const bill = billRows[0];
    const actualAmount = parseFloat(bill.OutstandingAmount);

    // Step 3: Validate amount (CRITICAL SECURITY CHECK)
    if (actualAmount <= 0) {
      return res.status(400).json({ message: 'No outstanding amount for this bill' });
    }

    // NEVER trust frontend amount - use database amount
    const amountInPaise = Math.round(actualAmount * 100);

    // Step 4: Check if bill is already paid or has pending payment
    const pendingCheck = await db.query(
      `SELECT * FROM PaymentTransactions 
       WHERE PatRegID = ? AND status IN ('CREATED', 'PENDING', 'SUCCESS') 
       ORDER BY createdAt DESC LIMIT 1`,
      [PatRegID]
    );

    if (pendingCheck[0]?.length > 0) {
      const pending = pendingCheck[0][0];
      if (pending.status === 'SUCCESS') {
        return res.status(400).json({ message: 'Bill is already paid' });
      }
      if (pending.status === 'PENDING' || pending.status === 'CREATED') {
        // Return existing order if created within last 10 minutes
        const orderAge = Date.now() - new Date(pending.createdAt).getTime();
        if (orderAge < 10 * 60 * 1000) {
          return res.json({
            orderId: pending.gatewayOrderId,
            amount: actualAmount,
            currency: pending.currency,
            razorpayKeyId: process.env.RAZORPAY_KEY_ID,
            patientName: bill.Patname,
            patientPhone: bill.MobileNo,
          });
        }
      }
    }

    // Step 5: Create Razorpay order
    const razorpayOrder = await razorpay.orders.create({
      amount: amountInPaise,
      currency: currency,
      receipt: `PT${PatRegID}_${Date.now()}`,
      notes: {
        PID: PID,
        PatRegID: PatRegID,
        BranchId: BranchId,
      },
    });

    // Step 6: Store transaction in database
    await db.query(
      `INSERT INTO PaymentTransactions 
       (PID, PatRegID, BranchId, gatewayOrderId, amount, currency, status) 
       VALUES (?, ?, ?, ?, ?, ?, 'CREATED')`,
      [PID, PatRegID, BranchId, razorpayOrder.id, actualAmount, currency]
    );

    // Step 7: Return order details to frontend
    res.json({
      orderId: razorpayOrder.id,
      amount: actualAmount,
      currency: currency,
      razorpayKeyId: process.env.RAZORPAY_KEY_ID,
      patientName: bill.Patname,
      patientPhone: bill.MobileNo,
    });

  } catch (error) {
    console.error('Create payment order error:', error);
    res.status(500).json({ message: 'Failed to create payment order' });
  }
}
```

**Response**:
```json
{
  "orderId": "order_MNqzxAbc123xyz",
  "amount": 1500.00,
  "currency": "INR",
  "razorpayKeyId": "rzp_test_abc123",
  "patientName": "John Doe",
  "patientPhone": "9876543210"
}
```

---

### 2. Verify Payment

**Endpoint**: `POST /api/payments/verify`

**Purpose**:
- Verify Razorpay payment signature
- Verify payment status with Razorpay
- Check for duplicate payments
- Update payment transaction status
- Mark bill as paid
- Update BillingDesk receipt records

**Request Body**:
```json
{
  "PID": 123,
  "PatRegID": 456,
  "razorpay_order_id": "order_MNqzxAbc123xyz",
  "razorpay_payment_id": "pay_MNqzxAbc123xyz",
  "razorpay_signature": "abc123signature",
  "amount": 1500.00,
  "paymentMethod": "UPI",
  "BranchId": 1
}
```

**Backend Logic**:
```javascript
async function verifyPayment(req, res) {
  const {
    PID,
    PatRegID,
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    amount,
    paymentMethod,
    BranchId = 1,
  } = req.body;

  try {
    // Step 1: Authenticate patient
    const authenticatedPID = req.user?.PID;
    if (!authenticatedPID || authenticatedPID !== PID) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Step 2: Verify signature (CRITICAL SECURITY)
    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(razorpay_order_id + '|' + razorpay_payment_id)
      .digest('hex');

    if (generatedSignature !== razorpay_signature) {
      // Signature mismatch - possible fraud attempt
      await db.query(
        `UPDATE PaymentTransactions 
         SET status = 'FAILED', 
             failureReason = 'Invalid signature',
             updatedAt = NOW()
         WHERE gatewayOrderId = ?`,
        [razorpay_order_id]
      );
      
      return res.status(400).json({
        success: false,
        message: 'Payment verification failed: Invalid signature',
        paymentStatus: 'FAILED',
      });
    }

    // Step 3: Verify payment with Razorpay API
    const payment = await razorpay.payments.fetch(razorpay_payment_id);
    
    if (payment.status !== 'captured' && payment.status !== 'authorized') {
      await db.query(
        `UPDATE PaymentTransactions 
         SET status = 'FAILED', 
             gatewayPaymentId = ?,
             failureReason = ?,
             updatedAt = NOW()
         WHERE gatewayOrderId = ?`,
        [razorpay_payment_id, `Payment not captured: ${payment.status}`, razorpay_order_id]
      );
      
      return res.status(400).json({
        success: false,
        message: 'Payment not completed',
        paymentStatus: 'FAILED',
      });
    }

    // Step 4: Verify amount (security check)
    const paidAmount = payment.amount / 100; // Convert paise to rupees
    if (Math.abs(paidAmount - amount) > 0.01) {
      await db.query(
        `UPDATE PaymentTransactions 
         SET status = 'FAILED', 
             gatewayPaymentId = ?,
             failureReason = 'Amount mismatch',
             updatedAt = NOW()
         WHERE gatewayOrderId = ?`,
        [razorpay_payment_id, razorpay_order_id]
      );
      
      return res.status(400).json({
        success: false,
        message: 'Payment amount mismatch',
        paymentStatus: 'FAILED',
      });
    }

    // Step 5: Check for duplicate successful payment (idempotency)
    const [existingTxn] = await db.query(
      `SELECT * FROM PaymentTransactions 
       WHERE gatewayOrderId = ? AND status = 'SUCCESS'`,
      [razorpay_order_id]
    );

    if (existingTxn.length > 0) {
      // Already processed - return success (idempotent)
      return res.json({
        success: true,
        message: 'Payment already verified',
        transactionId: existingTxn[0].id,
        receiptNo: existingTxn[0].receiptNo,
        paymentStatus: 'SUCCESS',
      });
    }

    // Step 6: Start database transaction
    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
      // Step 7: Create receipt in BillingDesk
      const receiptResult = await connection.query(
        `INSERT INTO BillingDesk_Receipt 
         (BillNo, PatRegID, PID, AmtPaid, PaymentType, PaymentMethod, 
          OnlineTransType, OnlineTransID, TransDate, Username, BranchId) 
         VALUES 
         ((SELECT MAX(BillNo) FROM Patient WHERE PatRegID = ?), ?, ?, ?, 'Online', ?, 
          'Razorpay', ?, NOW(), 'SYSTEM', ?)`,
        [PatRegID, PatRegID, PID, amount, paymentMethod, razorpay_payment_id, BranchId]
      );

      const receiptNo = receiptResult[0].insertId;

      // Step 8: Update payment transaction
      await connection.query(
        `UPDATE PaymentTransactions 
         SET status = 'SUCCESS', 
             gatewayPaymentId = ?,
             razorpaySignature = ?,
             paymentMethod = ?,
             receiptNo = ?,
             updatedAt = NOW()
         WHERE gatewayOrderId = ?`,
        [razorpay_payment_id, razorpay_signature, paymentMethod, receiptNo, razorpay_order_id]
      );

      // Step 9: Update outstanding amount in PatientTestStatus
      await connection.query(
        `UPDATE PatientTestStatus 
         SET PaidAmount = PaidAmount + ?,
             OutstandingAmount = GREATEST(OutstandingAmount - ?, 0)
         WHERE PatRegID = ? AND BranchId = ?`,
        [amount, amount, PatRegID, BranchId]
      );

      // Step 10: Commit transaction
      await connection.commit();
      connection.release();

      // Step 11: Return success
      res.json({
        success: true,
        message: 'Payment verified successfully',
        transactionId: razorpay_payment_id,
        receiptNo: receiptNo,
        paymentStatus: 'SUCCESS',
      });

    } catch (dbError) {
      await connection.rollback();
      connection.release();
      throw dbError;
    }

  } catch (error) {
    console.error('Payment verification error:', error);
    
    // Update transaction as failed
    try {
      await db.query(
        `UPDATE PaymentTransactions 
         SET status = 'FAILED', 
             failureReason = ?,
             updatedAt = NOW()
         WHERE gatewayOrderId = ?`,
        [error.message, razorpay_order_id]
      );
    } catch (updateError) {
      console.error('Failed to update transaction:', updateError);
    }

    res.status(500).json({
      success: false,
      message: 'Payment verification failed',
      paymentStatus: 'FAILED',
    });
  }
}
```

**Response (Success)**:
```json
{
  "success": true,
  "message": "Payment verified successfully",
  "transactionId": "pay_MNqzxAbc123xyz",
  "receiptNo": 123456,
  "paymentStatus": "SUCCESS"
}
```

**Response (Failure)**:
```json
{
  "success": false,
  "message": "Payment verification failed: Invalid signature",
  "paymentStatus": "FAILED"
}
```

---

### 3. Get Payment Status

**Endpoint**: `POST /api/payments/:transactionId/status`

**Purpose**: Check payment transaction status

**Request**: 
```
POST /api/payments/pay_MNqzxAbc123xyz/status
Body: {}
```

**Backend Logic**:
```javascript
async function getPaymentStatus(req, res) {
  const { transactionId } = req.params;
  const authenticatedPID = req.user?.PID;

  try {
    const [rows] = await db.query(
      `SELECT pt.*, p.Patname, p.MobileNo
       FROM PaymentTransactions pt
       INNER JOIN Patient p ON pt.PID = p.PID
       WHERE pt.gatewayPaymentId = ? AND pt.PID = ?`,
      [transactionId, authenticatedPID]
    );

    if (!rows || rows.length === 0) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error('Get payment status error:', error);
    res.status(500).json({ message: 'Failed to fetch payment status' });
  }
}
```

**Response**:
```json
{
  "id": 1,
  "PID": 123,
  "PatRegID": 456,
  "BranchId": 1,
  "gatewayOrderId": "order_MNqzxAbc123xyz",
  "gatewayPaymentId": "pay_MNqzxAbc123xyz",
  "amount": 1500.00,
  "currency": "INR",
  "paymentMethod": "UPI",
  "status": "SUCCESS",
  "receiptNo": 123456,
  "createdAt": "2026-08-19T10:30:00Z",
  "updatedAt": "2026-08-19T10:32:00Z"
}
```

---

### 4. Get Payment Receipt

**Endpoint**: `POST /api/payments/:transactionId/receipt`

**Purpose**: Get receipt details for PDF generation

**Backend Logic**:
```javascript
async function getPaymentReceipt(req, res) {
  const { transactionId } = req.params;
  const authenticatedPID = req.user?.PID;

  try {
    const [rows] = await db.query(
      `SELECT 
        pt.id as transactionId,
        pt.gatewayPaymentId as paymentId,
        pt.receiptNo,
        pt.amount,
        pt.paymentMethod,
        pt.createdAt as paymentDate,
        pt.status,
        p.PID,
        p.PatRegID as patientId,
        p.Patname as patientName,
        p.MobileNo,
        p.Pataddress
       FROM PaymentTransactions pt
       INNER JOIN Patient p ON pt.PID = p.PID AND pt.PatRegID = p.PatRegID
       WHERE pt.gatewayPaymentId = ? AND pt.PID = ? AND pt.status = 'SUCCESS'`,
      [transactionId, authenticatedPID]
    );

    if (!rows || rows.length === 0) {
      return res.status(404).json({ message: 'Receipt not found' });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error('Get payment receipt error:', error);
    res.status(500).json({ message: 'Failed to fetch receipt' });
  }
}
```

---

## Testing with Razorpay Test Mode

### Test Card Numbers

**Success**:
- Card: `4111 1111 1111 1111`
- CVV: Any 3 digits
- Expiry: Any future date

**Failure**:
- Card: `4000 0000 0000 0002`

### Test UPI IDs

**Success**: `success@razorpay`
**Failure**: `failure@razorpay`

### Test Net Banking

Use any test bank from Razorpay dropdown in test mode.

---

## Security Checklist

✅ NEVER trust frontend amount - always fetch from database  
✅ Verify Razorpay signature on backend  
✅ Verify payment status with Razorpay API  
✅ Check for duplicate successful payments (idempotency)  
✅ Use database transactions for payment + bill update  
✅ Authenticate patient before processing payment  
✅ Verify bill ownership  
✅ Check bill not already paid  
✅ Prevent ₹0 or negative amounts  
✅ Store RAZORPAY_KEY_SECRET only on backend  
✅ Log all payment attempts for audit  

---

## Error Handling

| Error | HTTP Status | Action |
|-------|-------------|--------|
| Unauthorized | 401 | Return error, don't process |
| Bill not found | 404 | Return error |
| Already paid | 400 | Return error |
| Invalid signature | 400 | Mark FAILED, return error |
| Amount mismatch | 400 | Mark FAILED, return error |
| Gateway error | 500 | Mark FAILED, retry allowed |
| Database error | 500 | Rollback, mark FAILED |

---

## Webhook (Optional - Recommended for Production)

**Endpoint**: `POST /api/payments/webhook`

**Purpose**: Handle Razorpay webhook events for payment status updates

```javascript
async function handleWebhook(req, res) {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  const webhookSignature = req.headers['x-razorpay-signature'];
  
  // Verify webhook signature
  const expectedSignature = crypto
    .createHmac('sha256', webhookSecret)
    .update(JSON.stringify(req.body))
    .digest('hex');
    
  if (webhookSignature !== expectedSignature) {
    return res.status(400).send('Invalid signature');
  }
  
  const event = req.body.event;
  const payment = req.body.payload.payment.entity;
  
  // Handle different events
  switch (event) {
    case 'payment.captured':
      // Payment successful
      await handlePaymentSuccess(payment);
      break;
    case 'payment.failed':
      // Payment failed
      await handlePaymentFailure(payment);
      break;
  }
  
  res.status(200).send('OK');
}
```

---

## Production Deployment

1. **Switch to Live Mode**:
   - Get live keys from Razorpay Dashboard
   - Update `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` in production `.env`

2. **Enable Webhooks**:
   - Configure webhook URL in Razorpay Dashboard
   - Add webhook secret to `.env`

3. **SSL Certificate**:
   - Ensure API has valid SSL certificate

4. **Rate Limiting**:
   - Add rate limiting to payment endpoints

5. **Monitoring**:
   - Set up alerts for failed payments
   - Monitor payment success rate

---

## Support

For Razorpay integration issues:
- Documentation: https://razorpay.com/docs/
- Support: https://razorpay.com/support/

---

**Implementation Date**: August 19, 2026  
**API Version**: 1.0  
**Status**: Ready for Development
