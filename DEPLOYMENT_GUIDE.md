# 🚀 Secure Payment Gateway - Deployment Guide

**Production-Ready Razorpay Integration**

---

## 📋 Prerequisites

### Backend Requirements
- Node.js 14+ 
- MySQL 5.7+ or 8.0+
- Razorpay account (live mode)

### Frontend Requirements
- Expo SDK 48+
- React Native 0.71+
- `react-native-webview` installed

---

## 🔧 Step 1: Backend Setup

### 1.1 Install Dependencies

```bash
cd backend
npm install razorpay mysql2 express dotenv crypto
```

### 1.2 Configure Environment Variables

Create `.env` file in backend root:

```env
# Razorpay Credentials (Get from https://dashboard.razorpay.com/)
RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_live_secret_key
RAZORPAY_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxx

# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=life_relier_lims
DB_PORT=3306

# Application
NODE_ENV=production
PORT=3000
```

### 1.3 Create Database Table

Run this SQL script:

```sql
CREATE TABLE IF NOT EXISTS PaymentTransactions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  PID INT NOT NULL,
  PatRegID INT NOT NULL,
  BranchId INT NOT NULL,
  gatewayOrderId VARCHAR(100) NOT NULL,
  gatewayPaymentId VARCHAR(100) DEFAULT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'INR',
  paymentMethod VARCHAR(50) DEFAULT NULL,
  status ENUM('CREATED', 'PENDING', 'SUCCESS', 'FAILED', 'CANCELLED', 'REFUNDED') DEFAULT 'CREATED',
  failureReason TEXT DEFAULT NULL,
  razorpaySignature VARCHAR(255) DEFAULT NULL,
  webhookReceived BOOLEAN DEFAULT FALSE,
  webhookReceivedAt DATETIME DEFAULT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_pid_patreg (PID, PatRegID),
  INDEX idx_gateway_order (gatewayOrderId),
  INDEX idx_gateway_payment (gatewayPaymentId),
  INDEX idx_status (status),
  
  UNIQUE KEY unique_payment (gatewayOrderId, gatewayPaymentId),
  
  FOREIGN KEY (PID) REFERENCES PatientTestStatus(PID),
  FOREIGN KEY (PatRegID) REFERENCES PatientTestStatus(PatRegID)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### 1.4 Copy Backend Files

Copy these files to your backend:

```
backend/
├── controllers/
│   └── paymentController.js          ← From: backend_paymentController.js
├── routes/
│   └── paymentRoutes.js              ← From: backend_paymentRoutes.js
├── middleware/
│   └── razorpayWebhook.js            ← From: backend_razorpayWebhook.js
└── .env                              ← Configure with your credentials
```

### 1.5 Register Routes in app.js

Add to your main `app.js` or `server.js`:

```javascript
const express = require('express');
const paymentRoutes = require('./routes/paymentRoutes');

const app = express();

// IMPORTANT: Webhook route needs raw body BEFORE express.json()
app.use('/api/payments/webhook', express.raw({ type: 'application/json' }));

// Then use express.json() for other routes
app.use(express.json());

// Register payment routes
app.use('/api/payments', paymentRoutes);

// ... rest of your app
```

### 1.6 Start Backend

```bash
npm start
# or
node server.js
```

Verify backend is running: `http://localhost:3000`

---

## 📱 Step 2: Frontend Setup

### 2.1 Install Dependencies

```bash
cd frontend
npx expo install react-native-webview
```

### 2.2 Copy Frontend Files

Copy these files to your frontend:

```
src/
├── screens/patient/
│   └── PaymentGatewayScreen.tsx      ← From: PaymentGatewayScreen_WebView.tsx
└── services/
    └── paymentService.ts             ← Already exists (no changes needed)
```

### 2.3 Configure API Base URL

Update `src/utils/constants.ts` or `.env`:

```typescript
// For development
export const API_BASE_URL = 'http://192.168.1.100:3000';

// For production
export const API_BASE_URL = 'https://your-api-domain.com';
```

Or in `.env`:

```env
API_BASE_URL=https://your-api-domain.com
```

### 2.4 Register Navigation

Add to your navigation stack:

```typescript
// In PatientNavigator.tsx
import PaymentGatewayScreen from '../screens/patient/PaymentGatewayScreen';

// Add to stack
<Stack.Screen 
  name="PaymentGateway" 
  component={PaymentGatewayScreen}
  options={{ headerShown: false }}
/>
```

---

## 🌐 Step 3: Configure Razorpay Dashboard

### 3.1 Get Production Keys

