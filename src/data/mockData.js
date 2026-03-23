// Mock data for the event booking system

export const categories = [
  {
    id: 'dining',
    name: 'Dining',
    icon: 'restaurant',
    description: 'Curated culinary experiences'
  },
  {
    id: 'open-mic',
    name: 'Open Mic',
    icon: 'mic',
    description: 'Spoken word and live performances'
  },
  {
    id: 'cinema',
    name: 'Cinema',
    icon: 'movie',
    description: 'Independent films and screenings'
  },
  {
    id: 'concerts',
    name: 'Concerts',
    icon: 'theater_comedy',
    description: 'Live music and performances'
  },
  {
    id: 'sports',
    name: 'Sports',
    icon: 'sports_basketball',
    description: 'Sporting events and matches'
  },
  {
    id: 'competitions',
    name: 'Competitions',
    icon: 'code',
    description: 'Hackathons and competitive events'
  }
]

export const events = [
  // Dining Events
  {
    id: '1',
    category: 'dining',
    title: "A Priori: The Chef's Secret Table Experience",
    venue: 'Upper West Side, Manhattan',
    date: '2024-11-24',
    time: '19:30 — 22:00',
    price: 245,
    status: 'available',
    capacity: 40,
    booked: 28,
    waitlist: 2,
    image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80',
    description: 'An intimate dining experience with a Michelin-starred chef. Limited to 40 guests for an unforgettable evening of culinary artistry.',
    tags: ['Michelin Star', 'Intimate'],
    attendees: 28,
    organizer: 'Chef Marcus Chen',
    ticketTiers: [
      { name: 'Standard', price: 245, available: 8, features: ['7-Course Menu', 'Wine Pairing', 'Chef Meet & Greet'] },
      { name: 'Premium', price: 345, available: 4, features: ['10-Course Menu', 'Premium Wine Pairing', 'Kitchen Tour', 'Recipe Book'] }
    ]
  },
  {
    id: '2',
    category: 'dining',
    title: 'Midnight in Kyoto: Omakase & Jazz',
    venue: 'Brooklyn Heights',
    date: '2024-11-25',
    time: '21:00 — 00:00',
    price: 180,
    status: 'waitlist',
    capacity: 24,
    booked: 24,
    waitlist: 8,
    image: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=800&q=80',
    description: 'A fusion of traditional Japanese omakase with live jazz performances.',
    tags: ['Pop-Up Series', 'Jazz'],
    attendees: 24,
    organizer: 'Sakura Collective',
    ticketTiers: [
      { name: 'Standard', price: 180, available: 0, features: ['Omakase Menu', 'Live Jazz'] }
    ]
  },
  {
    id: '3',
    category: 'dining',
    title: 'The Winter Harvest Banquet at Solaris',
    venue: 'Tribeca Rooftop',
    date: '2024-11-29',
    time: '18:00 — 22:30',
    price: 310,
    status: 'limited',
    capacity: 60,
    booked: 52,
    waitlist: 3,
    image: 'https://images.unsplash.com/photo-1555244162-803834f70033?w=800&q=80',
    description: 'Seasonal celebration featuring farm-to-table cuisine on a stunning rooftop venue.',
    tags: ['Seasonal Gala', 'Rooftop'],
    attendees: 52,
    organizer: 'Solaris Events',
    ticketTiers: [
      { name: 'Standard', price: 310, available: 8, features: ['Harvest Menu', 'Cocktails', 'Rooftop Access'] }
    ]
  },

  // Open Mic Events
  {
    id: '4',
    category: 'open-mic',
    title: 'Voice of Soho: Poetry & Spoken Word',
    venue: 'The Underground Stage, Soho',
    date: '2024-11-26',
    time: '20:00 — 23:00',
    price: 25,
    status: 'available',
    capacity: 80,
    booked: 45,
    waitlist: 0,
    image: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=800&q=80',
    description: 'An open platform for poets, storytellers, and spoken word artists.',
    tags: ['Open Mic', 'Poetry'],
    attendees: 45,
    organizer: 'Soho Arts Collective',
    ticketTiers: [
      { name: 'General Admission', price: 25, available: 35, features: ['Standing Room', 'Complimentary Drink'] },
      { name: 'Reserved Seating', price: 45, available: 10, features: ['Reserved Seat', 'Two Drinks'] }
    ]
  },

  // Cinema Events
  {
    id: '5',
    category: 'cinema',
    title: "Midnight Classics: Blade Runner (Director's Cut)",
    venue: 'The Roxy Cinema',
    date: '2024-11-27',
    time: '23:30 — 02:00',
    price: 20,
    status: 'available',
    capacity: 120,
    booked: 87,
    waitlist: 0,
    image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&q=80',
    description: 'Late-night screening of cinematic masterpieces in a vintage theater.',
    tags: ['Classic Film', 'Midnight'],
    attendees: 87,
    organizer: 'The Roxy',
    ticketTiers: [
      { name: 'Standard', price: 20, available: 33, features: ['Cinema Seat', 'Popcorn & Drink'] }
    ]
  },

  // Concert Events
  {
    id: '6',
    category: 'concerts',
    title: 'The Great Revival',
    venue: 'Royal Albert Hall',
    date: '2024-11-12',
    time: '19:00 — 22:00',
    price: 85,
    status: 'limited',
    capacity: 200,
    booked: 157,
    waitlist: 5,
    image: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=800&q=80',
    description: 'A transcendent evening of orchestral innovation and visual storytelling.',
    tags: ['Orchestra', 'Featured'],
    attendees: 157,
    organizer: 'Royal Philharmonic',
    ticketTiers: [
      { name: 'Standard', price: 85, available: 20, features: ['General Seating', 'Program Guide'] },
      { name: 'Premium', price: 145, available: 15, features: ['Premium Seating', 'Reception Access'] },
      { name: 'VIP', price: 295, available: 8, features: ['VIP Box', 'Meet & Greet', 'Signed Program'] }
    ]
  },
  {
    id: '7',
    category: 'concerts',
    title: 'Obsidian Jazz Lounge',
    venue: 'Soho',
    date: '2024-11-14',
    time: '20:00 — 23:00',
    price: 45,
    status: 'available',
    capacity: 60,
    booked: 38,
    waitlist: 0,
    image: 'https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=800&q=80',
    description: 'Intimate jazz performances in a vintage lounge setting.',
    tags: ['Jazz', 'Intimate'],
    attendees: 38,
    organizer: 'Obsidian Collective',
    ticketTiers: [
      { name: 'General', price: 45, available: 22, features: ['Standing/Lounge', 'One Drink'] }
    ]
  },

  // Sports Events
  {
    id: '8',
    category: 'sports',
    title: 'Premier League: Chelsea vs Arsenal',
    venue: 'Stamford Bridge',
    date: '2024-12-01',
    time: '15:00 — 17:00',
    price: 120,
    status: 'available',
    capacity: 40000,
    booked: 35420,
    waitlist: 450,
    image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&q=80',
    description: 'London derby match between two historic rivals.',
    tags: ['Football', 'Derby'],
    attendees: 35420,
    organizer: 'Chelsea FC',
    ticketTiers: [
      { name: 'General', price: 120, available: 2580, features: ['Stadium Seat'] },
      { name: 'Club', price: 250, available: 180, features: ['Club Seat', 'Lounge Access'] }
    ]
  },

  // Competition Events
  {
    id: '9',
    category: 'competitions',
    title: 'Neural Link 2024: AI Hackathon',
    venue: 'Tech Hub Central',
    date: '2024-12-04',
    time: '09:00 — 21:00',
    price: 50,
    status: 'available',
    capacity: 200,
    booked: 143,
    waitlist: 12,
    image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&q=80',
    description: 'A multi-city hackathon pushing the boundaries of spatial computing and neural interfaces.',
    tags: ['Hackathon', 'AI'],
    attendees: 143,
    organizer: 'TechCon Global',
    ticketTiers: [
      { name: 'Individual', price: 50, available: 45, features: ['Event Access', 'Meals', 'Swag Bag'] },
      { name: 'Team (4)', price: 180, available: 12, features: ['Team Workspace', 'Meals', 'Mentorship'] }
    ]
  },
  {
    id: '10',
    category: 'competitions',
    title: 'RoboWars Championship Finals',
    venue: 'Innovation Arena',
    date: '2024-12-10',
    time: '14:00 — 20:00',
    price: 35,
    status: 'available',
    capacity: 500,
    booked: 312,
    waitlist: 0,
    image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&q=80',
    description: 'Championship finals featuring the best combat robots from around the world.',
    tags: ['Robotics', 'Competition'],
    attendees: 312,
    organizer: 'RoboWars Inc',
    ticketTiers: [
      { name: 'General', price: 35, available: 188, features: ['Arena Seating', 'Program'] }
    ]
  }
]

export const userBookings = [
  {
    id: 'ASM-92840-X',
    eventId: '6',
    status: 'confirmed',
    seats: ['F-12', 'F-13'],
    tier: 'Premium',
    quantity: 2,
    totalPrice: 290,
    bookingDate: '2024-10-15',
    qrCode: 'https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=ASM-92840-X'
  },
  {
    id: 'ASM-11029-Y',
    eventId: '7',
    status: 'processing',
    seats: ['A-5'],
    tier: 'General',
    quantity: 1,
    totalPrice: 45,
    bookingDate: '2024-10-18',
    qrCode: 'https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=ASM-11029-Y'
  },
  {
    id: 'ASM-77213-Z',
    eventId: '1',
    status: 'confirmed',
    seats: ['Table-3'],
    tier: 'Standard',
    quantity: 2,
    totalPrice: 490,
    bookingDate: '2024-10-20',
    qrCode: 'https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=ASM-77213-Z'
  }
]

export const waitlistData = [
  {
    id: 'WAIT-001',
    eventId: '2',
    position: 3,
    status: 'active',
    joinedDate: '2024-10-22',
    estimatedWait: '2-3 days'
  }
]
