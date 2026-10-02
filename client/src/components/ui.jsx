import React, { createContext, useContext, useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useLocation } from 'react-router-dom';
import { MessageCircle, Star, Compass, MapPin, ArrowRight, Shield, Check, Phone, Clock, Calendar, Users, Fuel, Award, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { api, img } from '../api.js';

const SettingsContext = createContext({});

export const useSettings = () => useContext(SettingsContext);

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState({
    businessName: 'Ranjit Tour & Travels',
    tagline: 'Your Journey. Our Route. Royal Route Experience.',
    phone: '+91 98165 96713',
    whatsapp: '+91 98165 96713',
    email: 'info@ranjittravels.com',
    address: 'Railway Station, Amb Andaura, District Una, Himachal Pradesh, India 177203',
    city: 'Amb Andaura, Una',
    state: 'Himachal Pradesh',
    pincode: '177203',
    businessHours: 'Open 24 Hours · 7 Days a Week (Round-the-Clock Chauffeur Dispatch)',
    stats: [
      { label: 'Years of Experience', value: '18+' },
      { label: 'Happy Travelers', value: '45,000+' },
      { label: 'Destinations Covered', value: '85+' },
      { label: 'Luxury Fleet Vehicles', value: '120+' }
    ]
  });

  useEffect(() => {
    api.get('/settings')
      .then(res => {
        if (res.data) setSettings(res.data);
      })
      .catch(() => {});
  }, []);

  return (
    <SettingsContext.Provider value={settings}>
      {children}
    </SettingsContext.Provider>
  );
}

export function Seo({ title, description, image, jsonLd, keywords = [] }) {
  const s = useSettings();
  const location = useLocation();
  const siteUrl = import.meta.env.VITE_SITE_URL || window.location.origin;
  const pageTitle = title ? `${title} | ${s.businessName || 'Ranjit Tour & Travels'}` : `${s.businessName || 'Ranjit Tour & Travels'} | Luxury Tours & Outstation Taxi`;
  const metaDesc = description || s.heroText || 'Book custom Himachal tour packages, luxury cabs from Chandigarh and Delhi, and Spiti/Ladakh expeditions.';
  const canonicalUrl = `${siteUrl}${location.pathname}`;
  const ogImg = image ? img(image) : 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=1200&q=80';

  return (
    <Helmet>
      <title>{pageTitle}</title>
      <meta name="description" content={metaDesc} />
      {keywords.length > 0 && <meta name="keywords" content={keywords.join(', ')} />}
      <link rel="canonical" href={canonicalUrl} />
      
      {/* Open Graph */}
      <meta property="og:site_name" content={s.businessName || 'Ranjit Tour & Travels'} />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={metaDesc} />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={ogImg} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={metaDesc} />
      <meta name="twitter:image" content={ogImg} />

      {/* Structured Data JSON-LD */}
      {jsonLd && (
        <script type="application/ld+json">
          {JSON.stringify(jsonLd)}
        </script>
      )}
    </Helmet>
  );
}

export function Logo({ compact = false, light = false }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-teal-500/30 via-emerald-500/20 to-teal-700/40 p-0.5 backdrop-blur-md border border-teal-400/40 shadow-lg shadow-teal-900/20 flex items-center justify-center flex-shrink-0 group overflow-hidden">
        {/* Specular glass reflection sheen */}
        <div className="absolute top-0 inset-x-0 h-1/2 bg-gradient-to-b from-white/30 to-transparent pointer-events-none rounded-t-[10px]" />
        
        <img
          src="/favicon.svg"
          alt="Ranjit Tour & Travels Glassmorphism Logo"
          className="w-6 h-6 sm:w-7 sm:h-7 object-contain relative z-10 transition-transform duration-500 group-hover:scale-110 drop-shadow-sm"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
        <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-white animate-pulse z-20" />
      </div>
      {!compact && (
        <div className="flex flex-col min-w-0">
          <span className={`font-display font-extrabold text-sm sm:text-base md:text-lg tracking-tight leading-none whitespace-nowrap ${light ? 'text-white' : 'text-slate-900'}`}>
            RANJIT <span className={light ? 'text-teal-300' : 'text-teal-700'}>TOURS</span>
          </span>
          <span className={`text-[8px] sm:text-[9px] tracking-[0.15em] sm:tracking-[0.2em] uppercase font-bold mt-0.5 whitespace-nowrap ${light ? 'text-teal-200/80' : 'text-slate-500'}`}>
            Himachal & North India
          </span>
        </div>
      )}
    </div>
  );
}

export function Cover({ src, alt, className = '' }) {
  const [loaded, setLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const fallbackImg = 'https://images.unsplash.com/photo-1597074866923-dc0589150358?auto=format&fit=crop&w=1200&q=80';

  return (
    <div className={`relative overflow-hidden w-full h-full bg-slate-200 ${className}`}>
      <img
        src={hasError || !src ? fallbackImg : img(src)}
        alt={alt || 'Ranjit Tour & Travels'}
        loading="lazy"
        onLoad={() => setLoaded(true)}
        onError={() => {
          setHasError(true);
          setLoaded(true);
        }}
        className={`w-full h-full object-cover transition-all duration-500 ${loaded ? 'scale-100 opacity-100' : 'scale-105 opacity-80'}`}
      />
    </div>
  );
}

export function RatingStars({ rating = 5, count }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex text-amber-500">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            size={14}
            className={i <= Math.round(rating) ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}
          />
        ))}
      </div>
      <span className="text-xs font-bold text-slate-800">{rating.toFixed(1)}</span>
      {count != null && <span className="text-xs text-slate-500">({count})</span>}
    </div>
  );
}

