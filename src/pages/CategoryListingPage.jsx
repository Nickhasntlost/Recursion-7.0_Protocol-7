import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'

const cardHover = {
  rest: { y: 0, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' },
  hover: { y: -6, boxShadow: '0 20px 40px rgba(0,0,0,0.08)', transition: { duration: 0.3, ease: 'easeOut' } }
}

const avatarUrls = [
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBui7wRyNhmPpprBqnjS4uY1YxLKZaLISSPzDl-QR8s2j5AJjSCat7wumW3vH9dFA42SuqgPUhVXJLvfCGSiU8hJ4Jhy0exv_anFmPRNUc4Zx5PLKPMIzfKWMkHH9sZlJZ1rAtW0A03Fa1K34a-NeGa7EnuY9GPQHugXh0NFNAuxoLvG0DQL9Q2guA4ib-J7zfEMHLEe4XqaiXx7ZNw8cvmtrzKVoTSeB3_MXP3YN9AzKSktYnBmVYO2bnsk5VA5_lWkTDlgey5-i4',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCW7RpMtxO7Adqrpc-7JgEckpTQoX3U99DkdZxWcs0mzOC3w8mXnir-wpUjWadr9PfRuDWXwP5eip9VUgt5gaY0wMcvlWy_cj4jzoAByDc1koTmW24OjGE7bTEjdmtLX1YjW1VMxntFeEiMU6G7P2n6T73KtE9OEyNswjimnV78kLywHmRgX8mND10dk5CuAKtwe7mGfmjzG1H1Pg96Y7u7bQdhBKydUfvc0e3ne8OfH3sBYiQ0ckXRuJnDgo4egj6XsFpQ0kgtG1I',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAoSXqwLej5Kg-0b4_eWwJKnKRxjfb4RSYLvrkJHzAQKPaf05JriIZQMB3WslSTNPeRuWjuSqyP0lKd3gy3HD3zf3uG0vrruiA--TBFz6XI_VUF2tA7bzpKi8OYquqAZuUlBXkJIOva8y68GS_3hfOOq0dj5--231CrpyLog4yKjN5vPvkeRDV2M2qSbwn8kbppZV9APYJBygL-2rjs0Q1HL1IJgpfhEkKCPR_u_l_w1xSpL4SbyUOvG7s8FKxRKSJNCox6Z6r4q0E',
]

// Category configs with all combined data
const categoryConfigs = {
  dining: {
    title: 'Dining',
    description: "An editorial selection of the city's most elusive culinary experiences, from private chef tables to ephemeral pop-ups.",
    label: 'Michelin Star',
    theme: 'light',
    layout: 'editorial-detailed-grid',
    cards: [
      {
        id: 1,
        title: "A Priori: The Chef's Secret Table Experience",
        location: 'Upper West Side, Manhattan',
        date: 'Sat, Nov 24',
        time: '19:30 — 22:00',
        price: '₹245',
        people: 12,
        bookable: true,
        badge: 'Michelin Star',
        available: true,
        availableLabel: 'Available',
      },
      {
        id: 2,
        title: 'Midnight in Kyoto: Omakase & Jazz',
        location: 'Brooklyn Heights',
        date: 'Sun, Nov 25',
        time: '21:00 — 00:00',
        price: '₹180',
        people: 4,
        bookable: false,
        badge: 'Pop-Up Series',
        available: false,
        availableLabel: 'Waitlist Only',
      },
      {
        id: 3,
        title: 'The Winter Harvest Banquet at Solaris',
        location: 'Tribeca Rooftop',
        date: 'Thu, Nov 29',
        time: '18:00 — 22:30',
        price: '₹310',
        people: 42,
        bookable: true,
        badge: 'Seasonal Gala',
        available: true,
        availableLabel: 'Limited',
      },
    ]
  },
  cinema: {
    title: 'Cinema',
    description: 'Curated films for the modern observer. A selection of masterpieces spanning independent visions and timeless classics.',
    label: 'Featured Collection',
    theme: 'dark',
    layout: 'film-grid',
    cards: [
      { id: 1, title: 'Neon Echoes', genre: 'Drama', rating: '8.4 IMDb', director: 'Dir. Aris Thorne', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAb8Es7x6Y9mahFV8oTneGdy8ze6zpq-8rtCfh8cJWQPOq1opDL8GeHMgDZjm_8tT1KKMhkfu0EIuA9dA-AF8f04lTx04xL4jonI2tK7YmQ658pDgHmrjp4ayH1mBa5e09VI6bJOwbGIK-u22O6UFLe1-P9JD1uLomONGpqKfh3Dx9ywOnHUGgsSv5PbKQnenC9XgXkEyHwQdkBhlVhuoiWCu1x77PlQrNviMy_Vj3zM6SuMcAJ2fe0LXFdZgrgbcigtRDCh7tSuyo' },
      { id: 2, title: 'Silent Grid', genre: 'Noir', rating: '9.1 IMDb', director: 'Dir. Elena Volkov', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAWghKhr1K_uI6hYmBKEzOQ8Mx337vKbTf0qPCXwSRbOXYTZomi_fPtSq5v1JI8a35xhonTQcB3zXCZxpaqksDpCbWrk_J40aN3zL2Q3xiZI4RX1vW6JG0P7mDSbsWcR0Nfh5BYiptMnnHuXlBm3rnYTEXwvywhKU0_Rlj003CR5viTghz_8nAbJ5hRYV79UaAs36UDZhbNaSOCnjQqQ4_A5bY6yQWYO__vtSBAJiyMjT7ZehjfvgokVHaVgDQqWm-hG0w2gHMxXoE' },
      { id: 3, title: 'The Archive', genre: 'Classics', rating: 'R', director: 'Dir. Julian Mare', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB97HT6EJBJgetkvqFS9sgpLC1WbvYo46Rzm-ZDrDv3eDBzKK7isxklwqY0RFSHDemWJ6YcklNJ8ZsHsZiIzE63MWZNu_wABikCFuQ1fbFXhaKOEdr55d1JbGVoqJPQoTZzUgYxTrLzbJA4ezXvh-IRFXHoVgD6bgAPni9OQDdbsK2j3U_FdsYCqXZLKa4a1lZkRkoij-iZu2aByy0WKubnKhJSI1fm9Er5z8_NBHaCA6ppatx2hd8cKOhbhKrvF0datjz3Y5ylfCQ' },
      { id: 4, title: 'Visionaries', genre: 'Documentary', rating: '94% RT', director: 'Dir. Sarah Chen', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAvF_YoEQeK5ua2N1rvA6dSOwFKV2ppBdjykgLOuPIgYuDjlh_SKg6nxx9fgjWhs-7l47DPn4P72P-2glY18tutNMCSv64R7vRLwjKhPXwhwCaMUwuztLPUzDV8ZSL93tYN3XvtxawHDseSbRE6aGWlGX3bdxqOYB3mkez9gcf6pkVBk7qyu3qsMg2VuVvBjYq4cmRuTIYGatsO4QVp05mpS2BUteNDSn301VFmNEedPA_YSlxYKxqwhFChDz_jsDXxUs9oHK62vAQ' },
    ]
  },
  comedy: {
    title: 'Comedy',
    description: "A collection of the city's sharpest wits.",
    label: 'Featured Artist',
    theme: 'light',
    layout: 'masonry',
    cards: [
      { id: 1, title: 'Laughter Therapy.', artist: 'Alex Rivera', quote: '"If life gives you lemons, just hope they\'re not thrown at you during a set."', featured: true, image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDFJ6gv9EAG0hZ9VT15yXXJdsksHVqi6ya4DoGlhcG5fBfoW9MHWoWpKIrpqNcCJYG4Hh6JjwUE9qOnyddriP450O6Hrdoi5mfeOW7FF9oV_0GDqt0gZsknoDCkzvqz1IQeifahlM6i8DYQpH1n7gIQD1eoNnxSmfsvhCz6Vb1zYEluDm2zg95M6CCKji0bjHlWmOyv4FuzlZAqUdEWUvwODieH-DjWJdCyUGqttRcFIe6Ol4-0ZkMJuc2IiehFexLWHrhJLAr1VZM' },
      { id: 2, title: 'The Roast Master.', artist: 'Mila Kunis Jr.', note: 'Every Friday at The Cellar', accent: true },
    ]
  },
  concerts: {
    title: 'Concerts',
    description: 'Resonant performances in iconic spaces. A curated journal of sonic experiences, from underground basements to architectural marvels.',
    label: 'Category',
    theme: 'light',
    layout: 'editorial-journal',
  },
  hackathons: {
    title: 'Hackathons',
    description: 'Architecting the future, line by line.',
    label: 'Protocol',
    theme: 'light',
    layout: 'brutalist-grid',
    cards: [
      { id: 1, title: 'Neural Mesh 2024', status: 'OPEN', desc: 'Building decentralized inference engines for large scale LLM deployment.', prize: '$150,000', icon: 'terminal', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC7gmCS6LO7vHsuAgKX9jfDqDZ7qU7JrWlUSzv3UjOjeqM88FFzPPihGg1A0bdiZ0eWrtLVNmak6rB2Wt8qyXEIcmXTfDqDZ7qU7JrWlUSzv3UjOjeqM88FFzPPihGg1A0bd' },
      { id: 2, title: 'Zero-Knowledge Summit', status: 'FEATURED', desc: 'Optimizing circuits for non-interactive proofs.', prize: '$300,000', icon: 'lock', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA1MdHxzfyFuvKqt6R8PfzDG11SNA8qbuxb3f3GVoCen6J9elJK_28lOWAxtAQJXw9emXbvg0ol_k5aoXxU4B52-OpP_JbioLYs5HTDQD0NhgXQMrrGTU5fH0BmvThuPDWS' },
    ]
  },
  'open-mic': {
    title: 'Open Mic',
    description: 'Unfiltered voices in curated intimate settings.',
    label: 'Acoustic',
    theme: 'light',
    layout: 'polaroid-grid',
    cards: [
      { id: 1, title: 'Lia Thorne', time: '8pm', genre: 'Acoustic', desc: 'Raw storytelling through a weathered Gibson.', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBJjARU0u-XYYa0kF8cgOFYOWYrvNid-_T--DKvSEoaQyCqoXchpqAzA837xGY1dRZPhY6ssHSqp7aIwEL5-cbUlLy3F3VRn5h4V_Mni_cA3uEyl8ltuYBSgbj7uswCZ626o7S_oW9y17znxnK2jaJxrMD-etVtKJkUJJ8GVQCKAueQ7ZQxE624WOVZRQNKi1wA-hrYF5DIwZlg1SxJJop60F9sJ8go2OQUBUVLnriUrhFtPzii7jsNSg7EfeV-sepD4x8giM3e_8k' },
      { id: 2, title: 'Marcus V.', time: '9:15pm', genre: 'Slam Poetry', desc: 'Three-time regional champion exploring intersection of urban rhythm.', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDsLf8fUhPcEWycW4uaA-T6eUKX47YxkIG6Xe2FZ8MKVQFc1s537Ccd6Cqf2KqLH8MgGDezCLc8F0iLSWNJQ2bI7T7T7JaMqwvhlOjYHgMOuZq8J8wnALTxb3KCZBafR-I4Jg9FqzKL-YOs8KHfFLHPE1Hdt4xEttc82ThWrI7YkFNSWFG-fzSJoZEJI4bpjpNH4uHLH3hjPiY-kpMuNzTKVhxBSVSSo49u-mxz6W3xeiKldTDsGAsD6MqOHLyKAclYEtJ7T28tAls' },
      { id: 3, title: 'The Glitch', time: '10:30pm', genre: 'Experimental', desc: 'Found sounds and modular synthesis exploration.', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBbdn0ouRDOrYJtindMbf9nl4OrCLRaUmjIX4a7nH-04kLNwN1uBsqVarWZtfIbQXBkFzsL9KP8BVBWi1eMim6bMdVc4gP6OH0hzOT3uMjjh3boLdmT3xLwE21SZyIh3lCp0kGW5kEztKgV7Y0ox-mRsURcn361N4nq96Rh1AA5qQ6mXayV-GqCLAYskeys8zpI_4Yr728fmRgWiavGGCauVHerbj_cEH-IWox9ANbhyovoQLLVLqNz6-RyM61QWzP3CbHU5ZmAL9A' },
      { id: 4, title: 'Jada Blue', time: '8:45pm', genre: 'Jazz Soul', desc: 'Velvet tones and deep improvisations reinterpreting jazz classics.', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCsEHa_lzhNhgmozpGHHHZ2f5me7Tjwa6Iv3YsKKohpC8w5pD04JsH7SChjrA_ZZlWiFZI0dEii2YlrVqCn9XDNNz0hNnGaEHjJy-ezi01ntIPbPdUKNadxF9pZcR2lNDGh3eg1yN2H0q8ruL7vhtSEi90fzd4l_8d9gQ1Dh9W6wv6N-9v3uefOAn-1meqtsTEub82TB4UwHf7oa1JpuZEg04hrsSoQhHwaOTy-hlWFo3trp6ap1KxHWFlxxSYk-xZ-WDpy29cWbV8' },
    ]
  },
  sports: {
    title: 'Sports',
    description: 'Precision, power, and kinetic excellence.',
    label: 'Live Updates',
    theme: 'light',
    layout: 'sports-featured',
    cards: [
      { id: 1, title: 'Aquatic Velocity Open', sport: 'Precision Water', time: '47.2s', bpm: '172', rank: '#1', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC6AcD1S7JuZM1s9c7bwjBiCMDyQZ9kY6pGNX8F8WnzzJSdDZpwyFdt9Guuk6p5nQr7N9HZovE5fJovweq-7KCuqxLxQRHCnyMdI-G6wBUVlKSmE_uMcOHEapd4f_Rkms4hbl7npJPHJXQR1711N0P-fuYYI5JIwrksE5ER-N6Gaa1EUqnzOsPBEW8vP1AQxPLj2UX8qyevUlkipbZnlnJnRKgerT9gWcxokgkFOzwgGpRx0dicR31Jkbwq00COP_PFSwoaV-b0kYA' },
      { id: 2, title: 'Grand Track Masters', sport: 'Kinetic Force', athlete: 'K. Thompson', time: '9.82s', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBivROCYab4q8BhJD6SOwx0NV_bY4qRtbMKvyjO_6uZS6TlGVhayI5xHu7ksGmAXvl3PAlu1MEObJ_eWV1MwawCbEJ45MMEVn9PDdjB57jHs_mWPEB0XZKdU59hZzqa6NuWHSq9Dl_hgttqVhXWes6TKx1DbM_dbdGx9aH12GDg7hfj5NLCN1NLoZBoS2gqpG9gJghl7o4wtjAVk4o6yex3vCHtkczeXb7cB4Ho1fXB56NA-0ogJIQR-o3kYrhrQaAxsXbECY3mlC0' },
    ]
  }
}

// Layout Components

const DetailedGridComponent = ({ config }) => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {config.cards.map((card, i) => (
        <motion.article
          key={card.title}
          className="bg-white rounded-xl p-8 shadow-sm transition-all duration-500 border border-transparent hover:border-surface-container-highest group flex flex-col h-full"
          variants={cardHover}
          initial="rest"
          whileHover="hover"
        >
          <div className="flex justify-between items-start mb-6">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-widest text-secondary">{card.badge}</span>
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  <img className="w-8 h-8 rounded-full border-2 border-white object-cover" src={avatarUrls[0]} alt="" />
                  <img className="w-8 h-8 rounded-full border-2 border-white object-cover" src={avatarUrls[(i + 1) % 3]} alt="" />
                  <div className="w-8 h-8 rounded-full border-2 border-white bg-surface-container-high flex items-center justify-center text-[10px] font-bold text-black">+{card.people}</div>
                </div>
              </div>
            </div>
            <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase flex items-center gap-1.5 ${card.available ? 'bg-secondary-container text-on-secondary-fixed' : 'bg-surface-container-high text-on-surface-variant'}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${card.available ? 'bg-on-secondary-fixed animate-pulse' : 'bg-on-surface-variant/30'}`} />
              {card.availableLabel}
            </div>
          </div>
          <h3 className="text-2xl font-black leading-tight mb-6 flex-grow text-black">{card.title}</h3>
          <div className="space-y-3 mb-8">
            <div className="flex items-center gap-3 text-on-surface-variant">
              <span className="material-symbols-outlined text-lg">location_on</span>
              <span className="text-sm font-medium">{card.location}</span>
            </div>
            <div className="flex items-center gap-3 text-on-surface-variant">
              <span className="material-symbols-outlined text-lg">calendar_today</span>
              <span className="text-sm font-medium">{card.date}</span>
            </div>
            <div className="flex items-center gap-3 text-on-surface-variant">
              <span className="material-symbols-outlined text-lg">schedule</span>
              <span className="text-sm font-medium">{card.time}</span>
            </div>
          </div>
          <div className="flex items-center justify-between mt-auto pt-6 border-t border-surface-container text-black">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest opacity-40 block">{card.bookable ? 'From' : 'Price'}</span>
              <span className="text-xl font-black">{card.price}</span>
            </div>
            <Link to={card.bookable ? '/event/great-revival' : '/waitlist'}>
              <button className={`px-6 py-3 rounded-full font-bold text-sm flex items-center gap-2 active:scale-95 transition-transform ${card.bookable ? 'bg-black text-white' : 'bg-surface-container-high text-on-surface hover:bg-surface-container-highest'}`}>
                {card.bookable ? 'Book Now' : 'Join Waitlist'}
                {card.bookable && <span className="material-symbols-outlined text-sm">arrow_forward</span>}
              </button>
            </Link>
          </div>
        </motion.article>
      ))}
    </div>
  </motion.div>
)

const CinemaLayout = ({ config }) => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
      {config.cards.map((card, idx) => (
        <motion.article
          key={card.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.1 }}
          className="group relative flex flex-col cursor-pointer"
        >
          <div className="aspect-[2/3] w-full overflow-hidden rounded-xl bg-zinc-900 relative">
            <img src={card.image} alt={card.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent flex flex-col justify-end p-8">
              <div className="flex items-center gap-2 mb-4">
                <span className="px-3 py-1 bg-secondary-container text-on-secondary-fixed text-[10px] font-black uppercase tracking-widest rounded-full">{card.genre}</span>
                <span className="px-3 py-1 bg-white/10 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-widest rounded-full">{card.rating}</span>
              </div>
              <h3 className="text-3xl font-headline font-extrabold tracking-tighter mb-1 text-white">{card.title}</h3>
              <p className="text-sm text-zinc-300 font-medium">{card.director}</p>
            </div>
          </div>
        </motion.article>
      ))}
    </div>
  </motion.div>
)

const ComedyLayout = ({ config }) => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }} className="space-y-12">
    {config.cards.map((card, idx) => (
      <motion.div key={card.id} initial={{ opacity: 0, x: idx % 2 ? 20 : -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.15 }}>
        {card.featured ? (
          <div className="bg-surface-container-lowest text-black rounded-xl overflow-hidden relative group">
            <div className="h-[400px] w-full bg-surface-container-high overflow-hidden">
              <img alt={card.title} src={card.image} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
            </div>
            <div className="p-8 relative">
              <div className="absolute -top-6 right-8 bg-secondary-container text-on-secondary-fixed px-4 py-2 rounded-full font-bold text-xs uppercase tracking-widest">Selling Fast</div>
              <h3 className="font-headline text-4xl font-black leading-none mb-4 -ml-4 -rotate-1 origin-left">{card.title}</h3>
              <p className="text-on-surface-variant italic mb-6">{card.quote}</p>
              <div className="flex items-center justify-between">
                <span className="font-bold text-lg">{card.artist}</span>
                <button className="bg-primary text-on-primary w-12 h-12 rounded-full flex items-center justify-center group-hover:translate-x-1 transition-transform">
                  <span className="material-symbols-outlined">arrow_forward</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-secondary-container p-8 rounded-xl text-black">
            <h3 className="font-headline text-5xl font-black tracking-tighter leading-none mb-8">{card.title}</h3>
            <p className="font-bold text-on-secondary-fixed">{card.artist || 'Featured Artist'}</p>
            <p className="text-on-secondary-fixed-variant text-sm">{card.note}</p>
          </div>
        )}
      </motion.div>
    ))}
  </motion.div>
)

const HackathonsLayout = ({ config }) => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {config.cards.map((card, idx) => (
        <motion.div
          key={card.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.15 }}
          className="bg-surface-container-lowest text-black border-2 border-black flex flex-col hover:translate-x-1 hover:-translate-y-1 transition-transform bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
        >
          <div className="h-48 bg-surface-container-low relative overflow-hidden">
            <img src={card.image} alt={card.title} className="w-full h-full object-cover grayscale contrast-125" />
            <div className="absolute top-4 left-4 bg-primary text-on-primary font-mono text-xs px-2 py-1">STATUS: {card.status}</div>
          </div>
          <div className="p-6 flex-grow flex flex-col">
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-headline text-2xl font-extrabold uppercase leading-tight">{card.title}</h3>
              <span className="material-symbols-outlined">{card.icon}</span>
            </div>
            <p className="text-on-surface-variant font-mono text-sm mb-6 flex-grow">{card.desc}</p>
            <div className="border-t-2 border-black pt-4">
              <div className="flex justify-between font-mono text-xs uppercase mb-2">
                <span>Prize Pool</span>
                <span className="font-bold text-secondary">{card.prize}</span>
              </div>
            </div>
            <button className="mt-6 w-full border-2 border-black py-3 font-headline font-black uppercase hover:bg-secondary-container transition-colors">Register →</button>
          </div>
        </motion.div>
      ))}
    </div>
  </motion.div>
)

const OpenMicLayout = ({ config }) => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 lg:gap-20 items-start">
      {config.cards.map((card, idx) => (
        <motion.div
          key={card.id}
          initial={{ opacity: 0, rotate: idx % 2 ? 3 : -2 }}
          animate={{ opacity: 1, rotate: 0 }}
          transition={{ delay: idx * 0.1 }}
          className="flex flex-col gap-6"
        >
          <div className="bg-surface-container-lowest text-black p-4 pb-12 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:rotate-0 transition-transform" style={{ transform: `rotate(${idx % 2 ? 3 : -2}deg)` }}>
            <div className="aspect-square bg-surface-container overflow-hidden mb-6">
              <img alt={card.title} src={card.image} className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500" />
            </div>
            <div className="px-2">
              <p className="text-3xl font-light text-on-surface-variant italic">{card.title} / {card.time}</p>
            </div>
          </div>
          <div className="px-4">
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="bg-secondary-container text-on-secondary-fixed px-4 py-1 rounded-full text-xs font-bold tracking-widest uppercase">{card.genre}</span>
            </div>
            <p className="text-on-surface-variant leading-relaxed">{card.desc}</p>
          </div>
        </motion.div>
      ))}
    </div>
  </motion.div>
)

const SportsLayout = ({ config }) => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
      {config.cards.map((card, idx) => (
        <motion.div
          key={card.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.15 }}
          className="bg-surface-container-low rounded-xl overflow-hidden flex flex-col"
        >
          <div className="relative h-64 overflow-hidden">
            <img src={card.image} alt={card.title} className="w-full h-full object-cover" />
            <div className="absolute top-4 right-4 bg-white/70 backdrop-blur px-4 py-2 rounded-full flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-secondary"></span>
              <span className="text-[10px] font-black uppercase tracking-widest text-black">{card.sport}</span>
            </div>
          </div>
          <div className="p-8 flex-1 flex flex-col justify-between">
            <div>
              <h3 className="text-3xl font-black font-headline tracking-tight text-primary mb-2">{card.title}</h3>
            </div>
            <div className="grid grid-cols-3 gap-4 mt-8">
              {card.time && <div className="bg-white p-4 rounded-lg"><span className="text-[10px] font-bold text-on-surface-variant uppercase block mb-1">Time</span><span className="text-xl font-black font-headline text-black">{card.time}</span></div>}
              {card.bpm && <div className="bg-white p-4 rounded-lg"><span className="text-[10px] font-bold text-on-surface-variant uppercase block mb-1">BPM</span><span className="text-xl font-black font-headline text-black">{card.bpm}</span></div>}
              {card.rank && <div className="bg-secondary-container p-4 rounded-lg"><span className="text-[10px] font-bold text-on-secondary-fixed-variant uppercase block mb-1">Rank</span><span className="text-xl font-black font-headline text-on-secondary-fixed">{card.rank}</span></div>}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  </motion.div>
)

const ConcertsLayout = ({ config }) => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }} className="space-y-12">
    <div className="bg-surface-container-lowest text-black rounded-xl overflow-hidden">
      <div className="flex flex-col md:flex-row">
        <div className="w-full md:w-2/5 aspect-square overflow-hidden">
          <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuCsQ66GPsa7v1hyGeWL1dxIfO4ZHTwgBCbSSGIvrVb9TMCuMsd5Tl1-EMPQCKYb_JqZwvMa4YzWuuWnsfH8pNyZthhLtT2yOdSBG7zEvPzePR2QHdOhfHHWVCugbRQrVe00UcVRY6RmV27GyBqmKQ9lMdNjkcUYmTnC6keSGs5_RztKPbKMXCIoRYtCHStvvdWR7kjM1IQlHPb5zWpmlgAmUza1fS3xSWv0e25ietMRWEYKuCkOYN0RS4Em0oZxYesvFh9cut-V2Rs" alt="Concert" className="w-full h-full object-cover" />
        </div>
        <div className="flex-1 p-8 md:p-12">
          <div className="flex items-center gap-4 mb-6"><span className="bg-black text-white px-4 py-1 rounded-full text-[10px] font-bold uppercase">Live Performance</span><span className="text-secondary">May 24, 2024</span></div>
          <h2 className="text-4xl md:text-5xl font-headline font-black tracking-tight mb-8">Velvet Echoes: The Orchestral Session</h2>
          <div className="space-y-4 mb-8"><div><span className="text-[10px] font-black uppercase tracking-widest text-black/40">Set Times</span><ul className="space-y-2 mt-4"><li className="flex justify-between border-b border-outline-variant/10 pb-2"><span>Doors Open</span><span className="font-bold">19:30</span></li><li className="flex justify-between border-b border-outline-variant/10 pb-2"><span>Opening Act</span><span className="font-bold">20:15</span></li><li className="flex justify-between border-b border-outline-variant/10 pb-2"><span>Velvet Echoes</span><span className="font-bold">21:30</span></li></ul></div></div>
          <div className="flex items-center justify-between pt-8 border-t"><div className="text-2xl font-black">$45.00 — $120.00</div><button className="px-8 py-4 bg-primary text-white rounded-full font-bold hover:opacity-90 flex items-center gap-2">Reserve Seat <span className="material-symbols-outlined">arrow_forward</span></button></div>
        </div>
      </div>
    </div>
  </motion.div>
)

export default function CategoryListingPage() {
  const { slug } = useParams()
  const config = categoryConfigs[slug] || categoryConfigs.dining

  const renderLayout = () => {
    switch (config.layout) {
      case 'editorial-detailed-grid':
        return <DetailedGridComponent config={config} />
      case 'film-grid':
        return <CinemaLayout config={config} />
      case 'masonry':
        return <ComedyLayout config={config} />
      case 'brutalist-grid':
        return <HackathonsLayout config={config} />
      case 'polaroid-grid':
        return <OpenMicLayout config={config} />
      case 'sports-featured':
        return <SportsLayout config={config} />
      case 'editorial-journal':
        return <ConcertsLayout config={config} />
      default:
        return <DetailedGridComponent config={config} />
    }
  }

  return (
    <div className={`min-h-screen ${config.theme === 'dark' ? 'bg-black text-white' : 'bg-surface text-black'}`}>
      <div className="max-w-screen-2xl mx-auto px-6 md:px-12 pt-32 pb-24 flex gap-12">
        {/* Left Sidebar Layout extracted from Stash */}
        <aside className="hidden lg:block w-[240px] flex-shrink-0 sticky top-32 h-[calc(100vh-8rem)] overflow-y-auto no-scrollbar">
          <div className="space-y-10">
            <section>
              <h3 className="text-xs font-black uppercase tracking-[0.2em] mb-6 text-on-surface-variant">Filter</h3>
              <div className="relative group">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-neutral-400">near_me</span>
                <select className={`w-full pl-12 pr-4 py-3 border-none rounded-full text-sm font-bold appearance-none focus:ring-2 focus:ring-secondary-container transition-all cursor-pointer ${config.theme === 'dark' ? 'bg-zinc-900 text-white' : 'bg-surface-container-low text-black'}`}>
                  <option>New York, NY</option>
                  <option>London, UK</option>
                  <option>Paris, FR</option>
                  <option>Mumbai, IN</option>
                  <option>Goa, IN</option>
                </select>
              </div>
            </section>
          </div>
        </aside>

        {/* Dynamic Category Main Layout */}
        <motion.main
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="flex-1 min-w-0"
        >
          <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-16">
            <div className="inline-block px-4 py-1 bg-secondary-container text-on-secondary-fixed rounded-full text-xs font-bold tracking-widest uppercase mb-4">{config.label}</div>
            <h1 className={`text-6xl md:text-8xl font-headline font-black tracking-tighter mb-6`}>{config.title}</h1>
            <p className={`text-xl md:text-2xl max-w-2xl font-light ${config.theme === 'dark' ? 'text-zinc-400' : 'text-on-surface-variant'}`}>{config.description}</p>
          </motion.section>

          {renderLayout()}

          {/* Pagination Component Extracted from Stash */}
          <div className="mt-20 flex items-center justify-center gap-4">
            <button className={`w-12 h-12 rounded-full border flex items-center justify-center transition-all ${config.theme === 'dark' ? 'border-zinc-800 hover:bg-zinc-800 text-zinc-400 hover:text-white' : 'border-surface-container-high hover:bg-white text-neutral-400 hover:text-black hover:shadow-md'}`}>
               <span className="material-symbols-outlined">chevron_left</span>
            </button>
            <div className="flex items-center gap-2">
               <button className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-sm ${config.theme === 'dark' ? 'bg-white text-black' : 'bg-black text-white'}`}>1</button>
               <button className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-sm transition-colors ${config.theme === 'dark' ? 'hover:bg-zinc-900' : 'hover:bg-surface-container-low'}`}>2</button>
               <button className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-sm transition-colors ${config.theme === 'dark' ? 'hover:bg-zinc-900' : 'hover:bg-surface-container-low'}`}>3</button>
               <span className="px-2 opacity-30 tracking-widest font-black">...</span>
               <button className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-sm transition-colors ${config.theme === 'dark' ? 'hover:bg-zinc-900' : 'hover:bg-surface-container-low'}`}>12</button>
            </div>
            <button className={`w-12 h-12 rounded-full border flex items-center justify-center transition-all ${config.theme === 'dark' ? 'border-zinc-800 hover:bg-zinc-800 text-zinc-400 hover:text-white' : 'border-surface-container-high hover:bg-white text-neutral-400 hover:text-black hover:shadow-md'}`}>
               <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="mt-20 text-center">
            <Link to="/" className="inline-block px-8 py-4 bg-primary text-white rounded-full font-bold hover:opacity-90 transition-opacity">
              &larr; Back to Home
            </Link>
          </motion.div>
        </motion.main>
      </div>
    </div>
  )
}
