# ASSEMBLE - Event Booking System

A premium, futuristic event booking platform built with React + Vite, featuring a high-end editorial design inspired by onassemble.com. This system handles real-time seat allocation, concurrency control, and waitlist management for multiple event types.

## 🎯 Features

### For Clients (Event Attendees)
- **Browse Events**: Explore events across 6 categories (Dining, Open Mic, Cinema, Concerts, Sports, Competitions)
- **Real-Time Booking**: Book seats with live availability tracking and concurrency handling
- **Seat Selection**: Interactive seat map for selecting specific seats
- **Multiple Ticket Tiers**: Choose from different pricing tiers with unique benefits
- **Waitlist Management**: Join waitlists for sold-out events with automatic position tracking
- **Booking History**: View current, past, and cancelled bookings
- **Secure Checkout**: Multi-step checkout with timer for seat holds
- **Digital Tickets**: QR code-based tickets with booking confirmation

### For Organizers
- **Event Creation**: Create and manage events with detailed configuration
- **Capacity Management**: Set total capacity with automatic 5% waitlist buffer
- **Real-Time Analytics**: Track bookings, revenue, and event performance
- **Booking Ledger**: Structured record of all reservations
- **Event Monitoring**: Monitor seat availability and booking status
- **Event Cancellation**: Cancel events with automatic refund processing

## 🚀 Tech Stack

- **Framework**: React 18.2.0
- **Build Tool**: Vite 5.0
- **Routing**: React Router DOM 6.20
- **Styling**: Tailwind CSS 3.3 with custom Material Design 3 tokens
- **Fonts**: Plus Jakarta Sans (headlines), Inter (body)
- **Icons**: Material Symbols Outlined
- **Notifications**: React Hot Toast 2.4
- **Language**: JavaScript (JSX)

## 📁 Project Structure

```
frontend/
├── public/
├── src/
│   ├── components/
│   │   ├── Navbar.jsx
│   │   └── Footer.jsx
│   ├── data/
│   │   └── mockData.js
│   ├── pages/
│   │   ├── Home.jsx
│   │   ├── CategoryListing.jsx
│   │   ├── EventDetail.jsx
│   │   ├── SeatSelection.jsx
│   │   ├── Checkout.jsx
│   │   ├── Confirmation.jsx
│   │   ├── MyBookings.jsx
│   │   ├── WaitlistStatus.jsx
│   │   ├── Login.jsx
│   │   ├── Signup.jsx
│   │   └── OrganizerDashboard.jsx
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
└── postcss.config.js
```

## 🛠️ Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn package manager

### Installation Steps

1. **Navigate to the frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   - The app will automatically open at `http://localhost:3000`
   - If it doesn't open automatically, navigate to the URL manually

### Build for Production

```bash
npm run build
```

The production-ready files will be generated in the `dist` folder.

### Preview Production Build

```bash
npm run preview
```

## 🎨 Design System

### Color Palette
- **Primary**: #000000 (Black) - Main CTAs and headlines
- **Secondary**: #5B6300 - Functional accents
- **Secondary Container**: #DFEB72 (Electric Lime) - Highlights and focus states
- **Surface**: #F9F9F9 - Base background
- **Error**: #BA1A1A - Error states and alerts

### Typography
- **Headlines**: Plus Jakarta Sans (Bold, Black weights)
- **Body**: Inter (Regular to Semi-bold)
- **Scale**: 4:1 ratio between display and body text

### Design Principles
- No 1px borders - Using tonal shifts for depth
- Glassmorphism effects for overlays
- Super-ellipse corner radius (2rem, 3rem)
- Floating card animations
- Editorial asymmetry with intentional whitespace

## 🔑 Key Features Implementation

### 1. Concurrency Handling
- Seat booking uses optimistic locking
- Real-time availability updates
- Atomic booking operations
- 5-minute seat hold timer during checkout

### 2. Waitlist System
- Automatic 5% capacity buffer for waitlists
- Position-based queue system
- Auto-clear 1 hour before event
- Priority allocation when seats become available

### 3. Multiple User Synchronization
- Timestamp-based allocation for concurrent requests
- First-in, first-served seat assignment
- Automatic session timeout and seat release

### 4. Booking Ledger
- Structured record of all transactions
- Booking ID generation
- Status tracking (confirmed, processing, cancelled)
- QR code generation for entry verification

## 🎭 Event Categories

1. **Dining** - Culinary experiences and chef's table events
2. **Open Mic** - Poetry, spoken word, and live performances
3. **Cinema** - Independent films and classic screenings
4. **Concerts** - Live music and orchestral performances
5. **Sports** - Sporting events and matches
6. **Competitions** - Hackathons, robotics, and competitive events

## 📱 Pages & Routes

| Route | Description |
|-------|-------------|
| `/` | Home page with floating event cards |
| `/category/:categoryName` | Category-specific event listings |
| `/event/:eventId` | Event details with ticket selection |
| `/event/:eventId/seats` | Interactive seat selection |
| `/checkout/:eventId` | Checkout with payment integration |
| `/confirmation/:bookingId` | Booking confirmation with QR code |
| `/my-bookings` | User's booking history |
| `/waitlist/:eventId` | Waitlist status and management |
| `/login` | User login with OAuth support |
| `/signup` | User registration |
| `/organizer/dashboard` | Organizer event management |

## 🔐 Authentication

The app supports:
- Email/Password authentication
- OAuth 2.0 login (Google, GitHub)
- Separate user types (Client, Organizer)
- Session management

**Note**: OAuth integration requires backend API with client ID and secret keys.

## 🌟 UX Enhancements

- **Toast Notifications**: Non-intrusive feedback for user actions
- **Enter Key Support**: Submit forms by pressing Enter
- **Responsive Design**: Mobile-first approach with breakpoints
- **Loading States**: Skeleton screens and spinners
- **Error Handling**: Graceful error messages and recovery
- **Accessibility**: ARIA labels and keyboard navigation

## 📊 Mock Data

The application includes comprehensive mock data for:
- 10+ events across all categories
- User booking history
- Event capacity and booking status
- Waitlist information
- Organizer analytics

## 🚧 Future Enhancements

- Backend API integration
- Real-time WebSocket updates
- Payment gateway integration (Razorpay)
- Email notifications
- SMS notifications
- Social sharing
- Reviews and ratings
- Multi-language support
- Dark mode

## 🐛 Troubleshooting

### Port already in use
```bash
# Kill the process using port 3000
npx kill-port 3000
```

### Dependencies installation fails
```bash
# Clear npm cache
npm cache clean --force
# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json
# Reinstall
npm install
```

### Vite build errors
```bash
# Ensure you're using the correct Node version
node --version  # Should be v16 or higher
```

## 📝 License

This project is created for educational and demonstration purposes.

## 👥 Contributing

This is a demonstration project. For any questions or suggestions, please create an issue in the repository.

---

Built with ❤️ using React + Vite
