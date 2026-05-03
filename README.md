# 🚗 AutoFix Car Workshop Booking System
### MongoDB + Node.js Edition (v2.0)

> Upgraded from PHP/MySQL to **Node.js/Express + MongoDB** with a full redesign featuring a dark industrial UI and interactive CSS animations.

---

## 📁 Project Structure

```
CarWorkshop-Booking/
├── server.js          # Express app — REST API routes
├── db.js              # MongoDB connection + seeding
├── package.json
├── .env.example       # Copy to .env and configure
└── public/
    ├── index.html     # Booking form (3-step wizard)
    ├── admin.html     # Admin dashboard
    ├── style.css      # Dark industrial UI styles
    ├── script.js      # Booking form logic
    └── admin.js       # Admin table + CRUD logic
```

---

## 🚀 Quick Start

### 1. Prerequisites
- [Node.js](https://nodejs.org) v18+
- [MongoDB](https://www.mongodb.com) running locally (or use MongoDB Atlas)

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment
```bash
cp .env.example .env
# Edit .env if needed:
#   MONGO_URI=mongodb://localhost:27017
#   PORT=3000
```

### 4. Start the server
```bash
npm start
# or for hot-reload:
npm run dev
```

### 5. Open in browser
- **Booking form:** http://localhost:3000
- **Admin panel:**  http://localhost:3000/admin

---

## 🌐 REST API Endpoints

| Method | Path                       | Description              |
|--------|----------------------------|--------------------------|
| GET    | `/api/mechanics`           | List all mechanics       |
| POST   | `/api/appointments`        | Create new appointment   |
| GET    | `/api/appointments`        | List all appointments    |
| PUT    | `/api/appointments/:id`    | Update appointment       |
| DELETE | `/api/appointments/:id`    | Delete appointment       |

---

## 🔄 What Changed from PHP/MySQL

| Before (PHP + MySQL)                  | After (Node.js + MongoDB)            |
|--------------------------------------|--------------------------------------|
| `db.php` → `mysqli_connect()`        | `db.js` → `MongoClient`             |
| `insert.php` → INSERT SQL            | `POST /api/appointments`            |
| `admin.php` → SELECT + JOIN SQL      | `GET /api/appointments` (aggregate) |
| `carshop.sql` → table schema         | Auto-seeded collections             |
| Static mechanic `<select>`           | Dynamic cards fetched from DB       |
| Page refresh on submit               | Async fetch / JSON API              |
| Basic HTML table styling             | Dark industrial UI + animations     |

---

## ✨ New Features
- **3-step booking wizard** with progress indicator
- **Mechanic cards** (loaded from MongoDB, selectable)
- **Real-time validation** with clear error messages
- **Admin dashboard** with stats, search, filter, edit & delete
- **Toast notifications** for all actions
- **Dark industrial UI** with grid background, hover animations, and glow effects

---

## 🗃️ MongoDB Collections

### `mechanics`
```json
{ "_id": 1, "name": "Mr. Karim", "speciality": "Engine Specialist" }
```

### `appointments`
```json
{
  "_id": ObjectId,
  "client_name": "Akib",
  "address": "Dhaka",
  "phone": "01712345678",
  "car_license": "DHK-1234",
  "engine_number": "123456",
  "appointment_date": "2026-05-10",
  "mechanic_id": 1,
  "status": "pending",
  "created_at": ISODate
}
```
