import { useParams, useLocation, useNavigate } from 'react-router-dom'
import Footer from '../components/Footer'

const Confirmation = () => {
  const { bookingId } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const { event, tier, quantity, seats } = location.state || {}

  const handleDownload = () => {
    alert('Ticket download functionality would be implemented here')
  }

  const handleAddToCalendar = () => {
    alert('Add to calendar functionality would be implemented here')
  }

  return (
    <div className="bg-surface font-body text-on-surface antialiased">
      <main className="min-h-screen flex flex-col items-center justify-center px-6 py-20">
        {/* Success Identity */}
        <div className="flex flex-col items-center mb-12 text-center">
          <div className="w-24 h-24 bg-secondary-container rounded-full flex items-center justify-center mb-8">
            <span
              className="material-symbols-outlined text-on-secondary-container text-5xl"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              check_circle
            </span>
          </div>
          <h1 className="font-headline font-black text-6xl md:text-8xl tracking-tighter text-primary mb-4">
            You're In.
          </h1>
          <p className="text-on-surface-variant text-lg max-w-md font-medium">
            Your entry to the Assemble collection is confirmed. We've sent a copy to your email.
          </p>
        </div>

        {/* The Ticket Card */}
        {event && (
          <div className="w-full max-w-md bg-surface-container-lowest rounded-xl shadow-[0_32px_64px_-12px_rgba(26,28,28,0.06)] overflow-hidden">
            {/* Image Header */}
            <div className="h-48 w-full bg-surface-container-high relative">
              <img
                className="w-full h-full object-cover grayscale brightness-90"
                src={event.image}
                alt={event.title}
              />
              <div className="absolute top-6 left-6">
                <span className="bg-secondary-fixed text-on-secondary-fixed font-headline text-xs font-bold px-4 py-1.5 rounded-full tracking-widest uppercase">
                  Confirmed
                </span>
              </div>
            </div>

            {/* Ticket Content */}
            <div className="p-8">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-on-surface-variant mb-1">
                    Booking ID
                  </p>
                  <p className="font-headline font-bold text-sm">{bookingId}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-on-surface-variant mb-1">
                    Status
                  </p>
                  <p className="font-headline font-bold text-sm">Valid</p>
                </div>
              </div>

              <h2 className="font-headline font-extrabold text-3xl text-primary mb-6 leading-tight">
                {event.title}
              </h2>

              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-surface-container-low flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary text-xl">calendar_today</span>
                  </div>
                  <div>
                    <p className="text-xs text-on-surface-variant font-medium">Date & Time</p>
                    <p className="font-headline font-bold text-sm">
                      {new Date(event.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}{' '}
                      • {event.time.split('—')[0].trim()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-surface-container-low flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary text-xl">location_on</span>
                  </div>
                  <div>
                    <p className="text-xs text-on-surface-variant font-medium">Venue</p>
                    <p className="font-headline font-bold text-sm">{event.venue}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-surface-container-low flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary text-xl">event_seat</span>
                  </div>
                  <div>
                    <p className="text-xs text-on-surface-variant font-medium">Seats</p>
                    <p className="font-headline font-bold text-sm">{seats?.join(', ')}</p>
                  </div>
                </div>
              </div>

              {/* Perforated Divider */}
              <div className="relative flex items-center py-4 mb-4">
                <div className="flex-grow border-t-2 border-dashed border-surface-container-high"></div>
                <div className="absolute -left-12 w-8 h-8 bg-surface rounded-full"></div>
                <div className="absolute -right-12 w-8 h-8 bg-surface rounded-full"></div>
              </div>

              {/* QR Code Section */}
              <div className="flex flex-col items-center">
                <div className="w-48 h-48 bg-surface-container-low rounded-lg flex items-center justify-center p-4 border border-outline-variant/10">
                  <img
                    className="w-full h-full mix-blend-multiply opacity-90"
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=₹{bookingId}`}
                    alt="QR Code"
                  />
                </div>
                <p className="mt-4 text-[10px] text-on-surface-variant font-bold tracking-widest uppercase">
                  Scan at Entrance
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Action Row */}
        <div className="mt-12 flex flex-col md:flex-row items-center gap-4 w-full max-w-md">
          <button
            onClick={handleDownload}
            className="w-full bg-primary text-on-primary font-headline font-bold py-5 px-8 rounded-full flex items-center justify-center gap-2 transition-transform hover:scale-[1.02] active:scale-95"
          >
            Download Ticket
            <span className="material-symbols-outlined text-xl">download</span>
          </button>

          <div className="flex gap-4 w-full">
            <button
              onClick={handleAddToCalendar}
              className="flex-1 bg-surface-container-high text-primary font-headline font-bold py-4 px-6 rounded-full flex items-center justify-center gap-2 hover:bg-surface-container-highest transition-colors"
            >
              Calendar
              <span className="material-symbols-outlined text-lg">calendar_add_on</span>
            </button>
            <button
              onClick={() => navigate('/my-bookings')}
              className="flex-1 border border-outline-variant/30 text-on-surface-variant font-headline font-bold py-4 px-6 rounded-full flex items-center justify-center hover:bg-surface-container-low transition-colors"
            >
              My Bookings
            </button>
          </div>
        </div>

        <button
          onClick={() => navigate('/')}
          className="mt-12 text-on-surface-variant hover:text-primary transition-colors font-bold text-sm flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-lg">arrow_back</span>
          Return to Explore
        </button>
      </main>

      <Footer />
    </div>
  )
}

export default Confirmation
