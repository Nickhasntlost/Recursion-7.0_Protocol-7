import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { ThemeProvider } from './contexts/ThemeContext'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import DashboardLayout from './components/DashboardLayout'
import HomePage from './pages/HomePage'
import CategoryListingPage from './pages/CategoryListingPage'
import EventDetailPage from './pages/EventDetailPage'
import SelectionPage from './pages/SelectionPage'
import CheckoutPage from './pages/CheckoutPage'
import PaymentPage from './pages/PaymentPage'
import ConfirmationPage from './pages/ConfirmationPage'
import MyBookingsPage from './pages/MyBookingsPage'
import WaitlistPage from './pages/WaitlistPage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'

// Dashboard Pages
import DashboardOverview from './pages/dashboard/DashboardOverview'
import EventsManagement from './pages/dashboard/EventsManagement'
import CreateEvent from './pages/dashboard/CreateEvent'
import EditEvent from './pages/dashboard/EditEvent'
import StatsEvent from './pages/dashboard/StatsEvent'
import LiveFeed from './pages/dashboard/LiveFeed'
import Analytics from './pages/dashboard/Analytics'
import Attendees from './pages/dashboard/Attendees'
import Marketing from './pages/dashboard/Marketing'
import AutomationPage from './pages/dashboard/AutomationPage'
import VolunteersManagement from './pages/dashboard/VolunteersManagement'

function App() {
  return (
    <ThemeProvider>
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />
      <BrowserRouter>
        <AnimatePresence mode="wait">
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />

            {/* Protected Routes with Layout */}
            <Route element={<Layout />}>
              <Route index element={<HomePage />} />
              <Route path="/category/:slug" element={<CategoryListingPage />} />
              <Route path="/event/:id" element={<EventDetailPage />} />
              <Route path="/event/:id/select" element={<SelectionPage />} />

              {/* Routes that require authentication */}
              <Route
                path="/payment/:eventId"
                element={
                  <ProtectedRoute>
                    <PaymentPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/checkout"
                element={
                  <ProtectedRoute>
                    <CheckoutPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/confirmation"
                element={
                  <ProtectedRoute>
                    <ConfirmationPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/my-bookings"
                element={
                  <ProtectedRoute>
                    <MyBookingsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/waitlist"
                element={
                  <ProtectedRoute>
                    <WaitlistPage />
                  </ProtectedRoute>
                }
              />
            </Route>

            {/* Organizer Dashboard Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute organizerOnly>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<DashboardOverview />} />
              <Route path="events" element={<EventsManagement />} />
              <Route path="events/create" element={<CreateEvent />} />
              <Route path="events/:eventId/edit" element={<EditEvent />} />
              <Route path="events/:eventId/stats" element={<StatsEvent />} />
              <Route path="events/:eventId/live-feed" element={<LiveFeed />} />
              <Route path="automation" element={<AutomationPage />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="attendees" element={<Attendees />} />
              <Route path="volunteers" element={<VolunteersManagement />} />
              <Route path="bookings" element={<Analytics />} />
              <Route path="marketing" element={<Marketing />} />
              <Route path="settings" element={<Analytics />} />
            </Route>
          </Routes>
        </AnimatePresence>
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App