1. Go to https://dashboard.razorpay.com/
2. Switch to **Live Mode** (top-left toggle)
3. Go to **Settings** → **API Keys**
4. Generate new keys if needed
5. Copy `Key ID` and `Key Secret` to backend `.env`

### 3.2 Set Up Webhook

1. Go to **Settings** → **Webhooks**
2. Click **+ Add New Webhook**
3. **Webhook URL**: `https://your-api-domain.com/api/payments/webhook`
4. **Active Events**: Select `payment.captured`
5. **Secret**: Copy the generated secret to backend `.env` as `RAZORPAY_WEBHOOK_SECRET`
6. Click **Create Webhook**

### 3.3 Test Webhook

1. In webhook settings, click **Send Test Webhook**
2. Select `payment.captured` event
3. Check your backend logs for webhook received
4. Verify webhook signature verification works

---

## ✅ Step 4: Testing

### 4.1 Test in Development

Use Razorpay Test Mode credentials:

```env
# Backend .env (Test Mode)
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_test_secret
```

**Test Cards:**
```
Success: 4111 1111 1111 1111
CVV: 123
Expiry: Any future date

Failure: 4000 0000 0000 0002
```

**Test UPI:**
```
Success: success@razorpay
Failure: failure@razorpay
```

### 4.2 Test Scenarios

Run through these scenarios:

- [ ] **UPI Payment Success**
- [ ] **Card Payment Success**
- [ ] **Net Banking Success**
- [ ] **Payment Failure** (use failure test card)
- [ ] **Payment Cancellation** (close payment modal)
- [ ] **Webhook Processing** (close app immediately after payment)
- [ ] **Double Submit** (rapid clicks on pay button)
- [ ] **Network Error** (disable internet mid-payment)
- [ ] **Amount Tampering** (modify amount in dev tools)

### 4.3 Verify Database

Check `PaymentTransactions` table:

```sql
SELECT * FROM PaymentTransactions 
WHERE status = 'SUCCESS' 
ORDER BY createdAt DESC 
LIMIT 10;
```

Verify:
- `gatewayOrderId` is set
- `gatewayPaymentId` is set
- `razorpaySignature` is set
- `status` is 'SUCCESS'
- `webhookReceived` is TRUE (if webhook fired)

Check `PatientTestStatus`:

```sql
SELECT * FROM PatientTestStatus 
WHERE PatRegID = ? AND PID = ?;
```

Verify:
- `PaidAmount` = `TestCharges`
- `Status` = 'Paid'

---

## 🚀 Step 5: Production Deployment

### 5.1 Backend Deployment

#### Option A: Traditional Server (PM2)

```bash
# Install PM2
npm install -g pm2

# Start backend
pm2 start server.js --name lims-backend

# Save PM2 configuration
pm2 save

# Set up auto-restart on server reboot
pm2 startup
```

#### Option B: Docker

```dockerfile
# Dockerfile
FROM node:16-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

EXPOSE 3000

CMD ["node", "server.js"]
```

```bash
# Build and run
docker build -t lims-backend .
docker run -d -p 3000:3000 --env-file .env lims-backend
```

### 5.2 Frontend Deployment (Expo)

#### Option A: EAS Build

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Configure EAS
eas build:configure

# Build for production
eas build --platform android --profile production
eas build --platform ios --profile production
```

#### Option B: Expo Publish

```bash
expo publish --release-channel production
```

### 5.3 SSL/HTTPS Setup

**CRITICAL**: Razorpay requires HTTPS in production!

#### Using Let's Encrypt (Certbot):

```bash
# Install certbot
sudo apt-get install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d your-api-domain.com

