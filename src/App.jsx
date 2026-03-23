import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Home from './pages/Home'
import CategoryListing from './pages/CategoryListing'
import EventDetail from './pages/EventDetail'
import Checkout from './pages/Checkout'
import Confirmation from './pages/Confirmation'
import MyBookings from './pages/MyBookings'
import Login from './pages/Login'
import Signup from './pages/Signup'
import OrganizerDashboard from './pages/OrganizerDashboard'
import WaitlistStatus from './pages/WaitlistStatus'
import SeatSelection from './pages/SeatSelection'

function App() {
  return (
    <Router>
      <div className="bg-surface min-h-screen">
        <Toaster
          position="top-right"
          toastOptions={{
            className: 'font-body',
            duration: 3000,
            style: {
              background: '#1a1c1c',
              color: '#f9f9f9',
              borderRadius: '1rem',
              padding: '16px',
            },
            success: {
              iconTheme: {
                primary: '#dfeb72',
                secondary: '#1a1c1c',
              },
            },
          }}
        />

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/category/:categoryName" element={<CategoryListing />} />
          <Route path="/event/:eventId" element={<EventDetail />} />
          <Route path="/event/:eventId/seats" element={<SeatSelection />} />
          <Route path="/checkout/:eventId" element={<Checkout />} />
          <Route path="/confirmation/:bookingId" element={<Confirmation />} />
          <Route path="/my-bookings" element={<MyBookings />} />
          <Route path="/waitlist/:eventId" element={<WaitlistStatus />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/organizer/dashboard" element={<OrganizerDashboard />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
