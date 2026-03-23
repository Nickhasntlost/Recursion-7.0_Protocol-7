# Razorpay Payment Integration - Test Mode

## Complete Payment Flow for AI-Created Events

### Overview
After AI creates an event, users proceed to payment to book tickets using Razorpay (Test Mode). No real money is deducted!

---

## Setup (Get Test API Keys)

### Step 1: Create Razorpay Account
1. Visit https://dashboard.razorpay.com/signup
2. Sign up with email
3. Complete verification

### Step 2: Get Test API Keys
1. Login to https://dashboard.razorpay.com
2. Switch to **TEST MODE** (toggle at top)
3. Go to **Settings → API Keys** (https://dashboard.razorpay.com/#/app/keys)
4. Generate Test Key
5. Copy:
   - `Key ID` (starts with `rzp_test_`)
   - `Key Secret` (click "Show" to reveal)

### Step 3: Add to `.env`
```bash
RAZORPAY_KEY_ID=rzp_test_XXXXXXXXXXXXX
RAZORPAY_KEY_SECRET=YYYYYYYYYYYYYYYY
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret
```

### Step 4: Setup Webhook (Optional)
1. Go to **Settings → Webhooks** in Razorpay Dashboard
2. Add webhook URL: `https://yourdomain.com/api/v1/payments/webhook`
3. Select events: `payment.captured`, `payment.failed`, `refund.created`
4. Copy **Webhook Secret** and add to `.env`

---

## Payment Flow

### Full User Journey

```
1. User chats with AI → Event details extracted
2. User selects venue → Event created (DRAFT status)
3. Frontend navigates to Payment Page
4. User clicks "Book Tickets"
5. Backend creates Razorpay order (Step 1)
6. Frontend shows Razorpay Checkout
7. User completes payment (TEST MODE - use test cards)
8. Frontend sends payment details to backend (Step 2)
9. Backend verifies signature
10. Booking confirmed! Tickets generated.
```

---

## API Endpoints

### 1. Create Payment Order (Step 1)

**Endpoint:** `POST /api/v1/payments/create-order`

**Request:**
```json
{
  "event_id": "69c124abc123...",
  "ticket_tier_id": "tier_123",
  "quantity": 2,
  "contact_email": "user@example.com",
  "contact_phone": "+919876543210"
}
```

**Response:**
```json
{
  "booking_id": "booking_123",
  "order_id": "order_MNopQRstUVwx",  // Razorpay order ID
  "amount": 598.0,
  "currency": "INR",
  "razorpay_key_id": "rzp_test_XXXXX",  // For frontend checkout
  "booking_number": "BK-20260323-ABC123",
  "expires_at": "2026-03-23T10:30:00"  // 15 min expiry
}
```

**What happens:**
- Creates booking (PENDING status)
- Locks seats temporarily (15 min)
- Creates Razorpay order
- Returns order_id for frontend

---

### 2. Verify Payment (Step 2)

**Endpoint:** `POST /api/v1/payments/verify`

**Request:**
```json
{
  "booking_id": "booking_123",
  "razorpay_order_id": "order_MNopQRstUVwx",
  "razorpay_payment_id": "pay_ABCdefGHIjkl",
  "razorpay_signature": "signature_from_razorpay"
}
```

**Response:**
```json
{
  "success": true,
  "booking_id": "booking_123",
  "booking_number": "BK-20260323-ABC123",
  "payment_status": "completed",
  "booking_status": "confirmed",
  "message": "Payment verified successfully! Booking confirmed."
}
```

**What happens:**
- Verifies Razorpay signature (security)
- Updates booking: PENDING → CONFIRMED
- Updates payment_status: PENDING → COMPLETED
- Updates event stats (total_bookings, total_revenue)
- Tickets are now confirmed!

---

### 3. Get My Bookings

**Endpoint:** `GET /api/v1/payments/my-bookings`

**Response:**
```json
[
  {
    "booking_id": "booking_123",
    "booking_number": "BK-20260323-ABC123",
    "event_id": "event_456",
    "total_tickets": 2,
    "total_amount": 598.0,
    "payment_status": "completed",
    "booking_status": "confirmed",
    "created_at": "2026-03-23T10:15:00",
    "confirmed_at": "2026-03-23T10:20:00"
  }
]
```

---

### 4. Webhook Handler (Automatic)

**Endpoint:** `POST /api/v1/payments/webhook`

**Headers:**
- `X-Razorpay-Signature`: Webhook signature from Razorpay

**Body:** (sent by Razorpay)
```json
{
  "event": "payment.captured",
  "payload": {
    "payment": {
      "entity": {
        "id": "pay_ABCdefGHIjkl",
        "order_id": "order_MNopQRstUVwx",
        "status": "captured",
        "amount": 59800
      }
    }
  }
}
```

**Handled Events:**
- `payment.captured` → Confirm booking
- `payment.failed` → Cancel booking, restore seats
- `refund.created` → Mark as refunded

---

## Frontend Integration (React Example)

### Step 1: Create Order (Backend Call)

```javascript
const createPaymentOrder = async () => {
  const response = await fetch('/api/v1/payments/create-order', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      event_id: eventId,
      ticket_tier_id: selectedTier.tier_id,
      quantity: ticketCount,
      contact_email: user.email,
      contact_phone: user.phone
    })
  });

  const data = await response.json();
  return data; // Contains order_id, booking_id, amount, etc.
};
```

### Step 2: Show Razorpay Checkout

```javascript
const showRazorpayCheckout = (orderData) => {
  const options = {
    key: orderData.razorpay_key_id,  // Test key from backend
    amount: orderData.amount * 100,   // Convert to paise
    currency: orderData.currency,
    name: "Event Booking System",
    description: `Booking for ${eventTitle}`,
    order_id: orderData.order_id,     // Razorpay order ID
    handler: async function (response) {
      // Payment successful - verify on backend
      await verifyPayment({
        booking_id: orderData.booking_id,
        razorpay_order_id: response.razorpay_order_id,
        razorpay_payment_id: response.razorpay_payment_id,
        razorpay_signature: response.razorpay_signature
      });
    },
    prefill: {
      email: user.email,
      contact: user.phone
    },
    theme: {
      color: "#3399cc"
    }
  };

  const rzp = new window.Razorpay(options);
  rzp.open();
};
```

### Step 3: Verify Payment (Backend Call)

```javascript
const verifyPayment = async (paymentData) => {
  const response = await fetch('/api/v1/payments/verify', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(paymentData)
  });

  const result = await response.json();

  if (result.success) {
    // Show success message
    alert('Booking confirmed! ' + result.booking_number);
    // Redirect to booking details page
    window.location.href = `/bookings/${result.booking_id}`;
  }
};
```

### Complete Flow Component

```javascript
import React, { useState } from 'react';

const PaymentPage = ({ eventId, ticketTier }) => {
  const [loading, setLoading] = useState(false);

  const handleBooking = async () => {
    setLoading(true);

    try {
      // Step 1: Create order
      const orderData = await createPaymentOrder();

      // Step 2: Show Razorpay checkout
      showRazorpayCheckout(orderData);
    } catch (error) {
      alert('Booking failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button onClick={handleBooking} disabled={loading}>
      {loading ? 'Processing...' : `Book ${ticketTier.name} Tickets`}
    </button>
  );
};
```

---

## Test Mode Features

### Test Cards (No Real Money!)

**Success:**
- Card: `4111 1111 1111 1111`
- CVV: Any 3 digits
- Expiry: Any future date

**Failure:**
- Card: `4000 0000 0000 0002`
- CVV: Any 3 digits
- Expiry: Any future date

### Test UPI
- VPA: `success@razorpay`
- VPA (fail): `failure@razorpay`

### Test Netbanking
- After selecting bank, Razorpay shows mock page
- Click "Success" or "Failure" button

---

## Payment States

### Booking Status Flow

```
PENDING → Create order
  ↓
PENDING → User completes payment
  ↓
CONFIRMED → Payment verified
```

### Payment Status Flow

```
PENDING → Order created
  ↓
COMPLETED → Payment successful & verified
  or
FAILED → Payment failed or signature invalid
  or
REFUNDED → Refund processed
```

---

## Security Features

### 1. Signature Verification
- Every payment verified using HMAC SHA256
- Prevents payment tampering
- Invalid signatures → Payment rejected

### 2. Webhook Signature
- Webhooks verified using webhook secret
- Prevents fake webhook attacks

### 3. Order Expiry
- Temporary seat locks expire in 15 minutes
- Prevents indefinite seat blocking

### 4. Idempotency
- Duplicate payment verifications ignored
- Prevents double-booking

---

## Error Handling

### Common Errors

**1. "Not enough tickets available"**
- Solution: Check event capacity

**2. "Payment signature verification failed"**
- Cause: Tampered payment data
- Solution: Payment rejected, booking cancelled

**3. "Booking expired"**
- Cause: Payment not completed within 15 min
- Solution: Create new booking

**4. "Invalid Razorpay credentials"**
- Cause: Wrong API keys in .env
- Solution: Check RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET

---

## Webhook Testing

### Using Ngrok (Local Development)

```bash
# Install ngrok
npm install -g ngrok

# Expose local server
ngrok http 8000

# Copy https URL (e.g., https://abc123.ngrok.io)
# Add to Razorpay Dashboard:
# https://abc123.ngrok.io/api/v1/payments/webhook
```

### Manual Webhook Test

```bash
curl -X POST http://localhost:8000/api/v1/payments/webhook \
  -H "X-Razorpay-Signature: test_signature" \
  -H "Content-Type: application/json" \
  -d '{
    "event": "payment.captured",
    "payload": {
      "payment": {
        "entity": {
          "id": "pay_test123",
          "order_id": "order_test456",
          "status": "captured"
        }
      }
    }
  }'
```

---

## Modular Payment Service

The payment service is **modular** and can be reused for:

1. **Event Bookings** ✅ (Implemented)
2. **Merchandise Sales** (Reuse payment_service)
3. **Donations** (Reuse payment_service)
4. **VIP Upgrades** (Reuse payment_service)

**Usage Example:**
```python
from app.services.payment_service import payment_service

# Create order
order = payment_service.create_order(
    amount=999.0,
    receipt="MERCH-123",
    notes={"product_id": "tshirt_xl"}
)

# Verify payment
is_valid = payment_service.verify_payment_signature(
    razorpay_order_id=order_id,
    razorpay_payment_id=payment_id,
    razorpay_signature=signature
)
```

---

## Testing Checklist

- [ ] Get Razorpay test API keys
- [ ] Add keys to `.env`
- [ ] Restart server
- [ ] Create event via AI
- [ ] Call `/payments/create-order`
- [ ] Test with card `4111 1111 1111 1111`
- [ ] Verify payment signature
- [ ] Check booking status = CONFIRMED
- [ ] Check payment status = COMPLETED
- [ ] Test failure with card `4000 0000 0000 0002`
- [ ] Verify seats restored on failure

---

## Resources

- **Razorpay Dashboard:** https://dashboard.razorpay.com
- **Test Cards:** https://razorpay.com/docs/payments/payments/test-card-details/
- **Python SDK Docs:** https://razorpay.com/docs/payments/server-integration/python/
- **Webhook Setup:** https://razorpay.com/docs/webhooks/
- **Signature Verification:** https://github.com/razorpay/razorpay-python/blob/master/documents/webhook.md

---

## Support

For issues, check:
1. API keys are from TEST MODE
2. Keys correctly added to `.env`
3. Server restarted after adding keys
4. Frontend using correct `razorpay_key_id`

**Test Mode = 100% Safe, No Real Money! 💳**
