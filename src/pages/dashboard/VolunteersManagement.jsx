import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-toastify'
import { volunteerService } from '../../services/volunteerService'
import { eventService } from '../../services/event'

export default function VolunteersManagement() {
  const [events, setEvents] = useState([])
  const [selectedEventId, setSelectedEventId] = useState('')
  const [volunteers, setVolunteers] = useState([])
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState('all')

  // Modals state
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)

  // Upload state
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)

  // Add volunteer state
  const [newVolunteer, setNewVolunteer] = useState({
    name: '',
    email: '',
    phone: '',
    role: '',
    skills: [],
    availability: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    notes: '',
    specialRequirements: ''
  })
  
  // Input for adding skills
  const [skillInput, setSkillInput] = useState('')

  useEffect(() => {
    // Fetch organizer's events to select from
    fetchEvents()
  }, [])

  useEffect(() => {
    if (selectedEventId) {
      loadVolunteers()
    } else {
      setVolunteers([])
    }
  }, [selectedEventId, filter])

  const fetchEvents = async () => {
    try {
      const data = await eventService.getAllEvents()
      if (data && data.length > 0) {
        setEvents(data)
        // Auto-select first event
        setSelectedEventId(data[0]._id || data[0].id)
      }
    } catch (err) {
      toast.error('Failed to load events')
    }
  }

  const loadVolunteers = async () => {
    setLoading(true)
    try {
      const status = filter === 'all' ? null : filter
      const data = await volunteerService.getEventVolunteers(selectedEventId, status)
      setVolunteers(data)
    } catch (error) {
      toast.error('Failed to load volunteers')
    } finally {
      setLoading(false)
    }
  }

  // File Upload Handlers
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile) {
      const extension = selectedFile.name.split('.').pop().toLowerCase()
      if (!['xlsx', 'xls', 'csv'].includes(extension)) {
        toast.error('Please upload .xlsx, .xls, or .csv file')
        setFile(null)
        return
      }
      setFile(selectedFile)
    }
  }

  const handleUpload = async () => {
    if (!file) {
      toast.warning('Please select a file')
      return
    }
    setUploading(true)
    try {
      const data = await volunteerService.uploadExcel(selectedEventId, file)
      toast.success(`Successfully added ${data.volunteers_created} volunteers!`)
      if (data.volunteers_skipped > 0) {
        toast.warning(`${data.volunteers_skipped} volunteers skipped (duplicates or missing info)`)
      }
      setShowUploadModal(false)
      setFile(null)
      loadVolunteers()
    } catch (err) {
      toast.error(typeof err === 'string' ? err : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  // Manual Add Handlers
  const handleAddSkill = (e) => {
    if (e.key === 'Enter' && skillInput.trim()) {
      e.preventDefault()
      if (!newVolunteer.skills.includes(skillInput.trim())) {
        setNewVolunteer({
          ...newVolunteer,
          skills: [...newVolunteer.skills, skillInput.trim()]
        })
      }
      setSkillInput('')
    }
  }

  const removeSkill = (skillToRemove) => {
    setNewVolunteer({
      ...newVolunteer,
      skills: newVolunteer.skills.filter(s => s !== skillToRemove)
    })
  }

  const handleCreateVolunteer = async (e) => {
    e.preventDefault()
    try {
      await volunteerService.create(selectedEventId, newVolunteer)
      toast.success('Volunteer added successfully')
      setShowAddModal(false)
      setNewVolunteer({
        name: '', email: '', phone: '', role: '', skills: [],
        availability: '', emergencyContactName: '', emergencyContactPhone: '',
        notes: '', specialRequirements: ''
      })
      loadVolunteers()
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to add volunteer')
    }
  }

  // Individual Actions
  const toggleCheckIn = async (volunteer) => {
    try {
      const newStatus = !volunteer.checked_in
      const res = await volunteerService.checkInVolunteer(volunteer.id, newStatus)
      toast.success(newStatus ? 'Checked in successfully' : `Checked out! Hours logged: ${res.total_hours_logged}`)
      loadVolunteers()
    } catch (error) {
      toast.error('Check-in/out failed')
    }
  }

  const deleteVolunteer = async (id) => {
    if (!window.confirm('Are you sure you want to remove this volunteer?')) return
    try {
      await volunteerService.delete(id)
      toast.success('Volunteer deleted')
      loadVolunteers()
    } catch (err) {
      toast.error('Failed to delete volunteer')
    }
  }

  return (
    <div className="space-y-8">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black font-[family-name:var(--font-family-headline)]">
            Volunteers
          </h2>
          <p className="text-on-surface-variant">Manage event staff and volunteers</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
            className="px-4 py-2 rounded-xl bg-surface-container-high border-none outline-none text-sm font-bold min-w-[200px]"
          >
            <option value="" disabled>Select Event</option>
            {events.map(ev => (
              <option key={ev._id || ev.id} value={ev._id || ev.id}>
                {ev.title || ev.name}
              </option>
            ))}
          </select>

          <button
            onClick={() => setShowUploadModal(true)}
            disabled={!selectedEventId}
            className="flex items-center gap-2 px-4 py-2 bg-surface-container-high hover:bg-surface-container-highest rounded-full transition-all text-sm font-bold disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[18px]">upload_file</span>
            Import List
          </button>
          
          <button
            onClick={() => setShowAddModal(true)}
            disabled={!selectedEventId}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-on-primary rounded-full hover:shadow-lg hover:shadow-primary/20 transition-all text-sm font-bold disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            Add Volunteer
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/30 overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-outline-variant/30 flex justify-between items-center bg-surface-container-low">
          <div className="flex gap-2">
            {['all', 'invited', 'accepted', 'active', 'inactive'].map(status => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-full text-xs font-bold capitalize transition-all ${
                  filter === status
                    ? 'bg-secondary-container text-on-secondary-fixed'
                    : 'text-on-surface-variant hover:bg-surface-container-highest'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-outline-variant/30 bg-surface-container-lowest text-on-surface-variant text-sm font-bold">
                <th className="p-4 pl-6">Name</th>
                <th className="p-4">Contact</th>
                <th className="p-4">Role</th>
                <th className="p-4">Tasks</th>
                <th className="p-4">Status / Time</th>
                <th className="p-4 pr-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-on-surface-variant">
                    <span className="material-symbols-outlined animate-spin text-3xl">refresh</span>
                    <p className="mt-2 text-sm">Loading volunteers...</p>
                  </td>
                </tr>
              ) : volunteers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-on-surface-variant">
                    <span className="material-symbols-outlined text-4xl mb-2">group_off</span>
                    <p>No volunteers found for this event.</p>
                  </td>
                </tr>
              ) : (
                volunteers.map((vol) => (
                  <tr key={vol.id} className="border-b border-outline-variant/10 hover:bg-surface-container-lowest transition-colors">
                    <td className="p-4 pl-6">
                      <div className="font-bold">{vol.name}</div>
                      <div className="text-xs text-on-surface-variant line-clamp-1 max-w-[200px]">
                        Skills: {vol.skills?.join(', ') || 'N/A'}
                      </div>
                    </td>
                    <td className="p-4 text-sm text-on-surface-variant">
                      <div>{vol.email}</div>
                      <div>{vol.phone}</div>
                    </td>
                    <td className="p-4 font-medium text-sm">
                      {vol.role}
                    </td>
                    <td className="p-4 text-sm">
                      {vol.total_tasks_completed} / {vol.total_tasks_assigned} completed
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`w-2 h-2 rounded-full ${
                          vol.status === 'active' ? 'bg-green-500' :
                          vol.status === 'accepted' ? 'bg-blue-500' :
                          'bg-yellow-500'
                        }`} />
                        <span className="text-sm font-bold capitalize">{vol.status}</span>
                      </div>
                      <div className="text-xs text-on-surface-variant">
                        {vol.total_hours_logged || 0} hrs logged
                      </div>
                    </td>
                    <td className="p-4 pr-6 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => toggleCheckIn(vol)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                            vol.checked_in 
                              ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20' 
                              : 'bg-green-500/10 text-green-500 hover:bg-green-500/20'
                          }`}
                        >
                          {vol.checked_in ? 'Check Out' : 'Check In'}
                        </button>
                        <button
                          onClick={() => deleteVolunteer(vol.id)}
                          className="p-1.5 text-on-surface-variant hover:text-error hover:bg-error/10 rounded-lg transition-colors"
                          title="Remove Volunteer"
                        >
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Upload Modal */}
      <AnimatePresence>
        {showUploadModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-scrim/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-surface-container-lowest max-w-md w-full rounded-3xl p-6 shadow-xl border border-outline-variant/30"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">Import Volunteers</h3>
                <button onClick={() => setShowUploadModal(false)} className="material-symbols-outlined text-on-surface-variant hover:text-on-surface">
                  close
                </button>
              </div>

              <div className="space-y-4">
                <div className="p-8 border-2 border-dashed border-outline-variant rounded-2xl text-center hover:border-primary/50 transition-colors">
                  <input
                    type="file"
                    id="excel-upload"
                    accept=".xlsx,.xls,.csv"
                    className="hidden"
                    onChange={handleFileChange}
                    disabled={uploading}
                  />
                  <label htmlFor="excel-upload" className="cursor-pointer flex flex-col items-center">
                    <span className="material-symbols-outlined text-4xl text-primary mb-2">upload_file</span>
                    <span className="font-bold text-sm">Click to upload CSV or Excel</span>
                    <span className="text-xs text-on-surface-variant mt-1">.csv, .xls, .xlsx supported</span>
                  </label>
                </div>
                
                {file && (
                  <div className="bg-surface-container rounded-xl p-3 flex justify-between items-center text-sm">
                    <span className="font-bold truncate">{file.name}</span>
                    <button onClick={() => setFile(null)} className="material-symbols-outlined text-[18px] text-error">close</button>
                  </div>
                )}

                <div className="bg-secondary-container/50 p-4 rounded-xl">
                  <h4 className="text-sm font-bold mb-2 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px]">info</span>
                    Format Requirements
                  </h4>
                  <p className="text-xs text-on-surface-variant">
                    Required columns: name, email. <br/>
                    Optional columns: phone, role, skills, availability, emergency_contact_name, emergency_contact_phone
                  </p>
                  <a href="/volunteers_sample.csv" download className="text-xs text-primary font-bold mt-2 inline-block">
                    📥 Download Template
                  </a>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <button
                    onClick={() => setShowUploadModal(false)}
                    className="px-4 py-2 rounded-full font-bold text-sm bg-surface-container-high hover:bg-surface-container-highest"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpload}
                    disabled={!file || uploading}
                    className="px-4 py-2 rounded-full font-bold text-sm bg-primary text-on-primary disabled:opacity-50"
                  >
                    {uploading ? 'Processing...' : 'Upload List'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
        
        {/* Add Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8 bg-scrim/50 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-surface-container-lowest max-w-2xl w-full rounded-3xl p-6 shadow-xl border border-outline-variant/30 m-auto mt-20 md:mt-auto"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">Add Volunteer</h3>
                <button onClick={() => setShowAddModal(false)} className="material-symbols-outlined text-on-surface-variant hover:text-on-surface">
                  close
                </button>
              </div>

              <form onSubmit={handleCreateVolunteer} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold mb-1 ml-2 text-on-surface-variant">Name *</label>
                    <input required type="text" value={newVolunteer.name} onChange={e => setNewVolunteer({...newVolunteer, name: e.target.value})} className="w-full bg-surface-container px-4 py-3 rounded-2xl text-sm" placeholder="John Doe" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1 ml-2 text-on-surface-variant">Email *</label>
                    <input required type="email" value={newVolunteer.email} onChange={e => setNewVolunteer({...newVolunteer, email: e.target.value})} className="w-full bg-surface-container px-4 py-3 rounded-2xl text-sm" placeholder="john@example.com" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1 ml-2 text-on-surface-variant">Phone</label>
                    <input type="text" value={newVolunteer.phone} onChange={e => setNewVolunteer({...newVolunteer, phone: e.target.value})} className="w-full bg-surface-container px-4 py-3 rounded-2xl text-sm" placeholder="+91..." />
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1 ml-2 text-on-surface-variant">Role</label>
                    <input type="text" value={newVolunteer.role} onChange={e => setNewVolunteer({...newVolunteer, role: e.target.value})} className="w-full bg-surface-container px-4 py-3 rounded-2xl text-sm" placeholder="Security Lead" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1 ml-2 text-on-surface-variant">Skills (Press Enter to add)</label>
                  <div className="bg-surface-container p-2 rounded-2xl flex flex-wrap gap-2">
                    {newVolunteer.skills.map(skill => (
                      <span key={skill} className="px-3 py-1 bg-surface-container-highest rounded-full text-xs font-bold flex items-center gap-1">
                        {skill}
                        <button type="button" onClick={() => removeSkill(skill)} className="material-symbols-outlined text-[14px]">close</button>
                      </span>
                    ))}
                    <input
                      type="text"
                      value={skillInput}
                      onChange={e => setSkillInput(e.target.value)}
                      onKeyDown={handleAddSkill}
                      placeholder="Add a skill..."
                      className="bg-transparent border-none outline-none text-sm flex-1 min-w-[120px] px-2 py-1"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold mb-1 ml-2 text-on-surface-variant">Emergency Contact Name</label>
                    <input type="text" value={newVolunteer.emergencyContactName} onChange={e => setNewVolunteer({...newVolunteer, emergencyContactName: e.target.value})} className="w-full bg-surface-container px-4 py-3 rounded-2xl text-sm" placeholder="Jane Doe" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1 ml-2 text-on-surface-variant">Emergency Contact Phone</label>
                    <input type="text" value={newVolunteer.emergencyContactPhone} onChange={e => setNewVolunteer({...newVolunteer, emergencyContactPhone: e.target.value})} className="w-full bg-surface-container px-4 py-3 rounded-2xl text-sm" placeholder="+91..." />
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-8">
                  <button type="button" onClick={() => setShowAddModal(false)} className="px-6 py-3 rounded-full font-bold text-sm bg-surface-container-high hover:bg-surface-container-highest">
                    Cancel
                  </button>
                  <button type="submit" className="px-6 py-3 rounded-full font-bold text-sm bg-primary text-on-primary hover:shadow-lg hover:shadow-primary/20">
                    Add Volunteer
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
