import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { ThemeProvider } from './contexts/ThemeContext'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import HomePage from './pages/HomePage'
import CategoryListingPage from './pages/CategoryListingPage'
import EventDetailPage from './pages/EventDetailPage'
import SelectionPage from './pages/SelectionPage'
import CheckoutPage from './pages/CheckoutPage'
import ConfirmationPage from './pages/ConfirmationPage'
import MyBookingsPage from './pages/MyBookingsPage'
import WaitlistPage from './pages/WaitlistPage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'

function App() {
  return (
    <ThemeProvider>
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
          </Routes>
        </AnimatePresence>
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App
