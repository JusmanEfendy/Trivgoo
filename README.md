# 🏨 TrivGoo — Mini Hotel Booking Engine

A fullstack **Mini Hotel Booking Engine** (OTA-style) built as a technical assignment. Supports hotel search, room availability checking, booking with race-condition prevention, and an admin dashboard.

## 📸 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React Native (Expo) |
| **Backend** | Node.js + Express.js |
| **Database** | MySQL |
| **Validation** | Zod |

---

## 📁 Project Structure

```
trivgoo/
├── backend/                  # Node.js + Express API
│   ├── src/
│   │   ├── config/           # Database connection
│   │   ├── controllers/      # Request handlers
│   │   ├── middleware/       # Error handling
│   │   ├── models/           # Data access layer
│   │   ├── routes/           # API route definitions
│   │   └── app.js            # Entry point
│   ├── migrations/
│   │   └── init.sql          # Database schema + seed data
│   ├── .env.example          # Environment template
│   └── package.json
│
├── frontend/                 # React Native (Expo)
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── constants/        # Theme & design tokens
│   │   ├── screens/          # App screens
│   │   ├── services/         # API client (Axios)
│   │   └── utils/            # Helper functions
│   ├── App.js                # Root component + navigation
│   └── package.json
│
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18+)
- **MySQL** (v8+)
- **npm** (v9+)

### 1. Clone the Repository

```bash
git clone https://github.com/JusmanEfendy/Trivgoo.git
cd trivgoo
```

### 2. Setup Backend

```bash
cd backend
cp .env.example .env        # Copy environment config (lalu edit sesuai kebutuhan)
npm install                  # Install dependencies
```

### 3. Setup Database

Pastikan MySQL sedang berjalan, lalu jalankan migrasi:

```bash
# Menggunakan MySQL CLI
mysql -u root < migrations/init.sql

# Atau via MySQL Workbench / phpMyAdmin:
# Bukan dan Eksekusi file: backend/migrations/init.sql
```

This will:
- Buat `booking_engine` database
- Buat table: `hotels`, `rooms`, `bookings`
- Seed sample data (7 hotels, 25 rooms, 3 bookings)

### 4. Start Backend Server

```bash
npm run dev                  # Development mode (auto-reload)
# or
npm start                    # Production mode
```

Server runs on `http://localhost:3000`

### 5. Setup Frontend

```bash
cd ../frontend
npm install                  # Install dependencies
```

### 6. Start Frontend

```bash
npx expo start --web         # Jalankan di browser
# or
npx expo start               # Jalankan di mobile (scan QR dengan Expo Go)
```

---

## 📡 API Endpoints

### Public APIs

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/health` | Health check |
| `GET` | `/api/hotels/search` | Search hotels (query: `city`, `check_in`, `check_out`, `guests`) |
| `GET` | `/api/hotels/:id` | Hotel detail + available rooms |
| `POST` | `/api/bookings` | Create booking |
| `GET` | `/api/bookings/:ref` | Get booking by reference |

### Admin APIs

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/admin/hotels` | List all hotels |
| `POST` | `/api/admin/hotels` | Create hotel |
| `PUT` | `/api/admin/hotels/:id` | Update hotel |
| `DELETE` | `/api/admin/hotels/:id` | Delete hotel |
| `GET` | `/api/admin/hotels/:id/rooms` | List rooms for hotel |
| `POST` | `/api/admin/rooms` | Create room |
| `PUT` | `/api/admin/rooms/:id` | Update room |
| `DELETE` | `/api/admin/rooms/:id` | Delete room |
| `GET` | `/api/admin/bookings` | List all bookings |
| `PUT` | `/api/admin/bookings/:ref/cancel` | Cancel booking |

### Example: Search Hotels

```bash
GET /api/hotels/search?city=Bali&check_in=2026-03-10&check_out=2026-03-13&guests=2
```

### Example: Create Booking

```bash
POST /api/bookings
Content-Type: application/json

{
  "room_id": 1,
  "guest_name": "John Doe",
  "guest_email": "john@example.com",
  "check_in_date": "2026-03-10",
  "check_out_date": "2026-03-13"
}
```

---

## 🗄️ Database Schema

```
hotels                          rooms                           bookings
├── id (PK)                     ├── id (PK)                     ├── id (PK)
├── name                        ├── hotel_id (FK → hotels)      ├── room_id (FK → rooms)
├── city (indexed)              ├── room_type                   ├── booking_ref (UUID, unique)
├── address                     ├── capacity (indexed)          ├── guest_name
├── description                 ├── price_per_night (indexed)   ├── guest_email
├── image_url                   ├── description                 ├── check_in_date
├── created_at                  ├── created_at                  ├── check_out_date
└── updated_at                  └── updated_at                  ├── total_price
                                                                ├── status (confirmed/cancelled)
                                                                ├── created_at
                                                                └── updated_at
```

**Key constraints:**
- Foreign keys with `ON DELETE CASCADE` (rooms) and `ON DELETE RESTRICT` (bookings)
- Composite index on `(room_id, check_in_date, check_out_date)` for availability queries
- `CHECK` constraint: `check_out_date > check_in_date`
- Double booking prevention via `SELECT ... FOR UPDATE` in transactions

---

## ✨ Key Features

- **Smart Search**: Filters hotels by city, date availability, and guest capacity
- **Race Condition Prevention**: Uses MySQL transactions with `FOR UPDATE` row locking
- **UUID Booking Reference**: Each booking gets a unique UUID reference number
- **Input Validation**: Zod schemas on all endpoints with proper error messages
- **Pagination**: Search results support page-based pagination
- **Admin Dashboard**: Full CRUD for hotels and rooms, booking management
- **Cross-Platform**: Runs on Web, Android, and iOS via Expo
