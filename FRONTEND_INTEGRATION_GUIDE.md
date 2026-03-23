# Frontend Integration Guide - Event Booking System API

Complete API documentation for frontend developers with exact request/response formats.

---

## Table of Contents

1. [Setup & Configuration](#setup--configuration)
2. [Authentication Flow](#authentication-flow)
3. [API Endpoints](#api-endpoints)
4. [AI Chat Implementation](#ai-chat-implementation)
5. [Payment Integration](#payment-integration)
6. [Error Handling](#error-handling)
7. [Complete Examples](#complete-examples)

---

## Setup & Configuration

### Base URL
```javascript
const API_BASE_URL = "http://localhost:8000/api/v1";
```

### Axios Setup (Recommended)
```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api/v1',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 errors (token expired)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

---

## Authentication Flow

### 1. Signup

**Endpoint:** `POST /auth/signup`

**Request:**
```javascript
{
  "email": "user@example.com",
  "username": "johndoe",
  "password": "SecurePass123",
  "full_name": "John Doe",
  "phone": "+919876543210",
  "city": "Mumbai",
  "country": "India",
  "role": "user"  // "user" or "organizer"
}
```

**Response:**
```javascript
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "69c11be63de68676d78ad62a",
    "email": "user@example.com",
    "username": "johndoe",
    "full_name": "John Doe",
    "phone": "+919876543210",
    "role": "user",
    "avatar_url": null,
    "city": "Mumbai",
    "country": "India",
    "organization_id": null,
    "loyalty_points": 0,
    "total_bookings": 0,
    "is_active": true,
    "is_verified": false,
    "created_at": "2026-03-23T10:00:00"
  }
}
```

**Frontend Implementation:**
```javascript
const signup = async (userData) => {
  try {
    const response = await api.post('/auth/signup', userData);

    // Store tokens in localStorage
    localStorage.setItem('access_token', response.data.access_token);
    localStorage.setItem('refresh_token', response.data.refresh_token);
    localStorage.setItem('user', JSON.stringify(response.data.user));

    return response.data;
  } catch (error) {
    throw error.response?.data?.detail || 'Signup failed';
  }
};
```

---

### 2. Login

**Endpoint:** `POST /auth/login`

**Request:**
```javascript
{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

**Response:** (Same as signup)
```javascript
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { ... }
}
```

**Frontend Implementation:**
```javascript
const login = async (email, password) => {
  try {
    const response = await api.post('/auth/login', { email, password });

    // Store tokens in localStorage
    localStorage.setItem('access_token', response.data.access_token);
    localStorage.setItem('refresh_token', response.data.refresh_token);
    localStorage.setItem('user', JSON.stringify(response.data.user));

    return response.data;
  } catch (error) {
    throw error.response?.data?.detail || 'Login failed';
  }
};
```

---

### 3. Get Current User

**Endpoint:** `GET /auth/me`

**Headers:** `Authorization: Bearer {access_token}`

**Response:**
```javascript
{
  "id": "69c11be63de68676d78ad62a",
  "email": "user@example.com",
  "username": "johndoe",
  "full_name": "John Doe",
  "phone": "+919876543210",
  "role": "user",
  "organization_id": null,
  ...
}
```

**Frontend Implementation:**
```javascript
const getCurrentUser = async () => {
  try {
    const response = await api.get('/auth/me');
    localStorage.setItem('user', JSON.stringify(response.data));
    return response.data;
  } catch (error) {
    throw error;
  }
};
```

---

### 4. Logout

**Frontend Implementation:**
```javascript
const logout = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('user');
  window.location.href = '/login';
};
```

---

### Protected Routes (React Example)

```javascript
import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('access_token');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Usage in App.js
<Route
  path="/dashboard"
  element={
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  }
/>
```

---

## AI Chat Implementation

### Critical Logic: conversation_id Handling

**Rule:**
- **First message:** Do NOT send `conversation_id` (send `null`)
- **Subsequent messages:** Send `conversation_id` from first response

### 1. Start New Conversation

**Endpoint:** `POST /ai-assistant/chat`

**Request (First Message):**
```javascript
{
  "message": "I want to organize a tech conference for 500 people",
  "conversation_id": null  // NULL for first message!
}
```

**Response:**
```javascript
{
  "conversation_id": "69c1242122d3eca42d8905b0",  // SAVE THIS!
  "assistant_message": "Great! Let me help you plan...",
  "extracted_data": {
    "title": null,
    "category": "conference",
    "capacity": 500,
    "start_datetime": null,
    ...
  },
  "is_complete": false,
  "next_questions": ["What's the name of your event?"],
  "venue_suggestions": []
}
```

---

### 2. Continue Conversation

**Request (Subsequent Messages):**
```javascript
{
  "message": "TechCon 2026",
  "conversation_id": "69c1242122d3eca42d8905b0"  // From previous response
}
```

**Response:**
```javascript
{
  "conversation_id": "69c1242122d3eca42d8905b0",
  "assistant_message": "Perfect! When is the event?",
  "extracted_data": {
    "title": "TechCon 2026",
    "category": "conference",
    "capacity": 500,
    ...
  },
  "is_complete": false,
  "next_questions": ["When is the event?"],
  "venue_suggestions": [
    {
      "id": "venue_123",
      "name": "Grand Conference Center",
      "city": "Los Angeles",
      "capacity": 500,
      "images": ["https://...", "https://..."]
    }
  ]
}
```

---

### 3. AI Chat Frontend Implementation

```javascript
import React, { useState } from 'react';
import api from './api';

const AIChat = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [conversationId, setConversationId] = useState(null);  // START AS NULL
  const [venueSuggestions, setVenueSuggestions] = useState([]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    // Add user message to UI
    setMessages([...messages, { role: 'user', content: input }]);

    try {
      const response = await api.post('/ai-assistant/chat', {
        message: input,
        conversation_id: conversationId  // NULL for first message!
      });

      // Save conversation_id from FIRST response
      if (!conversationId && response.data.conversation_id) {
        setConversationId(response.data.conversation_id);
      }

      // Add AI response to UI
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: response.data.assistant_message
      }]);

      // Update venue suggestions
      if (response.data.venue_suggestions?.length > 0) {
        setVenueSuggestions(response.data.venue_suggestions);
      }

      setInput('');
    } catch (error) {
      console.error('Chat error:', error);
    }
  };

  return (
    <div className="chat-container">
      <div className="messages">
        {messages.map((msg, idx) => (
          <div key={idx} className={`message ${msg.role}`}>
            {msg.content}
          </div>
        ))}
      </div>

      {venueSuggestions.length > 0 && (
        <div className="venue-suggestions">
          <h3>Suggested Venues:</h3>
          {venueSuggestions.map(venue => (
            <div key={venue.id} className="venue-card">
              <img src={venue.images[0]} alt={venue.name} />
              <h4>{venue.name}</h4>
              <p>{venue.city} • {venue.capacity} capacity</p>
              <button onClick={() => createEvent(venue.id)}>
                Select Venue
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="input-area">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Describe your event..."
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
};
```

---

### 4. Create Event from AI

**Endpoint:** `POST /ai-assistant/{conversation_id}/create-event`

**Request:**
```javascript
{
  "venue_id": "venue_123"  // Selected from venue_suggestions
}
```

**Response:**
```javascript
{
  "success": true,
  "event_id": "event_456",
  "event_title": "TechCon 2026",
  "event_slug": "techcon-2026",
  "venue_name": "Grand Conference Center",
  "status": "draft",
  "ticket_tiers": [
    {
      "tier_id": "tier_1",
      "name": "Standard",
      "price": 299.0,
      "currency": "INR",
      "available": 500
    }
  ],
  "message": "Event created successfully! Proceed to payment to book tickets.",
  "next_action": "payment",  // Navigate to payment page!
  "payment_endpoint": "/api/v1/payments/create-order"
}
```

**Frontend Implementation:**
```javascript
const createEvent = async (venueId) => {
  try {
    const response = await api.post(
      `/ai-assistant/${conversationId}/create-event`,
      { venue_id: venueId }
    );

    if (response.data.next_action === 'payment') {
      // Navigate to payment page
      window.location.href = `/payment/${response.data.event_id}`;
    }
  } catch (error) {
    console.error('Event creation failed:', error);
  }
};
```

---

## Payment Integration

### 1. Create Payment Order

**Endpoint:** `POST /payments/create-order`

**Request:**
```javascript
{
  "event_id": "event_456",
  "ticket_tier_id": "tier_1",
  "quantity": 2,
  "contact_email": "user@example.com",
  "contact_phone": "+919876543210"
}
```

**Response:**
```javascript
{
  "booking_id": "booking_123",
  "order_id": "order_MabcdXYZ12",  // Razorpay order ID
  "amount": 598.0,
  "currency": "INR",
  "razorpay_key_id": "rzp_test_v0xLqA7iZWxL2T",
  "booking_number": "BK-20260323-ABC123",
  "expires_at": "2026-03-23T10:30:00"
}
```

---

### 2. Razorpay Checkout (Frontend)

```javascript
// Include Razorpay script in index.html
<script src="https://checkout.razorpay.com/v1/checkout.js"></script>

// Payment component
const PaymentPage = ({ eventId, ticketTier }) => {
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    setLoading(true);

    try {
      // Step 1: Create order
      const orderResponse = await api.post('/payments/create-order', {
        event_id: eventId,
        ticket_tier_id: ticketTier.tier_id,
        quantity: 2,
        contact_email: user.email,
        contact_phone: user.phone
      });

      const orderData = orderResponse.data;

      // Step 2: Show Razorpay checkout
      const options = {
        key: orderData.razorpay_key_id,
        amount: orderData.amount * 100,  // Convert to paise
        currency: orderData.currency,
        name: "Event Booking",
        description: `Booking for event`,
        order_id: orderData.order_id,

        handler: async function (response) {
          // Step 3: Verify payment
          await verifyPayment({
            booking_id: orderData.booking_id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature
          });
        },

        prefill: {
          email: user.email,
          contact: user.phone
        },

        theme: {
          color: "#3399cc"
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (error) {
      alert('Payment failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button onClick={handlePayment} disabled={loading}>
      {loading ? 'Processing...' : 'Book Tickets'}
    </button>
  );
};
```

---

### 3. Verify Payment

**Endpoint:** `POST /payments/verify`

**Request:**
```javascript
{
  "booking_id": "booking_123",
  "razorpay_order_id": "order_MabcdXYZ12",
  "razorpay_payment_id": "pay_ABC123",
  "razorpay_signature": "signature_from_razorpay"
}
```

**Response:**
```javascript
{
  "success": true,
  "booking_id": "booking_123",
  "booking_number": "BK-20260323-ABC123",
  "payment_status": "completed",
  "booking_status": "confirmed",
  "message": "Payment verified successfully! Booking confirmed."
}
```

**Frontend Implementation:**
```javascript
const verifyPayment = async (paymentData) => {
  try {
    const response = await api.post('/payments/verify', paymentData);

    if (response.data.success) {
      // Show success message
      alert(`Booking confirmed! ${response.data.booking_number}`);

      // Redirect to bookings page
      window.location.href = '/my-bookings';
    }
  } catch (error) {
    alert('Payment verification failed!');
  }
};
```

---

### 4. Get My Bookings

**Endpoint:** `GET /payments/my-bookings`

**Response:**
```javascript
[
  {
    "booking_id": "booking_123",
    "booking_number": "BK-20260323-ABC123",
    "event_id": "event_456",
    "total_tickets": 2,
    "total_amount": 598.0,
    "payment_status": "completed",
    "booking_status": "confirmed",
    "created_at": "2026-03-23T10:15:00",
    "confirmed_at": "2026-03-23T10:20:00"
  }
]
```

---

## Other API Endpoints

### Organizations

#### Create Organization
**POST /organizations**
```javascript
// Request
{
  "name": "Event Masters Inc",
  "email": "info@eventmasters.com",
  "city": "Mumbai",
  "country": "India",
  "phone": "+919876543210",
  "address": "123 Business Street",
  "postal_code": "400001",
  "description": "Leading event management company",
  "social_links": {
    "website": "https://eventmasters.com",
    "facebook": "https://facebook.com/eventmasters",
    "instagram": "https://instagram.com/eventmasters"
  }
}

// Response
{
  "id": "org_123",
  "name": "Event Masters Inc",
  "email": "info@eventmasters.com",
  ...
}
```

#### Get Organizations
**GET /organizations?city=Mumbai&is_verified=true**

---

### Events

#### Get All Events
**GET /events?category=concert&status=published**

**Response:**
```javascript
[
  {
    "id": "event_123",
    "title": "Rock Festival 2026",
    "slug": "rock-festival-2026",
    "description": "Annual rock music festival",
    "organization_id": "org_123",
    "venue_id": "venue_456",
    "category": "concert",
    "start_datetime": "2026-06-15T18:00:00",
    "end_datetime": "2026-06-15T23:00:00",
    "total_capacity": 5000,
    "available_capacity": 4500,
    "min_price": 500.0,
    "max_price": 2000.0,
    "status": "published",
    "images": ["https://..."],
    "tags": ["rock", "music", "festival"]
  }
]
```

#### Get Event by ID
**GET /events/{event_id}**

---

### Volunteers

#### Upload Excel
**POST /volunteers/{event_id}/upload-excel**

**Request:** (multipart/form-data)
```javascript
const formData = new FormData();
formData.append('file', excelFile);

const response = await api.post(
  `/volunteers/${eventId}/upload-excel`,
  formData,
  {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  }
);
```

**Response:**
```javascript
{
  "success": true,
  "total_rows": 7,
  "volunteers_created": 7,
  "volunteers_skipped": 0,
  "skipped_details": [],
  "note": "File processed from temporary storage and deleted (FREE!)"
}
```

---

## Error Handling

### Standard Error Response
```javascript
{
  "detail": "Error message here"
}
```

### Common HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (invalid/expired token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Server Error

### Error Handling Example
```javascript
try {
  const response = await api.post('/some-endpoint', data);
  return response.data;
} catch (error) {
  if (error.response) {
    // Server responded with error
    const message = error.response.data.detail || 'An error occurred';
    alert(message);
  } else if (error.request) {
    // No response from server
    alert('Network error. Please check your connection.');
  } else {
    // Other errors
    alert('An unexpected error occurred.');
  }
}
```

---

## Complete React Example

```javascript
// src/services/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api/v1'
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.clear();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

```javascript
// src/services/auth.js
import api from './api';

export const authService = {
  signup: async (userData) => {
    const response = await api.post('/auth/signup', userData);
    localStorage.setItem('access_token', response.data.access_token);
    localStorage.setItem('user', JSON.stringify(response.data.user));
    return response.data;
  },

  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    localStorage.setItem('access_token', response.data.access_token);
    localStorage.setItem('user', JSON.stringify(response.data.user));
    return response.data;
  },

  logout: () => {
    localStorage.clear();
    window.location.href = '/login';
  },

  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('access_token');
  }
};
```

```javascript
// src/pages/Login.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/auth';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      await authService.login(email, password);
      navigate('/dashboard');
    } catch (error) {
      alert(error.response?.data?.detail || 'Login failed');
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        required
      />
      <button type="submit">Login</button>
    </form>
  );
};

export default Login;
```

---

## Quick Reference

### Authentication
- `POST /auth/signup` - Register user
- `POST /auth/login` - Login user
- `GET /auth/me` - Get current user

### Organizations
- `POST /organizations` - Create organization
- `GET /organizations` - List organizations
- `GET /organizations/{id}` - Get organization

### Events
- `GET /events` - List events
- `GET /events/{id}` - Get event details
- `POST /events` - Create event (organizers only)

### AI Assistant
- `POST /ai-assistant/chat` - Chat with AI
- `POST /ai-assistant/{conversation_id}/create-event` - Create event from AI

### Payments
- `POST /payments/create-order` - Create payment order
- `POST /payments/verify` - Verify payment
- `GET /payments/my-bookings` - Get user bookings

### Volunteers
- `POST /volunteers/{event_id}/upload-excel` - Upload volunteers
- `GET /volunteers/{event_id}` - Get event volunteers

### Tasks
- `POST /tasks/{event_id}` - Create task
- `GET /tasks/{event_id}` - Get event tasks

### Chat
- `POST /chat/{event_id}` - Send message
- `GET /chat/{event_id}` - Get messages

---

## Test Cards (Razorpay Test Mode)

**Success:** `4111 1111 1111 1111`
**Failure:** `4000 0000 0000 0002`
**CVV:** Any 3 digits
**Expiry:** Any future date

---

## Support

For issues or questions, check:
1. Token stored in localStorage
2. Authorization header added to requests
3. CORS enabled on backend
4. Backend server running on http://localhost:8000

**Happy Coding! 🚀**
