import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'

// Category-specific fields (same as CreateEvent)
const categoryFields = {
  concert: {
    label: 'Concert',
    fields: ['artist_name', 'genre', 'venue_name', 'seating_type', 'sound_quality']
  },
  workshop: {
    label: 'Workshop',
    fields: ['instructor_name', 'skill_level', 'max_participants', 'course_duration', 'materials_provided']
  },
  conference: {
    label: 'Conference',
    fields: ['venue_name', 'number_of_tracks', 'registration_fee', 'lunch_provided', 'certificate_provided']
  },
  festival: {
    label: 'Festival',
    fields: ['venue_name', 'number_of_stages', 'parking_available', 'camping_available', 'food_vendors']
  },
  exhibition: {
    label: 'Exhibition',
    fields: ['venue_name', 'number_of_booths', 'wheelchair_accessible', 'multimedia_displays', 'entry_fee']
  }
}

// Mock event data - in real app, this would come from API
const mockEventsList = [
  {
    id: 1,
    title: 'TechCon 2026',
    category: 'conference',
    start_datetime: '2026-12-28T09:00',
    end_datetime: '2026-12-30T18:00',
    description: 'Annual technology conference bringing together innovators and leaders',
    venue_name: 'Convention Center',
    number_of_tracks: 5,
    registration_fee: 500,
    lunch_provided: true,
    certificate_provided: true,
    status: 'Published',
    bookings: 450,
    capacity: 500,
    revenue: 225000,
    tickets: [
      { type: 'Regular', price: 500, quantity: 300, sold: 200 },
      { type: 'VIP', price: 1000, quantity: 100, sold: 85 },
      { type: 'Student', price: 250, quantity: 100, sold: 165 }
    ]
  },
  {
    id: 2,
    title: 'Summer Music Festival',
    category: 'concert',
    start_datetime: '2027-01-15T18:00',
    end_datetime: '2027-01-16T23:00',
    description: 'Three-day music festival featuring international and local artists',
    artist_name: 'Various Artists',
    genre: 'pop',
    venue_name: 'Open Air Park',
    seating_type: 'general',
    sound_quality: 'surround',
    status: 'Draft',
    bookings: 0,
    capacity: 1000,
    revenue: 0,
    tickets: [
      { type: 'Early Bird', price: 800, quantity: 500, sold: 0 },
      { type: 'Regular', price: 1200, quantity: 500, sold: 0 }
    ]
  },
  {
    id: 3,
    title: 'Art & Design Expo',
    category: 'exhibition',
    start_datetime: '2027-02-20T10:00',
    end_datetime: '2027-02-20T18:00',
    description: 'Contemporary art exhibition showcasing emerging artists',
    venue_name: 'Art Gallery District',
    number_of_booths: 40,
    wheelchair_accessible: true,
    multimedia_displays: true,
    entry_fee: 400,
    status: 'Published',
    bookings: 120,
    capacity: 200,
    revenue: 48000,
    tickets: [
      { type: 'General Entry', price: 400, quantity: 200, sold: 120 }
    ]
  }
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] } }
}

