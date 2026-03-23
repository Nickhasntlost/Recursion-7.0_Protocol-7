import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { events, categories } from '../data/mockData'
import toast from 'react-hot-toast'

const OrganizerDashboard = () => {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('my-events')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newEvent, setNewEvent] = useState({
    title: '',
    category: 'dining',
    venue: '',
    date: '',
    time: '',
    capacity: '',
    price: '',
    description: ''
  })

  // Mock organizer events
  const organizerEvents = events.slice(0, 3)

  const handleInputChange = (e) => {
    setNewEvent({ ...newEvent, [e.target.name]: e.target.value })
  }

  const handleCreateEvent = (e) => {
    e.preventDefault()
    toast.success('Event created successfully!')
    setShowCreateModal(false)
    setNewEvent({
      title: '',
      category: 'dining',
      venue: '',
      date: '',
      time: '',
      capacity: '',
      price: '',
      description: ''
    })
  }

  const handleCancelEvent = (eventId) => {
    if (window.confirm('Are you sure you want to cancel this event? All bookings will be refunded.')) {
      toast.success('Event cancelled successfully')
    }
  }

  return (
    <div className="bg-surface text-on-surface">
      <Navbar isLoggedIn={true} userType="organizer" />

      <main className="max-w-screen-2xl mx-auto px-8 pt-24 pb-32">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h1 className="font-headline text-5xl font-extrabold tracking-tighter text-primary mb-4">
              Organizer Dashboard
            </h1>
            <p className="text-on-surface-variant text-lg">Manage your events and track bookings</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 bg-primary text-on-primary px-8 py-4 rounded-full font-bold hover:scale-[0.98] transition-all"
          >
            <span className="material-symbols-outlined">add</span>
            Create Event
          </button>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 items-center bg-surface-container-low p-1.5 rounded-full w-fit mb-12">
          {[
            { id: 'my-events', label: 'My Events' },
            { id: 'bookings', label: 'All Bookings' },
            { id: 'analytics', label: 'Analytics' }
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

        {/* Content */}
        {activeTab === 'my-events' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {organizerEvents.map(event => {
              const availableSeats = event.capacity - event.booked
              const percentageBooked = (event.booked / event.capacity) * 100

              return (
                <div
                  key={event.id}
                  className="bg-surface-container-lowest rounded-xl p-8 shadow-sm hover:shadow-xl transition-all"
                >
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-secondary">
                        {event.category}
                      </span>
                      <h3 className="text-2xl font-black font-headline mt-1">{event.title}</h3>
                    </div>
                    <div
                      className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ₹{
                        event.status === 'available'
                          ? 'bg-secondary-container text-on-secondary-fixed'
                          : 'bg-error-container text-on-error-container'
                      }`}
                    >
                      {event.status === 'available' ? 'Active' : event.status}
                    </div>
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-3 text-on-surface-variant">
                      <span className="material-symbols-outlined text-lg">location_on</span>
                      <span className="text-sm">{event.venue}</span>
                    </div>
                    <div className="flex items-center gap-3 text-on-surface-variant">
                      <span className="material-symbols-outlined text-lg">calendar_today</span>
                      <span className="text-sm">{new Date(event.date).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Booking Progress */}
                  <div className="mb-6">
                    <div className="flex justify-between mb-2 text-sm">
                      <span className="font-bold">Bookings</span>
                      <span className="font-bold">
                        {event.booked}/{event.capacity} ({percentageBooked.toFixed(0)}%)
                      </span>
                    </div>
                    <div className="w-full h-2 bg-surface-container-high rounded-full overflow-hidden">
                      <div
                        className={`h-full ₹{percentageBooked > 80 ? 'bg-error' : 'bg-secondary-container'}`}
                        style={{ width: `₹{percentageBooked}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Revenue */}
                  <div className="flex items-center justify-between p-4 bg-surface-container-low rounded-lg mb-6">
                    <span className="text-sm text-on-surface-variant">Estimated Revenue</span>
                    <span className="text-2xl font-black">₹{(event.booked * event.price).toLocaleString()}</span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => navigate(`/event/₹{event.id}`)}
                      className="flex-1 py-3 bg-surface-container-high rounded-lg font-bold text-sm hover:bg-surface-container-highest transition-all"
                    >
                      View Details
                    </button>
                    <button className="flex-1 py-3 bg-surface-container-high rounded-lg font-bold text-sm hover:bg-surface-container-highest transition-all">
                      Edit
                    </button>
                    <button
                      onClick={() => handleCancelEvent(event.id)}
                      className="px-6 py-3 text-error font-bold text-sm hover:bg-error-container rounded-lg transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {activeTab === 'bookings' && (
          <div className="bg-surface-container-lowest rounded-xl p-8 shadow-sm">
            <h2 className="text-2xl font-black font-headline mb-6">All Bookings</h2>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="flex items-center justify-between p-4 bg-surface-container-low rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-secondary-container flex items-center justify-center">
                      <span className="font-bold">#{i}</span>
                    </div>
                    <div>
                      <p className="font-bold">Booking ASM-{Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
                      <p className="text-sm text-on-surface-variant">Customer Name • 2 tickets</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <span className="font-black">₹{Math.floor(Math.random() * 500) + 50}</span>
                    <span className="px-3 py-1 bg-secondary-container text-on-secondary-fixed text-xs font-bold rounded-full">
                      Confirmed
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-surface-container-lowest rounded-xl p-8 shadow-sm">
              <span className="material-symbols-outlined text-primary text-4xl mb-4 block">trending_up</span>
              <p className="text-sm text-on-surface-variant mb-2">Total Revenue</p>
              <p className="text-4xl font-black font-headline">₹24,580</p>
            </div>
            <div className="bg-surface-container-lowest rounded-xl p-8 shadow-sm">
              <span className="material-symbols-outlined text-primary text-4xl mb-4 block">confirmation_number</span>
              <p className="text-sm text-on-surface-variant mb-2">Total Bookings</p>
              <p className="text-4xl font-black font-headline">143</p>
            </div>
            <div className="bg-surface-container-lowest rounded-xl p-8 shadow-sm">
              <span className="material-symbols-outlined text-primary text-4xl mb-4 block">event</span>
              <p className="text-sm text-on-surface-variant mb-2">Active Events</p>
              <p className="text-4xl font-black font-headline">3</p>
            </div>
          </div>
        )}
      </main>

      {/* Create Event Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-surface-container-lowest rounded-xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-black font-headline">Create New Event</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 hover:bg-surface-container-low rounded-full transition-all"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateEvent} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold ml-4">Event Title</label>
                <input
                  type="text"
                  name="title"
                  value={newEvent.title}
                  onChange={handleInputChange}
                  className="w-full bg-surface-container-low border-none rounded-lg p-4 focus:ring-2 focus:ring-secondary-container"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold ml-4">Category</label>
                <select
                  name="category"
                  value={newEvent.category}
                  onChange={handleInputChange}
                  className="w-full bg-surface-container-low border-none rounded-lg p-4 focus:ring-2 focus:ring-secondary-container"
                >
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold ml-4">Venue</label>
                  <input
                    type="text"
                    name="venue"
                    value={newEvent.venue}
                    onChange={handleInputChange}
                    className="w-full bg-surface-container-low border-none rounded-lg p-4 focus:ring-2 focus:ring-secondary-container"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold ml-4">Capacity</label>
                  <input
                    type="number"
                    name="capacity"
                    value={newEvent.capacity}
                    onChange={handleInputChange}
                    className="w-full bg-surface-container-low border-none rounded-lg p-4 focus:ring-2 focus:ring-secondary-container"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold ml-4">Date</label>
                  <input
                    type="date"
                    name="date"
                    value={newEvent.date}
                    onChange={handleInputChange}
                    className="w-full bg-surface-container-low border-none rounded-lg p-4 focus:ring-2 focus:ring-secondary-container"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold ml-4">Time</label>
                  <input
                    type="time"
                    name="time"
                    value={newEvent.time}
                    onChange={handleInputChange}
                    className="w-full bg-surface-container-low border-none rounded-lg p-4 focus:ring-2 focus:ring-secondary-container"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold ml-4">Price (₹)</label>
                <input
                  type="number"
                  name="price"
                  value={newEvent.price}
                  onChange={handleInputChange}
                  className="w-full bg-surface-container-low border-none rounded-lg p-4 focus:ring-2 focus:ring-secondary-container"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold ml-4">Description</label>
                <textarea
                  name="description"
                  value={newEvent.description}
                  onChange={handleInputChange}
                  rows="4"
                  className="w-full bg-surface-container-low border-none rounded-lg p-4 focus:ring-2 focus:ring-secondary-container"
                  required
                ></textarea>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-4 border border-outline-variant rounded-full font-bold hover:bg-surface-container-low transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-4 bg-primary text-on-primary rounded-full font-bold hover:scale-[0.98] transition-all"
                >
                  Create Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  )
}

export default OrganizerDashboard
