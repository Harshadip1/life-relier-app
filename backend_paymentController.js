/**
 * 🔐 SECURE PAYMENT CONTROLLER - PRODUCTION READY
 * 
 * Security Features:
 * - Database transactions with row-level locking (FOR UPDATE)
 * - Idempotency enforcement (prevents duplicate processing)
 * - Signature verification (prevents tampering)
 * - Amount validation from database (prevents frontend manipulation)
 * - Webhook support (handles asynchronous payment confirmation)
 * - Environment-based secrets (no hardcoded credentials)
 * 
 * Race Condition Prevention:
 * - BEGIN TRANSACTION at the start of each operation
 * - SELECT...FOR UPDATE locks the row until COMMIT/ROLLBACK
 * - Other concurrent requests wait for lock release
 * - Idempotency check within transaction ensures single processing
 */

const Razorpay = require('razorpay');
const crypto = require('crypto');
const mysql = require('mysql2/promise');

// ═══════════════════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

// Razorpay instance (uses environment variables)
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Database connection pool
const dbPool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// ═══════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Verify Razorpay payment signature
 * @param {string} orderId - Razorpay order ID
 * @param {string} paymentId - Razorpay payment ID
 * @param {string} signature - Razorpay signature
 * @returns {boolean} - True if signature is valid
 */
function verifyRazorpaySignature(orderId, paymentId, signature) {
  const text = `${orderId}|${paymentId}`;
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(text)
    .digest('hex');
  
  return expectedSignature === signature;
}

/**
 * Verify webhook signature
 * @param {string} webhookBody - Raw webhook body as string
 * @param {string} webhookSignature - X-Razorpay-Signature header
 * @returns {boolean} - True if signature is valid
 */
function verifyWebhookSignature(webhookBody, webhookSignature) {
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
    .update(webhookBody)
    .digest('hex');
  
  return expectedSignature === webhookSignature;
}

// ═══════════════════════════════════════════════════════════════════════════
// API ENDPOINT: CREATE PAYMENT ORDER
// ═══════════════════════════════════════════════════════════════════════════

/**
 * POST /api/payments/create-order
 * 
 * Creates a Razorpay order and stores it in the database.
 * 
 * Request Body:
 * {
 *   PID: number,
 *   PatRegID: number,
 *   amount: number,  // Frontend sends this, but backend validates from DB
 *   currency: string,
 *   BranchId: number
 * }
 * 
 * Response:
 * {
 *   orderId: string,
 *   amount: number,  // Actual amount from database
 *   currency: string,
 *   razorpayKeyId: string,  // Safe to expose (NOT the secret)
 *   patientName: string,
 *   patientEmail: string,
 *   patientPhone: string
 * }
 */