# Auto-renew
sudo certbot renew --dry-run
```

#### Nginx Configuration:

```nginx
server {
    listen 443 ssl http2;
    server_name your-api-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-api-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-api-domain.com/privkey.pem;

    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

## 🔒 Step 6: Security Checklist

### Backend Security

- [ ] ✅ All secrets in `.env` (not in code)
- [ ] ✅ `NODE_ENV=production`
- [ ] ✅ HTTPS enabled
- [ ] ✅ Database connection uses SSL
- [ ] ✅ Rate limiting enabled
- [ ] ✅ CORS configured properly
- [ ] ✅ Input validation on all endpoints
- [ ] ✅ SQL injection prevention (parameterized queries)
- [ ] ✅ Error handling doesn't expose sensitive info
- [ ] ✅ Webhook signature verification enabled

### Frontend Security

- [ ] ✅ No API keys hardcoded
- [ ] ✅ Using HTTPS API endpoints
- [ ] ✅ WebView restricted to Razorpay domains
- [ ] ✅ No console.log in production builds
- [ ] ✅ Error reporting enabled (Sentry/Bugsnag)

### Database Security

- [ ] ✅ Strong database password
- [ ] ✅ Database user has minimal privileges
- [ ] ✅ Regular backups configured
- [ ] ✅ Transaction isolation level set
- [ ] ✅ Unique constraint on payment fields
- [ ] ✅ Indexes for performance

---

## 📊 Step 7: Monitoring

### 7.1 Set Up Error Monitoring

#### Sentry (Backend):

```bash
npm install @sentry/node
```

```javascript
// In server.js
const Sentry = require("@sentry/node");

Sentry.init({
  dsn: "your-sentry-dsn",
  environment: process.env.NODE_ENV,
});
```

#### Sentry (Frontend):

```bash
npx expo install @sentry/react-native
```

```typescript
// In App.tsx
import * as Sentry from '@sentry/react-native';

Sentry.init({
  dsn: 'your-sentry-dsn',
  enableInExpoDevelopment: false,
});
```

### 7.2 Payment Analytics

Track key metrics:

```javascript
// In paymentController.js
async function verifyPayment(req, res) {
  try {
    // ... payment verification ...
    
    // Track successful payment
    analytics.track('payment_success', {
      amount: transaction.amount,
      method: paymentMethod,
      orderId: orderId,
    });
    
  } catch (error) {
    // Track failed payment
    analytics.track('payment_failed', {
      reason: error.message,
      orderId: orderId,
    });
  }
}
```

### 7.3 Database Monitoring

Set up alerts for:
- Failed payments > threshold
- Long transaction durations
- High connection count
- Duplicate payment attempts

---

## 🐛 Step 8: Troubleshooting

### Issue: Webhook not receiving events

**Solution:**
1. Check webhook URL is publicly accessible
2. Verify SSL certificate is valid
3. Check Razorpay Dashboard → Webhooks → Event Logs
4. Ensure webhook secret matches `.env`
5. Check server logs for webhook errors

### Issue: Signature verification fails

**Solution:**
1. Verify `RAZORPAY_KEY_SECRET` is correct
2. Check no extra whitespace in `.env`
3. Ensure using raw body for webhooks
4. Verify signature algorithm (SHA256)

### Issue: Database deadlock

**Solution:**
1. Check transaction timeout settings
2. Verify `FOR UPDATE` is working
3. Reduce transaction scope
4. Add retry logic with exponential backoff

### Issue: WebView not loading

**Solution:**
1. Check internet connectivity
2. Verify Razorpay Checkout JS is loading
3. Check WebView console logs
4. Ensure JavaScript is enabled
5. Test on real device (not simulator)

### Issue: Payment succeeds but database not updated

**Solution:**
1. Check backend logs for errors
2. Verify database credentials
3. Check transaction commit/rollback
4. Verify foreign key constraints
5. Check webhook is firing

---

## ✅ Production Checklist

### Pre-Launch

- [ ] All tests passing
- [ ] Test mode working perfectly
- [ ] Switched to live Razorpay keys
- [ ] Webhook configured and tested
- [ ] SSL certificate installed
- [ ] Database backups enabled
- [ ] Error monitoring enabled
- [ ] Rate limiting configured
- [ ] Load testing completed
- [ ] Security audit done

### Launch Day

- [ ] Monitor backend logs
- [ ] Monitor error tracking dashboard
- [ ] Check database for successful payments
- [ ] Verify webhook events coming through
- [ ] Test with small real payment
- [ ] Monitor user feedback
- [ ] Have rollback plan ready

### Post-Launch

- [ ] Daily payment reconciliation
- [ ] Weekly database backup verification
- [ ] Monthly security updates
- [ ] Monitor Razorpay dashboard
- [ ] Review error logs
- [ ] Customer support for payment issues

---

## 📞 Support Resources

### Razorpay Support
- Dashboard: https://dashboard.razorpay.com/
- Docs: https://razorpay.com/docs/
- Support: support@razorpay.com

### Technical Issues
- Check backend logs: `pm2 logs lims-backend`
- Check database: SQL queries above
- Check Sentry dashboard for errors
- Review Razorpay webhook logs

---

## 🎉 Deployment Complete!

Your secure, production-ready payment gateway is now live!

**Key Features Implemented:**
✅ WebView-based Razorpay integration (Expo compatible)  
✅ Database transactions with row-level locking  
✅ Idempotency enforcement  
✅ Webhook support  
✅ Signature verification  
✅ Amount validation from database  
✅ Comprehensive error handling  
✅ Security hardening  

**Next Steps:**
1. Monitor payments closely for first few days
2. Set up automated daily reports
3. Train support team on payment troubleshooting
4. Plan for scaling as transaction volume grows

🚀 **Happy Processing!**
