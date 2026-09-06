# 🔍 FindBack — Lost & Found Intelligent System

A full-stack MERN application with intelligent matching, multi-level verification, and dual OTP confirmation.

## 🚀 Features

- **Smart Matching Algorithm** — Matches lost & found items by description, category, city, date, color, brand
- **Multi-Level Verification** — Hidden item details, proof-based validation
- **Dual OTP Confirmation** — Both parties verify via email OTP before resolution
- **Real-time Notifications** — In-app + email notifications for matches
- **User Authentication** — JWT-based with email OTP verification
- **Image Uploads** — Multer-based with drag & drop UI
- **Responsive UI** — Mobile-first Tailwind CSS design
- **Search & Filter** — Full-text search, category, city, type filters
- **User Reputation** — Track reliability of users

## 🗂 Project Structure

```
findback/
├── backend/           # Express + MongoDB API
│   ├── config/        # DB connection
│   ├── controllers/   # Route logic
│   ├── middleware/    # Auth, upload, error handling
│   ├── models/        # Mongoose schemas
│   ├── routes/        # Express routes
│   └── utils/         # Email, matching algorithm
└── frontend/          # React + Vite + Tailwind
    └── src/
        ├── components/ # Navbar, Footer, ItemCard
        ├── context/    # AuthContext
        ├── pages/      # All page components
        └── utils/      # Axios API instance
```

## ⚙️ Setup & Installation

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)
- Gmail account (for OTP emails)

### 1. Clone & Install
```bash
git clone <repo-url>
cd findback

# Install all dependencies
npm install
npm run install:all
```

### 2. Backend Environment
```bash
cd backend
cp .env.example .env
```
Edit `.env`:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/lostfound
JWT_SECRET=your_super_secret_key_here
JWT_EXPIRE=7d

# Gmail SMTP (use App Password, not your real password)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_16_char_app_password

CLIENT_URL=http://localhost:5173
OTP_EXPIRE_MINUTES=10
```

> **Gmail App Password**: Go to Google Account → Security → 2-Step Verification → App passwords

### 3. Run Development Servers
```bash
# From root
npm run dev

# Or separately:
npm run dev:backend    # Backend on port 5000
npm run dev:frontend   # Frontend on port 5173
```

### 4. Open Browser
Visit `http://localhost:5173`

## 📋 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register user |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/verify-email` | Verify email OTP |
| POST | `/api/auth/forgot-password` | Request reset OTP |
| POST | `/api/auth/reset-password` | Reset with OTP |
| GET | `/api/auth/profile` | Get user profile |

### Items
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/items` | Browse items (with filters) |
| POST | `/api/items` | Create new item report |
| GET | `/api/items/:id` | Get single item |
| PUT | `/api/items/:id` | Update item |
| DELETE | `/api/items/:id` | Delete item |
| GET | `/api/items/my` | Get my items |
| GET | `/api/items/stats` | Platform stats |

### Matches
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/matches` | Get my matches |
| GET | `/api/matches/:id` | Get match details |
| POST | `/api/matches/:id/initiate` | Initiate claim |
| POST | `/api/matches/verify-otp` | Verify OTP |

### Notifications
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/notifications` | Get notifications |
| PUT | `/api/notifications/mark-read` | Mark all read |

## 🔐 Security Features

1. **Hidden Details** — Submitter adds secret info (e.g., engraving, wallpaper) not visible publicly
2. **Dual OTP Verification** — Both lost owner AND found owner must verify via separate OTPs
3. **JWT Authentication** — Secure token-based auth with 7-day expiry
4. **Bcrypt Passwords** — Passwords hashed with 12 salt rounds
5. **Email Verified Accounts** — Users must verify email before accessing the platform

## 🧠 Matching Algorithm

Scores are calculated (0-100) based on:
- **Category match**: 25 points
- **Text similarity** (title + description): up to 30 points
- **Location match** (city/state): up to 20 points  
- **Date proximity** (1 day to 30 days): up to 15 points
- **Color match**: 5 points
- **Brand match**: 5 points

Matches with score ≥ 40 are surfaced. Email notifications sent for ≥ 60.

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS |
| State | React Context API |
| Forms | React Hook Form |
| Routing | React Router v6 |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| Auth | JWT, Bcrypt |
| Email | Nodemailer |
| Upload | Multer |
| Fonts | Syne, DM Sans |