async function createPaymentOrder(req, res) {
  let connection;
  
  try {
    const { PID, PatRegID, amount: frontendAmount, currency, BranchId } = req.body;
    
    // Validation
    if (!PID || !PatRegID || !frontendAmount || !currency || !BranchId) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'PID, PatRegID, amount, currency, and BranchId are required',
      });
    }
    
    connection = await dbPool.getConnection();
    
    // ─────────────────────────────────────────────────────────────────────
    // 1. Fetch actual bill amount from database (NEVER trust frontend)
    // ─────────────────────────────────────────────────────────────────────
    const [bills] = await connection.query(
      `SELECT 
        TestCharges, 
        PaidAmount, 
        PatientName, 
        Patphoneno, 
        BarcodeID 
       FROM PatientTestStatus 
       WHERE PID = ? AND PatRegID = ? AND BranchId = ? 
       LIMIT 1`,
      [PID, PatRegID, BranchId]
    );
    
    if (bills.length === 0) {
      return res.status(404).json({
        error: 'Bill not found',
        message: 'No bill found for the provided patient and registration ID',
      });
    }
    
    const bill = bills[0];
    const actualAmount = bill.TestCharges;
    const alreadyPaid = bill.PaidAmount || 0;
    const outstandingAmount = actualAmount - alreadyPaid;
    
    // ─────────────────────────────────────────────────────────────────────
    // 2. Validate that bill is not already fully paid
    // ─────────────────────────────────────────────────────────────────────
    if (outstandingAmount <= 0) {
      return res.status(400).json({
        error: 'Bill already paid',
        message: 'This bill has been fully paid',
      });
    }
    
    // ─────────────────────────────────────────────────────────────────────
    // 3. Validate amount (allow small floating-point differences)
    // ─────────────────────────────────────────────────────────────────────
    const amountDifference = Math.abs(outstandingAmount - frontendAmount);
    if (amountDifference > 0.01) {
      return res.status(400).json({
        error: 'Amount mismatch',
        message: `Expected amount: ${outstandingAmount}, Received: ${frontendAmount}`,
      });
    }
    
    // ─────────────────────────────────────────────────────────────────────
    // 4. Create Razorpay order
    // ─────────────────────────────────────────────────────────────────────
    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(outstandingAmount * 100), // Convert to paise
      currency: currency.toUpperCase(),
      receipt: `LIMS-${PatRegID}-${Date.now()}`,
      notes: {
        PID: PID.toString(),
        PatRegID: PatRegID.toString(),
        BranchId: BranchId.toString(),
      },
    });
    
    // ─────────────────────────────────────────────────────────────────────
    // 5. Store order in database
    // ─────────────────────────────────────────────────────────────────────
    await connection.query(
      `INSERT INTO PaymentTransactions 
       (PID, PatRegID, BranchId, gatewayOrderId, amount, currency, status, createdAt) 
       VALUES (?, ?, ?, ?, ?, ?, 'CREATED', NOW())`,
      [PID, PatRegID, BranchId, razorpayOrder.id, outstandingAmount, currency]
    );
    
    // ─────────────────────────────────────────────────────────────────────
    // 6. Return order details (key_id is safe to expose, NOT key_secret)
    // ─────────────────────────────────────────────────────────────────────
    res.status(200).json({
      orderId: razorpayOrder.id,
      amount: outstandingAmount,
      currency: currency.toUpperCase(),
      razorpayKeyId: process.env.RAZORPAY_KEY_ID, // Safe to expose
      patientName: bill.PatientName || 'Patient',
      patientEmail: '', // Add email field to DB if available
      patientPhone: bill.Patphoneno || '',
    });
    
  } catch (error) {
    console.error('Error creating payment order:', error);
    res.status(500).json({
      error: 'Failed to create payment order',
      message: error.message,
    });
  } finally {
    if (connection) connection.release();
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// API ENDPOINT: VERIFY PAYMENT
// ═══════════════════════════════════════════════════════════════════════════

/**
 * POST /api/payments/verify
 * 
 * Verifies payment signature and updates database.
 * Uses database transactions with row-level locking to prevent race conditions.
 * 
 * Request Body:
 * {
 *   PID: number,
 *   PatRegID: number,
 *   razorpay_order_id: string,
 *   razorpay_payment_id: string,
 *   razorpay_signature: string,
 *   amount: number,
 *   paymentMethod: string,
 *   BranchId: number
 * }
 * 
 * Response:
 * {
 *   success: boolean,
 *   message: string,
 *   transactionId: string,
 *   receiptNo: number,
 *   paymentStatus: string
 * }
 */
async function verifyPayment(req, res) {
  let connection;
  
  try {
    const {
      PID,
      PatRegID,
      razorpay_order_id: orderId,
      razorpay_payment_id: paymentId,
      razorpay_signature: signature,
      amount,
      paymentMethod,
      BranchId,
    } = req.body;
    
    // Validation
    if (!PID || !PatRegID || !orderId || !paymentId || !signature) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        message: 'PID, PatRegID, order ID, payment ID, and signature are required',
        paymentStatus: 'FAILED',
      });
    }
    
    connection = await dbPool.getConnection();
    
    // ═════════════════════════════════════════════════════════════════════
    // CRITICAL: START TRANSACTION FIRST (prevents race conditions)
    // ═════════════════════════════════════════════════════════════════════
    await connection.beginTransaction();
    
    try {
      // ───────────────────────────────────────────────────────────────────
      // 1. Lock the transaction row (FOR UPDATE blocks other transactions)
      // ───────────────────────────────────────────────────────────────────
      const [transactions] = await connection.query(
        `SELECT * FROM PaymentTransactions 
         WHERE gatewayOrderId = ? 
         FOR UPDATE`,  // Row-level lock - other transactions must wait
        [orderId]
      );
      
      if (transactions.length === 0) {
        await connection.rollback();
        return res.status(404).json({
          success: false,
          error: 'Transaction not found',
          message: 'No transaction found for this order ID',
          paymentStatus: 'FAILED',
        });
      }
      
      const transaction = transactions[0];
      
      // ───────────────────────────────────────────────────────────────────
      // 2. IDEMPOTENCY CHECK: If already processed, return existing result
      // ───────────────────────────────────────────────────────────────────
      if (transaction.status === 'SUCCESS' && transaction.gatewayPaymentId === paymentId) {
        await connection.commit(); // Release lock
        return res.status(200).json({
          success: true,
          message: 'Payment already processed',
          transactionId: transaction.gatewayPaymentId,
          receiptNo: transaction.id,
          paymentStatus: 'SUCCESS',
        });
      }
      
      // ───────────────────────────────────────────────────────────────────
      // 3. Verify Razorpay signature (prevents tampering)
      // ───────────────────────────────────────────────────────────────────
      const isValid = verifyRazorpaySignature(orderId, paymentId, signature);
      
      if (!isValid) {
        // Update transaction as failed
        await connection.query(
          `UPDATE PaymentTransactions 
           SET status = 'FAILED', 
               failureReason = 'Invalid signature', 
               updatedAt = NOW() 
           WHERE gatewayOrderId = ?`,
          [orderId]
        );
        
        await connection.commit();
        
        return res.status(400).json({
          success: false,
          error: 'Invalid signature',
          message: 'Payment signature verification failed',
          paymentStatus: 'FAILED',
        });
      }
      
      // ───────────────────────────────────────────────────────────────────
      // 4. Verify payment with Razorpay API (double-check)
      // ───────────────────────────────────────────────────────────────────
      const razorpayPayment = await razorpay.payments.fetch(paymentId);
      
      if (razorpayPayment.status !== 'captured' && razorpayPayment.status !== 'authorized') {
        await connection.query(
          `UPDATE PaymentTransactions 
           SET status = 'FAILED', 
               failureReason = ?, 
               gatewayPaymentId = ?, 
               updatedAt = NOW() 
           WHERE gatewayOrderId = ?`,
          [`Payment status: ${razorpayPayment.status}`, paymentId, orderId]
        );
        
        await connection.commit();
        
        return res.status(400).json({
          success: false,
          error: 'Payment not captured',
          message: `Payment status is ${razorpayPayment.status}`,
          paymentStatus: 'FAILED',
        });
      }
      
      // ───────────────────────────────────────────────────────────────────
      // 5. Update payment transaction status
      // ───────────────────────────────────────────────────────────────────
      await connection.query(
        `UPDATE PaymentTransactions 
         SET status = 'SUCCESS', 
             gatewayPaymentId = ?, 
             paymentMethod = ?,
             razorpaySignature = ?,
             updatedAt = NOW() 
         WHERE gatewayOrderId = ?`,
        [paymentId, paymentMethod, signature, orderId]
      );
      
      // ───────────────────────────────────────────────────────────────────
      // 6. Update patient test status (mark as paid)
      // ───────────────────────────────────────────────────────────────────
      await connection.query(
        `UPDATE PatientTestStatus 
         SET PaidAmount = TestCharges,
             Status = 'Paid',
             updatedAt = NOW()
         WHERE PID = ? AND PatRegID = ? AND BranchId = ?`,
        [PID, PatRegID, BranchId]
      );
      
      // ───────────────────────────────────────────────────────────────────
      // 7. COMMIT TRANSACTION (releases lock)
      // ───────────────────────────────────────────────────────────────────
      await connection.commit();
      
      // ───────────────────────────────────────────────────────────────────
      // 8. Return success response
      // ───────────────────────────────────────────────────────────────────
      res.status(200).json({
        success: true,
        message: 'Payment verified successfully',
        transactionId: paymentId,
        receiptNo: transaction.id,
        paymentStatus: 'SUCCESS',
      });
      
    } catch (txError) {
      // Rollback on any error within transaction
      await connection.rollback();
      throw txError;
    }
    
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({
      success: false,
      error: 'Payment verification failed',
      message: error.message,
      paymentStatus: 'FAILED',
    });
  } finally {
    if (connection) connection.release();
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// API ENDPOINT: WEBHOOK HANDLER
// ═══════════════════════════════════════════════════════════════════════════

/**
 * POST /api/payments/webhook
 * 
 * Handles Razorpay webhook events (payment.captured).
 * Uses the SAME transactional logic as verifyPayment to ensure idempotency.
 * 
 * Headers:
 * - X-Razorpay-Signature: Webhook signature for verification
 * 
 * Body:
 * {
 *   event: "payment.captured",
 *   payload: {
 *     payment: {
 *       entity: {
 *         id: "pay_abc123",
 *         order_id: "order_xyz789",
 *         amount: 25000,  // in paise
 *         currency: "INR",
 *         status: "captured",
 *         method: "upi",
 *         ...
 *       }
 *     }
 *   }
 * }
 */
async function handleWebhook(req, res) {
  let connection;
  
  try {
    // ═════════════════════════════════════════════════════════════════════
    // 1. Verify webhook signature (CRITICAL for security)
    // ═════════════════════════════════════════════════════════════════════
    const webhookSignature = req.headers['x-razorpay-signature'];
    const webhookBody = JSON.stringify(req.body);
    
    if (!webhookSignature) {
      console.error('Webhook signature missing');
      return res.status(400).json({ error: 'Signature missing' });
    }
    
    const isValid = verifyWebhookSignature(webhookBody, webhookSignature);
    
    if (!isValid) {
      console.error('Invalid webhook signature');
      return res.status(400).json({ error: 'Invalid signature' });
    }
    
    // ═════════════════════════════════════════════════════════════════════
    // 2. Parse webhook event
    // ═════════════════════════════════════════════════════════════════════
    const { event, payload } = req.body;
    
    // Only process payment.captured events
    if (event !== 'payment.captured') {
      console.log(`Ignoring webhook event: ${event}`);
      return res.status(200).json({ message: 'Event ignored' });
    }
    
    const payment = payload.payment.entity;
    const orderId = payment.order_id;
    const paymentId = payment.id;
    const paymentAmount = payment.amount / 100; // Convert paise to rupees
    const paymentMethod = payment.method;
    
    console.log(`Webhook received: ${event} for order ${orderId}`);
    
    connection = await dbPool.getConnection();
    
    // ═════════════════════════════════════════════════════════════════════
    // CRITICAL: START TRANSACTION FIRST (same as verifyPayment)
    // ═════════════════════════════════════════════════════════════════════
    await connection.beginTransaction();
    
    try {
      // ───────────────────────────────────────────────────────────────────
      // 3. Lock the transaction row (FOR UPDATE)
      // ───────────────────────────────────────────────────────────────────
      const [transactions] = await connection.query(
        `SELECT * FROM PaymentTransactions 
         WHERE gatewayOrderId = ? 
         FOR UPDATE`,  // Row-level lock
        [orderId]
      );
      
      if (transactions.length === 0) {
        console.error(`Transaction not found for order: ${orderId}`);
        await connection.rollback();
        return res.status(404).json({ error: 'Transaction not found' });
      }
      
      const transaction = transactions[0];
      
      // ───────────────────────────────────────────────────────────────────
      // 4. IDEMPOTENCY CHECK: If already processed, return success
      // ───────────────────────────────────────────────────────────────────
      if (transaction.status === 'SUCCESS' && transaction.gatewayPaymentId === paymentId) {
        console.log(`Payment already processed for order: ${orderId}`);
        await connection.commit();
        return res.status(200).json({ message: 'Payment already processed' });
      }
      
      // ───────────────────────────────────────────────────────────────────
      // 5. Update payment transaction
      // ───────────────────────────────────────────────────────────────────
      await connection.query(
        `UPDATE PaymentTransactions 
         SET status = 'SUCCESS', 
             gatewayPaymentId = ?, 
             paymentMethod = ?,
             webhookReceived = TRUE,
             webhookReceivedAt = NOW(),
             updatedAt = NOW() 
         WHERE gatewayOrderId = ?`,
        [paymentId, paymentMethod, orderId]
      );
      
      // ───────────────────────────────────────────────────────────────────
      // 6. Update patient test status (mark as paid)
      // ───────────────────────────────────────────────────────────────────
      await connection.query(
        `UPDATE PatientTestStatus 
         SET PaidAmount = TestCharges,
             Status = 'Paid',
             updatedAt = NOW()
         WHERE PID = ? AND PatRegID = ? AND BranchId = ?`,
        [transaction.PID, transaction.PatRegID, transaction.BranchId]
      );
      
      // ───────────────────────────────────────────────────────────────────
      // 7. COMMIT TRANSACTION (releases lock)
      // ───────────────────────────────────────────────────────────────────
      await connection.commit();
      
      console.log(`Payment processed successfully for order: ${orderId}`);
      
      // ───────────────────────────────────────────────────────────────────
      // 8. Return 200 OK (required for Razorpay)
      // ───────────────────────────────────────────────────────────────────
      res.status(200).json({ message: 'Webhook processed successfully' });
      
    } catch (txError) {
      await connection.rollback();
      throw txError;
    }
    
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  } finally {
    if (connection) connection.release();
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════

module.exports = {
  createPaymentOrder,
  verifyPayment,
  handleWebhook,
};
