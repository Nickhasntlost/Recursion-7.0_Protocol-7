import { useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { events, categories } from '../data/mockData'

const CategoryListing = () => {
  const { categoryName } = useParams()
  const navigate = useNavigate()
  const [filteredEvents, setFilteredEvents] = useState([])
  const [timelineFilter, setTimelineFilter] = useState('Today')
  const [priceMin, setPriceMin] = useState('')
  const [priceMax, setPriceMax] = useState('')
  const [availabilityFilter, setAvailabilityFilter] = useState('available')

  const category = categories.find(cat => cat.id === categoryName)

  useEffect(() => {
    const filtered = events.filter(event => {
      const matchesCategory = event.category === categoryName
      const matchesAvailability = availabilityFilter === 'all' || event.status === availabilityFilter
      const matchesPrice = (!priceMin || event.price >= parseInt(priceMin)) &&
                          (!priceMax || event.price <= parseInt(priceMax))
      return matchesCategory && matchesAvailability && matchesPrice
    })
    setFilteredEvents(filtered)
  }, [categoryName, availabilityFilter, priceMin, priceMax])

  const handleEventClick = (eventId) => {
    navigate(`/event/₹{eventId}`)
  }

  return (
    <div className="bg-surface text-on-surface">
      <Navbar />

      <main className="pt-24 min-h-screen flex max-w-screen-2xl mx-auto px-8 gap-12">
        {/* Left Sidebar (FILTER) */}
        <aside className="hidden md:block w-[240px] flex-shrink-0 pt-8 pb-12 sticky top-24 h-[calc(100vh-6rem)] overflow-y-auto no-scrollbar">
          <div className="space-y-10">
            <section>
              <h3 className="text-xs font-black uppercase tracking-[0.2em] mb-6 text-on-surface-variant">Filter</h3>

              {/* City Selector */}
              <div className="relative group">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-neutral-400">
                  near_me
                </span>
                <select className="w-full pl-12 pr-4 py-3 bg-surface-container-low border-none rounded-full text-sm font-bold appearance-none focus:ring-2 focus:ring-secondary-container transition-all cursor-pointer">
                  <option>New York, NY</option>
                  <option>London, UK</option>
                  <option>Paris, FR</option>
                </select>
              </div>
            </section>

            <section>
              <h4 className="text-[10px] font-bold uppercase tracking-widest mb-4 opacity-50">Timeline</h4>
              <div className="flex flex-wrap gap-2">
                {['Today', 'Weekend', 'Next Week'].map(time => (
                  <button
                    key={time}
                    onClick={() => setTimelineFilter(time)}
                    className={`px-4 py-2 rounded-full text-xs font-bold transition-transform active:scale-95 ₹{
                      timelineFilter === time
                        ? 'bg-primary text-on-primary'
                        : 'bg-surface-container-high text-on-surface hover:bg-surface-container-highest'
                    }`}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </section>

            <section>
              <h4 className="text-[10px] font-bold uppercase tracking-widest mb-4 opacity-50">Price Range</h4>
              <div className="flex items-center gap-2">
                <input
                  className="w-full px-4 py-2 bg-surface-container-low border-none rounded-full text-xs font-bold focus:ring-2 focus:ring-secondary-container"
                  placeholder="Min"
                  type="text"
                  value={priceMin}
                  onChange={(e) => setPriceMin(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && e.target.blur()}
                />
                <span className="text-neutral-300">—</span>
                <input
                  className="w-full px-4 py-2 bg-surface-container-low border-none rounded-full text-xs font-bold focus:ring-2 focus:ring-secondary-container"
                  placeholder="Max"
                  type="text"
                  value={priceMax}
                  onChange={(e) => setPriceMax(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && e.target.blur()}
                />
              </div>
            </section>

            <section>
              <div className="flex items-center justify-between p-1 bg-surface-container-low rounded-full">
                <button
                  onClick={() => setAvailabilityFilter('available')}
                  className={`flex-1 py-2 text-[10px] font-black uppercase tracking-tighter rounded-full ₹{
                    availabilityFilter === 'available'
                      ? 'bg-secondary-container text-on-secondary-fixed'
                      : 'text-neutral-400'
                  }`}
                >
                  Available Only
                </button>
                <button
                  onClick={() => setAvailabilityFilter('all')}
                  className={`flex-1 py-2 text-[10px] font-black uppercase tracking-tighter rounded-full ₹{
                    availabilityFilter === 'all'
                      ? 'bg-secondary-container text-on-secondary-fixed'
                      : 'text-neutral-400'
                  }`}
                >
                  All Events
                </button>
              </div>
            </section>
          </div>
        </aside>

        {/* Main Listing Area */}
        <div className="flex-1 pt-8 pb-20">
          {/* Breadcrumb & Title */}
          <nav className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-4">
            <button onClick={() => navigate('/')} className="hover:text-primary transition-colors">Home</button>
            <span className="opacity-30">/</span>
            <span className="text-primary">{category?.name || categoryName}</span>
          </nav>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <h1 className="text-6xl font-black tracking-tighter font-headline capitalize">{category?.name || categoryName}</h1>
            <div className="flex items-center gap-6">
              <span className="text-[10px] font-bold uppercase tracking-widest opacity-50">Sort By</span>
              <button className="flex items-center gap-2 font-black text-sm group">
                Recommended
                <span className="material-symbols-outlined text-sm group-hover:translate-y-0.5 transition-transform">
                  expand_more
                </span>
              </button>
            </div>
          </div>

          {/* Event Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
            {filteredEvents.map((event) => (
              <article
                key={event.id}
                onClick={() => handleEventClick(event.id)}
                className="bg-white rounded-xl p-8 shadow-sm hover:shadow-xl transition-all duration-500 border border-transparent hover:border-surface-container-highest group flex flex-col h-full cursor-pointer"
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-secondary">
                      {event.tags[0]}
                    </span>
                    <div className="flex items-center gap-3">
                      <div className="flex -space-x-2">
                        <div className="w-8 h-8 rounded-full border-2 border-white bg-zinc-200"></div>
                        <div className="w-8 h-8 rounded-full border-2 border-white bg-zinc-200"></div>
                        <div className="w-8 h-8 rounded-full border-2 border-white bg-surface-container-high flex items-center justify-center text-[10px] font-bold">
                          +{event.attendees}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase flex items-center gap-1.5 ₹{
                    event.status === 'available'
                      ? 'bg-secondary-container text-on-secondary-fixed'
                      : event.status === 'waitlist'
                      ? 'bg-surface-container-high text-on-surface-variant'
                      : 'bg-error-container text-on-error-container'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ₹{
                      event.status === 'available'
                        ? 'bg-on-secondary-fixed animate-pulse'
                        : event.status === 'waitlist'
                        ? 'bg-on-surface-variant/30'
                        : 'bg-error'
                    }`}></span>
                    {event.status === 'available' ? 'Available' : event.status === 'waitlist' ? 'Waitlist Only' : 'Limited'}
                  </div>
                </div>

                <h3 className="text-2xl font-black leading-tight mb-6 flex-grow font-headline">{event.title}</h3>

                <div className="space-y-3 mb-8">
                  <div className="flex items-center gap-3 text-on-surface-variant">
                    <span className="material-symbols-outlined text-lg">location_on</span>
                    <span className="text-sm font-medium">{event.venue}</span>
                  </div>
                  <div className="flex items-center gap-3 text-on-surface-variant">
                    <span className="material-symbols-outlined text-lg">calendar_today</span>
                    <span className="text-sm font-medium">
                      {new Date(event.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-on-surface-variant">
                    <span className="material-symbols-outlined text-lg">schedule</span>
                    <span className="text-sm font-medium">{event.time}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-auto pt-6 border-t border-surface-container">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest opacity-40 block">
                      {event.status === 'waitlist' ? 'Price' : 'From'}
                    </span>
                    <span className="text-xl font-black">₹{event.price}</span>
                  </div>
                  <button className={`px-6 py-3 rounded-full font-bold text-sm flex items-center gap-2 group/btn active:scale-95 transition-transform ₹{
                    event.status === 'waitlist'
                      ? 'bg-surface-container-high text-on-surface hover:bg-surface-container-highest'
                      : 'bg-black text-white'
                  }`}>
                    {event.status === 'waitlist' ? 'Join Waitlist' : 'Book Now'}
                    <span className="material-symbols-outlined text-sm group-hover/btn:translate-x-1 transition-transform">
                      arrow_forward
                    </span>
                  </button>
                </div>
              </article>
            ))}
          </div>

          {/* Pagination */}
          <div className="mt-20 flex items-center justify-center gap-4">
            <button className="w-12 h-12 rounded-full border border-surface-container-high flex items-center justify-center hover:bg-white hover:shadow-md transition-all text-neutral-400 hover:text-black">
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            <div className="flex items-center gap-2">
              <button className="w-12 h-12 rounded-full flex items-center justify-center font-black text-sm bg-black text-white">
                1
              </button>
              <button className="w-12 h-12 rounded-full flex items-center justify-center font-black text-sm hover:bg-surface-container-low transition-colors">
                2
              </button>
              <button className="w-12 h-12 rounded-full flex items-center justify-center font-black text-sm hover:bg-surface-container-low transition-colors">
                3
              </button>
              <span className="px-2 opacity-30 tracking-widest font-black">...</span>
              <button className="w-12 h-12 rounded-full flex items-center justify-center font-black text-sm hover:bg-surface-container-low transition-colors">
                12
              </button>
            </div>
            <button className="w-12 h-12 rounded-full border border-surface-container-high flex items-center justify-center hover:bg-white hover:shadow-md transition-all text-neutral-400 hover:text-black">
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default CategoryListing
