# Simple Razorpay Payment Flow (No Webhooks Needed!)

## Test Mode - 2 Keys, 3 Steps

### Setup (Done ✅)
```env
RAZORPAY_KEY_ID=rzp_test_v0xLqA7iZWxL2T
RAZORPAY_KEY_SECRET=INagDD5P5IEv8FOzBAH2MsOu
```

---

## Payment Flow (Simple Version)

### Step 1: Create Payment Order (Backend)

**API:** `POST /api/v1/payments/create-order`

**Request:**
```json
{
  "event_id": "event_123",
  "ticket_tier_id": "tier_1",
  "quantity": 2,
  "contact_email": "user@example.com"
}
```

**Response:**
```json
{
  "order_id": "order_MabcdXYZ12",  // Use this in Razorpay checkout
  "booking_id": "booking_456",
  "amount": 598.0,
  "razorpay_key_id": "rzp_test_v0xLqA7iZWxL2T",
  "booking_number": "BK-20260323-ABC"
}
```

---

### Step 2: Show Razorpay Checkout (Frontend)

```javascript
// Include Razorpay script in HTML
<script src="https://checkout.razorpay.com/v1/checkout.js"></script>

// Show checkout
const options = {
  key: "rzp_test_v0xLqA7iZWxL2T",  // From Step 1 response
  amount: 59800,  // Amount in paise (598.00 * 100)
  currency: "INR",
  name: "Event Booking",
  order_id: "order_MabcdXYZ12",  // From Step 1 response

  handler: function (response) {
    // Payment successful - got these 3 values:
    console.log(response.razorpay_order_id);
    console.log(response.razorpay_payment_id);
    console.log(response.razorpay_signature);

    // Now verify on backend (Step 3)
    verifyPayment(response);
  }
};

const rzp = new Razorpay(options);
rzp.open();
```

**Test Card (No Real Money!):**
- Card: `4111 1111 1111 1111`
- CVV: `123`
- Expiry: Any future date

---

### Step 3: Verify Payment (Backend)

**API:** `POST /api/v1/payments/verify`

**Request:**
```json
{
  "booking_id": "booking_456",
  "razorpay_order_id": "order_MabcdXYZ12",
  "razorpay_payment_id": "pay_ABC123",
  "razorpay_signature": "signature_from_razorpay"
}
```

**Response:**
```json
{
  "success": true,
  "booking_number": "BK-20260323-ABC",
  "payment_status": "completed",
  "booking_status": "confirmed",
  "message": "Payment verified! Booking confirmed."
}
```

**Done! Booking confirmed.** ✅

---

## Complete Frontend Code

```javascript
// Step 1: Create order
const createOrder = async () => {
  const res = await fetch('/api/v1/payments/create-order', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      event_id: eventId,
      ticket_tier_id: tierOne.tier_id,
      quantity: 2,
      contact_email: user.email
    })
  });
  return await res.json();
};

// Step 2: Show Razorpay checkout
const showCheckout = (orderData) => {
  const options = {
    key: orderData.razorpay_key_id,
    amount: orderData.amount * 100,
    currency: "INR",
    name: "Event Booking",
    order_id: orderData.order_id,
    handler: async (response) => {
      // Step 3: Verify payment
      await verifyPayment({
        booking_id: orderData.booking_id,
        ...response  // Contains order_id, payment_id, signature
      });
    }
  };

  new Razorpay(options).open();
};

// Step 3: Verify payment
const verifyPayment = async (data) => {
  const res = await fetch('/api/v1/payments/verify', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });

  const result = await res.json();

  if (result.success) {
    alert('Booking confirmed! ' + result.booking_number);
  }
};

// Use it
const handleBooking = async () => {
  const orderData = await createOrder();
  showCheckout(orderData);
};
```

---

## What About Webhooks?

**You DON'T need webhooks for test mode!**

Webhooks are for:
- Production backup (if user closes browser before verification)
- Asynchronous payment methods (UPI takes 2-3 min)
- Payment failures that need to be handled automatically

**For testing:** The `/verify` endpoint is enough. ✅

**For production later:** Add webhook endpoint as backup safety net.

---

## Test Now

1. **Restart server:**
```bash
cd backend
uvicorn main:app --reload
```

2. **Test in Swagger:**
```
POST /api/v1/payments/create-order
# Copy order_id from response
# Use test card: 4111 1111 1111 1111
POST /api/v1/payments/verify
```

3. **Check booking:**
```
GET /api/v1/payments/my-bookings
# Should show confirmed booking!
```

---

## Summary

✅ **2 API Keys** (added to .env)
✅ **3 Simple Steps** (create → pay → verify)
✅ **No Webhooks** needed for test mode
✅ **Test Cards** - No real money
✅ **Direct Verification** via `/verify` endpoint

**Webhooks = Optional production backup**

---

## Sources

- [Razorpay Payment Flow Explained](https://dev.to/vjygour/the-correct-razorpay-payment-flow-explained-simply-g98)
- [Razorpay Integration Guide](https://medium.com/@anujgupta5686/a-complete-guide-to-razorpay-payment-gateway-integration-from-scratch-to-verification-cc7ec4e1eac1)
- [Webhooks FAQ](https://razorpay.com/docs/webhooks/faqs/)
- [About Webhooks](https://razorpay.com/docs/webhooks/)
