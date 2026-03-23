import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { paymentService } from '../services/payment';
import api from '../services/api';
import { authService } from '../services/auth';
import { toast } from 'react-toastify';

export default function PaymentPage() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [eventData, setEventData] = useState(null);
  const [error, setError] = useState('');
  const user = authService.getCurrentUser();

  useEffect(() => {
    // Fetch event details to get ticket_tier
    const fetchEvent = async () => {
      try {
        const response = await api.get(`/events/${eventId}`);
        setEventData(response.data);
      } catch (err) {
        console.error('Failed to load event details', err);
        setError('Failed to load event details. It might not exist.');
      }
    };
    if (eventId) {
      fetchEvent();
    }
  }, [eventId]);

  const handlePayment = async () => {
    setLoading(true);
    setError('');

    try {
      if (!eventData?.ticket_tiers || eventData.ticket_tiers.length === 0) {
        // Mock a ticket tier if they don't exist, based on spec 
        console.warn("No ticket tiers found, sending a mock one or handling error");
      }

      const ticketTier = eventData?.ticket_tiers?.[0] || { tier_id: "tier_1", price: 299.0 };

      // Step 1: Create order
      const orderData = await paymentService.createOrder({
        event_id: eventId,
        ticket_tier_id: ticketTier.tier_id || ticketTier.id || "tier_1",
        quantity: 1,
        contact_email: user?.email || "user@example.com",
        contact_phone: user?.phone || "+919876543210"
      });

      // Step 2: Show Razorpay checkout
      const options = {
        key: orderData.razorpay_key_id || "rzp_test_v0xLqA7iZWxL2T",
        amount: orderData.amount * 100, // Convert to paise
        currency: orderData.currency || "INR",
        name: "Utsova Event Booking",
        description: `Booking for ${eventData?.title || 'event'}`,
        order_id: orderData.order_id,

        handler: async function (response) {
          try {
            // Step 3: Verify payment
            const verifyRes = await paymentService.verifyPayment({
              booking_id: orderData.booking_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            });

            if (verifyRes.success || verifyRes.booking_id) {
              toast.success(`Booking confirmed! ${verifyRes.booking_number || ''}`);
              navigate('/my-bookings');
            }
          } catch (verifyErr) {
            console.error('Verify error:', verifyErr);
            toast.error('Payment verification failed!');
          }
        },

        prefill: {
          email: user?.email || "",
          contact: user?.phone || ""
        },

        theme: {
          color: "#000000" // Using black to sync with default light dark theme dynamically if possible or a neutral dark color. Let's stick with the classic dark color.
        }
      };

      const rzp = window.Razorpay ? new window.Razorpay(options) : null;
      if(rzp){
          rzp.on('payment.failed', function (response){
            toast.error(`Payment failed: ${response.error.description}`);
          });
          rzp.open();
      }else{
          toast.error('Razorpay SDK failed to load. Are you offline?')
      }

    } catch (err) {
      console.error('Payment initialization failed:', err);
      const msg = err.response?.data?.detail || err.message || 'Payment failed';
      toast.error('Payment failed: ' + msg);
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
     if(eventData && !error) {
         handlePayment();
     }
  }, [eventData]);

  if (error) {
    return (
      <div className="max-w-screen-md mx-auto px-8 py-24 text-center">
        <h2 className="text-3xl font-bold font-[family-name:var(--font-family-headline)]">Oops</h2>
        <p className="mt-4 text-on-surface-variant">{error}</p>
        <button onClick={() => navigate('/dashboard')} className="mt-8 px-6 py-3 rounded-full bg-primary text-on-primary">
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] max-w-screen-md mx-auto px-8 py-24 text-center">
      <h1 className="text-5xl font-extrabold font-[family-name:var(--font-family-headline)] tracking-tight mb-4">
        Connecting to Payment Gateway
      </h1>
      <p className="text-on-surface-variant text-lg mb-12">
        {eventData ? `Initializing secure checkout for ${eventData.title}...` : 'Loading event details...'}
      </p>

      <div className="flex justify-center mt-12">
        {loading && (
           <div className="flex flex-col items-center gap-4">
             <span className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin"></span>
             <p className="font-medium text-sm text-on-surface-variant">Please wait...</p>
           </div>
        )}
      </div>

    </div>
  );
}