export function Breadcrumbs({ items }) {
  return (
    <nav aria-label="Breadcrumb" className="text-xs text-slate-500 flex items-center flex-wrap gap-2 mb-4">
      <Link to="/" className="hover:text-teal-700 transition">Home</Link>
      {items.map((item, idx) => (
        <React.Fragment key={idx}>
          <span className="opacity-40">/</span>
          {item.to ? (
            <Link to={item.to} className="hover:text-teal-700 transition">{item.label}</Link>
          ) : (
            <span className="text-teal-800 font-semibold">{item.label}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}

export function JourneyRoute({ stops = [] }) {
  if (!stops || stops.length === 0) return null;
  const n = stops.length;
  const W = 800;
  const pts = stops.map((_, i) => [
    40 + i * ((W - 80) / Math.max(n - 1, 1)),
    i % 2 === 0 ? 50 : 90
  ]);

  const pathD = pts
    .map((p, i) => {
      if (i === 0) return `M ${p[0]} ${p[1]}`;
      const prev = pts[i - 1];
      const cx = (prev[0] + p[0]) / 2;
      const cy = prev[1] > p[1] ? 20 : 120;
      return `Q ${cx} ${cy} ${p[0]} ${p[1]}`;
    })
    .join(' ');

  return (
    <div className="w-full bg-white border border-slate-200 rounded-2xl p-6 relative overflow-hidden shadow-sm">
      <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-teal-600" />
          <h3 className="font-display text-sm tracking-wider uppercase text-slate-900 font-bold">Signature Journey Route</h3>
        </div>
        <span className="text-xs text-teal-700 font-mono font-semibold">30.9010° N · 75.8573° E</span>
      </div>

      <div className="overflow-x-auto pb-4">
        <svg viewBox={`0 0 ${W} 140`} className="min-w-[650px] w-full" role="img" aria-label={`Travel route stops: ${stops.join(' to ')}`}>
          {/* Background route line */}
          <path d={pathD} fill="none" stroke="#e2e8f0" strokeWidth="4" />
          
          {/* Animated Sea Green dash line */}
          <motion.path
            d={pathD}
            fill="none"
            stroke="#0d9488"
            strokeWidth="2.5"
            strokeDasharray="8 6"
            className="animate-route-dash"
            initial={{ pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.8, ease: "easeInOut" }}
          />

          {/* Location Nodes */}
          {pts.map((p, i) => (
            <g key={i}>
              <circle cx={p[0]} cy={p[1]} r="10" fill="#ffffff" stroke="#0d9488" strokeWidth="2.5" />
              <circle cx={p[0]} cy={p[1]} r="4" fill="#059669" />
              <text
                x={p[0]}
                y={p[1] + (i % 2 === 0 ? -16 : 26)}
                textAnchor="middle"
                fontSize="11"
                fontWeight="700"
                fill="#0f172a"
                className="font-sans"
              >
                {stops[i]}
              </text>
              <text
                x={p[0]}
                y={p[1] + (i % 2 === 0 ? -28 : 38)}
                textAnchor="middle"
                fontSize="9"
                fill="#64748b"
                className="font-mono uppercase tracking-wider font-semibold"
              >
                {i === 0 ? 'START' : i === n - 1 ? 'RETURN' : `STOP 0${i}`}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}

export const waLink = (settings = {}, text = '') => {
  const whatsappNumber = typeof settings === 'string' ? settings : (settings?.whatsapp || settings?.phone || '+919816596713');
  const num = (whatsappNumber || '+919816596713').replace(/\D/g, '') || '919816596713';
  return `https://wa.me/${num}?text=${encodeURIComponent(text)}`;
};

export function WhatsAppButton({ text = 'Hello Ranjit Tour & Travels, I want information about planning a trip.', label = 'WhatsApp Us', className = '' }) {
  const s = useSettings();
  return (
    <a
      href={waLink(s, text)}
      target="_blank"
      rel="noopener noreferrer"
      className={`btn-turquoise ${className}`}
    >
      <MessageCircle size={18} />
      <span>{label}</span>
    </a>
  );
}

export function Loading() {
  return (
    <div className="min-h-[300px] flex flex-col items-center justify-center p-12 text-center" role="status">
      <div className="relative w-14 h-14 mb-4">
        <Compass className="w-14 h-14 text-teal-700 animate-spin-slow opacity-80" />
        <div className="absolute inset-0 rounded-full border-2 border-t-emerald-500 border-r-transparent border-b-transparent border-l-transparent animate-spin" />
      </div>
      <p className="text-sm font-bold tracking-wider text-slate-900 font-display">CALIBRATING ROYAL ROUTE…</p>
      <span className="text-xs text-slate-500 mt-1">Fetching live travel records</span>
    </div>
  );
}

export function ErrorBox({ message, onRetry }) {
  return (
    <div className="travel-card border-red-200 bg-white p-8 max-w-lg mx-auto my-8 text-center" role="alert">
      <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-3">
        <Shield className="w-6 h-6" />
      </div>
      <h3 className="font-display font-bold text-lg text-slate-900 mb-1">Route Coordinates Unavailable</h3>
      <p className="text-sm text-slate-600 mb-4">{message || 'We could not complete your request. Please check your connection.'}</p>
      {onRetry && (
        <button onClick={onRetry} className="btn-secondary text-xs">
          Try Again
        </button>
      )}
    </div>
  );
}
