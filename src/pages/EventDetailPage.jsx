import { Link, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import api from '../services/api'
const sectionVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] } }
}

const avatarUrls = [
  'https://lh3.googleusercontent.com/aida-public/AB6AXuD7kFXr9KRrvQpErzgwHW942fd6GDbi4q-8c238u6t-vzrJOjcwK1YBTZSNHIZlnUUR4iKU3PgTrWhwBu85SwjV1ilgiOy8R5M_u0z_-mdudH66IDHb_QKMRinYfrdxQNu1rMHpsFlOiMsNurOVsR_gj5GKqAdDhsL50Cqh-ZyE8g_ABFyHDiqeVlVCsJFX2YEDLbTZ3Tc_8zd90U5tCq9W_4Yb9nVibFb1Hc28axuEO6fe3Hsto6EH_8KnDLJjY5FXOi833Y4MYr0',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCHOtCxv6cciPQsEnZOPkAQ1wQ5qf_gKsSCrwp5BrU6Cg70RV7xd6kpWEv28Hk3prQDTJMJiuRjbpPfoKEmDLn8Ynb1aaSVCJusg1DK24AIAKwx9gB2nF0TaKa_evPmw3SPJvrhHGTZevuoVYp0traRsxXxMwDWNTpgeEVuUWaGYpCsv5WK59m1-hyvC2A0QGVl5PsOM3mozZCAz8btmGHoHR-oLSUbnFLmkS553y6Qv6iXxSR3vM6ETeisgM3QiybyTFC6tRXYCVo',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCXFCbmXhCz4tGawC8CqYXBU3PB23YoYoB4ymtG7RWfKvNaE9AozbapHi_Y3kq8eh0koFGFzhV89jYbwltEkROhp9V6RJqFLFzDW-PQj2SCEArr4RaGAjYg-2WMAGWXWFapHvPYxBuxzIA3v_1UOS0iq48zDDtn8BUbxr3Qe2TaQoS3PISpyOz-nczunKDQ7k53kbVc17M1zrL7Mv0oP2IZm_6cbzKD-9JMoJpU0QeWNmWfg94sTD2D9OFEagKgn_noZ0n4Yv_fW78',
]

