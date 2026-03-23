import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import CategoryListingPage from './pages/CategoryListingPage'
import EventDetailPage from './pages/EventDetailPage'
import SelectionPage from './pages/SelectionPage'
import CheckoutPage from './pages/CheckoutPage'
import ConfirmationPage from './pages/ConfirmationPage'
import MyBookingsPage from './pages/MyBookingsPage'
import WaitlistPage from './pages/WaitlistPage'

function App() {
  return (
    <BrowserRouter>
      <AnimatePresence mode="wait">
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="/category/:slug" element={<CategoryListingPage />} />
            <Route path="/event/:id" element={<EventDetailPage />} />
            <Route path="/event/:id/select" element={<SelectionPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/confirmation" element={<ConfirmationPage />} />
            <Route path="/my-bookings" element={<MyBookingsPage />} />
            <Route path="/waitlist" element={<WaitlistPage />} />
          </Route>
        </Routes>
      </AnimatePresence>
    </BrowserRouter>
  )
}

export default App
