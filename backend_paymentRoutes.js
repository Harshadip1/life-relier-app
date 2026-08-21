/**
 * Payment Routes
 * 
 * Routes for payment gateway integration with Razorpay
 */

const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { rawBodyMiddleware } = require('../middleware/razorpayWebhook');

// ═══════════════════════════════════════════════════════════════════════════
// PAYMENT ROUTES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * POST /api/payments/create-order
 * Create a new payment order
 */
router.post('/create-order', paymentController.createPaymentOrder);

/**
 * POST /api/payments/verify
 * Verify payment after gateway callback
 */
router.post('/verify', paymentController.verifyPayment);

/**
 * POST /api/payments/webhook
 * Handle Razorpay webhook events
 * 
 * IMPORTANT: This route needs raw body for signature verification
 * Use rawBodyMiddleware to preserve raw body before JSON parsing
 */
router.post('/webhook', rawBodyMiddleware, paymentController.handleWebhook);

module.exports = router;
