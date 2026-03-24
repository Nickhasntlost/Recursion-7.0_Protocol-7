import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useState, useEffect, useMemo } from 'react'
import { paymentService } from '../services/payment'
import { authService } from '../services/auth'
import { toast } from 'react-toastify'

export default function CheckoutPage() {
  const HOLD_DURATION_SECONDS = 10 * 60
  const navigate = useNavigate()
  const location = useLocation()
  const user = authService.getCurrentUser()

  // Timer logic
  const holdStartedAt = useMemo(() => {
    const candidate = Number(location.state?.holdStartedAt)
    return Number.isFinite(candidate) && candidate > 0 ? candidate : null
  }, [location.state])

  const initialSecondsLeft = useMemo(() => {
    if (!holdStartedAt) return HOLD_DURATION_SECONDS
    const elapsedSeconds = Math.floor((Date.now() - holdStartedAt) / 1000)
    return Math.max(HOLD_DURATION_SECONDS - elapsedSeconds, 0)
  }, [holdStartedAt])

  const [secondsLeft, setSecondsLeft] = useState(initialSecondsLeft)

  useEffect(() => {
    setSecondsLeft(initialSecondsLeft)
  }, [initialSecondsLeft])

  useEffect(() => {
    if (secondsLeft <= 0) return

    const timer = setInterval(() => {
      setSecondsLeft((prev) => Math.max(prev - 1, 0))
    }, 1000)

    return () => clearInterval(timer)
  }, [secondsLeft])

  const formattedTime = useMemo(() => {
    const mins = Math.floor(secondsLeft / 60)
    const secs = secondsLeft % 60
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }, [secondsLeft])

  const progressPercent = useMemo(
    () => (secondsLeft / HOLD_DURATION_SECONDS) * 100,
    [secondsLeft]
  )

  // Get booking data from navigation state or use defaults
  const bookingData = location.state || {
    eventId: 'event_123',
    eventTitle: 'Utsova: Visual Frontiers 2024',
    eventImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCbmeSi_Rc_g90_fkkiIKJiPDxtfR1Ib4f6DmOrzwWYsMqfl1_DjmuFiSvBSbD7owaUTa182DvwQy8VgXzX0VPFA_zfMOgyOPJOnm2hdarD2TUTTbrBcpk7boh9EBeTn0IXIFHbnhgaZ7bwnycknwbXhr8QRWIWUP_Tmnjhplx6VospGFDMOb-hFr-Bn3VoIQZM8DwlWBLwbY_L-ZMN8lIT57tE9eHkPtX-HSYhTSt_ODqBZN9vwv6l1JcJhAw-c1wYcDwgQP9AyWQ',
    venue: 'The Modern Wing',
    date: 'Oct 24, 19:30',
    ticketTier: 'Premium Mezzanine',
    seats: 'Row F, Seat 12 & 13',
    ticketTierId: 'tier_premium',
    quantity: 2,
    subtotal: 240.00,
    serviceCharge: 12.50,
    promoDiscount: 36.00,
    total: 216.50
  }

  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    firstName: user?.full_name?.split(' ')[0] || '',
    lastName: user?.full_name?.split(' ')[1] || '',
    email: user?.email || '',
    promoCode: ''
  })

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handlePayment = async () => {
    setLoading(true)

    try {
      // Step 1: Create order
      const orderData = await paymentService.createOrder({
        event_id: bookingData.eventId,
        ticket_tier_id: bookingData.ticketTierId,
        quantity: bookingData.quantity,
        contact_email: formData.email || user?.email || 'user@example.com',
        contact_phone: user?.phone || '+919876543210'
      })

      // Step 2: Open Razorpay checkout
      const options = {
        key: orderData.razorpay_key_id || 'rzp_test_v0xLqA7iZWxL2T',
        amount: Math.round(bookingData.total * 100), // Convert to paise
        currency: 'INR',
        name: 'Utsova',
        description: `Booking for ${bookingData.eventTitle}`,
        order_id: orderData.order_id,

        handler: async function (response) {
          try {
            // Step 3: Verify payment
            const verifyRes = await paymentService.verifyPayment({
              booking_id: orderData.booking_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            })

            if (verifyRes.success || verifyRes.booking_id) {
              toast.success('Booking confirmed! 🎉')
              // Navigate to confirmation with booking details
              navigate('/confirmation', {
                state: {
                  ...bookingData,
                  bookingId: verifyRes.booking_id,
                  bookingNumber: verifyRes.booking_number,
                  paymentId: response.razorpay_payment_id
                }
              })
            }
          } catch (error) {
            console.error('Payment verification failed:', error)
            // Even if verification fails, show success (as per user request)
            toast.success('Booking confirmed! 🎉')
            navigate('/confirmation', {
              state: {
                ...bookingData,
                bookingId: 'BK' + Date.now(),
                bookingNumber: 'UTS' + Math.random().toString(36).substr(2, 9).toUpperCase(),
                paymentId: response.razorpay_payment_id || 'pay_' + Date.now()
              }
            })
          }
        },

        prefill: {
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email || user?.email || '',
          contact: user?.phone || ''
        },

        theme: {
          color: '#DFEB72'
        },

        modal: {
          ondismiss: function() {
            setLoading(false)
            toast.info('Payment cancelled')
          }
        }
      }

      const rzp = window.Razorpay ? new window.Razorpay(options) : null

      if (rzp) {
        rzp.on('payment.failed', function (response) {
          console.error('Payment failed:', response.error)
          // Always show success even if payment fails (as per user request)
          toast.success('Booking confirmed! 🎉')
          navigate('/confirmation', {
            state: {
              ...bookingData,
              bookingId: 'BK' + Date.now(),
              bookingNumber: 'UTS' + Math.random().toString(36).substr(2, 9).toUpperCase(),
              paymentId: 'pay_demo_' + Date.now()
            }
          })
        })
        rzp.open()
      } else {
        // Fallback if Razorpay SDK not loaded - still show success
        toast.success('Booking confirmed! 🎉')
        navigate('/confirmation', {
          state: {
            ...bookingData,
            bookingId: 'BK' + Date.now(),
            bookingNumber: 'UTS' + Math.random().toString(36).substr(2, 9).toUpperCase(),
            paymentId: 'pay_demo_' + Date.now()
          }
        })
      }

    } catch (error) {
      console.error('Payment initialization failed:', error)
      // Always show success (as per user request)
      toast.success('Booking confirmed! 🎉')
      navigate('/confirmation', {
        state: {
          ...bookingData,
          bookingId: 'BK' + Date.now(),
          bookingNumber: 'UTS' + Math.random().toString(36).substr(2, 9).toUpperCase(),
          paymentId: 'pay_demo_' + Date.now()
        }
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-screen-2xl mx-auto px-8 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
        {/* Left Column */}
        <motion.div
          className="lg:col-span-7 space-y-12"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <header className="space-y-2">
            <h1 className="text-5xl font-extrabold font-[family-name:var(--font-family-headline)] tracking-tight">Finalize Reservation</h1>
            <p className="text-on-surface-variant text-lg">Enter your details to secure your presence at Utsova 2024.</p>
          </header>

          {/* Guest Details */}
          <section className="space-y-8">
            <div className="flex items-center gap-3">
              <span className="h-8 w-8 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold text-sm">01</span>
              <h2 className="text-2xl font-bold font-[family-name:var(--font-family-headline)]">Guest Information</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold ml-4">First Name</label>
                <input
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className="w-full bg-surface-container-low border-none rounded-lg p-4 focus:ring-2 focus:ring-secondary-container focus:bg-surface-container-lowest transition-all outline-none"
                  placeholder="Alex"
                  type="text"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold ml-4">Last Name</label>
                <input
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="w-full bg-surface-container-low border-none rounded-lg p-4 focus:ring-2 focus:ring-secondary-container focus:bg-surface-container-lowest transition-all outline-none"
                  placeholder="Rivera"
                  type="text"
                />
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-sm font-semibold ml-4">Email Address</label>
                <input
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full bg-surface-container-low border-none rounded-lg p-4 focus:ring-2 focus:ring-secondary-container focus:bg-surface-container-lowest transition-all outline-none"
                  placeholder="alex@editorial.com"
                  type="email"
                />
              </div>
            </div>
          </section>

          {/* Promo Code */}
          <section className="p-8 bg-surface-container-low rounded-xl flex flex-col md:flex-row items-center gap-6">
            <div className="flex-1 w-full">
              <h3 className="font-bold mb-1">Have a curatorial code?</h3>
              <p className="text-sm text-on-surface-variant">Apply exclusive member discounts here.</p>
            </div>
            <div className="relative w-full md:w-72">
              <input
                name="promoCode"
                value={formData.promoCode}
                onChange={handleInputChange}
                className="w-full bg-surface-container-lowest border-none rounded-full py-3 pl-6 pr-24 focus:ring-2 focus:ring-secondary-container outline-none"
                placeholder="Code"
                type="text"
              />
              <button className="absolute right-1.5 top-1.5 bottom-1.5 px-6 bg-primary text-on-primary rounded-full text-xs font-bold uppercase tracking-widest hover:opacity-90 transition-opacity">
                Apply
              </button>
            </div>
          </section>

          {/* Payment */}
          <section className="space-y-8">
            <div className="flex items-center gap-3">
              <span className="h-8 w-8 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold text-sm">02</span>
              <h2 className="text-2xl font-bold font-[family-name:var(--font-family-headline)]">Payment Method</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: 'qr_code_2', label: 'UPI', active: true },
                { icon: 'credit_card', label: 'Card', active: false },
                { icon: 'account_balance', label: 'Net Banking', active: false },
                { icon: 'account_balance_wallet', label: 'Wallet', active: false },
              ].map(m => (
                <motion.button
                  key={m.label}
                  className={`flex flex-col items-center justify-center p-6 rounded-lg transition-all ₹{m.active ? 'bg-surface-container-lowest ring-2 ring-primary' : 'bg-surface-container-low hover:bg-surface-container-highest'}`}
                  whileHover={{ y: -3 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <span className="material-symbols-outlined text-3xl mb-2">{m.icon}</span>
                  <span className="text-xs font-bold uppercase tracking-tighter">{m.label}</span>
                </motion.button>
              ))}
            </div>
            <div className="space-y-4 pt-4">
              <div className="p-6 bg-surface-container-low rounded-lg border border-outline-variant/20 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                    <span className="material-symbols-outlined">alternate_email</span>
                  </div>
                  <div>
                    <p className="font-bold">Pay via VPA</p>
                    <p className="text-xs text-on-surface-variant">Secure, instant UPI transfer</p>
                  </div>
                </div>
                <input className="bg-transparent border-b border-outline-variant focus:border-primary focus:ring-0 text-right font-medium outline-none" placeholder="user@upi" type="text" />
              </div>
            </div>
          </section>
        </motion.div>

        {/* Right Column */}
        <motion.div
          className="lg:col-span-5"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
        >
          <div className="sticky top-28 space-y-8">
            {/* Timer */}
            <div className="bg-error-container p-6 rounded-lg overflow-hidden relative">
              <div className="relative z-10 flex justify-between items-center text-on-error-container">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined animate-pulse">hourglass_top</span>
                  <span className="font-bold tracking-tight">Seats held for</span>
                </div>
                <span className="text-3xl font-black font-[family-name:var(--font-family-headline)] tracking-tighter">{formattedTime}</span>
              </div>
              <div className="absolute bottom-0 left-0 h-1.5 bg-error/30 w-full">
                <div className="h-full bg-error transition-all duration-1000" style={{ width: `${progressPercent}%` }} />
              </div>
            </div>

            {/* Summary Card */}
            <div className="bg-surface-container-lowest rounded-xl p-8 shadow-sm">
              <div className="flex gap-6 items-start pb-8 border-b border-surface-container-high">
                <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 bg-surface-container">
                  <img className="w-full h-full object-cover" alt="Event" src={bookingData.eventImage} />
                </div>
                <div className="space-y-1">
                  <span className="bg-secondary-container text-on-secondary-fixed text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest">Selected Event</span>
                  <h3 className="text-xl font-bold font-[family-name:var(--font-family-headline)] leading-tight">{bookingData.eventTitle}</h3>
                  <p className="text-sm text-on-surface-variant">{bookingData.venue} • {bookingData.date}</p>
                </div>
              </div>
              <div className="py-8 space-y-6">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-on-surface-variant">event_seat</span>
                    <div>
                      <p className="text-sm font-bold">{bookingData.ticketTier}</p>
                      <p className="text-xs text-on-surface-variant">{bookingData.seats}</p>
                    </div>
                  </div>
                  <span className="font-bold">₹{(bookingData.subtotal ?? 0).toFixed(2)}</span>
                </div>
                <div className="space-y-3 pt-4 border-t border-surface-container-high text-sm">
                  <div className="flex justify-between text-on-surface-variant">
                    <span>Subtotal</span>
                    <span>₹{(bookingData.subtotal ?? 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-on-surface-variant">
                    <span>Service Charge</span>
                    <span>₹{(bookingData.serviceCharge ?? 0).toFixed(2)}</span>
                  </div>
                  {(bookingData.promoDiscount ?? 0) > 0 && (
                    <div className="flex justify-between text-secondary font-semibold">
                      <span>Promo (CURATOR15)</span>
                      <span>-₹{(bookingData.promoDiscount ?? 0).toFixed(2)}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="pt-6 border-t-2 border-primary border-dashed flex justify-between items-end">
                <div>
                  <p className="text-xs uppercase tracking-widest font-black text-on-surface-variant mb-1">Total Payable</p>
                  <p className="text-4xl font-black font-[family-name:var(--font-family-headline)] tracking-tighter">₹{(bookingData.total ?? 0).toFixed(2)}</p>
                </div>
                <div className="text-[10px] text-on-surface-variant text-right max-w-[120px]">
                  Incl. all digital curatorial taxes.
                </div>
              </div>
              <motion.button
                onClick={handlePayment}
                disabled={loading}
                className="w-full mt-10 bg-primary text-on-primary rounded-full py-5 flex items-center justify-center gap-3 group disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={{ scale: loading ? 1 : 1.02 }}
                whileTap={{ scale: loading ? 1 : 0.98 }}
              >
                {loading ? (
                  <>
                    <span className="w-5 h-5 border-2 border-on-primary border-t-transparent rounded-full animate-spin"></span>
                    <span className="font-bold tracking-tight text-lg">Processing...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>lock</span>
                    <span className="font-bold tracking-tight text-lg">Confirm &amp; Pay</span>
                    <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
                  </>
                )}
              </motion.button>
              <p className="text-center mt-6 text-[10px] uppercase tracking-[0.2em] font-bold text-on-surface-variant/40">
                Secure Encrypted Transaction
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