const reviewers = [
  { name: 'Elena Vance', role: 'Architect, Oct 2023', stars: 5, review: '"The curation at Utsova is unmatched. It\'s not just a talk; it\'s a sensory dive into the future of our craft."', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCq4FIT0-UI8XQNhgjy3LKCCmzRKCwPK8TRPUGzEBvr-GEql3cD4rkoOKASJv8pY6MFxwrgCrtC_cKCsLZ0PrTnZamghQR2TVYwu2kT278A8UG67xTrI_GmV4t7OTHvazWcG_3BvHUKEZddFtKJtzjnSMYOHbN-hbFQivQzaJAuKdssGmOHrL-HJrp-Q-KmX7kC6prM0-5nvgqa7kdKm87YdEfqOG8DEzipwYEBvrOa0Tq_S-R02WIB20FWMrEHnegPsEHzaKlonv0' },
  { name: 'Marcus Thorne', role: 'Structural Engineer, Sep 2023', stars: 5, review: '"High density of information. The networking opportunities alone are worth the Professional ticket price."', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuATRQlPTq5VbAbXvMUTka1EuXSlCNkmc64akX3IprKlYTJbZ_SL9bMazNXgoA1QpoKRyHldpu4oIcN_Av_ksfcsP-8f4W_ctSdXuqbXGxMckSH1rqKlnvDSWPe10gBP81vHTlyrvpsp8bV2BVwYEK1pjOsMg5OpYEaxN2x5lLZicE_FSVXp-UjteH73rhHAQMJltdL7ay87IZ9mf6TG3GxxY_8xDxCyPuwApM9WfQJ_d3M9_THHZimpFoRVDj9fOdbGVExr_fTuqek' },
  { name: 'Sasha Gray', role: 'Urban Designer, Nov 2023', stars: 4, review: '"Visually stunning venue. The Concrete Gallery is the perfect backdrop for these discussions."', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAqRnIrw7KyYWYrE7k-nLNlrpxZKytwHFCR_tJSUTrdRJ-N_PjImDqFoj6vdliCw3lSg5uwt8kKtNfKY9I3OsR8TVDIIqTAlnbCt-OMMnBbYLONy1cICTIE5LQSaFiXZjd3tMhwTUslDigvb9Ipw1NOwGUg_OHsoDBQovzeAcomw3vaiRjXbb2WOM4kexUz9u2qBw9djBZ6NkUskQXNoLT8cl5zfqL_OMU_wSW5hy90yfks-JEbF8rs46ZFJ5kttO7Y43Kn7F6oLIE' },
]

export default function EventDetailPage() {
  const { id } = useParams()
  const [event, setEvent] = useState(null)
  const [error, setError] = useState(false)
  
  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await api.get(`/events/${id}`)
        setEvent(res.data)
      } catch (err) {
        console.error(err)
        setError(true)
      }
    }
    fetchEvent()
  }, [id])

  if (error) {
    return (
      <div className="min-h-[80vh] flex flex-col gap-4 items-center justify-center text-center px-4">
        <span className="material-symbols-outlined text-6xl text-error mb-4">cloud_off</span>
        <h2 className="font-bold text-2xl mb-2">Failed to load event</h2>
        <p className="text-on-surface-variant max-w-md">The backend could not fetch this event's details. Please verify your connection.</p>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="min-h-[80vh] flex flex-col gap-4 items-center justify-center font-bold text-xl text-on-surface-variant">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        Loading event details...
      </div>
    )
  }

  const selectionPath = `/event/${event.id}/select`

  return (
    <div className="max-w-screen-2xl mx-auto px-6 md:px-12 pt-8 pb-32">
      {/* Hero Section */}
      <motion.section
        className="bg-surface-container-lowest rounded-xl overflow-hidden flex flex-col lg:flex-row gap-0 lg:gap-12 p-4 lg:p-8 mb-12"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="w-full lg:w-1/2 aspect-[4/5] lg:aspect-auto">
          <img className="w-full h-full object-cover rounded-lg shadow-sm" alt="Event space" src={event.cover_image || 'https://images.pexels.com/photos/976866/pexels-photo-976866.jpeg?auto=compress&cs=tinysrgb&w=800&h=800&dpr=2'} />
        </div>
        <div className="w-full lg:w-1/2 py-8 lg:py-4 flex flex-col justify-center">
          <span className="inline-block bg-secondary-container text-on-secondary-fixed px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase mb-6 w-max">
            {event.category}
          </span>
          <h1 className="font-[family-name:var(--font-family-headline)] text-5xl md:text-7xl font-extrabold tracking-tighter mb-8 leading-[0.9]">
            {event.title}
          </h1>
          <div className="flex flex-wrap gap-8 mb-10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center">
                <span className="material-symbols-outlined text-primary">location_on</span>
              </div>
              <div>
                <p className="text-xs text-on-surface-variant font-medium">VENUE</p>
                <p className="font-bold">{event.venue_name || 'India Event Venue'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center">
                <span className="material-symbols-outlined text-primary">calendar_today</span>
              </div>
              <div>
                <p className="text-xs text-on-surface-variant font-medium">DATE &amp; TIME</p>
                <p className="font-bold">{new Date(event.start_datetime).toLocaleString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4 mb-8 p-4 rounded-lg bg-surface-container-low w-max">
            <div className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center">
              <span className="material-symbols-outlined text-primary">business</span>
            </div>
            <div>
              <p className="text-xs text-on-surface-variant">ORGANIZED BY</p>
              <p className="font-bold">{event.organization_name || 'Assemble Organizer'}</p>
            </div>
          </div>
          <p className="text-on-surface-variant text-lg leading-relaxed mb-10 max-w-xl">
            {event.description}
          </p>
          <div className="flex items-center gap-3">
            <div className="flex -space-x-3">
              {avatarUrls.map((url, i) => (
                <img key={i} className="w-10 h-10 rounded-full border-4 border-surface-container-lowest object-cover" alt="Attendee" src={url} />
              ))}
              <div className="w-10 h-10 rounded-full border-4 border-surface-container-lowest bg-surface-container-high flex items-center justify-center text-[10px] font-bold">+184</div>
            </div>
            <span className="text-sm font-medium text-on-surface-variant italic">Attending this event</span>
          </div>
        </div>
      </motion.section>

      {/* Availability Bar */}
      <motion.section className="mb-20" variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
        <div className="bg-surface-container-low p-8 rounded-lg flex flex-col md:flex-row items-center gap-8 shadow-sm">
          <div className="flex-1 w-full">
            <div className="flex justify-between mb-4">
              <span className="font-bold flex items-center gap-2">
                <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>confirmation_number</span>
                Live Availability
              </span>
              <span className="font-bold text-error">{event.total_capacity - event.total_sold} remaining</span>
            </div>
            <div className="w-full h-3 bg-surface-container-highest rounded-full overflow-hidden">
              <div
                className={`h-full ${((event.total_capacity - event.total_sold) / event.total_capacity) < 0.3 ? 'bg-error' : 'bg-primary'}`}
                style={{ width: `${Math.max(5, (event.total_sold / event.total_capacity) * 100)}%` }}
              />
            </div>
          </div>
          {((event.total_capacity - event.total_sold) / event.total_capacity) < 0.3 && (
            <div className="bg-error-container text-on-error-container px-4 py-2 rounded-full text-xs font-bold animate-pulse">
              Selling out fast
            </div>
          )}
        </div>
      </motion.section>

      {/* Ticket Tiers */}
      <motion.section className="mb-24" variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
          <div>
            <h2 className="font-[family-name:var(--font-family-headline)] text-4xl font-extrabold tracking-tight mb-2">Ticket Tiers</h2>
            <p className="text-on-surface-variant">Select the experience that fits your vision.</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {event.ticket_tiers && event.ticket_tiers.map((tier, idx) => (
            <motion.div key={tier.tier_id || idx} className={`p-8 rounded-lg flex flex-col border border-transparent shadow-sm transition-all group ${idx === 1 ? 'bg-primary text-on-primary shadow-2xl scale-105 relative z-10' : 'bg-surface-container-lowest hover:border-outline-variant'} `} whileHover={{ y: -5 }}>
              {idx === 1 && <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-secondary-container text-on-secondary-fixed px-4 py-1 rounded-full text-[10px] font-black tracking-widest uppercase">Most Popular</div>}
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h3 className="text-2xl font-black mb-1">{tier.tier_name}</h3>
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${tier.available_quantity > 10 ? 'bg-green-500' : 'bg-error'}`} />
                    <span className="text-xs font-bold uppercase tracking-wider opacity-70">
                      {tier.available_quantity > 10 ? 'Available' : 'Limited Space'}
                    </span>
                  </div>
                </div>
                <p className="text-3xl font-black">₹{tier.price}</p>
              </div>
              <ul className="space-y-4 mb-12 flex-grow">
                {tier.perks && tier.perks.length > 0 ? tier.perks.map((p, i) => (
                  <li key={i} className="flex items-center gap-3 opacity-90">
                    <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                    {p}
                  </li>
                )) : <li className="text-sm opacity-80">Access to all general areas</li>}
              </ul>
              <Link to={selectionPath}><button className={`w-full py-4 rounded-full font-bold transition-all ${idx === 1 ? 'bg-secondary-container text-on-secondary-fixed hover:brightness-110' : 'border-2 border-primary hover:bg-primary hover:text-on-primary'}`}>Select</button></Link>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Reviews */}
      <motion.section className="mb-12" variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
        <h2 className="font-[family-name:var(--font-family-headline)] text-4xl font-extrabold tracking-tight mb-12">Alumni Echoes</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviewers.map(r => (
            <motion.div key={r.name} className="bg-surface-container-low p-8 rounded-lg" whileHover={{ y: -4, boxShadow: '0 12px 30px rgba(0,0,0,0.06)' }}>
              <div className="flex items-center gap-4 mb-6">
                <img className="w-12 h-12 rounded-full object-cover" alt={r.name} src={r.img} />
                <div><p className="font-bold">{r.name}</p><p className="text-xs text-on-surface-variant">{r.role}</p></div>
              </div>
              <div className="flex gap-1 mb-4 text-primary">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span key={i} className="material-symbols-outlined text-sm" style={{ fontVariationSettings: i < r.stars ? "'FILL' 1" : "'FILL' 0" }}>star</span>
                ))}
              </div>
              <p className="text-on-surface-variant italic">{r.review}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Sticky Bottom Bar */}
      <div className="fixed bottom-0 left-0 w-full z-50 p-6">
        <div className="max-w-4xl mx-auto glass rounded-full px-10 py-5 shadow-[0_32px_64px_rgba(26,28,28,0.08)] flex justify-between items-center">
          <div className="flex flex-col">
            <p className="text-[10px] font-black tracking-widest text-on-surface-variant uppercase">Starting From</p>
            <p className="text-2xl font-black">₹{event.min_price?.toFixed(2)}</p>
          </div>
          <div className="hidden sm:flex items-center gap-4 bg-surface-container-low px-6 py-2 rounded-full">
            <span className="material-symbols-outlined text-on-surface-variant">person</span>
            <span className="font-bold text-sm">1 Adult</span>
            <span className="material-symbols-outlined text-primary text-sm cursor-pointer">expand_more</span>
          </div>
          <Link to={selectionPath}>
            <button className="bg-primary text-on-primary px-8 py-3.5 rounded-full font-bold flex items-center gap-3 hover:scale-[0.98] transition-all">
              Book Now
              <span className="material-symbols-outlined text-lg">arrow_forward</span>
            </button>
          </Link>
        </div>
      </div>
    </div>
  )
}
