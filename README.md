# 🚌 BusMate - Live Bus Tracking System

![BusMate Banner](https://via.placeholder.com/1200x400?text=BusMate+Live+Tracking) <!-- Replace with your actual banner -->

BusMate is a comprehensive real-time bus tracking and management platform designed to provide passengers with live bus locations, accurate schedules, and route information. It features a modern, responsive web application for passengers, an administrative dashboard for system managers, and a robust real-time backend.

## 🌟 Features

### Passenger Application (Frontend)
- **Live Tracking:** Real-time bus locations displayed interactively on Google Maps.
- **Dynamic Routing:** Visualizes bus routes and calculates optimal paths.
- **Schedules & Updates:** Access accurate, up-to-date bus schedules.
- **Modern UI:** A beautiful, responsive interface built with Chakra UI, Tailwind CSS, and Framer Motion.

### Administrative Dashboard (Admin)
- **Fleet Management:** Add, update, and manage buses and drivers.
- **Route Configuration:** Define and edit bus routes, stops, and schedules.
- **System Monitoring:** Oversee active trips and system health.

### Real-Time Backend
- **WebSocket Integration:** Powers live location updates with extremely low latency via Socket.io.
- **Database Architecture:** Robust PostgreSQL database managed via Knex.js query builder.
- **Caching & Pub/Sub:** Redis integration for optimized data retrieval and event handling.
- **Notifications:** Twilio SMS and Firebase integration for alerts.

---

## 🏗️ Tech Stack

### 🚀 Frontend (`busmate-frontend`)
- **Framework:** React 19 + Vite
- **Styling:** Tailwind CSS v4, Chakra UI, Emotion
- **Maps:** Google Maps API (`@react-google-maps/api`)
- **Real-time:** `socket.io-client`
- **Animations:** Framer Motion

### 🛠️ Backend (`busmate-backend`)
- **Runtime:** Node.js + Express 5
- **Database:** PostgreSQL with Knex.js & Objection.js
- **Real-time:** Socket.io
- **Caching:** Redis (`ioredis`)
- **Auth & Security:** JWT, bcrypt, Helmet
- **Third-party:** Twilio (SMS), Firebase

### 🛡️ Admin Panel (`busmate-admin`)
- **Framework:** React 19 + Vite
- **Styling:** Tailwind CSS v4
- **Icons:** Lucide React
- **Notifications:** React Toastify

---

## 📂 Project Structure

This repository is set up as an npm workspace monorepo.

```text
BUSMATE DEV/
├── busmate-frontend/   # Passenger React Application
├── busmate-admin/      # Administrator React Dashboard
├── busmate-backend/    # Node.js/Express Real-time API
├── common/             # Shared utilities and types across packages
└── package.json        # Root workspace configuration
```

---

## 🚦 Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- PostgreSQL database
- Redis server
- Google Maps API Key

### 1. Clone & Install
Clone the repository and install dependencies for all workspaces from the root folder:

```bash
git clone https://github.com/PasinduLakmal7/busmate-live-bus-tracking.git
cd "BUSMATE DEV"
npm install
```

### 2. Environment Variables
Create a `.env` file in the `busmate-backend` directory (and frontend/admin if needed) based on the provided examples.

**Backend `.env` example:**
```env
PORT=4000
DB_HOST=127.0.0.1
DB_USER=your_postgres_user
DB_PASSWORD=your_postgres_password
DB_NAME=busmate_db
REDIS_URL=redis://localhost:6379
JWT_SECRET=your_jwt_secret
```

**Frontend `.env` example:**
```env
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_key
VITE_API_URL=http://localhost:4000
```

### 3. Database Setup (Backend)
Navigate to the backend and run migrations and seeds:

```bash
cd busmate-backend
npm run migrate
npm run seed
```

### 4. Running the Application
You can run individual parts of the application or set up a concurrent script at the root level.

**Start Backend:**
```bash
cd busmate-backend
npm run dev
```

**Start Passenger App:**
```bash
cd busmate-frontend
npm run dev
```

**Start Admin Dashboard:**
```bash
cd busmate-admin
npm run dev
```

---

## 🤝 Contributing
Contributions, issues, and feature requests are welcome!

## 📄 License
This project is licensed under the ISC License.
