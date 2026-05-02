# 🚌 BusMate - Live Bus Tracking & Management System

> **A real-time, comprehensive platform connecting passengers, drivers, and administrators for a seamless transit experience.**

## 📖 Overview
BusMate is an advanced live bus tracking and fleet management solution. It empowers passengers with real-time bus locations and accurate schedules while providing transport administrators with a robust dashboard to manage fleets, routes, and daily operations efficiently.

## ❓ Problem Statement
Public transit systems often suffer from unpredictable schedules, lack of real-time communication, and inefficient fleet management. Passengers are left guessing when their bus will arrive, while administrators struggle to monitor active vehicles and manage route deviations manually.

## 💡 Solution
BusMate solves this by bridging the gap between passengers and transit authorities through real-time GPS tracking. Utilizing WebSockets and a highly optimized backend, it broadcasts live bus locations directly to passengers' devices. It also centralizes fleet management, enabling administrators to digitize routes, track vehicle health, and streamline daily transit operations.

---

## ✨ Features

### For Passengers (Frontend Application)
- **Live Tracking:** See buses moving in real-time on an interactive Google Map.
- **Dynamic Routing & ETAs:** View optimal bus paths and estimated arrival times.
- **Schedule Management:** Access accurate, up-to-date daily bus schedules.
- **Mobile-Responsive UI:** A sleek, user-friendly interface optimized for all devices.

### For Administrators (Admin Dashboard)
- **Fleet Management:** Add, update, and monitor buses and drivers.
- **Route Configuration:** Define and edit complex bus routes, stops, and schedules.
- **System Monitoring:** Oversee active trips and overall system health.

### Real-Time Capabilities (Backend)
- **Ultra-Low Latency:** Sub-second location updates powered by Socket.io.
- **Reliable Caching:** Redis implementation for high-speed data retrieval and Pub/Sub event handling.
- **Notifications:** Integrated with Twilio (SMS) and Firebase.

---

## 🏗️ Tech Stack

### Frontend & Admin
- **Framework:** React 19 + Vite
- **Styling:** Tailwind CSS v4, Chakra UI (Frontend)
- **Maps:** Google Maps API (`@react-google-maps/api`)
- **Real-Time Client:** `socket.io-client`
- **Animations:** Framer Motion

### Backend API
- **Runtime:** Node.js + Express 5
- **Database:** PostgreSQL
- **Query Builder/ORM:** Knex.js & Objection.js
- **Caching & Pub/Sub:** Redis (`ioredis`)
- **Real-Time Server:** Socket.io
- **Security:** JWT, bcrypt, Helmet

---

## 🏛️ System Architecture

1. **Client Tier:** The React frontend maintains an active WebSocket connection with the backend, listening for specific route or bus location events.
2. **Application Tier:** The Node.js/Express server acts as the central hub. It authenticates users, processes RESTful API requests, and handles WebSocket handshakes.
3. **Real-Time Broker:** Redis acts as a fast in-memory datastore for caching frequent requests and as a Pub/Sub message broker to scale Socket.io across multiple server instances.
4. **Data Tier:** A normalized PostgreSQL database securely stores long-term data (users, routes, schedules, historical logs) managed via Knex.js migrations.

---

## 🚀 Usage

### Installation Steps

**1. Prerequisites**
- Node.js (v18+)
- PostgreSQL database
- Redis server
- Google Maps API Key

**2. Clone the Repository**
```bash
git clone https://github.com/PasinduLakmal7/busmate-live-bus-tracking.git
cd "BUSMATE DEV"
```

**3. Install Dependencies**
This project uses npm workspaces. Install all dependencies from the root:
```bash
npm install
```

**4. Environment Setup**
Create `.env` files in both the frontend and backend directories.
*Backend `.env` example:*
```env
PORT=4000
DB_HOST=127.0.0.1
DB_USER=your_postgres_user
DB_PASSWORD=your_postgres_password
DB_NAME=busmate_db
REDIS_URL=redis://localhost:6379
JWT_SECRET=your_jwt_secret
```
*Frontend `.env` example:*
```env
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_key
VITE_API_URL=http://localhost:4000
```

**5. Database Setup**
```bash
cd busmate-backend
npm run migrate
npm run seed
```

### How to Run the Project

You need to start the backend and the desired frontend applications.

**Start the Backend API:**
```bash
cd busmate-backend
npm run dev
```

**Start the Passenger App:**
```bash
cd busmate-frontend
npm run dev
```

**Start the Admin Dashboard:**
```bash
cd busmate-admin
npm run dev
```

---

## 🖼️ Visuals

> **Note:** Add your screenshots and GIFs here.

| Passenger Live Tracking | Admin Dashboard |
|:---:|:---:|
| ![Live Tracking App](https://via.placeholder.com/600x400?text=Live+Tracking+Map) | ![Admin Panel](https://via.placeholder.com/600x400?text=Admin+Dashboard) |

---

## 🔮 Future Improvements
- **Predictive ETAs:** Implement machine learning to predict delays based on historical traffic data.
- **Offline Mode:** Enable caching of schedules for offline viewing via Service Workers (PWA).
- **Payment Gateway Integration:** Allow passengers to purchase digital tickets via the app.

## ⚠️ Limitations
- Real-time tracking accuracy is highly dependent on the stability of the driver's mobile network connection.
- High volume of concurrent WebSocket connections requires appropriate horizontal scaling of the Redis/Socket.io infrastructure.

---

## 🤝 Contributing
Contributions are welcome! Please follow these steps:
1. Fork the repository.
2. Create your feature branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

---

## 👤 Author
**Pasindu Lakmal**
- GitHub: [@PasinduLakmal7](https://github.com/PasinduLakmal7)

## 📜 License
This project is licensed under the **ISC License**.
