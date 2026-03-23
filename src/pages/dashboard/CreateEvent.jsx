import { motion } from 'framer-motion'
import { useState } from 'react'
import AIChatBuilder from './AIChatBuilder'
import { eventService } from '../../services/event'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'

// Category-specific fields configuration
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

export default function CreateEvent() {
  const [creationMode, setCreationMode] = useState('manual') // 'manual' | 'ai'
  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    // Basic Info
    title: '',
    category: '',
    start_datetime: '',
    end_datetime: '',
    description: '',
    
    // Category-specific details
    artist_name: '',
    genre: '',
    instructor_name: '',
    skill_level: '',
    venue_name: '',
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
    
    // Ticket Info
    tickets: [
      { type: 'Regular', price: '', quantity: '' }
    ]
  })

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

  const addTicketType = () => {
    setFormData({
      ...formData,
      tickets: [...formData.tickets, { type: '', price: '', quantity: '' }]
    })
  }

  const removeTicketType = (index) => {
    setFormData({
      ...formData,
      tickets: formData.tickets.filter((_, i) => i !== index)
    })
  }

  const handleManualSubmit = async () => {
    try {
      if (!formData.title || !formData.category) {
        toast.error('Please fill in required fields')
        return
      }

      setIsSubmitting(true)
      const dataToSubmit = {
        title: formData.title,
        category: formData.category,
        start_datetime: formData.start_datetime ? new Date(formData.start_datetime).toISOString() : null,
        end_datetime: formData.end_datetime ? new Date(formData.end_datetime).toISOString() : null,
        description: formData.description,
        status: 'draft',
        details: {
          venue_name: formData.venue_name,
          artist_name: formData.artist_name,
          instructor_name: formData.instructor_name,
          skill_level: formData.skill_level,
          genre: formData.genre,
          seating_type: formData.seating_type,
          sound_quality: formData.sound_quality,
          max_participants: formData.max_participants,
          course_duration: formData.course_duration,
          materials_provided: formData.materials_provided,
          number_of_tracks: formData.number_of_tracks,
          registration_fee: formData.registration_fee,
          lunch_provided: formData.lunch_provided,
          certificate_provided: formData.certificate_provided,
          number_of_stages: formData.number_of_stages,
          parking_available: formData.parking_available,
          camping_available: formData.camping_available,
          food_vendors: formData.food_vendors,
          number_of_booths: formData.number_of_booths,
          wheelchair_accessible: formData.wheelchair_accessible,
          multimedia_displays: formData.multimedia_displays,
          entry_fee: formData.entry_fee
        },
        tickets: formData.tickets
      }
      
      const response = await eventService.createEvent(dataToSubmit)
      toast.success('Event created successfully!')
      navigate('/dashboard/events')
    } catch (error) {
      console.error('Error creating event:', error)
      toast.error(error.message || 'Failed to create event')
    } finally {
      setIsSubmitting(false)
    }
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
              placeholder="e.g., The Beatles"
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
              placeholder="e.g., Dr. John Smith"
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
              placeholder="e.g., Madison Square Garden"
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
              placeholder="e.g., 30"
              className="w-full px-6 py-4 rounded-full bg-surface-container-low border border-outline-variant/20 focus:border-secondary-container/50 outline-none transition-all font-medium text-on-surface placeholder:text-on-surface-variant/50"
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
              placeholder="e.g., 8"
              className="w-full px-6 py-4 rounded-full bg-surface-container-low border border-outline-variant/20 focus:border-secondary-container/50 outline-none transition-all font-medium text-on-surface placeholder:text-on-surface-variant/50"
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
              placeholder="e.g., 3"
              className="w-full px-6 py-4 rounded-full bg-surface-container-low border border-outline-variant/20 focus:border-secondary-container/50 outline-none transition-all font-medium text-on-surface placeholder:text-on-surface-variant/50"
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
              placeholder="e.g., 500"
              className="w-full px-6 py-4 rounded-full bg-surface-container-low border border-outline-variant/20 focus:border-secondary-container/50 outline-none transition-all font-medium text-on-surface placeholder:text-on-surface-variant/50"
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
              placeholder="e.g., 2"
              className="w-full px-6 py-4 rounded-full bg-surface-container-low border border-outline-variant/20 focus:border-secondary-container/50 outline-none transition-all font-medium text-on-surface placeholder:text-on-surface-variant/50"
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
              placeholder="e.g., 50"
              className="w-full px-6 py-4 rounded-full bg-surface-container-low border border-outline-variant/20 focus:border-secondary-container/50 outline-none transition-all font-medium text-on-surface placeholder:text-on-surface-variant/50"
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
              placeholder="e.g., 200"
              className="w-full px-6 py-4 rounded-full bg-surface-container-low border border-outline-variant/20 focus:border-secondary-container/50 outline-none transition-all font-medium text-on-surface placeholder:text-on-surface-variant/50"
            />
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-5xl font-black font-[family-name:var(--font-family-headline)] tracking-tight mb-2">
            Create New Event
          </h1>
          <p className="text-on-surface-variant text-lg">
            Let's bring your event to life
          </p>
        </div>
        
        {/* Toggle Mode */}
        <div className="flex bg-surface-container-high rounded-full p-1 border border-outline-variant/20">
          <button
            onClick={() => setCreationMode('manual')}
            className={`px-6 py-3 rounded-full text-sm font-bold transition-all flex items-center gap-2 ${
              creationMode === 'manual' 
                ? 'bg-surface-container-lowest text-on-surface shadow-sm' 
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">edit_document</span>
            Manual
          </button>
          <button
            onClick={() => setCreationMode('ai')}
            className={`px-6 py-3 rounded-full text-sm font-bold transition-all flex items-center gap-2 ${
              creationMode === 'ai' 
                ? 'bg-secondary-container text-on-secondary-fixed shadow-sm' 
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
            AI Assistant
          </button>
        </div>
      </div>

      {creationMode === 'ai' ? (
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
        >
          <AIChatBuilder />
        </motion.div>
      ) : (
        <>
          {/* Progress Steps */}
          <div className="flex items-center gap-4">
            {['Basic Info', 'Details', 'Tickets', 'Review'].map((label, idx) => {
              const stepNum = idx + 1
              const isActive = step === stepNum
              const isCompleted = step > stepNum

              return (
                <div key={label} className="flex items-center flex-1">
                  <div className="flex items-center gap-3 flex-1">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-sm transition-all ${
                        isActive
                          ? 'bg-secondary-container text-on-secondary-fixed scale-110'
                          : isCompleted
                          ? 'bg-secondary-container text-on-secondary-fixed'
                          : 'bg-surface-container-high text-on-surface-variant'
                      }`}
                    >
                      {isCompleted ? (
                        <span className="material-symbols-outlined text-[18px]">check</span>
                      ) : (
                        stepNum
                      )}
                    </div>
                    <span className={`text-sm font-bold ${isActive ? 'text-on-surface' : 'text-on-surface-variant'}`}>
                      {label}
                    </span>
                  </div>
                  {idx < 3 && (
                    <div className={`h-1 flex-1 rounded-full mx-4 ${isCompleted ? 'bg-secondary-container' : 'bg-surface-container-high'}`} />
                  )}
                </div>
              )
            })}
          </div>

          {/* Form */}
          <motion.div
            className="bg-surface-container-lowest rounded-3xl p-8 border border-outline-variant/20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {step === 1 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-black font-[family-name:var(--font-family-headline)] mb-6">
                  Basic Information
                </h2>

                <div>
                  <label className="block text-sm font-bold mb-2 uppercase tracking-widest text-on-surface-variant">
                    Event Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="e.g., TechCon 2026"
                    className="w-full px-6 py-4 rounded-full bg-surface-container-low border border-outline-variant/20 focus:border-secondary-container/50 outline-none transition-all font-medium text-on-surface placeholder:text-on-surface-variant/50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold mb-2 uppercase tracking-widest text-on-surface-variant">
                    Category *
                  </label>
                  <select 
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full px-6 py-4 rounded-full bg-surface-container-low border border-outline-variant/20 focus:border-secondary-container/50 outline-none transition-all font-medium text-on-surface"
                  >
                    <option value="">Select category</option>
                    <option value="conference">Conference</option>
                    <option value="concert">Concert</option>
                    <option value="workshop">Workshop</option>
                    <option value="festival">Festival</option>
                    <option value="exhibition">Exhibition</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold mb-2 uppercase tracking-widest text-on-surface-variant">
                      Start Date *
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
                      End Date *
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
                    placeholder="Tell attendees what makes your event special..."
                    className="w-full px-6 py-4 rounded-3xl bg-surface-container-low border border-outline-variant/20 focus:border-secondary-container/50 outline-none transition-all font-medium resize-none text-on-surface placeholder:text-on-surface-variant/50"
                  />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-black font-[family-name:var(--font-family-headline)] mb-2">
                  Event Details
                </h2>
                <p className="text-on-surface-variant mb-6">
                  {formData.category ? `Configure ${categoryFields[formData.category]?.label || 'event'} specific details` : 'Please select a category in step 1'}
                </p>
                
                {formData.category ? renderCategoryFields() : (
                  <div className="text-center py-12">
                    <span className="material-symbols-outlined text-6xl text-on-surface-variant/30 mb-4 block">
                      info
                    </span>
                    <p className="text-on-surface-variant">Select a category in the previous step to unlock category-specific details</p>
                  </div>
                )}
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-black font-[family-name:var(--font-family-headline)] mb-6">
                  Ticket Configuration
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
                        <h3 className="font-bold">Ticket Type {idx + 1}</h3>
                        {formData.tickets.length > 1 && (
                          <button
                            onClick={() => removeTicketType(idx)}
                            className="p-2 rounded-full text-red-500 hover:bg-red-500/10 transition-all"
                          >
                            <span className="material-symbols-outlined">delete</span>
                          </button>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-bold mb-2 uppercase tracking-widest text-on-surface-variant">
                          Ticket Type *
                        </label>
                        <input
                          type="text"
                          value={ticket.type}
                          onChange={(e) => handleTicketChange(idx, 'type', e.target.value)}
                          placeholder="e.g., Regular, VIP, Student"
                          className="w-full px-6 py-4 rounded-full bg-surface-container-lowest border border-outline-variant/20 focus:border-secondary-container/50 outline-none transition-all font-medium text-on-surface placeholder:text-on-surface-variant/50"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-bold mb-2 uppercase tracking-widest text-on-surface-variant">
                            Price (₹) *
                          </label>
                          <input
                            type="number"
                            value={ticket.price}
                            onChange={(e) => handleTicketChange(idx, 'price', e.target.value)}
                            placeholder="e.g., 500"
                            className="w-full px-6 py-4 rounded-full bg-surface-container-lowest border border-outline-variant/20 focus:border-secondary-container/50 outline-none transition-all font-medium text-on-surface placeholder:text-on-surface-variant/50"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-bold mb-2 uppercase tracking-widest text-on-surface-variant">
                            Quantity *
                          </label>
                          <input
                            type="number"
                            value={ticket.quantity}
                            onChange={(e) => handleTicketChange(idx, 'quantity', e.target.value)}
                            placeholder="e.g., 100"
                            className="w-full px-6 py-4 rounded-full bg-surface-container-lowest border border-outline-variant/20 focus:border-secondary-container/50 outline-none transition-all font-medium text-on-surface placeholder:text-on-surface-variant/50"
                          />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <button
                  onClick={addTicketType}
                  className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-full bg-surface-container-low hover:bg-surface-container-high border border-dashed border-secondary-container transition-all font-bold text-secondary"
                >
                  <span className="material-symbols-outlined">add_circle</span>
                  Add Ticket Type
                </button>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-black font-[family-name:var(--font-family-headline)] mb-6">
                  Review Event Details
                </h2>

                {/* Basic Info Summary */}
                <div className="p-6 rounded-2xl bg-surface-container-low border border-outline-variant/20 space-y-4">
                  <h3 className="font-bold text-lg">Basic Information</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-on-surface-variant uppercase tracking-widest mb-1">Title</p>
                      <p className="font-bold">{formData.title || '-'}</p>
                    </div>
                    <div>
                      <p className="text-on-surface-variant uppercase tracking-widest mb-1">Category</p>
                      <p className="font-bold capitalize">{formData.category || '-'}</p>
                    </div>
                    <div>
                      <p className="text-on-surface-variant uppercase tracking-widest mb-1">Start Date</p>
                      <p className="font-bold">{formData.start_datetime ? new Date(formData.start_datetime).toLocaleString() : '-'}</p>
                    </div>
                    <div>
                      <p className="text-on-surface-variant uppercase tracking-widest mb-1">End Date</p>
                      <p className="font-bold">{formData.end_datetime ? new Date(formData.end_datetime).toLocaleString() : '-'}</p>
                    </div>
                  </div>
                  {formData.description && (
                    <div>
                      <p className="text-on-surface-variant uppercase tracking-widest mb-1">Description</p>
                      <p className="font-medium text-on-surface">{formData.description}</p>
                    </div>
                  )}
                </div>

                {/* Category Details Summary */}
                {formData.category && (
                  <div className="p-6 rounded-2xl bg-surface-container-low border border-outline-variant/20 space-y-4">
                    <h3 className="font-bold text-lg">{categoryFields[formData.category]?.label} Details</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      {formData.venue_name && <div><p className="text-on-surface-variant kb-1">Venue</p><p className="font-bold">{formData.venue_name}</p></div>}
                      {formData.artist_name && <div><p className="text-on-surface-variant mb-1">Artist</p><p className="font-bold">{formData.artist_name}</p></div>}
                      {formData.instructor_name && <div><p className="text-on-surface-variant mb-1">Instructor</p><p className="font-bold">{formData.instructor_name}</p></div>}
                      {formData.genre && <div><p className="text-on-surface-variant mb-1">Genre</p><p className="font-bold">{formData.genre}</p></div>}
                      {formData.skill_level && <div><p className="text-on-surface-variant mb-1">Skill Level</p><p className="font-bold capitalize">{formData.skill_level}</p></div>}
                      {formData.max_participants && <div><p className="text-on-surface-variant mb-1">Max Participants</p><p className="font-bold">{formData.max_participants}</p></div>}
                    </div>
                  </div>
                )}

                {/* Ticket Summary */}
                <div className="p-6 rounded-2xl bg-surface-container-low border border-outline-variant/20 space-y-4">
                  <h3 className="font-bold text-lg">Ticket Configuration</h3>
                  <div className="space-y-3">
                    {formData.tickets.map((ticket, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-surface-container-high">
                        <div>
                          <p className="font-bold">{ticket.type || 'Unnamed'}</p>
                          <p className="text-sm text-on-surface-variant">₹{ticket.price || 0} × {ticket.quantity || 0} tickets</p>
                        </div>
                        <p className="font-bold">₹{(ticket.price * ticket.quantity) || 0}</p>
                      </div>
                    ))}
                  </div>
                  <div className="pt-3 border-t border-outline-variant/20 flex items-center justify-between">
                    <p className="font-bold">Total Revenue Potential</p>
                    <p className="text-xl font-black">₹{formData.tickets.reduce((sum, t) => sum + (t.price * t.quantity || 0), 0)}</p>
                  </div>
                </div>

                <motion.div
                  className="p-6 rounded-2xl bg-secondary-container/10 border border-secondary-container/30"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <div className="flex items-start gap-4">
                    <span className="material-symbols-outlined text-2xl text-secondary shrink-0">
                      check_circle
                    </span>
                    <div>
                      <h3 className="font-black text-lg mb-1 text-on-surface">Ready to Launch</h3>
                      <p className="text-sm text-on-surface-variant">
                        Click "Create Event" to save your event as draft. You can continue editing anytime.
                      </p>
                    </div>
                  </div>
                </motion.div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between mt-12 pt-8 border-t border-outline-variant/20">
              <button
                onClick={() => setStep(Math.max(1, step - 1))}
                disabled={step === 1}
                className="flex items-center gap-2 px-8 py-4 rounded-full bg-surface-container-low text-on-surface hover:bg-surface-container-high disabled:opacity-30 disabled:cursor-not-allowed transition-all font-bold"
              >
                <span className="material-symbols-outlined">arrow_back</span>
                Previous
              </button>

              <div className="flex items-center gap-3">
                {step < 4 && (
                  <button 
                    onClick={handleManualSubmit}
                    disabled={isSubmitting}
                    className="px-8 py-4 rounded-full bg-surface-container-low text-on-surface hover:bg-surface-container-high transition-all font-bold disabled:opacity-50"
                  >
                    {isSubmitting ? 'Saving...' : 'Save Draft'}
                  </button>
                )}
                {step === 4 && (
                  <button 
                    onClick={handleManualSubmit}
                    disabled={isSubmitting}
                    className="px-8 py-4 rounded-full bg-surface-container-low text-on-surface hover:bg-surface-container-high transition-all font-bold disabled:opacity-50"
                  >
                    {isSubmitting ? 'Creating...' : 'Save as Draft'}
                  </button>
                )}
                {step < 4 && (
                  <button
                    onClick={() => setStep(Math.min(4, step + 1))}
                    className="flex items-center gap-2 px-8 py-4 rounded-full bg-secondary-container text-on-secondary-fixed hover:scale-[0.98] transition-all font-bold shadow-lg shadow-secondary-container/20"
                  >
                    Continue
                    <span className="material-symbols-outlined">arrow_forward</span>
                  </button>
                )}
                {step === 4 && (
                  <button
                    onClick={handleManualSubmit}
                    disabled={isSubmitting}
                    className="flex items-center gap-2 px-8 py-4 rounded-full bg-secondary-container text-on-secondary-fixed hover:scale-[0.98] disabled:opacity-50 transition-all font-bold shadow-lg shadow-secondary-container/20"
                  >
                    {isSubmitting ? 'Creating...' : 'Create Event'}
                    <span className="material-symbols-outlined">check_circle</span>
                  </button>
                )}
              </div>
            </div>
          </motion.div>

          {/* Tips Sidebar */}
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
                <h3 className="font-black text-lg mb-2 text-on-surface">
                  {step === 1 && 'Pro Tip: Basic Information'}
                  {step === 2 && 'Pro Tip: Event Details'}
                  {step === 3 && 'Pro Tip: Ticket Pricing'}
                  {step === 4 && 'Pro Tip: Review & Launch'}
                </h3>
                <p className="text-sm text-on-surface-variant leading-relaxed">
                  {step === 1 && 'A compelling event title and description can increase bookings by up to 40%. Be specific about what attendees will experience!'}
                  {step === 2 && `Configure all ${formData.category ? categoryFields[formData.category]?.label : 'category'}-specific details to make your event stand out and attract the right audience.`}
                  {step === 3 && 'Offer multiple ticket types (Regular, VIP, Student) to cater to different audience segments and maximize revenue.'}
                  {step === 4 && 'Review all details carefully. You can edit your event anytime after creation. Click "Create Event" to save as draft.'}
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </div>
  )
}
