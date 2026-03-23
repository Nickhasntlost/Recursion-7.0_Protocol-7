import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { paymentService } from '../services/payment';
import api from '../services/api';

const cardHover = {
  rest: { y: 0, boxShadow: '0 0 0 rgba(0,0,0,0)' },
  hover: { y: -4, boxShadow: '0 32px 64px -12px rgba(26,28,28,0.06)', transition: { duration: 0.3 } }
}

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const bookingsData = await paymentService.getMyBookings();
        
        // Fetch event details for each booking, since booking data might only have event_id
        const enrichedBookings = await Promise.all(
          bookingsData.map(async (booking) => {
            try {
              const eventRes = await api.get(`/events/${booking.event_id}`);
              return { ...booking, event: eventRes.data };
            } catch (err) {
              return { ...booking, event: { title: 'Unknown Event', category: 'General' } };
            }
          })
        );
        
        setBookings(enrichedBookings);
      } catch (err) {
        console.error('Failed to load bookings:', err);
        setError('Could not load your bookings. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  return (
    <div className="max-w-screen-2xl mx-auto px-8 pt-16 pb-24 min-h-[80vh]">
      <motion.header
        className="mb-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="font-[family-name:var(--font-family-headline)] text-5xl font-extrabold tracking-tighter text-primary mb-8">My Bookings</h1>
        <div className="flex flex-wrap gap-2 items-center bg-surface-container-low p-1.5 rounded-full w-fit">
          {['Upcoming', 'Past', 'Waitlisted', 'Cancelled'].map((tab, i) => (
            <button key={tab} className={`px-8 py-2.5 rounded-full text-sm font-medium font-[family-name:var(--font-family-headline)] transition-all ${i === 0 ? 'bg-secondary-container text-on-secondary-container font-bold' : 'text-on-surface-variant hover:bg-surface-container-high'}`}>
              {tab}
            </button>
          ))}
        </div>
      </motion.header>

      {loading ? (
        <div className="flex justify-center items-center h-48">
          <span className="w-10 h-10 rounded-full border-4 border-primary border-t-transparent animate-spin"></span>
        </div>
      ) : error ? (
        <div className="text-center p-8 bg-error-container text-on-error-container rounded-2xl">
          {error}
        </div>
      ) : bookings.length === 0 ? (
        <div className="text-center py-20 bg-surface-container-lowest rounded-2xl border border-outline-variant/20">
          <span className="material-symbols-outlined text-6xl text-on-surface-variant mb-4">confirmation_number</span>
          <h2 className="text-2xl font-bold mb-2">No bookings yet</h2>
          <p className="text-on-surface-variant mb-6">You haven't booked any events. Discover amazing events today!</p>
          <Link to="/" className="inline-block px-8 py-3 bg-primary text-on-primary rounded-full font-bold">
            Explore Events
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8">
          {bookings.map((b, i) => {
            const event = b.event;
            const statusStyle = b.payment_status === 'completed' && b.booking_status === 'confirmed' 
              ? 'bg-secondary-container/30 text-secondary' 
              : 'bg-surface-container-high text-on-surface-variant';
            const dotColor = b.payment_status === 'completed' && b.booking_status === 'confirmed' 
              ? 'bg-secondary' 
              : 'bg-on-surface-variant';

            return (
              <motion.div
                key={b.booking_id || i}
                className="group relative flex flex-col md:flex-row bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm"
                variants={cardHover}
                initial="rest"
                whileHover="hover"
              >
                <div className="w-full md:w-1/3 h-64 md:h-auto relative overflow-hidden bg-surface-container-highest flex items-center justify-center">
                  {event?.cover_image ? (
                     <img alt="" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" src={event.cover_image} />
                  ) : (
                     <span className="material-symbols-outlined text-4xl text-on-surface-variant opacity-50">image</span>
                  )}
                  {b.payment_status === 'completed' && (
                    <div className="absolute top-4 left-4">
                      <span className="bg-secondary-fixed text-on-secondary-fixed text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">Booking Confirmed</span>
                    </div>
                  )}
                </div>
                <div className="flex-1 p-8 md:p-10 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <span className="text-xs font-bold tracking-widest text-on-surface-variant uppercase">BK: {b.booking_number || b.booking_id}</span>
                      <div className={`flex items-center gap-2 ${statusStyle} px-3 py-1 rounded-full`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
                        <span className="text-[10px] font-bold uppercase tracking-tight">{b.booking_status || 'Pending'}</span>
                      </div>
                    </div>
                    <h2 className="font-[family-name:var(--font-family-headline)] text-3xl font-bold tracking-tight text-primary mb-6">
                      {event?.title || 'Loading...'}
                    </h2>
                    <div className="space-y-3 mb-8">
                      <div className="flex items-center gap-3 text-on-surface-variant">
                        <span className="material-symbols-outlined text-xl">calendar_today</span>
                        <span className="text-sm font-medium">
                          {event?.start_datetime ? new Date(event.start_datetime).toLocaleString() : 'Date TBD'}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-on-surface-variant">
                        <span className="material-symbols-outlined text-xl">confirmation_number</span>
                        <span className="text-sm font-medium">{b.total_tickets} Tickets ({b.total_amount ? `INR ${b.total_amount}` : ''})</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-6 border-t border-surface-container">
                    <div className="flex items-center gap-4">
                      <Link to="/confirmation">
                        <button className="bg-primary text-on-primary px-8 py-3 rounded-full font-[family-name:var(--font-family-headline)] font-bold text-sm flex items-center gap-2 hover:opacity-90 transition-all">
                          View Details
                        </button>
                      </Link>
                    </div>
                    <div className="hidden sm:block">
                      <span className="text-xs text-on-surface-variant font-medium">Category: {event?.category || 'General'}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  )
}
