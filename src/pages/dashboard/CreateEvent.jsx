import { motion } from 'framer-motion'
import { useState } from 'react'
import AIChatBuilder from './AIChatBuilder'
import { eventService } from '../../services/event'
import { useNavigate } from 'react-router-dom'

export default function CreateEvent() {
  const [creationMode, setCreationMode] = useState('manual') // 'manual' | 'ai'
  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    title: '',
    category: '',
    start_datetime: '',
    end_datetime: '',
    description: ''
  })

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleManualSubmit = async () => {
    try {
      setIsSubmitting(true)
      const dataToSubmit = {
        ...formData,
        start_datetime: formData.start_datetime ? new Date(formData.start_datetime).toISOString() : null,
        end_datetime: formData.end_datetime ? new Date(formData.end_datetime).toISOString() : null,
        status: 'draft'
      }
      
      const response = await eventService.createEvent(dataToSubmit);
      alert('Event created successfully!')
      navigate('/dashboard/events')
    } catch (error) {
      console.error('Error creating event manually:', error)
      alert(error.message || 'Failed to create event')
    } finally {
      setIsSubmitting(false)
    }
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
                    Event Title
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
                    Category
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
                    placeholder="Tell attendees what makes your event special..."
                    className="w-full px-6 py-4 rounded-3xl bg-surface-container-low border border-outline-variant/20 focus:border-secondary-container/50 outline-none transition-all font-medium resize-none text-on-surface placeholder:text-on-surface-variant/50"
                  />
                </div>
              </div>
            )}

            {/* Placeholder for other steps */}
            {step > 1 && (
              <div className="text-center py-20">
                <span className="material-symbols-outlined text-8xl text-on-surface-variant/20 mb-6 block">
                  construction
                </span>
                <h3 className="text-2xl font-black mb-2">Step {step} Coming Soon</h3>
                <p className="text-on-surface-variant">
                  We're building out the detailed flow. In the meantime, you can skip to save.
                </p>
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
                <button 
                  onClick={handleManualSubmit}
                  disabled={isSubmitting}
                  className="px-8 py-4 rounded-full bg-surface-container-low text-on-surface hover:bg-surface-container-high transition-all font-bold disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Save & Exit'}
                </button>
                <button
                  onClick={() => setStep(Math.min(4, step + 1))}
                  className="flex items-center gap-2 px-8 py-4 rounded-full bg-secondary-container text-on-secondary-fixed hover:scale-[0.98] transition-all font-bold shadow-lg shadow-secondary-container/20"
                >
                  {step === 4 ? 'Review' : 'Continue'}
                  <span className="material-symbols-outlined">arrow_forward</span>
                </button>
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
                <h3 className="font-black text-lg mb-2 text-on-surface">Pro Tip</h3>
                <p className="text-sm text-on-surface-variant leading-relaxed">
                  A compelling event title and description can increase bookings by up to 40%. Be specific about what attendees will experience!
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </div>
  )
}
