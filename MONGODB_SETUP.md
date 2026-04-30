# MongoDB + Backend Setup Guide

Your CargoFlow app now has a **complete Node.js + Express + MongoDB backend** ready to connect multiple users (admins, managers, drivers, customers) working together in real-time.

---

## What Was Built

```
backend/
├── models/
│   ├── User.js       ← Users (admin/manager/driver/customer)
│   ├── Driver.js     ← Driver profiles + GPS location
│   └── Shipment.js   ← Shipments with multi-stop routes
├── routes/
│   ├── auth.js       ← Login / Register / JWT
│   ├── users.js      ← User management
│   ├── drivers.js    ← Driver profiles + GPS updates
│   └── shipments.js  ← Shipment CRUD + live tracking
├── middleware/
│   └── auth.js       ← JWT verification + role guards
├── server.js         ← Express server
├── seed.js           ← Sample data populator
├── package.json
└── .env              ← MongoDB connection string

src/
└── api.js            ← Frontend API client (calls backend)
```

---

## Step 1 — Install Backend Dependencies

Open a terminal in the `backend/` folder:

```bash
cd backend
npm install
```

This installs: `express`, `mongoose`, `bcryptjs`, `jsonwebtoken`, `cors`, `dotenv`, `nodemon`

---

## Step 2 — Configure MongoDB Connection

### Option A: Local MongoDB (if you have MongoDB installed)

Your `backend/.env` is already set to:
```
MONGO_URI=mongodb://localhost:27017/cargoflow
```

### Option B: MongoDB Compass with Remote Database

If your MongoDB Compass connects to a remote database (Atlas, etc.):

1. Open MongoDB Compass
2. Click "Connect" → copy the connection string
3. Edit `backend/.env` and replace the `MONGO_URI` line:

```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/cargoflow?retryWrites=true&w=majority
```

---

## Step 3 — Seed the Database

Run this **once** to populate MongoDB with sample users and shipments:

```bash
cd backend
node seed.js
```

**What it creates:**

| Role     | Email                    | Password   | Name          |
|----------|--------------------------|------------|---------------|
| Admin    | admin@cargoflow.com      | admin123   | Admin User    |
| Manager  | manager@cargoflow.com    | manager123 | Sarah Manager |
| Driver 1 | driver1@cargoflow.com    | driver123  | Michael Chen  |
| Driver 2 | driver2@cargoflow.com    | driver123  | Elena Rossi   |
| Driver 3 | driver3@cargoflow.com    | driver123  | James Wilson  |
| Customer | customer1@example.com    | cust123    | John Smith    |

Plus 5 sample shipments (SH-482, SH-921, DEMO-1, etc.)

---

## Step 4 — Start the Backend Server

```bash
cd backend
npm run dev
```

You should see:
```
✅  MongoDB connected: mongodb://localhost:27017/cargoflow
🚀  Server running on http://localhost:5000
```

**Keep this terminal open** — the server needs to run while you use the app.

---

## Step 5 — Start the Frontend

Open a **new terminal** (keep backend running):

```bash
npm run dev
```

Frontend runs on `http://localhost:5173`

---

## How It Works Now

### Login Flow

1. User enters email + password on LoginPage
2. Frontend calls `POST /api/auth/login` → backend verifies against MongoDB
3. Backend returns JWT token + user data
4. Frontend stores token in `localStorage`
5. All future API calls include `Authorization: Bearer <token>` header
6. User is redirected to their role-specific dashboard

### Real-Time GPS Tracking

**Before (localStorage only):**
- DriverShipment writes GPS to `localStorage`
- Tracking pages poll `localStorage` every 3 seconds
- ❌ Only works in same browser, no cross-device sync

**Now (MongoDB + localStorage hybrid):**
- DriverShipment writes GPS to **both**:
  - `localStorage` (instant same-tab updates)
  - `PATCH /api/drivers/me/location` (syncs to MongoDB)
- Tracking pages read from **both**:
  - `localStorage` (instant local updates)
  - `GET /api/drivers` every 5 seconds (cross-device sync)
- ✅ Works across devices — manager on desktop sees driver's phone GPS live

### Multi-User Collaboration

**Admin** can:
- View all shipments, drivers, users
- Create/edit/delete anything
- Assign drivers to shipments

**Manager** can:
- View all shipments
- Create shipments
- Assign drivers
- Track fleet in real-time

**Driver** can:
- See only their assigned shipments
- Update shipment status
- Broadcast live GPS location
- Mark stops as completed

