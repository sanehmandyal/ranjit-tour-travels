# Ranjit Tour & Travels — Premium MERN Stack Travel Platform

> **"Your Journey. Our Route."**  
> An enterprise-grade, SEO-first, production-ready tour & travel platform tailored for **Ranjit Tour & Travels**, featuring the unique **"Travel Map + Royal Route Experience"** design language.

---

## 🧭 Design Concept & Brand Identity
- **Visual Language**: Dark Charcoal (`#0f1012`) background with warm sand/ivory surfaces, royal gold metallic accents (`#d4af37`), electric turquoise highlights (`#2dd4bf`), topographic contour patterns, animated SVG route curves, and GPS coordinate markers (`30.9010° N · 75.8573° E`).
- **Signature Interaction**: Interactive **"Journey Route"** visualizer depicting the 5-stage travel path (`Start → Pickup → Destination → Curated Experiences → Safe Return`).
- **Typography**: Editorial display serif titles paired with modern, highly legible sans-serif for conversion-focused usability.

---

## 🚀 Tech Stack
### **Frontend (`/client`)**
- **Framework**: React 18 + Vite
- **Routing**: React Router DOM v6
- **Styling**: Tailwind CSS (custom theme variables + glassmorphism)
- **Icons**: Lucide React
- **Animations**: Framer Motion (respects `prefers-reduced-motion`)
- **SEO**: React Helmet Async + JSON-LD Structured Data
- **HTTP Client**: Axios with centralized auth interceptors

### **Backend (`/server`)**
- **Runtime**: Node.js + Express.js (ES Modules)
- **Database**: MongoDB with Mongoose ODM (indexed schemas)
- **Authentication**: JWT (JSON Web Tokens) with HTTP headers & role-based middleware
- **Security**: Helmet, CORS origin whitelisting, bcryptjs hashing, Express Rate Limiter, and centralized error handling
- **Image Management**: Multer multipart upload with support for local disk storage and cloud CDN

---

## 📂 Project Structure
```
ranjit-tour-travels/
├── client/                      # React + Vite Frontend
│   ├── src/
│   │   ├── admin/
│   │   │   └── Admin.jsx        # SaaS Admin Portal (CRUD + Analytics)
│   │   ├── components/
│   │   │   └── ui.jsx           # Reusable UI, SEO, JourneyRoute, Ratings, WhatsApp
│   │   ├── pages/
│   │   │   └── Pages.jsx        # Home, Listings, Details, Booking, Custom Tour, Blog
│   │   ├── api.js               # Axios instance & error handling
│   │   ├── App.jsx              # Routing & Main Shell layout
│   │   ├── index.css            # Custom Design System
│   │   └── main.jsx             # React DOM root & Providers
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
├── server/                      # Express + Node.js Backend
│   ├── config/
│   │   └── db.js                # MongoDB connection handler
│   ├── controllers/             # Clean REST API controllers
│   ├── middleware/              # Auth, RBAC, Multer & Error handler
│   ├── models/                  # 14 Mongoose Schema Models
│   ├── routes/                  # Modular Express router endpoints
│   ├── seed/
│   │   └── seed.js              # Database seed script with rich demo data
│   ├── uploads/                 # Uploaded vehicle & destination photos
│   ├── server.js                # Express app entry point
│   ├── .env.example
│   └── package.json
│
├── README.md
└── package.json
```

---

## ⚙️ Environment Variables Setup

### Server (`server/.env`)
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/ranjit_travels
JWT_SECRET=super_secret_jwt_key_ranjit_tour_and_travels_2026_royal_route
CLIENT_URL=http://localhost:5173
WHATSAPP_NUMBER=+919876543210
```

### Client (`client/.env`)
```env
VITE_API_URL=http://localhost:5000/api
VITE_API_ORIGIN=http://localhost:5000
VITE_SITE_URL=http://localhost:5173
```

---

## 📦 Quick Installation & Startup

### 1. Install Dependencies
```bash
# Install server & client packages
npm run install:all
```

### 2. Seed Database with Realistic Demo Data
```bash
npm run seed
```
> **Default Admin Credentials:**  
> **Email:** `admin@ranjittravels.com`  
> **Password:** `admin123`  
> *(Editor Account: `editor@ranjittravels.com` / `editor123`)*

### 3. Start Development Servers
```bash
# Terminal 1: Start Backend Server (port 5000)
npm run dev:server

