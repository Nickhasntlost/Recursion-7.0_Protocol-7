import { useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { events } from '../data/mockData'
import toast from 'react-hot-toast'

const EventDetail = () => {
  const { eventId } = useParams()
  const navigate = useNavigate()
  const [event, setEvent] = useState(null)
  const [selectedTier, setSelectedTier] = useState(null)
  const [quantity, setQuantity] = useState(1)

  useEffect(() => {
    const foundEvent = events.find(e => e.id === eventId)
    if (foundEvent) {
      setEvent(foundEvent)
      setSelectedTier(foundEvent.ticketTiers[0])
    }
  }, [eventId])

  const handleBookNow = () => {
    if (event.status === 'waitlist') {
      navigate(`/waitlist/₹{eventId}`)
      return
    }

    if (!selectedTier || selectedTier.available === 0) {
      toast.error('This tier is sold out. Please select another tier.')
      return
    }

    toast.success('Seats reserved! Proceeding to checkout...')
    setTimeout(() => {
      navigate(`/event/₹{eventId}/seats`, {
        state: { tier: selectedTier, quantity }
      })
    }, 1000)
  }

  const handleJoinWaitlist = () => {
    navigate(`/waitlist/₹{eventId}`)
  }

  if (!event) {
    return <div className="min-h-screen flex items-center justify-center">
      <p>Loading...</p>
    </div>
  }

  const availableSeats = event.capacity - event.booked
  const percentageBooked = (event.booked / event.capacity) * 100

  return (
    <div className="bg-surface font-body text-on-surface antialiased">
      <Navbar />

      <main className="max-w-screen-2xl mx-auto px-6 md:px-12 pt-24 pb-32">
        {/* Hero Section */}
        <section className="bg-surface-container-lowest rounded-xl overflow-hidden flex flex-col lg:flex-row gap-0 lg:gap-12 p-4 lg:p-8 mb-12">
          {/* Left: Image */}
          <div className="w-full lg:w-1/2 aspect-[4/5] lg:aspect-auto">
            <img
              className="w-full h-full object-cover rounded-lg shadow-sm"
              src={event.image}
              alt={event.title}
            />
          </div>

          {/* Right: Metadata */}
          <div className="w-full lg:w-1/2 py-8 lg:py-4 flex flex-col justify-center">
            <span className="inline-block bg-secondary-container text-on-secondary-fixed px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase mb-6 w-max">
              {event.category}
            </span>
            <h1 className="font-headline text-5xl md:text-7xl font-extrabold tracking-tighter mb-8 leading-[0.9]">
              {event.title}
            </h1>

            <div className="flex flex-wrap gap-8 mb-10">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary">location_on</span>
                </div>
                <div>
                  <p className="text-xs text-on-surface-variant font-medium">VENUE</p>
                  <p className="font-bold">{event.venue}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary">calendar_today</span>
                </div>
                <div>
                  <p className="text-xs text-on-surface-variant font-medium">DATE & TIME</p>
                  <p className="font-bold">
                    {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}, {event.time.split('—')[0].trim()}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 mb-8 p-4 rounded-lg bg-surface-container-low w-max">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                <span className="material-symbols-outlined">person</span>
              </div>
              <div>
                <p className="text-xs text-on-surface-variant">ORGANIZED BY</p>
                <p className="font-bold">{event.organizer}</p>
              </div>
            </div>

            <p className="text-on-surface-variant text-lg leading-relaxed mb-10 max-w-xl">
              {event.description}
            </p>

            <div className="flex items-center gap-3">
              <div className="flex -space-x-3">
                <div className="w-10 h-10 rounded-full border-4 border-surface-container-lowest bg-zinc-200"></div>
                <div className="w-10 h-10 rounded-full border-4 border-surface-container-lowest bg-zinc-200"></div>
                <div className="w-10 h-10 rounded-full border-4 border-surface-container-lowest bg-zinc-200"></div>
                <div className="w-10 h-10 rounded-full border-4 border-surface-container-lowest bg-surface-container-high flex items-center justify-center text-[10px] font-bold">
                  +{event.attendees}
                </div>
              </div>
              <span className="text-sm font-medium text-on-surface-variant italic">
                Attending this event
              </span>
            </div>
          </div>
        </section>

        {/* Availability Bar */}
        <section className="mb-20">
          <div className="bg-surface-container-low p-8 rounded-lg flex flex-col md:flex-row items-center gap-8 shadow-sm">
            <div className="flex-1 w-full">
              <div className="flex justify-between mb-4">
                <span className="font-bold flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
                    confirmation_number
                  </span>
                  Live Availability
                </span>
                <span className={`font-bold ₹{percentageBooked > 80 ? 'text-error' : 'text-secondary'}`}>
                  {availableSeats}/{event.capacity} remaining
                </span>
              </div>
              <div className="w-full h-3 bg-surface-container-highest rounded-full overflow-hidden">
                <div
                  className={`h-full ₹{percentageBooked > 80 ? 'bg-error' : 'bg-secondary-container'}`}
                  style={{ width: `₹{percentageBooked}%` }}
                ></div>
              </div>
            </div>
            {percentageBooked > 80 && (
              <div className="bg-error-container text-on-error-container px-4 py-2 rounded-full text-xs font-bold animate-pulse">
                Selling out fast
              </div>
            )}
          </div>
        </section>

        {/* Ticket Tiers */}
        <section className="mb-24">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
            <div>
              <h2 className="font-headline text-4xl font-extrabold tracking-tight mb-2">Ticket Tiers</h2>
              <p className="text-on-surface-variant">Select the experience that fits your vision.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {event.ticketTiers.map((tier, index) => (
              <div
                key={index}
                onClick={() => tier.available > 0 && setSelectedTier(tier)}
                className={`p-8 rounded-lg flex flex-col transition-all cursor-pointer ₹{
                  index === 1
                    ? 'bg-primary text-on-primary shadow-2xl scale-105 relative z-10'
                    : 'bg-surface-container-lowest border border-transparent hover:border-outline-variant'
                } ₹{selectedTier?.name === tier.name ? 'ring-4 ring-secondary-container' : ''}`}
              >
                {index === 1 && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-secondary-container text-on-secondary-fixed px-4 py-1 rounded-full text-[10px] font-black tracking-widest uppercase">
                    Most Popular
                  </div>
                )}

                <div className="flex justify-between items-start mb-8">
                  <div>
                    <h3 className="text-2xl font-black mb-1">{tier.name}</h3>
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ₹{tier.available > 0 ? 'bg-green-500' : 'bg-error'}`}></span>
                      <span className="text-xs font-bold uppercase tracking-wider opacity-70">
                        {tier.available > 0 ? `₹{tier.available} Available` : 'Sold Out'}
                      </span>
                    </div>
                  </div>
                  <p className={`text-3xl font-black ₹{index === 1 ? 'text-white' : 'text-black'}`}>
                    ₹{tier.price}
                  </p>
                </div>

                <ul className="space-y-4 mb-12 flex-grow">
                  {tier.features.map((feature, idx) => (
                    <li key={idx} className={`flex items-center gap-3 ₹{index === 1 ? 'opacity-90' : 'text-on-surface-variant'}`}>
                      <span
                        className={`material-symbols-outlined text-sm ₹{index === 1 ? 'text-secondary-container' : 'text-primary'}`}
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        check_circle
                      </span>
                      {feature}
                    </li>
                  ))}
                </ul>

                <button
                  disabled={tier.available === 0}
                  className={`w-full py-4 rounded-full font-bold transition-all ₹{
                    tier.available === 0
                      ? 'bg-surface-container-high text-on-surface-variant cursor-not-allowed opacity-50'
                      : index === 1
                      ? 'bg-secondary-container text-on-secondary-fixed hover:brightness-110'
                      : 'border-2 border-primary hover:bg-primary hover:text-on-primary'
                  }`}
                >
                  {tier.available === 0 ? 'Sold Out' : selectedTier?.name === tier.name ? 'Selected' : 'Select'}
                </button>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Sticky Bottom Bar */}
      <div className="fixed bottom-0 left-0 w-full z-50 p-6">
        <div className="max-w-4xl mx-auto glass rounded-full px-10 py-5 shadow-[0_32px_64px_rgba(26,28,28,0.08)] flex justify-between items-center">
          <div className="flex flex-col">
            <p className="text-[10px] font-black tracking-widest text-on-surface-variant uppercase">
              {selectedTier ? selectedTier.name : 'No Tier Selected'}
            </p>
            <p className="text-2xl font-black">₹{selectedTier ? selectedTier.price * quantity : 0}.00</p>
          </div>

          <div className="hidden sm:flex items-center gap-4 bg-surface-container-low px-6 py-2 rounded-full">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="material-symbols-outlined text-on-surface-variant hover:text-primary"
            >
              remove
            </button>
            <span className="font-bold text-sm w-8 text-center">{quantity}</span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="material-symbols-outlined text-primary"
            >
              add
            </button>
          </div>

          <button
            onClick={handleBookNow}
            disabled={!selectedTier || selectedTier.available === 0}
            className="bg-primary text-on-primary px-8 py-3.5 rounded-full font-bold flex items-center gap-3 hover:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {event.status === 'waitlist' ? 'Join Waitlist' : 'Book Now'}
            <span className="material-symbols-outlined text-lg">arrow_forward</span>
          </button>
        </div>
      </div>

      <Footer />
    </div>
  )
}

export default EventDetail