**Customer** can:
- Track their own shipments by ID
- See live driver location
- View ETA and delivery progress

---

## API Endpoints Reference

### Auth
- `POST /api/auth/register` — Create account
- `POST /api/auth/login` — Login (returns JWT)
- `GET /api/auth/me` — Get current user

### Users
- `GET /api/users` — List all (admin only)
- `GET /api/users/drivers` — List drivers (admin + manager)
- `PUT /api/users/:id` — Update user

### Drivers
- `GET /api/drivers` — List all drivers (admin + manager)
- `GET /api/drivers/me` — Driver's own profile
- `PATCH /api/drivers/me/location` — Update GPS (driver only)
- `PATCH /api/drivers/me/status` — on-duty / off-duty / on-break

### Shipments
- `GET /api/shipments` — List (filtered by role)
- `GET /api/shipments/:id` — Get one
- `POST /api/shipments` — Create (admin + manager)
- `PUT /api/shipments/:id` — Update
- `PATCH /api/shipments/:id/location` — Update driver GPS
- `DELETE /api/shipments/:id` — Delete (admin only)

---

## Next Steps — Connect Frontend Components

The backend is ready. Now update your React components to use the API:

### 1. Update DriverShipment GPS broadcast

```javascript
// In startTracking() after writeLocation():
import { driversAPI } from '../api';

writeLocation(SHIPMENT_ID, coords.latitude, coords.longitude, accuracy);
// Also sync to MongoDB:
driversAPI.updateLocation({ lat: coords.latitude, lng: coords.longitude, accuracy });
```

### 2. Update Tracking page to fetch from MongoDB

```javascript
import { shipmentsAPI } from '../api';

useEffect(() => {
  const fetchShipments = async () => {
    const data = await shipmentsAPI.list({ status: 'in-transit' });
    setShipments(data);
  };
  fetchShipments();
  const interval = setInterval(fetchShipments, 5000); // poll every 5s
  return () => clearInterval(interval);
}, []);
```

### 3. Update AdminShipments to fetch real data

```javascript
import { shipmentsAPI } from '../api';

useEffect(() => {
  shipmentsAPI.list().then(setShipments);
}, []);
```

---

## Testing Multi-User Collaboration

### Scenario: Driver + Manager working together

1. **Terminal 1** — Start backend:
   ```bash
   cd backend
   npm run dev
   ```

2. **Terminal 2** — Start frontend:
   ```bash
   npm run dev
   ```

3. **Browser Tab 1** — Login as Driver:
   - Email: `driver1@cargoflow.com`
   - Password: `driver123`
   - Go to `/driver/shipments`
   - Click "Start GPS" — location broadcasts to MongoDB

4. **Browser Tab 2** (or different device) — Login as Manager:
   - Email: `manager@cargoflow.com`
   - Password: `manager123`
   - Go to `/manager/shipments`
   - See driver's live GPS marker moving on the map

5. **Browser Tab 3** — Customer tracking (no login):
   - Go to `/customer-tracking`
   - Enter `SH-482`
   - See driver's live location

---

## MongoDB Compass — View Your Data

1. Open MongoDB Compass
2. Connect to `mongodb://localhost:27017` (or your connection string)
3. Select database: `cargoflow`
4. Collections:
   - `users` — all accounts
   - `drivers` — driver profiles with GPS
   - `shipments` — all shipments with stops

You can manually edit data here and it syncs to the app instantly.

---

## Troubleshooting

### "MongoDB connection failed"
- Make sure MongoDB is running (if local)
- Check your connection string in `backend/.env`
- Test connection in MongoDB Compass first

### "CORS error" in browser console
- Backend must be running on `http://localhost:5000`
- Frontend must be on `http://localhost:5173`
- Check `cors()` config in `backend/server.js`

### "Token invalid" errors
- Clear browser localStorage: `localStorage.clear()`
- Login again to get a fresh token

### GPS not syncing across devices
- Check backend logs — should see `PATCH /api/drivers/me/location` requests
- Verify `driversAPI.updateLocation()` is called in `DriverShipment.jsx`

---

## Production Deployment

When ready to deploy:

1. **Backend** → Deploy to Heroku / Railway / Render
2. **MongoDB** → Use MongoDB Atlas (free tier)
3. **Frontend** → Deploy to Vercel / Netlify
4. Update `src/api.js` BASE URL to your backend domain
5. Update `backend/server.js` CORS to allow your frontend domain

---

**You're all set!** Run `cd backend && npm install && node seed.js && npm run dev` to start.
