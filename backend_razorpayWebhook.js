/**
 * Razorpay Webhook Middleware
 * 
 * Handles raw body parsing for webhook signature verification.
 * Razorpay requires the raw request body to verify the webhook signature.
 */

const express = require('express');

/**
 * Middleware to capture raw body for webhook signature verification
 * 
 * Usage in app.js:
 * 
 * // Before express.json() middleware
 * app.use('/api/payments/webhook', express.raw({ type: 'application/json' }));
 * 
 * // Then use express.json() for other routes
 * app.use(express.json());
 */
function rawBodyMiddleware(req, res, next) {
  // If raw body is available, convert it to string for signature verification
  if (req.body && Buffer.isBuffer(req.body)) {
    req.rawBody = req.body.toString('utf8');
    try {
      req.body = JSON.parse(req.rawBody);
    } catch (error) {
      return res.status(400).json({ error: 'Invalid JSON in webhook body' });
    }
  }
  next();
}

module.exports = {
  rawBodyMiddleware,
};
