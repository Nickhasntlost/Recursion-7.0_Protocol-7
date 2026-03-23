import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { userBookings, events } from '../data/mockData'
import toast from 'react-hot-toast'

const MyBookings = () => {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('upcoming')

  const getEventDetails = (eventId) => {
    return events.find(e => e.id === eventId)
  }

  const handleViewTicket = (bookingId) => {
    navigate(`/confirmation/₹{bookingId}`)
  }

  const handleCancelBooking = (bookingId) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      toast.success('Booking cancelled successfully')
    }
  }

  const filteredBookings = userBookings.filter(booking => {
    if (activeTab === 'upcoming') return booking.status === 'confirmed' || booking.status === 'processing'
    if (activeTab === 'past') return false // Mock: no past bookings
    if (activeTab === 'waitlisted') return false // Mock: no waitlisted bookings
    if (activeTab === 'cancelled') return false // Mock: no cancelled bookings
    return true
  })

  return (
    <div className="bg-surface text-on-surface">
      <Navbar isLoggedIn={true} userType="client" />

      <main className="max-w-screen-2xl mx-auto px-8 pt-24 pb-24">
        {/* Header Section */}
        <header className="mb-12">
          <h1 className="font-headline text-5xl font-extrabold tracking-tighter text-primary mb-8">My Bookings</h1>

          {/* Tab Strip */}
          <div className="flex flex-wrap gap-2 items-center bg-surface-container-low p-1.5 rounded-full w-fit">
            {[
              { id: 'upcoming', label: 'Upcoming' },
              { id: 'past', label: 'Past' },
              { id: 'waitlisted', label: 'Waitlisted' },
              { id: 'cancelled', label: 'Cancelled' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-8 py-2.5 rounded-full text-sm font-headline transition-all ₹{
                  activeTab === tab.id
                    ? 'bg-secondary-container text-on-secondary-container font-bold'
                    : 'text-on-surface-variant hover:bg-surface-container-high font-medium'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </header>

        {/* Ledger Grid */}
        <div className="grid grid-cols-1 gap-8">
          {filteredBookings.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-on-surface-variant text-lg">No bookings found in this category</p>
            </div>
          ) : (
            filteredBookings.map(booking => {
              const event = getEventDetails(booking.eventId)
              if (!event) return null

              return (
                <div
                  key={booking.id}
                  className="group relative flex flex-col md:flex-row bg-surface-container-lowest rounded-xl overflow-hidden transition-all duration-500 hover:shadow-[0_32px_64px_-12px_rgba(26,28,28,0.06)]"
                >
                  <div className="w-full md:w-1/3 h-64 md:h-auto relative overflow-hidden">
                    <img
                      alt={event.title}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      src={event.image}
                    />
                    <div className="absolute top-4 left-4">
                      <span className="bg-secondary-fixed text-on-secondary-fixed text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">
                        {booking.tier}
                      </span>
                    </div>
                  </div>

                  <div className="flex-1 p-8 md:p-10 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-4">
                        <span className="text-xs font-bold font-label tracking-widest text-on-surface-variant uppercase">
                          ID: {booking.id}
                        </span>
                        <div
                          className={`flex items-center gap-2 px-3 py-1 rounded-full ₹{
                            booking.status === 'confirmed'
                              ? 'bg-secondary-container/30 text-secondary'
                              : 'bg-surface-container-high text-on-surface-variant'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ₹{
                              booking.status === 'confirmed' ? 'bg-secondary' : 'bg-on-surface-variant'
                            }`}
                          ></span>
                          <span className="text-[10px] font-bold uppercase tracking-tight">
                            {booking.status === 'confirmed' ? 'Confirmed' : 'Processing'}
                          </span>
                        </div>
                      </div>

                      <h2 className="font-headline text-3xl font-bold tracking-tight text-primary mb-6">
                        {event.title}
                      </h2>

                      <div className="space-y-3 mb-8">
                        <div className="flex items-center gap-3 text-on-surface-variant">
                          <span className="material-symbols-outlined text-xl">calendar_today</span>
                          <span className="text-sm font-medium">
                            {new Date(event.date).toLocaleDateString('en-US', {
                              weekday: 'long',
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric'
                            })}{' '}
                            • {event.time.split('—')[0].trim()}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-on-surface-variant">
                          <span className="material-symbols-outlined text-xl">location_on</span>
                          <span className="text-sm font-medium">{event.venue}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-6 border-t border-surface-container">
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => handleViewTicket(booking.id)}
                          className="bg-primary text-on-primary px-8 py-3 rounded-full font-headline font-bold text-sm flex items-center gap-2 hover:opacity-90 transition-all"
                        >
                          View Ticket
                          <span className="material-symbols-outlined text-sm">arrow_forward</span>
                        </button>
                        <button
                          onClick={() => handleCancelBooking(booking.id)}
                          className="text-on-surface-variant font-headline font-bold text-sm hover:text-error transition-colors px-4 py-3"
                        >
                          Cancel
                        </button>
                      </div>
                      <div className="hidden sm:block">
                        <span className="text-xs text-on-surface-variant font-medium">
                          Category: {event.category}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default MyBookings
