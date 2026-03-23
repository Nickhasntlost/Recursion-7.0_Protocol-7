import { useParams, useLocation, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import Navbar from '../components/Navbar'
import { events } from '../data/mockData'
import toast from 'react-hot-toast'

const SeatSelection = () => {
  const { eventId } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const { tier, quantity } = location.state || {}

  const event = events.find(e => e.id === eventId)
  const [selectedSeats, setSelectedSeats] = useState([])

  // Generate mock seat layout
  const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']
  const seatsPerRow = 12
  const bookedSeats = ['A-3', 'A-4', 'B-5', 'C-2', 'D-8', 'E-1', 'F-6']

  const toggleSeat = (seatId) => {
    if (bookedSeats.includes(seatId)) {
      toast.error('This seat is already booked')
      return
    }

    if (selectedSeats.includes(seatId)) {
      setSelectedSeats(selectedSeats.filter(s => s !== seatId))
    } else {
      if (selectedSeats.length >= quantity) {
        toast.error(`You can only select ₹{quantity} seat(s)`)
        return
      }
      setSelectedSeats([...selectedSeats, seatId])
    }
  }

  const handleContinue = () => {
    if (selectedSeats.length !== quantity) {
      toast.error(`Please select exactly ₹{quantity} seat(s)`)
      return
    }

    toast.success('Seats selected! Proceeding to checkout...')
    setTimeout(() => {
      navigate(`/checkout/₹{eventId}`, {
        state: { tier, quantity, seats: selectedSeats }
      })
    }, 1000)
  }

  if (!event || !tier) {
    return <div className="min-h-screen flex items-center justify-center">
      <p>Invalid booking details</p>
    </div>
  }

  return (
    <div className="bg-surface text-on-surface min-h-screen">
      <Navbar />

      <main className="pt-24 pb-32 max-w-screen-xl mx-auto px-8">
        <div className="mb-12">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-on-surface-variant hover:text-primary mb-6 transition-colors"
          >
            <span className="material-symbols-outlined">arrow_back</span>
            <span className="font-medium">Back to Event</span>
          </button>

          <h1 className="text-5xl font-black font-headline mb-4">Select Your Seats</h1>
          <p className="text-on-surface-variant">Choose {quantity} seat(s) for {event.title}</p>
        </div>

        {/* Stage/Screen */}
        <div className="mb-12">
          <div className="bg-surface-container-low rounded-lg p-4 text-center mb-8">
            <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Stage / Screen</span>
          </div>

          {/* Seat Grid */}
          <div className="bg-white rounded-xl p-8 shadow-sm">
            <div className="space-y-4">
              {rows.map(row => (
                <div key={row} className="flex items-center gap-4 justify-center">
                  <span className="w-8 text-center font-bold text-sm">{row}</span>
                  <div className="flex gap-2">
                    {[...Array(seatsPerRow)].map((_, idx) => {
                      const seatId = `₹{row}-₹{idx + 1}`
                      const isBooked = bookedSeats.includes(seatId)
                      const isSelected = selectedSeats.includes(seatId)

                      return (
                        <button
                          key={seatId}
                          onClick={() => toggleSeat(seatId)}
                          disabled={isBooked}
                          className={`w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold transition-all ₹{
                            isBooked
                              ? 'bg-surface-container-high text-on-surface-variant cursor-not-allowed opacity-50'
                              : isSelected
                              ? 'bg-secondary-container text-on-secondary-fixed scale-110'
                              : 'bg-surface-container-low hover:bg-surface-container-high hover:scale-105'
                          }`}
                        >
                          <span className="material-symbols-outlined text-sm">
                            {isBooked ? 'close' : isSelected ? 'check' : 'event_seat'}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                  <span className="w-8 text-center font-bold text-sm">{row}</span>
                </div>
              ))}
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-8 mt-12 pt-8 border-t border-surface-container">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-surface-container-low flex items-center justify-center">
                  <span className="material-symbols-outlined text-xs">event_seat</span>
                </div>
                <span className="text-sm">Available</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-secondary-container flex items-center justify-center">
                  <span className="material-symbols-outlined text-xs">check</span>
                </div>
                <span className="text-sm">Selected</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-surface-container-high opacity-50 flex items-center justify-center">
                  <span className="material-symbols-outlined text-xs">close</span>
                </div>
                <span className="text-sm">Booked</span>
              </div>
            </div>
          </div>
        </div>

        {/* Selection Summary */}
        <div className="bg-surface-container-lowest rounded-xl p-8 shadow-sm">
          <h3 className="text-2xl font-black mb-6 font-headline">Selection Summary</h3>
          <div className="flex items-center justify-between mb-4">
            <span className="text-on-surface-variant">Tier</span>
            <span className="font-bold">{tier.name}</span>
          </div>
          <div className="flex items-center justify-between mb-4">
            <span className="text-on-surface-variant">Seats Selected</span>
            <span className="font-bold">{selectedSeats.length} / {quantity}</span>
          </div>
          <div className="flex items-center justify-between mb-4">
            <span className="text-on-surface-variant">Seat Numbers</span>
            <span className="font-bold">{selectedSeats.join(', ') || 'None'}</span>
          </div>
          <div className="pt-4 border-t border-surface-container flex items-center justify-between">
            <span className="font-bold">Total</span>
            <span className="text-2xl font-black">₹{tier.price * quantity}</span>
          </div>

          <button
            onClick={handleContinue}
            disabled={selectedSeats.length !== quantity}
            className="w-full mt-8 bg-primary text-on-primary py-5 rounded-full font-bold text-lg flex items-center justify-center gap-3 hover:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continue to Checkout
            <span className="material-symbols-outlined">arrow_forward</span>
          </button>
        </div>
      </main>
    </div>
  )
}

export default SeatSelection
