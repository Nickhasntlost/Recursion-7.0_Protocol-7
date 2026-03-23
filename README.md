# Event Booking System - Backend

FastAPI backend with MongoDB for the Event Booking System.

## 🚀 Quick Start

### 1. Prerequisites
- Python 3.10+
- MongoDB (local or MongoDB Atlas)
- Git

### 2. Setup Virtual Environment

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows
venv\Scripts\activate

# Linux/Mac
source venv/bin/activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Environment Configuration

Create `.env` file in the backend folder:

```bash
cp .env.example .env
```

Edit `.env` and configure:

```env
# MongoDB - Update this!
MONGODB_URL=mongodb://localhost:27017
# OR for MongoDB Atlas:
# MONGODB_URL=mongodb+srv://username:password@cluster.mongodb.net/

DATABASE_NAME=event_booking_system

# JWT Secret - CHANGE THIS!
SECRET_KEY=your-super-secret-key-min-32-characters-long
ALGORITHM=HS256

# Application
DEBUG=True
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

### 5. Run the Server

```bash
# Development mode (auto-reload)
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Production mode
uvicorn main:app --host 0.0.0.0 --port 8000
```

Server will start at: `http://localhost:8000`

### 6. Access API Documentation

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

---

## 📁 Project Structure

```
backend/
├── app/
│   ├── api/
│   │   └── v1/
│   │       ├── auth.py           # Authentication endpoints
│   │       ├── organizations.py  # Organization CRUD
│   │       ├── events.py         # Event management
│   │       └── bookings.py       # Booking system (TODO)
│   ├── core/
│   │   ├── config.py            # Configuration
│   │   ├── database.py          # MongoDB connection
│   │   └── security.py          # JWT & password hashing
│   ├── models/
│   │   ├── user.py              # User model
│   │   ├── organization.py      # Organization model
│   │   ├── event.py             # Event model
│   │   ├── venue.py             # Venue model
│   │   └── booking.py           # Booking model
│   ├── schemas/
│   │   ├── user.py              # User request/response schemas
│   │   ├── organization.py      # Organization schemas
│   │   └── event.py             # Event schemas
│   └── dependencies/
│       └── auth.py              # Authentication dependencies
├── main.py                      # FastAPI application
├── requirements.txt             # Python dependencies
├── .env.example                 # Environment variables template
└── README.md
```

---

## 🔐 API Endpoints

### Authentication
- `POST /api/v1/auth/signup` - Register new user
- `POST /api/v1/auth/login` - Login user
- `GET /api/v1/auth/me` - Get current user

### Organizations
- `POST /api/v1/organizations` - Create organization
- `GET /api/v1/organizations` - List organizations
- `GET /api/v1/organizations/{id}` - Get organization
- `PATCH /api/v1/organizations/{id}` - Update organization
- `GET /api/v1/organizations/my/organizations` - Get my organizations

### Events
- `POST /api/v1/events` - Create event (organizers only)
- `GET /api/v1/events` - List events
- `GET /api/v1/events/{id}` - Get event details
- `PATCH /api/v1/events/{id}` - Update event
- `DELETE /api/v1/events/{id}` - Delete event

---

## 📝 Usage Examples

### 1. Register User

```bash
curl -X POST "http://localhost:8000/api/v1/auth/signup" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "username": "johndoe",
    "full_name": "John Doe",
    "password": "securepassword123",
    "phone": "+1234567890",
    "city": "New York",
    "country": "USA",
    "role": "organizer"
  }'
```

### 2. Login

```bash
curl -X POST "http://localhost:8000/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "securepassword123"
  }'
```

### 3. Create Organization (with JWT token)

```bash
curl -X POST "http://localhost:8000/api/v1/organizations" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "name": "Event Masters Inc",
    "email": "info@eventmasters.com",
    "description": "Leading event management company",
    "phone": "+1234567890",
    "city": "Los Angeles",
    "country": "USA"
  }'
```

### 4. Create Event

```bash
curl -X POST "http://localhost:8000/api/v1/events" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "title": "Rock Festival 2026",
    "description": "Annual rock music festival",
    "venue_id": "VENUE_ID_HERE",
    "category": "concert",
    "start_datetime": "2026-06-15T18:00:00",
    "end_datetime": "2026-06-15T23:00:00",
    "ticket_tiers": [
      {
        "tier_id": "tier_1",
        "tier_name": "General Admission",
        "price": 50.0,
        "total_quantity": 1000,
        "available_quantity": 1000,
        "current_price": 50.0
      }
    ]
  }'
```

---

## 🗄️ MongoDB Setup

### Local MongoDB
```bash
# Install MongoDB locally
# Windows: Download from https://www.mongodb.com/try/download/community
# Linux: sudo apt-get install mongodb
# Mac: brew install mongodb-community

# Start MongoDB
mongod

# Use .env MONGODB_URL=mongodb://localhost:27017
```

### MongoDB Atlas (Cloud)
1. Go to https://www.mongodb.com/cloud/atlas
2. Create free cluster
3. Create database user
4. Whitelist your IP (or use 0.0.0.0/0 for development)
5. Get connection string
6. Update `.env` with connection string

---

## 🧪 Testing

```bash
# Install testing dependencies
pip install pytest pytest-asyncio httpx

# Run tests (coming soon)
pytest
```

---

## 🔧 Development Tools

### Database GUI Tools
- **MongoDB Compass** (Official): https://www.mongodb.com/products/compass
- **Studio 3T**: https://studio3t.com/

### API Testing
- **Swagger UI**: http://localhost:8000/docs (built-in)
- **Postman**: Import OpenAPI spec from `/openapi.json`
- **Thunder Client**: VSCode extension

---

## 📚 Tech Stack

- **Framework**: FastAPI 0.109.0
- **Database**: MongoDB (via Motor + Beanie ODM)
- **Authentication**: JWT (python-jose)
- **Password Hashing**: Bcrypt (passlib)
- **Validation**: Pydantic v2
- **ASGI Server**: Uvicorn

---

## 🐛 Common Issues

### Issue: MongoDB Connection Failed
**Solution**:
- Check MongoDB is running: `mongod --version`
- Verify MONGODB_URL in `.env`
- Check firewall settings

### Issue: ModuleNotFoundError
**Solution**:
```bash
# Ensure virtual environment is activated
# Windows
venv\Scripts\activate

# Then reinstall
pip install -r requirements.txt
```

### Issue: JWT Token Invalid
**Solution**:
- Ensure SECRET_KEY in `.env` is at least 32 characters
- Check token hasn't expired
- Verify Authorization header format: `Bearer <token>`

---

## 📦 Deployment

### Docker (Optional)
```dockerfile
# Dockerfile
FROM python:3.11-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

```bash
docker build -t event-booking-api .
docker run -p 8000:8000 --env-file .env event-booking-api
```

---

## 🤝 Contributing

1. Create feature branch
2. Make changes
3. Test thoroughly
4. Submit pull request

---

## 📄 License

MIT License

---

## 📞 Support

For issues, please create a GitHub issue or contact the development team.
