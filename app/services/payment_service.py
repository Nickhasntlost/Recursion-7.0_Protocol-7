"""
Razorpay Payment Service - TEST MODE
Handles payment order creation, verification, and webhooks
"""
import razorpay
from app.core.config import settings
from typing import Optional, Dict
import hmac
import hashlib


class PaymentService:
    """Razorpay payment integration service (modular & reusable)"""

    def __init__(self):
        """Initialize Razorpay client with test credentials"""
        self.client = razorpay.Client(
            auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET)
        )
        self.client.set_app_details({"title": "Event Booking System", "version": "1.0.0"})

    def create_order(
        self,
        amount: float,
        currency: str = "INR",
        receipt: str = None,
        notes: Optional[Dict] = None
    ) -> Dict:
        """
        Create Razorpay order (Step 1 of payment flow)

        Args:
            amount: Amount in rupees (will be converted to paise)
            currency: Currency code (default: INR)
            receipt: Unique receipt ID
            notes: Additional notes (event_id, user_id, etc.)

        Returns:
            Order details with order_id for client-side payment
        """
        # Convert amount to paise (Razorpay uses smallest currency unit)
        amount_in_paise = int(amount * 100)

        order_data = {
            "amount": amount_in_paise,
            "currency": currency,
            "receipt": receipt or f"receipt_{hash(str(amount))}",
            "notes": notes or {}
        }

        order = self.client.order.create(data=order_data)
        return order

    def verify_payment_signature(
        self,
        razorpay_order_id: str,
        razorpay_payment_id: str,
        razorpay_signature: str
    ) -> bool:
        """
        Verify payment signature (Step 2 - after client completes payment)

        Args:
            razorpay_order_id: Order ID from create_order
            razorpay_payment_id: Payment ID returned by Razorpay
            razorpay_signature: Signature returned by Razorpay

        Returns:
            True if signature is valid, False otherwise
        """
        try:
            params_dict = {
                'razorpay_order_id': razorpay_order_id,
                'razorpay_payment_id': razorpay_payment_id,
                'razorpay_signature': razorpay_signature
            }
            self.client.utility.verify_payment_signature(params_dict)
            return True
        except razorpay.errors.SignatureVerificationError:
            return False

    def verify_webhook_signature(
        self,
        webhook_body: str,
        webhook_signature: str
    ) -> bool:
        """
        Verify webhook signature for secure webhook handling

        Args:
            webhook_body: Raw webhook request body (as string)
            webhook_signature: X-Razorpay-Signature header value

        Returns:
            True if webhook is authentic, False otherwise
        """
        try:
            # Generate expected signature
            expected_signature = hmac.new(
                settings.RAZORPAY_WEBHOOK_SECRET.encode(),
                webhook_body.encode(),
                hashlib.sha256
            ).hexdigest()

            return hmac.compare_digest(expected_signature, webhook_signature)
        except Exception:
            return False

    def fetch_payment(self, payment_id: str) -> Dict:
        """
        Fetch payment details by payment ID

        Args:
            payment_id: Razorpay payment ID

        Returns:
            Payment details
        """
        return self.client.payment.fetch(payment_id)

    def fetch_order(self, order_id: str) -> Dict:
        """
        Fetch order details by order ID

        Args:
            order_id: Razorpay order ID

        Returns:
            Order details
        """
        return self.client.order.fetch(order_id)

    def create_refund(
        self,
        payment_id: str,
        amount: Optional[float] = None,
        notes: Optional[Dict] = None
    ) -> Dict:
        """
        Create refund for a payment

        Args:
            payment_id: Razorpay payment ID
            amount: Refund amount in rupees (None = full refund)
            notes: Refund notes

        Returns:
            Refund details
        """
        refund_data = {"notes": notes or {}}

        if amount is not None:
            refund_data["amount"] = int(amount * 100)  # Convert to paise

        return self.client.payment.refund(payment_id, refund_data)


# Singleton instance
payment_service = PaymentService()
