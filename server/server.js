import express from 'express';
import dotenv from 'dotenv';
dotenv.config();
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';

import mongoose from 'mongoose';
import { connectDB } from './config/db.js';
import { errorHandler } from './middleware/errorHandler.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import destinationRoutes from './routes/destinationRoutes.js';
import packageRoutes from './routes/packageRoutes.js';
import vehicleRoutes from './routes/vehicleRoutes.js';
import serviceRoutes from './routes/serviceRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import inquiryRoutes from './routes/inquiryRoutes.js';
import blogRoutes from './routes/blogRoutes.js';
import testimonialRoutes from './routes/testimonialRoutes.js';
import galleryRoutes from './routes/galleryRoutes.js';
import customerRoutes from './routes/customerRoutes.js';
import couponRoutes from './routes/couponRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import settingsRoutes from './routes/settingsRoutes.js';
import statsRoutes from './routes/statsRoutes.js';
import searchRoutes from './routes/searchRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import seoRoutes from './routes/seoRoutes.js';
import syncRoutes from './routes/syncRoutes.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

const buildAllowedOrigins = () => {
  const configuredOrigins = [
    process.env.CLIENT_URL,
    process.env.VITE_SITE_URL,
    process.env.VITE_API_ORIGIN,
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'https://localhost:5173',
    'https://127.0.0.1:5173',
    'https://ranjittourandtravels.in',
    'https://www.ranjittourandtravels.in'
  ].filter(Boolean);

  return [...new Set(configuredOrigins)];
};

const isAllowedOrigin = (origin) => {
  if (!origin) return true;

  const allowedOrigins = buildAllowedOrigins();
  if (allowedOrigins.includes(origin)) return true;

  try {
    const hostname = new URL(origin).hostname;
    return hostname.endsWith('.vercel.app') || hostname.endsWith('.netlify.app');
  } catch {
    return false;
  }
};

const app = express();

// CORS middleware: allow the configured client origins plus local development hosts.
app.use((req, res, next) => {
  const origin = req.headers.origin;

  if (origin && isAllowedOrigin(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Vary', 'Origin');
  } else if (!origin) {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, PUT, PATCH, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Range, Client-Version');
  res.setHeader('Access-Control-Expose-Headers', 'Content-Length, Content-Range, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  next();
});

app.options('*', (req, res) => res.status(204).end());

// Connect Database
connectDB();

// Ensure DB connected on requests
app.use(async (req, res, next) => {
  try {
    if (mongoose && mongoose.connection && mongoose.connection.readyState === 0) {
      await connectDB();
    }
  } catch (e) {}
  next();
});

// 3. Security & Middlewares
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));
app.use(morgan('dev'));

// Rate Limiting (Skip preflight OPTIONS and health checks)
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 600,
  skip: (req) => req.method === 'OPTIONS' || req.path === '/' || req.path === '/healthz' || req.path === '/api/health',
  message: { success: false, message: 'Too many requests from this IP, please try again in 15 minutes.' }
});
app.use('/api', generalLimiter);

// Disable caching on all API responses so mobile & desktop clients always receive live database data
app.use('/api', (req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('Surrogate-Control', 'no-store');
  next();
});

// Root health check & Render ping endpoints (Resolves Render HEAD / 404)
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'online',
    platform: 'Ranjit Tour & Travels Enterprise API',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

app.head('/', (req, res) => {
  res.status(200).end();
});

app.get('/healthz', (req, res) => {
  res.status(200).send('OK');
});

// Serve static uploads & public images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/images', express.static(path.join(__dirname, 'public', 'images')));
app.use(express.static(path.join(__dirname, 'public')));

// Public SEO direct endpoints
app.use('/', seoRoutes);

// API Endpoints
app.use('/api/auth', authRoutes);
app.use('/api/destinations', destinationRoutes);
app.use('/api/packages', packageRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/inquiries', inquiryRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/testimonials', testimonialRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/sync', syncRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    platform: 'Ranjit Tour & Travels Enterprise API',
    timestamp: new Date().toISOString()
  });
});

// Centralized error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`[Ranjit Tour & Travels Server] running on http://localhost:${PORT}`);
  });
}

export default app;
