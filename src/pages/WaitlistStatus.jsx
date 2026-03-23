import { useParams, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { events } from '../data/mockData'
import toast from 'react-hot-toast'

const WaitlistStatus = () => {
  const { eventId } = useParams()
  const navigate = useNavigate()
  const event = events.find(e => e.id === eventId)
  const [isJoined, setIsJoined] = useState(false)
  const [position, setPosition] = useState(null)

  const handleJoinWaitlist = () => {
    // Simulate joining waitlist
    const randomPosition = Math.floor(Math.random() * 20) + 1
    setPosition(randomPosition)
    setIsJoined(true)
    toast.success(`You've joined the waitlist at position #₹{randomPosition}`)
  }

  const handleLeaveWaitlist = () => {
    if (window.confirm('Are you sure you want to leave the waitlist?')) {
      setIsJoined(false)
      setPosition(null)
      toast.success('You have left the waitlist')
    }
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Event not found</p>
      </div>
    )
  }

  return (
    <div className="bg-surface text-on-surface">
      <Navbar />

      <main className="max-w-screen-lg mx-auto px-8 pt-24 pb-32">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-on-surface-variant hover:text-primary mb-8 transition-colors"
        >
          <span className="material-symbols-outlined">arrow_back</span>
          <span className="font-medium">Back to Event</span>
        </button>

        <div className="bg-surface-container-lowest rounded-xl p-12 shadow-sm text-center">
          {!isJoined ? (
            <>
              <div className="w-24 h-24 bg-error-container rounded-full flex items-center justify-center mx-auto mb-8">
                <span className="material-symbols-outlined text-error text-5xl">event_busy</span>
              </div>

              <h1 className="font-headline text-5xl font-black tracking-tighter mb-4">Event Sold Out</h1>
              <p className="text-2xl font-bold text-on-surface-variant mb-8">{event.title}</p>

              <div className="bg-surface-container-low rounded-lg p-6 mb-8 max-w-md mx-auto">
                <p className="text-sm mb-2 text-on-surface-variant">Waiting List Available</p>
                <p className="text-lg font-bold">Join our waiting list and we'll notify you if seats become available</p>
              </div>

              <div className="space-y-4 mb-12 max-w-md mx-auto text-left">
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-primary mt-1">notifications_active</span>
                  <div>
                    <p className="font-bold">Automatic Notifications</p>
                    <p className="text-sm text-on-surface-variant">
                      We'll email you immediately when a seat becomes available
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-primary mt-1">timer</span>
                  <div>
                    <p className="font-bold">Priority Booking</p>
                    <p className="text-sm text-on-surface-variant">
                      Waitlist members get first access to cancelled seats
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-primary mt-1">event_available</span>
                  <div>
                    <p className="font-bold">Auto-Clear Before Event</p>
                    <p className="text-sm text-on-surface-variant">
                      Waitlist closes 1 hour before event starts
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={handleJoinWaitlist}
                className="bg-primary text-on-primary px-12 py-5 rounded-full font-bold text-lg flex items-center gap-3 mx-auto hover:scale-[0.98] transition-all"
              >
                Join Waiting List
                <span className="material-symbols-outlined">add</span>
              </button>
            </>
          ) : (
            <>
              <div className="w-24 h-24 bg-secondary-container rounded-full flex items-center justify-center mx-auto mb-8">
                <span className="material-symbols-outlined text-on-secondary-fixed text-5xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                  check_circle
                </span>
              </div>

              <h1 className="font-headline text-5xl font-black tracking-tighter mb-4">You're on the List!</h1>
              <p className="text-2xl font-bold text-on-surface-variant mb-8">{event.title}</p>

              <div className="bg-secondary-container/20 border-2 border-secondary-container rounded-lg p-8 mb-8 max-w-md mx-auto">
                <p className="text-sm uppercase tracking-widest font-black text-on-surface-variant mb-2">
                  Your Position
                </p>
                <p className="text-7xl font-black font-headline text-primary">#{position}</p>
                <p className="text-sm text-on-surface-variant mt-4">
                  Estimated wait: {position <= 5 ? '1-2 days' : position <= 10 ? '2-3 days' : '3-5 days'}
                </p>
              </div>

              <div className="space-y-4 mb-12 max-w-md mx-auto text-left">
                <div className="flex items-center gap-3 p-4 bg-surface-container-low rounded-lg">
                  <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>
                    email
                  </span>
                  <p className="text-sm">We'll notify you immediately if a seat opens up</p>
                </div>
                <div className="flex items-center gap-3 p-4 bg-surface-container-low rounded-lg">
                  <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>
                    hourglass_top
                  </span>
                  <p className="text-sm">List closes 1 hour before event</p>
                </div>
              </div>

              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => navigate('/my-bookings')}
                  className="px-8 py-4 border border-outline-variant rounded-full font-bold hover:bg-surface-container-low transition-all"
                >
                  View My Bookings
                </button>
                <button
                  onClick={handleLeaveWaitlist}
                  className="px-8 py-4 text-error font-bold hover:bg-error-container rounded-full transition-all"
                >
                  Leave Waitlist
                </button>
              </div>
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default WaitlistStatus