# Terminal 2: Start Frontend Client (port 5173)
npm run dev:client
```

---

## 🌟 Pages & Key Features

### **Public Pages**
1. **Homepage (`/`)**: Interactive journey finder hero, 5-stage Journey Route, statistics, popular destinations, package cards, fleet showcase, services, and live reviews.
2. **About Us (`/about`)**: Company history, safety protocols, chauffeur standards, and royal hospitality philosophy.
3. **Destinations (`/destinations`)**: Filterable grid with starting prices, state badges, and rich guides for Manali, Shimla, Dharamshala, Spiti, Ladakh, etc.
4. **Destination Details (`/destinations/:slug`)**: High-res gallery, GPS coordinates, best travel seasons, attractions list, activities, and FAQs.
5. **Tour Packages (`/tour-packages`)**: Filterable packages with category tags, pricing, and duration filters.
6. **Package Details (`/tour-packages/:slug`)**: Interactive day-by-day itinerary timeline, inclusions vs exclusions comparison, hotel & vehicle details, and sticky booking card.
7. **Vehicles & Cabs (`/cars`)**: Filterable fleet (Innova Crysta, Fortuner 4x4, Force Urbania 17-seater, Tempo Traveller 12-seater, Maruti Dzire Sedan).
8. **Vehicle Details (`/cars/:slug`)**: Specifications table, luggage capacity, per-km rate, per-day pricing, and instant booking.
9. **Services (`/services`)**: Outstation cabs, one-way drops, airport transfers, corporate delegations, and wedding convoys.
10. **Custom Tour Builder (`/custom-tour`)**: Multi-step interactive "Build Your Journey" wizard allowing travelers to select custom destinations, hotels, vehicles, and budget.
11. **Booking & Inquiry (`/booking`)**: Full validation, coupon discount calculation (`ROYAL10`), and automatic sequential **Booking ID** generation (`RJT-2026-XXXX`).
12. **Gallery (`/gallery`)**: Masonry photo gallery with category filter tabs.
13. **Travel Journal / Blog (`/blog` & `/blog/:slug`)**: Long-form travel guides with clean SEO slugs.
14. **Contact Us (`/contact`)**: NAP consistency, 24/7 helpline cards, direct message form, and Google Maps info.
15. **Local SEO Pages (`/locations/:city`)**: Dedicated landing pages for Chandigarh, Mohali, Zirakpur, Panchkula, and Delhi.
16. **Legal Pages**: Privacy Policy, Terms & Conditions, Refund Policy, and HTML Sitemap.

### **Admin Portal (`/admin/login` & `/admin/*`)**
- **Protected JWT Authentication** with auto-expiration logout.
- **Role-Based Access Control**: `superadmin`, `admin`, `editor`.
- **Analytics Dashboard**: Live metrics for total bookings, pending dispatch requests, confirmed tours, completed trips, and revenue metrics.
- **Full CRUD Management**:
  - Bookings Manager with status updates (`New` → `Contacted` → `Confirmed` → `In Progress` → `Completed` → `Cancelled`).
  - Inquiries CRM for custom trips & contact messages.
  - Destinations Manager with image upload, coordinates, and attractions.
  - Tour Packages Manager with itinerary builder and inclusions.
  - Fleet Manager with seats, luggage, per-km rates, and features.
  - Services, Blogs, Gallery, Testimonials, and Coupons CMS.
  - Global Website Settings (Business NAP, phone, email, hero content, social links).

---

## 🔍 SEO & Structured Data Implementation
- Dynamic `sitemap.xml` generated at `/sitemap.xml`.
- Search engine crawler rules at `/robots.txt`.
- Schema.org JSON-LD Structured Data included:
  - `TravelAgency` / `LocalBusiness`
  - `TouristTrip`
  - `Product` & `Offer`
  - `BreadcrumbList`
  - `FAQPage`
  - `Article`

### Google Search Console Submission:
1. Verify domain ownership using the Google Search Console meta tag configurable in Admin Settings.
2. Submit sitemap URL: `https://yourdomain.com/sitemap.xml`.

---

## 🚢 Production Deployment

### Frontend (Vercel)
1. Link GitHub repository to Vercel.
2. Root directory: `client`
3. Build Command: `npm run build`
4. Output Directory: `dist`
5. Set environment variable: `VITE_API_URL=https://your-backend-api.onrender.com/api`

### Backend (Render / Railway / VPS)
1. Root directory: `server`
2. Build Command: `npm install`
3. Start Command: `npm start`
4. Configure MongoDB Atlas connection string in `MONGO_URI`.

---

© 2026 **Ranjit Tour & Travels**. Built for royal journeys across Northern India.
