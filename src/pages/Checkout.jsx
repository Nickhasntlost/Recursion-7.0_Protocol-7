import { useParams, useLocation, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { events } from '../data/mockData'
import toast from 'react-hot-toast'

const Checkout = () => {
  const { eventId } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const { tier, quantity, seats } = location.state || {}

  const [event, setEvent] = useState(null)
  const [timeLeft, setTimeLeft] = useState(300) // 5 minutes
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    promoCode: ''
  })
  const [paymentMethod, setPaymentMethod] = useState('upi')
  const [discount, setDiscount] = useState(0)

  useEffect(() => {
    const foundEvent = events.find(e => e.id === eventId)
    setEvent(foundEvent)
  }, [eventId])

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          toast.error('Session expired! Please try again.')
          navigate(`/event/₹{eventId}`)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [eventId, navigate])

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `₹{mins.toString().padStart(2, '0')}:₹{secs.toString().padStart(2, '0')}`
  }

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleApplyPromo = () => {
    if (formData.promoCode.toUpperCase() === 'CURATOR15') {
      setDiscount(0.15)
      toast.success('Promo code applied! 15% discount')
    } else {
      toast.error('Invalid promo code')
    }
  }

  const handleConfirmPayment = (e) => {
    e.preventDefault()

    if (!formData.firstName || !formData.lastName || !formData.email) {
      toast.error('Please fill in all required fields')
      return
    }

    toast.success('Payment processing...')
    setTimeout(() => {
      const bookingId = 'ASM-' + Math.random().toString(36).substr(2, 9).toUpperCase()
      navigate(`/confirmation/₹{bookingId}`, {
        state: { event, tier, quantity, seats }
      })
    }, 2000)
  }

  if (!event || !tier) {
    return <div className="min-h-screen flex items-center justify-center">
      <p>Invalid booking details</p>
    </div>
  }

  const subtotal = tier.price * quantity
  const serviceCharge = 12.50
  const discountAmount = subtotal * discount
  const total = subtotal + serviceCharge - discountAmount

  return (
    <div className="bg-surface font-body text-on-surface antialiased">
      {/* TopNavBar */}
      <nav className="sticky top-0 w-full z-50 bg-white/70 backdrop-blur-xl">
        <div className="flex justify-between items-center w-full px-8 py-6 max-w-screen-2xl mx-auto">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="group flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors"
            >
              <span className="material-symbols-outlined text-xl">arrow_back</span>
              <span className="font-medium">Exit Checkout</span>
            </button>
          </div>
          <div className="text-2xl font-black tracking-tighter font-headline">ASSEMBLE</div>
          <div className="w-24"></div>
        </div>
      </nav>

      <main className="max-w-screen-2xl mx-auto px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          {/* Left Column: Checkout Details */}
          <div className="lg:col-span-7 space-y-12">
            <header className="space-y-2">
              <h1 className="text-5xl font-extrabold font-headline tracking-tight">Finalize Reservation</h1>
              <p className="text-on-surface-variant text-lg">Enter your details to secure your presence at {event.title}.</p>
            </header>

            {/* Guest Details Form */}
            <form onSubmit={handleConfirmPayment} className="space-y-8">
              <section className="space-y-8">
                <div className="flex items-center gap-3">
                  <span className="h-8 w-8 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold text-sm">
                    01
                  </span>
                  <h2 className="text-2xl font-bold font-headline">Guest Information</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold ml-4">First Name</label>
                    <input
                      className="w-full bg-surface-container-low border-none rounded-lg p-4 focus:ring-2 focus:ring-secondary-container focus:bg-surface-container-lowest transition-all"
                      placeholder="Alex"
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold ml-4">Last Name</label>
                    <input
                      className="w-full bg-surface-container-low border-none rounded-lg p-4 focus:ring-2 focus:ring-secondary-container focus:bg-surface-container-lowest transition-all"
                      placeholder="Rivera"
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-sm font-semibold ml-4">Email Address</label>
                    <input
                      className="w-full bg-surface-container-low border-none rounded-lg p-4 focus:ring-2 focus:ring-secondary-container focus:bg-surface-container-lowest transition-all"
                      placeholder="alex@editorial.com"
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      onKeyDown={(e) => e.key === 'Enter' && e.preventDefault()}
                      required
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
                    className="w-full bg-surface-container-lowest border-none rounded-full py-3 pl-6 pr-24 focus:ring-2 focus:ring-secondary-container"
                    placeholder="Code"
                    type="text"
                    name="promoCode"
                    value={formData.promoCode}
                    onChange={handleInputChange}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleApplyPromo())}
                  />
                  <button
                    type="button"
                    onClick={handleApplyPromo}
                    className="absolute right-1.5 top-1.5 bottom-1.5 px-6 bg-primary text-on-primary rounded-full text-xs font-bold uppercase tracking-widest hover:opacity-90 transition-opacity"
                  >
                    Apply
                  </button>
                </div>
              </section>

              {/* Payment Methods */}
              <section className="space-y-8">
                <div className="flex items-center gap-3">
                  <span className="h-8 w-8 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold text-sm">
                    02
                  </span>
                  <h2 className="text-2xl font-bold font-headline">Payment Method</h2>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { id: 'upi', icon: 'qr_code_2', label: 'UPI' },
                    { id: 'card', icon: 'credit_card', label: 'Card' },
                    { id: 'netbanking', icon: 'account_balance', label: 'Net Banking' },
                    { id: 'wallet', icon: 'account_balance_wallet', label: 'Wallet' }
                  ].map(method => (
                    <button
                      key={method.id}
                      type="button"
                      onClick={() => setPaymentMethod(method.id)}
                      className={`flex flex-col items-center justify-center p-6 rounded-lg transition-all ₹{
                        paymentMethod === method.id
                          ? 'bg-surface-container-lowest ring-2 ring-primary'
                          : 'bg-surface-container-low hover:bg-surface-container-highest'
                      }`}
                    >
                      <span className="material-symbols-outlined text-3xl mb-2">{method.icon}</span>
                      <span className="text-xs font-bold uppercase tracking-tighter">{method.label}</span>
                    </button>
                  ))}
                </div>
              </section>
            </form>
          </div>

          {/* Right Column: Order Summary & Timer */}
          <div className="lg:col-span-5">
            <div className="sticky top-28 space-y-8">
              {/* Hold Timer */}
              <div className="bg-error-container p-6 rounded-lg overflow-hidden relative">
                <div className="relative z-10 flex justify-between items-center text-on-error-container">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined animate-pulse">hourglass_top</span>
                    <span className="font-bold tracking-tight">Seats held for</span>
                  </div>
                  <span className="text-3xl font-black font-headline tracking-tighter">{formatTime(timeLeft)}</span>
                </div>
                <div className="absolute bottom-0 left-0 h-1.5 bg-error/30 w-full">
                  <div
                    className="h-full bg-error transition-all duration-1000"
                    style={{ width: `₹{(timeLeft / 300) * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* Summary Card */}
              <div className="bg-surface-container-lowest rounded-xl p-8 shadow-sm">
                <div className="flex gap-6 items-start pb-8 border-b border-surface-container-high">
                  <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 bg-surface-container">
                    <img className="w-full h-full object-cover" src={event.image} alt={event.title} />
                  </div>
                  <div className="space-y-1">
                    <span className="bg-secondary-container text-on-secondary-fixed text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest">
                      Selected Event
                    </span>
                    <h3 className="text-xl font-bold font-headline leading-tight">{event.title}</h3>
                    <p className="text-sm text-on-surface-variant">{event.venue} • {event.date}</p>
                  </div>
                </div>

                <div className="py-8 space-y-6">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-on-surface-variant">event_seat</span>
                      <div>
                        <p className="text-sm font-bold">{tier.name}</p>
                        <p className="text-xs text-on-surface-variant">{seats?.join(', ')}</p>
                      </div>
                    </div>
                    <span className="font-bold">₹{tier.price * quantity}.00</span>
                  </div>

                  <div className="space-y-3 pt-4 border-t border-surface-container-high text-sm">
                    <div className="flex justify-between text-on-surface-variant">
                      <span>Subtotal</span>
                      <span>₹{subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-on-surface-variant">
                      <span>Service Charge</span>
                      <span>₹{serviceCharge.toFixed(2)}</span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between text-secondary font-semibold">
                        <span>Promo (CURATOR15)</span>
                        <span>-₹{discountAmount.toFixed(2)}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-6 border-t-2 border-primary border-dashed flex justify-between items-end">
                  <div>
                    <p className="text-xs uppercase tracking-widest font-black text-on-surface-variant mb-1">
                      Total Payable
                    </p>
                    <p className="text-4xl font-black font-headline tracking-tighter">₹{total.toFixed(2)}</p>
                  </div>
                </div>

                <button
                  onClick={handleConfirmPayment}
                  className="w-full mt-10 bg-primary text-on-primary rounded-full py-5 flex items-center justify-center gap-3 group hover:scale-[1.02] transition-transform"
                >
                  <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                    lock
                  </span>
                  <span className="font-bold tracking-tight text-lg">Confirm & Pay</span>
                  <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">
                    arrow_forward
                  </span>
                </button>

                <p className="text-center mt-6 text-[10px] uppercase tracking-[0.2em] font-bold text-on-surface-variant/40">
                  Secure Encrypted Transaction
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default Checkout
