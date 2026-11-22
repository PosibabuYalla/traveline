# TravelLine – Driver Partner Management Portal

A production-ready web application for managing TravelLine driver partner registrations, verification, and account management.

---

## Tech Stack

**Frontend:** React 19 · Vite · TypeScript · Tailwind CSS · Framer Motion · React Hook Form · Zod · TanStack Query · Zustand · React Router DOM · Lucide Icons

**Backend:** Node.js · Express · TypeScript · PostgreSQL · Prisma ORM · JWT (refresh rotation) · bcryptjs · Multer · Zod

---

## Prerequisites

- Node.js 18+
- PostgreSQL 14+
- npm 9+

---

## Setup

### 1. Database

Create a PostgreSQL database:

```sql
CREATE DATABASE travelline_db;
```

### 2. Backend

```bash
cd backend
npm install
cp .env.example .env
# Edit .env — set DATABASE_URL to your PostgreSQL connection string
npx prisma migrate dev --name init
npx prisma generate
npm run dev
```

The API will start on **http://localhost:3001**

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

The app will start on **http://localhost:5173**

---

## Environment Variables (backend/.env)

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Secret for access tokens (change in production) |
| `JWT_REFRESH_SECRET` | Secret for refresh tokens (change in production) |
| `JWT_EXPIRES_IN` | Access token TTL (default: `15m`) |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token TTL (default: `7d`) |
| `PORT` | API port (default: `3001`) |
| `CORS_ORIGIN` | Frontend origin (default: `http://localhost:5173`) |
| `UPLOAD_DIR` | File upload directory (default: `./uploads`) |
| `MAX_FILE_SIZE` | Max upload size in bytes (default: `5242880` = 5MB) |

---

## Application Modules

| Route | Description |
|---|---|
| `/login` | Driver login |
| `/register` | 3-step driver registration wizard |
| `/registration-success` | Post-registration confirmation |
| `/dashboard` | Driver dashboard with stats and verification status |
| `/profile` | View and edit driver profile |
| `/documents` | Upload and manage identity documents |
| `/vehicles` | Register and manage personal vehicles |
| `/notifications` | Notification center |
| `/settings` | Account settings, password, theme |

---

## API Endpoints

### Auth
- `POST /api/auth/register` — create account
- `POST /api/auth/login` — login
- `POST /api/auth/refresh` — refresh tokens
- `POST /api/auth/logout` — logout
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`
- `GET  /api/auth/me`

### Driver
- `GET  /api/drivers/me`
- `PUT  /api/drivers/me`
- `PUT  /api/drivers/registration/step/:step`
- `POST /api/drivers/registration/submit`

### Documents
- `POST /api/documents/upload`
- `GET  /api/documents/me`
- `DELETE /api/documents/:id`
- `POST /api/documents/:id/resubmit`

### Vehicles
- `POST /api/vehicles`
- `GET  /api/vehicles`
- `GET  /api/vehicles/:id`
- `PUT  /api/vehicles/:id`
- `DELETE /api/vehicles/:id`

### Dashboard
- `GET /api/dashboard/overview`
- `GET /api/dashboard/notifications`

### Notifications
- `GET /api/notifications`
- `PUT /api/notifications/:id/read`
- `PUT /api/notifications/read-all`

---

## Registration Flow

1. Driver visits `/register`
2. **Step 1** — Personal details, address, registration type (Driver Only or Driver + Vehicle)
3. **Step 2** — Driving experience, licence details, languages, driving categories, emergency contact
4. **Step 3** — Document uploads, conditional vehicle details (Driver + Vehicle only), permissions, consent
5. **Success screen** — shows registration ID and verification timeline

---

## Document Types

| Code | Label | Required |
|---|---|---|
| `AADHAAR_CARD` | Aadhaar Card | Yes |
| `DRIVING_LICENCE_FRONT` | Driving Licence Front | Yes |
| `DRIVING_LICENCE_BACK` | Driving Licence Back | Yes |
| `PROFILE_PHOTO` | Profile Photograph | Yes |
| `ADDRESS_PROOF` | Address Proof | Yes |
| `PAN_CARD` | PAN Card | No |

Accepted formats: JPG, JPEG, PNG, PDF — max 5 MB each.

---

## Production Build

```bash
# Frontend
cd frontend && npm run build

# Backend
cd backend && npm run build && npm start
```

---

## Security Notes

- Never commit `.env` to version control
- Rotate `JWT_SECRET` and `JWT_REFRESH_SECRET` in production
- Configure Cloudinary (or S3) in production instead of local disk storage
- Enable HTTPS in production
- Set `NODE_ENV=production` in deployment