export default function EditEvent() {
  const { eventId } = useParams()
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [eventToEdit, setEventToEdit] = useState(null)

  useEffect(() => {
    // Find event from mock data
    const event = mockEventsList.find(e => e.id === parseInt(eventId))
    if (event) {
      setEventToEdit({
        ...event,
        start_datetime: event.start_datetime,
        end_datetime: event.end_datetime
      })
    } else {
      toast.error('Event not found')
      navigate('/dashboard/events')
    }
  }, [eventId, navigate])

  const [formData, setFormData] = useState({
    title: '',
    category: '',
    start_datetime: '',
    end_datetime: '',
    description: '',
    venue_name: '',
    artist_name: '',
    instructor_name: '',
    skill_level: '',
    genre: '',
    seating_type: '',
    sound_quality: '',
    max_participants: '',
    course_duration: '',
    materials_provided: false,
    number_of_tracks: '',
    registration_fee: '',
    lunch_provided: false,
    certificate_provided: false,
    number_of_stages: '',
    parking_available: false,
    camping_available: false,
    food_vendors: false,
    number_of_booths: '',
    wheelchair_accessible: false,
    multimedia_displays: false,
    entry_fee: '',
    status: 'Draft',
    tickets: []
  })

  useEffect(() => {
    if (eventToEdit) {
      setFormData(eventToEdit)
    }
  }, [eventToEdit])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    })
  }

  const handleTicketChange = (index, field, value) => {
    const newTickets = [...formData.tickets]
    newTickets[index][field] = value
    setFormData({ ...formData, tickets: newTickets })
  }

  const handleSaveChanges = async () => {
    try {
      setIsSubmitting(true)
      // Here you would call the API to update the event
      toast.success('Event updated successfully!')
      navigate('/dashboard/events')
    } catch (error) {
      toast.error('Failed to update event')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePublish = () => {
    setFormData({ ...formData, status: 'Published' })
    toast.success('Event published!')
  }

  const handleUnpublish = () => {
    setFormData({ ...formData, status: 'Draft' })
    toast.info('Event moved to draft')
  }

  const renderCategoryFields = () => {
    const category = formData.category
    if (!category || !categoryFields[category]) return null

    const fields = categoryFields[category].fields

    return (
      <div className="space-y-6">
        {fields.includes('artist_name') && (
          <div>
            <label className="block text-sm font-bold mb-2 uppercase tracking-widest text-on-surface-variant">
              Artist/Performer Name
            </label>
            <input
              type="text"
              name="artist_name"
              value={formData.artist_name}
              onChange={handleChange}
              className="w-full px-6 py-4 rounded-full bg-surface-container-low border border-outline-variant/20 focus:border-secondary-container/50 outline-none transition-all font-medium text-on-surface placeholder:text-on-surface-variant/50"
            />
          </div>
        )}

        {fields.includes('genre') && (
          <div>
            <label className="block text-sm font-bold mb-2 uppercase tracking-widest text-on-surface-variant">
              Genre
            </label>
            <select
              name="genre"
              value={formData.genre}
              onChange={handleChange}
              className="w-full px-6 py-4 rounded-full bg-surface-container-low border border-outline-variant/20 focus:border-secondary-container/50 outline-none transition-all font-medium text-on-surface"
            >
              <option value="">Select genre</option>
              <option value="rock">Rock</option>
              <option value="pop">Pop</option>
              <option value="jazz">Jazz</option>
              <option value="classical">Classical</option>
              <option value="hip-hop">Hip-Hop</option>
              <option value="electronic">Electronic</option>
            </select>
          </div>
        )}

        {fields.includes('instructor_name') && (
          <div>
            <label className="block text-sm font-bold mb-2 uppercase tracking-widest text-on-surface-variant">
              Instructor Name
            </label>
            <input
              type="text"
              name="instructor_name"
              value={formData.instructor_name}
              onChange={handleChange}
              className="w-full px-6 py-4 rounded-full bg-surface-container-low border border-outline-variant/20 focus:border-secondary-container/50 outline-none transition-all font-medium text-on-surface placeholder:text-on-surface-variant/50"
            />
          </div>
        )}

        {fields.includes('skill_level') && (
          <div>
            <label className="block text-sm font-bold mb-2 uppercase tracking-widest text-on-surface-variant">
              Skill Level
            </label>
            <select
              name="skill_level"
              value={formData.skill_level}
              onChange={handleChange}
              className="w-full px-6 py-4 rounded-full bg-surface-container-low border border-outline-variant/20 focus:border-secondary-container/50 outline-none transition-all font-medium text-on-surface"
            >
              <option value="">Select level</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
        )}

        {fields.includes('venue_name') && (
          <div>
            <label className="block text-sm font-bold mb-2 uppercase tracking-widest text-on-surface-variant">
              Venue Name
            </label>
            <input
              type="text"
              name="venue_name"
              value={formData.venue_name}
              onChange={handleChange}
              className="w-full px-6 py-4 rounded-full bg-surface-container-low border border-outline-variant/20 focus:border-secondary-container/50 outline-none transition-all font-medium text-on-surface placeholder:text-on-surface-variant/50"
            />
          </div>
        )}

        {fields.includes('seating_type') && (
          <div>
            <label className="block text-sm font-bold mb-2 uppercase tracking-widest text-on-surface-variant">
              Seating Type
            </label>
            <select
              name="seating_type"
              value={formData.seating_type}
              onChange={handleChange}
              className="w-full px-6 py-4 rounded-full bg-surface-container-low border border-outline-variant/20 focus:border-secondary-container/50 outline-none transition-all font-medium text-on-surface"
            >
              <option value="">Select seating</option>
              <option value="general">General Admission</option>
              <option value="reserved">Reserved Seating</option>
              <option value="vip">VIP Seating</option>
              <option value="mixed">Mixed (GA & Reserved)</option>
            </select>
          </div>
        )}

        {fields.includes('sound_quality') && (
          <div>
            <label className="block text-sm font-bold mb-2 uppercase tracking-widest text-on-surface-variant">
              Sound Quality
            </label>
            <select
              name="sound_quality"
              value={formData.sound_quality}
              onChange={handleChange}
              className="w-full px-6 py-4 rounded-full bg-surface-container-low border border-outline-variant/20 focus:border-secondary-container/50 outline-none transition-all font-medium text-on-surface"
            >
              <option value="">Select quality</option>
              <option value="standard">Standard</option>
              <option value="high">High Fidelity</option>
              <option value="surround">Surround Sound</option>
            </select>
          </div>
        )}

        {fields.includes('max_participants') && (
          <div>
            <label className="block text-sm font-bold mb-2 uppercase tracking-widest text-on-surface-variant">
              Maximum Participants
            </label>
            <input
              type="number"
              name="max_participants"
              value={formData.max_participants}
              onChange={handleChange}
              className="w-full px-6 py-4 rounded-full bg-surface-container-low border border-outline-variant/20 focus:border-secondary-container/50 outline-none transition-all font-medium text-on-surface"
            />
          </div>
        )}

        {fields.includes('course_duration') && (
          <div>
            <label className="block text-sm font-bold mb-2 uppercase tracking-widest text-on-surface-variant">
              Course Duration (hours)
            </label>
            <input
              type="number"
              name="course_duration"
              value={formData.course_duration}
              onChange={handleChange}
              className="w-full px-6 py-4 rounded-full bg-surface-container-low border border-outline-variant/20 focus:border-secondary-container/50 outline-none transition-all font-medium text-on-surface"
            />
          </div>
        )}

        {fields.includes('materials_provided') && (
          <label className="flex items-center gap-3 p-4 rounded-2xl bg-surface-container-low border border-outline-variant/20 cursor-pointer hover:bg-surface-container-high transition-all">
            <input
              type="checkbox"
              name="materials_provided"
              checked={formData.materials_provided}
              onChange={handleChange}
              className="w-5 h-5 cursor-pointer"
            />
            <span className="font-bold text-on-surface">Materials Provided</span>
          </label>
        )}

        {fields.includes('number_of_tracks') && (
          <div>
            <label className="block text-sm font-bold mb-2 uppercase tracking-widest text-on-surface-variant">
              Number of Tracks
            </label>
            <input
              type="number"
              name="number_of_tracks"
              value={formData.number_of_tracks}
              onChange={handleChange}
              className="w-full px-6 py-4 rounded-full bg-surface-container-low border border-outline-variant/20 focus:border-secondary-container/50 outline-none transition-all font-medium text-on-surface"
            />
          </div>
        )}

        {fields.includes('registration_fee') && (
          <div>
            <label className="block text-sm font-bold mb-2 uppercase tracking-widest text-on-surface-variant">
              Registration Fee (₹)
            </label>
            <input
              type="number"
              name="registration_fee"
              value={formData.registration_fee}
              onChange={handleChange}
              className="w-full px-6 py-4 rounded-full bg-surface-container-low border border-outline-variant/20 focus:border-secondary-container/50 outline-none transition-all font-medium text-on-surface"
            />
          </div>
        )}

        {fields.includes('lunch_provided') && (
          <label className="flex items-center gap-3 p-4 rounded-2xl bg-surface-container-low border border-outline-variant/20 cursor-pointer hover:bg-surface-container-high transition-all">
            <input
              type="checkbox"
              name="lunch_provided"
              checked={formData.lunch_provided}
              onChange={handleChange}
              className="w-5 h-5 cursor-pointer"
            />
            <span className="font-bold text-on-surface">Lunch Provided</span>
          </label>
        )}

        {fields.includes('certificate_provided') && (
          <label className="flex items-center gap-3 p-4 rounded-2xl bg-surface-container-low border border-outline-variant/20 cursor-pointer hover:bg-surface-container-high transition-all">
            <input
              type="checkbox"
              name="certificate_provided"
              checked={formData.certificate_provided}
              onChange={handleChange}
              className="w-5 h-5 cursor-pointer"
            />
            <span className="font-bold text-on-surface">Certificate Provided</span>
          </label>
        )}

        {fields.includes('number_of_stages') && (
          <div>
            <label className="block text-sm font-bold mb-2 uppercase tracking-widest text-on-surface-variant">
              Number of Stages
            </label>
            <input
              type="number"
              name="number_of_stages"
              value={formData.number_of_stages}
              onChange={handleChange}
              className="w-full px-6 py-4 rounded-full bg-surface-container-low border border-outline-variant/20 focus:border-secondary-container/50 outline-none transition-all font-medium text-on-surface"
            />
          </div>
        )}

        {fields.includes('parking_available') && (
          <label className="flex items-center gap-3 p-4 rounded-2xl bg-surface-container-low border border-outline-variant/20 cursor-pointer hover:bg-surface-container-high transition-all">
            <input
              type="checkbox"
              name="parking_available"
              checked={formData.parking_available}
              onChange={handleChange}
              className="w-5 h-5 cursor-pointer"
            />
            <span className="font-bold text-on-surface">Parking Available</span>
          </label>
        )}

        {fields.includes('camping_available') && (
          <label className="flex items-center gap-3 p-4 rounded-2xl bg-surface-container-low border border-outline-variant/20 cursor-pointer hover:bg-surface-container-high transition-all">
            <input
              type="checkbox"
              name="camping_available"
              checked={formData.camping_available}
              onChange={handleChange}
              className="w-5 h-5 cursor-pointer"
            />
            <span className="font-bold text-on-surface">Camping Available</span>
          </label>
        )}

        {fields.includes('food_vendors') && (
          <label className="flex items-center gap-3 p-4 rounded-2xl bg-surface-container-low border border-outline-variant/20 cursor-pointer hover:bg-surface-container-high transition-all">
            <input
              type="checkbox"
              name="food_vendors"
              checked={formData.food_vendors}
              onChange={handleChange}
              className="w-5 h-5 cursor-pointer"
            />
            <span className="font-bold text-on-surface">Food Vendors Available</span>
          </label>
        )}

        {fields.includes('number_of_booths') && (
          <div>
            <label className="block text-sm font-bold mb-2 uppercase tracking-widest text-on-surface-variant">
              Number of Exhibition Booths
            </label>
            <input
              type="number"
              name="number_of_booths"
              value={formData.number_of_booths}
              onChange={handleChange}
              className="w-full px-6 py-4 rounded-full bg-surface-container-low border border-outline-variant/20 focus:border-secondary-container/50 outline-none transition-all font-medium text-on-surface"
            />
          </div>
        )}

        {fields.includes('wheelchair_accessible') && (
          <label className="flex items-center gap-3 p-4 rounded-2xl bg-surface-container-low border border-outline-variant/20 cursor-pointer hover:bg-surface-container-high transition-all">
            <input
              type="checkbox"
              name="wheelchair_accessible"
              checked={formData.wheelchair_accessible}
              onChange={handleChange}
              className="w-5 h-5 cursor-pointer"
            />
            <span className="font-bold text-on-surface">Wheelchair Accessible</span>
          </label>
        )}

        {fields.includes('multimedia_displays') && (
          <label className="flex items-center gap-3 p-4 rounded-2xl bg-surface-container-low border border-outline-variant/20 cursor-pointer hover:bg-surface-container-high transition-all">
            <input
              type="checkbox"
              name="multimedia_displays"
              checked={formData.multimedia_displays}
              onChange={handleChange}
              className="w-5 h-5 cursor-pointer"
            />
            <span className="font-bold text-on-surface">Multimedia Displays</span>
          </label>
        )}

        {fields.includes('entry_fee') && (
          <div>
            <label className="block text-sm font-bold mb-2 uppercase tracking-widest text-on-surface-variant">
              Entry Fee (₹)
            </label>
            <input
              type="number"
              name="entry_fee"
              value={formData.entry_fee}
              onChange={handleChange}
              className="w-full px-6 py-4 rounded-full bg-surface-container-low border border-outline-variant/20 focus:border-secondary-container/50 outline-none transition-all font-medium text-on-surface"
            />
          </div>
        )}
      </div>
    )
  }

  if (!eventToEdit) {
    return (
      <div className="text-center py-20">
        <div className="inline-block">
          <div className="w-16 h-16 rounded-full bg-secondary-container/20 flex items-center justify-center animate-spin">
            <span className="material-symbols-outlined text-2xl text-secondary">
              hourglass_empty
            </span>
          </div>
          <p className="mt-4 text-on-surface-variant">Loading event...</p>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="mb-12">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div>
            <h1 className="text-5xl font-black font-[family-name:var(--font-family-headline)] tracking-tight mb-2">
              Edit Event
            </h1>
            <p className="text-on-surface-variant text-lg">
              {formData.title}
            </p>
          </div>
          <div className="flex gap-2">
            {formData.status === 'Draft' ? (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handlePublish}
                className="flex items-center gap-2 px-6 py-3 bg-secondary-container text-on-secondary-fixed rounded-full font-bold shadow-lg shadow-secondary-container/20"
              >
                <span className="material-symbols-outlined">publish</span>
                Publish Event
              </motion.button>
            ) : (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleUnpublish}
                className="flex items-center gap-2 px-6 py-3 bg-surface-container-high text-on-surface rounded-full font-bold"
              >
                <span className="material-symbols-outlined">unpublished</span>
                Unpublish
              </motion.button>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <span className={`px-4 py-2 rounded-full text-xs font-bold ${
            formData.status === 'Published'
              ? 'bg-secondary-container text-on-secondary-fixed'
              : 'bg-surface-container-high text-on-surface'
          }`}>
            {formData.status}
          </span>
          <span className="px-4 py-2 rounded-full text-xs font-bold bg-surface-container-high text-on-surface">
            {categoryFields[formData.category]?.label || formData.category}
          </span>
        </div>
      </motion.div>

      {/* Quick Stats */}
      {eventToEdit.bookings > 0 && (
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-1 md:grid-cols-4 gap-6"
        >
          <div className="bg-surface-container-lowest rounded-3xl p-6 border border-outline-variant/20">
            <p className="text-on-surface-variant text-sm font-bold mb-2 uppercase tracking-widest">Current Bookings</p>
            <h3 className="text-4xl font-black">{eventToEdit.bookings}</h3>
            <p className="text-xs text-secondary mt-2 font-bold">/ {eventToEdit.capacity} capacity</p>
          </div>

          <div className="bg-surface-container-lowest rounded-3xl p-6 border border-outline-variant/20">
            <p className="text-on-surface-variant text-sm font-bold mb-2 uppercase tracking-widest">Available Slots</p>
            <h3 className="text-4xl font-black text-secondary">{eventToEdit.capacity - eventToEdit.bookings}</h3>
            <p className="text-xs text-on-surface-variant mt-2 font-bold">{Math.round((eventToEdit.bookings / eventToEdit.capacity) * 100)}% Full</p>
          </div>

          <div className="bg-surface-container-lowest rounded-3xl p-6 border border-outline-variant/20">
            <p className="text-on-surface-variant text-sm font-bold mb-2 uppercase tracking-widest">Revenue Generated</p>
            <h3 className="text-3xl font-black">₹{eventToEdit.revenue.toLocaleString()}</h3>
            <p className="text-xs text-secondary mt-2 font-bold">From {eventToEdit.bookings} bookings</p>
          </div>

          <div className="bg-surface-container-lowest rounded-3xl p-6 border border-outline-variant/20">
            <p className="text-on-surface-variant text-sm font-bold mb-2 uppercase tracking-widest">Avg Ticket Price</p>
            <h3 className="text-3xl font-black">₹{Math.round(eventToEdit.revenue / eventToEdit.bookings)}</h3>
            <p className="text-xs text-on-surface-variant mt-2 font-bold">Per attendee</p>
          </div>
        </motion.div>
      )}

      {/* Tab Navigation */}
      <motion.div variants={itemVariants} className="flex gap-2 bg-surface-container-high p-2 rounded-full">
        {['Details', 'Tickets', 'Analytics'].map((tab, idx) => (
          <button
            key={tab}
            onClick={() => setStep(idx + 1)}
            className={`px-6 py-3 rounded-full text-sm font-bold transition-all ${
              step === idx + 1
                ? 'bg-secondary-container text-on-secondary-fixed'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            {tab}
          </button>
        ))}
      </motion.div>

      {/* Edit Form */}
      <motion.div
        className="bg-surface-container-lowest rounded-3xl p-8 border border-outline-variant/20 space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {step === 1 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-black font-[family-name:var(--font-family-headline)] mb-6">
              Event Details
            </h2>

            <div>
              <label className="block text-sm font-bold mb-2 uppercase tracking-widest text-on-surface-variant">
                Event Title
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full px-6 py-4 rounded-full bg-surface-container-low border border-outline-variant/20 focus:border-secondary-container/50 outline-none transition-all font-medium text-on-surface"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold mb-2 uppercase tracking-widest text-on-surface-variant">
                  Start Date
                </label>
                <input
                  type="datetime-local"
                  name="start_datetime"
                  value={formData.start_datetime}
                  onChange={handleChange}
                  className="w-full px-6 py-4 rounded-full bg-surface-container-low border border-outline-variant/20 focus:border-secondary-container/50 outline-none transition-all font-medium text-on-surface"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2 uppercase tracking-widest text-on-surface-variant">
                  End Date
                </label>
                <input
                  type="datetime-local"
                  name="end_datetime"
                  value={formData.end_datetime}
                  onChange={handleChange}
                  className="w-full px-6 py-4 rounded-full bg-surface-container-low border border-outline-variant/20 focus:border-secondary-container/50 outline-none transition-all font-medium text-on-surface"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold mb-2 uppercase tracking-widest text-on-surface-variant">
                Description
              </label>
              <textarea
                rows="6"
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full px-6 py-4 rounded-3xl bg-surface-container-low border border-outline-variant/20 focus:border-secondary-container/50 outline-none transition-all font-medium resize-none text-on-surface"
              />
            </div>

            <div className="border-t border-outline-variant/20 pt-6">
              <h3 className="text-xl font-black font-[family-name:var(--font-family-headline)] mb-6">
                {categoryFields[formData.category]?.label || 'Category'} Specific Details
              </h3>
              {renderCategoryFields()}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-black font-[family-name:var(--font-family-headline)] mb-6">
              Ticket Management
            </h2>

            <div className="space-y-4">
              {formData.tickets.map((ticket, idx) => (
                <motion.div
                  key={idx}
                  className="p-6 rounded-2xl bg-surface-container-low border border-outline-variant/20 space-y-4"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-lg">{ticket.type}</h3>
                    <div className="text-sm">
                      <p className="text-secondary font-bold">{ticket.sold} / {ticket.quantity} Sold</p>
                      <p className="text-xs text-on-surface-variant">₹{ticket.price} each</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold mb-2 uppercase tracking-widest text-on-surface-variant">
                        Type
                      </label>
                      <input
                        type="text"
                        value={ticket.type}
                        onChange={(e) => handleTicketChange(idx, 'type', e.target.value)}
                        className="w-full px-4 py-2 rounded-lg bg-surface-container-lowest border border-outline-variant/20 outline-none text-sm font-medium text-on-surface"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold mb-2 uppercase tracking-widest text-on-surface-variant">
                        Price (₹)
                      </label>
                      <input
                        type="number"
                        value={ticket.price}
                        onChange={(e) => handleTicketChange(idx, 'price', e.target.value)}
                        className="w-full px-4 py-2 rounded-lg bg-surface-container-lowest border border-outline-variant/20 outline-none text-sm font-medium text-on-surface"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold mb-2 uppercase tracking-widest text-on-surface-variant">
                        Quantity
                      </label>
                      <input
                        type="number"
                        value={ticket.quantity}
                        onChange={(e) => handleTicketChange(idx, 'quantity', e.target.value)}
                        className="w-full px-4 py-2 rounded-lg bg-surface-container-lowest border border-outline-variant/20 outline-none text-sm font-medium text-on-surface"
                      />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-black font-[family-name:var(--font-family-headline)] mb-6">
              Event Analytics
            </h2>

            {eventToEdit.bookings > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 rounded-2xl bg-surface-container-low border border-outline-variant/20">
                  <p className="text-on-surface-variant text-sm font-bold mb-4 uppercase tracking-widest">Ticket Distribution</p>
                  <div className="space-y-3">
                    {formData.tickets.map((ticket, idx) => (
                      <div key={idx}>
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-bold text-sm">{ticket.type}</p>
                          <p className="text-xs text-secondary font-bold">{ticket.sold} sold</p>
                        </div>
                        <div className="w-full bg-surface-container-lowest rounded-full h-2">
                          <div
                            className="bg-secondary-container rounded-full h-2"
                            style={{ width: `${(ticket.sold / ticket.quantity) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-6 rounded-2xl bg-surface-container-low border border-outline-variant/20">
                  <p className="text-on-surface-variant text-sm font-bold mb-4 uppercase tracking-widest">Revenue Breakdown</p>
                  <div className="space-y-3">
                    {formData.tickets.map((ticket, idx) => (
                      <div key={idx} className="flex items-center justify-between">
                        <p className="text-sm">{ticket.type}</p>
                        <p className="font-bold">₹{(ticket.sold * ticket.price).toLocaleString()}</p>
                      </div>
                    ))}
                    <div className="border-t border-outline-variant/20 pt-3 mt-3">
                      <div className="flex items-center justify-between">
                        <p className="font-bold">Total Revenue</p>
                        <p className="text-lg font-black text-secondary">₹{eventToEdit.revenue.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <span className="material-symbols-outlined text-6xl text-on-surface-variant/30 mb-4 block">
                  analytics
                </span>
                <p className="text-on-surface-variant">No analytics data yet. Bookings will appear here once attendees register.</p>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between mt-12 pt-8 border-t border-outline-variant/20">
          <button
            onClick={() => navigate('/dashboard/events')}
            className="flex items-center gap-2 px-8 py-4 rounded-full bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-bold transition-all"
          >
            <span className="material-symbols-outlined">arrow_back</span>
            Back to Events
          </button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSaveChanges}
            disabled={isSubmitting}
            className="flex items-center gap-2 px-8 py-4 rounded-full bg-secondary-container text-on-secondary-fixed hover:scale-[0.98] disabled:opacity-50 transition-all font-bold shadow-lg shadow-secondary-container/20"
          >
            {isSubmitting ? 'Saving...' : 'Save Changes'}
            <span className="material-symbols-outlined">check_circle</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Pro Tip */}
      <motion.div
        className="bg-secondary-container/10 rounded-3xl p-8 border border-secondary-container/30"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex items-start gap-4">
          <span className="material-symbols-outlined text-2xl text-secondary shrink-0">
            lightbulb
          </span>
          <div>
            <h3 className="font-black text-lg mb-2 text-on-surface">Pro Tip</h3>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              {step === 1 && 'Keep your event description engaging and specific about what attendees will experience.'}
              {step === 2 && 'Different ticket tiers can increase revenue by up to 35! Consider offering early bird discounts.'}
              {step === 3 && 'Monitor your analytics regularly to understand ticket sales patterns and optimize future events.'}
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
