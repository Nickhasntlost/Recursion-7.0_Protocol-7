import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { categories, events } from '../data/mockData'

const Home = () => {
  const navigate = useNavigate()

  const featuredEvent = events[5] // The Great Revival

  const handleCategoryClick = (categoryId) => {
    navigate(`/category/₹{categoryId}`)
  }

  const handleEventClick = (eventId) => {
    navigate(`/event/₹{eventId}`)
  }

  return (
    <div className="bg-surface text-on-surface selection:bg-secondary-container selection:text-on-secondary-container">
      <Navbar />

      <main className="pt-20">
        {/* Hero Section */}
        <section className="px-4 md:px-8 mb-20 relative overflow-hidden">
          <div className="relative w-full h-[870px] rounded-xl bg-surface-container-low flex items-center justify-center text-center">
            {/* Floating Elements - Left Side */}
            <div
              className="absolute left-[5%] top-[20%] animate-float-slow hidden lg:block cursor-pointer"
              onClick={() => handleCategoryClick('dining')}
            >
              <div className="floating-element bg-white p-6 rounded-2xl rotate-[-12deg] flex flex-col items-center gap-3">
                <span className="material-symbols-outlined text-3xl text-primary">restaurant</span>
                <span className="text-[10px] font-black uppercase tracking-widest">Dining</span>
              </div>
            </div>

            <div
              className="absolute left-[12%] bottom-[25%] animate-float-delayed hidden lg:block cursor-pointer"
              onClick={() => handleCategoryClick('cinema')}
            >
              <div className="floating-element bg-white p-5 rounded-2xl rotate-[8deg] flex flex-col items-center gap-3">
                <span className="material-symbols-outlined text-3xl text-primary">movie</span>
                <span className="text-[10px] font-black uppercase tracking-widest">Cinema</span>
              </div>
            </div>

            <div
              className="absolute left-[18%] top-[45%] animate-float hidden lg:block cursor-pointer"
              onClick={() => handleCategoryClick('open-mic')}
            >
              <div className="floating-element bg-secondary-container p-6 rounded-2xl rotate-[-5deg] flex flex-col items-center gap-3">
                <span className="material-symbols-outlined text-3xl text-on-secondary-container" style={{ fontVariationSettings: "'FILL' 1" }}>
                  mic
                </span>
                <span className="text-[10px] font-black uppercase tracking-widest">Open Mic</span>
              </div>
            </div>

            {/* Right Side */}
            <div
              className="absolute right-[8%] top-[25%] animate-float hidden lg:block cursor-pointer"
              onClick={() => handleCategoryClick('concerts')}
            >
              <div className="floating-element bg-white p-6 rounded-2xl rotate-[15deg] flex flex-col items-center gap-3">
                <span className="material-symbols-outlined text-3xl text-primary">theater_comedy</span>
                <span className="text-[10px] font-black uppercase tracking-widest">Concerts</span>
              </div>
            </div>

            <div
              className="absolute right-[15%] bottom-[30%] animate-float-slow hidden lg:block cursor-pointer"
              onClick={() => handleCategoryClick('competitions')}
            >
              <div className="floating-element bg-white p-5 rounded-2xl rotate-[-10deg] flex flex-col items-center gap-3">
                <span className="material-symbols-outlined text-3xl text-primary">code</span>
                <span className="text-[10px] font-black uppercase tracking-widest">Hackathons</span>
              </div>
            </div>

            <div
              className="absolute right-[20%] top-[55%] animate-float-delayed hidden lg:block cursor-pointer"
              onClick={() => handleCategoryClick('sports')}
            >
              <div className="floating-element bg-white p-6 rounded-2xl rotate-[5deg] flex flex-col items-center gap-3">
                <span className="material-symbols-outlined text-3xl text-primary">sports_basketball</span>
                <span className="text-[10px] font-black uppercase tracking-widest">Sports</span>
              </div>
            </div>

            {/* Central Content */}
            <div className="relative z-10 max-w-4xl px-8 flex flex-col items-center">
              <span className="inline-block px-4 py-1.5 rounded-full bg-secondary-container text-on-secondary-fixed text-xs font-bold tracking-widest uppercase mb-8">
                Few Spots Left
              </span>
              <h1 className="text-6xl md:text-[7.5rem] font-black tracking-tighter text-black leading-[0.9] mb-8 font-headline">
                {featuredEvent.title}
              </h1>
              <p className="text-xl md:text-2xl text-on-surface-variant font-medium max-w-2xl mx-auto mb-10 leading-relaxed">
                {featuredEvent.description}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-8 mb-12">
                <div className="flex items-center gap-2 text-black">
                  <span className="material-symbols-outlined text-primary">calendar_month</span>
                  <span className="font-bold text-lg">{new Date(featuredEvent.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                </div>
                <div className="flex items-center gap-2 text-black">
                  <span className="material-symbols-outlined text-primary">location_on</span>
                  <span className="font-bold text-lg">{featuredEvent.venue}</span>
                </div>
              </div>
              <button
                onClick={() => handleEventClick(featuredEvent.id)}
                className="group flex items-center gap-3 px-12 py-6 bg-primary text-white rounded-full font-bold text-xl hover:scale-[0.97] transition-all shadow-xl shadow-primary/20"
              >
                Book Experience
                <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">
                  arrow_forward
                </span>
              </button>
            </div>

            {/* Carousel Navigation Indicators */}
            <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex gap-4">
              <div className="w-16 h-1.5 bg-primary rounded-full"></div>
              <div className="w-16 h-1.5 bg-outline-variant rounded-full opacity-30 hover:opacity-50 transition-opacity cursor-pointer"></div>
              <div className="w-16 h-1.5 bg-outline-variant rounded-full opacity-30 hover:opacity-50 transition-opacity cursor-pointer"></div>
            </div>
          </div>
        </section>

        {/* Category Selector */}
        <section className="max-w-[1440px] mx-auto px-8 mb-24">
          <h2 className="text-3xl font-black mb-10 tracking-tight font-headline">Browse by Category</h2>
          <div className="flex flex-wrap gap-4">
            {categories.map((category, index) => (
              <button
                key={category.id}
                onClick={() => handleCategoryClick(category.id)}
                className={`flex items-center gap-3 px-8 py-5 rounded-full transition-all group ₹{
                  index === 1
                    ? 'bg-secondary-container text-on-secondary-fixed shadow-lg shadow-secondary-container/20 scale-105'
                    : 'bg-surface-container-low hover:bg-surface-container-high'
                }`}
              >
                <span
                  className={`material-symbols-outlined ₹{index === 1 ? '' : 'text-primary'}`}
                  style={index === 1 ? { fontVariationSettings: "'FILL' 1" } : {}}
                >
                  {category.icon}
                </span>
                <span className="font-bold">{category.name}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Trending Near You */}
        <section className="max-w-[1440px] mx-auto px-8 mb-24">
          <div className="flex justify-between items-end mb-10">
            <h2 className="text-4xl font-black tracking-tight font-headline">Trending Near You</h2>
            <button className="text-sm font-bold underline decoration-2 underline-offset-8 decoration-secondary-container hover:text-secondary-container transition-colors">
              See All Experiences
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {events.slice(0, 6).map((event) => (
              <div
                key={event.id}
                onClick={() => handleEventClick(event.id)}
                className="bg-white border border-outline-variant p-8 rounded-[2rem] shadow-sm hover:shadow-xl transition-all group flex flex-col gap-6 cursor-pointer"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-1">
                      {event.venue} • {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </p>
                    <h3 className="text-2xl font-black leading-tight font-headline">{event.title}</h3>
                  </div>
                  <div className="flex -space-x-3">
                    <div className="w-8 h-8 rounded-full border-2 border-white bg-zinc-100"></div>
                    <div className="w-8 h-8 rounded-full border-2 border-white bg-zinc-100"></div>
                  </div>
                </div>

                <div className={`inline-flex self-start items-center gap-2 px-3 py-1 rounded-full text-xs font-black uppercase ₹{
                  event.status === 'available'
                    ? 'bg-secondary-container/20 text-secondary'
                    : event.status === 'limited'
                    ? 'bg-error-container text-on-error-container'
                    : 'bg-surface-container-high text-on-surface-variant'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ₹{
                    event.status === 'available'
                      ? 'bg-secondary animate-pulse'
                      : event.status === 'limited'
                      ? 'bg-error'
                      : 'bg-outline'
                  }`}></span>
                  {event.status === 'available' ? 'Available' : event.status === 'limited' ? 'Limited' : event.status === 'waitlist' ? 'Waitlist Only' : 'Sold Out'}
                </div>

                <div className="mt-auto pt-6 flex justify-between items-center border-t border-outline-variant/30">
                  <span className="text-lg font-black">₹{event.price}</span>
                  <button className="px-6 py-2 bg-primary text-white text-xs font-black rounded-full hover:scale-95 transition-transform">
                    Book Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Upcoming Events */}
        <section className="bg-surface py-32 px-8">
          <div className="max-w-[1440px] mx-auto">
            <div className="mb-16">
              <span className="text-primary font-black tracking-widest uppercase text-xs mb-4 block">
                Curated Movement
              </span>
              <h2 className="text-5xl font-black tracking-tighter font-headline">Upcoming Global Events</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="bg-white border border-outline-variant p-10 rounded-[3rem] flex flex-col md:flex-row gap-10 hover:shadow-2xl transition-all">
                <div className="w-full md:w-1/2 aspect-square rounded-[2rem] overflow-hidden">
                  <img
                    alt="Hackathon event"
                    className="w-full h-full object-cover"
                    src={events[8].image}
                  />
                </div>
                <div className="w-full md:w-1/2 flex flex-col">
                  <div className="flex justify-between items-center mb-6">
                    <span className="px-4 py-1.5 bg-secondary-container text-on-secondary-fixed text-[10px] font-black uppercase rounded-full">
                      {new Date(events[8].date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  <h4 className="text-3xl font-black mb-2 font-headline">{events[8].title}</h4>
                  <p className="text-on-surface-variant text-sm mb-8">{events[8].description}</p>
                  <button
                    onClick={() => handleEventClick(events[8].id)}
                    className="mt-auto w-full py-4 bg-primary text-white font-black rounded-full hover:scale-95 transition-all"
                  >
                    Apply to Participate
                  </button>
                </div>
              </div>

              <div className="bg-primary text-white p-10 rounded-[3rem] flex flex-col md:flex-row gap-10 hover:shadow-2xl transition-all">
                <div className="w-full md:w-1/2 aspect-square rounded-[2rem] overflow-hidden">
                  <img
                    alt="Concert event"
                    className="w-full h-full object-cover"
                    src={events[6].image}
                  />
                </div>
                <div className="w-full md:w-1/2 flex flex-col">
                  <div className="flex justify-between items-center mb-6">
                    <span className="px-4 py-1.5 bg-secondary-container text-on-secondary-fixed text-[10px] font-black uppercase rounded-full">
                      {new Date(events[6].date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                    <span className="material-symbols-outlined">auto_awesome</span>
                  </div>
                  <h4 className="text-3xl font-black mb-2 text-white font-headline">{events[6].title}</h4>
                  <p className="text-zinc-400 text-sm mb-8">{events[6].description}</p>
                  <button
                    onClick={() => handleEventClick(events[6].id)}
                    className="mt-auto w-full py-4 bg-white text-black font-black rounded-full hover:scale-95 transition-all"
                  >
                    Reserve Slot
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

export default Home
