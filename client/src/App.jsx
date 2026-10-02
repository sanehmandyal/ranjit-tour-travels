import React, { lazy, Suspense, useState, useEffect } from 'react';
import { Routes, Route, Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { 
  Menu, X, Phone, Compass, MapPin, Search as SearchIcon, 
  MessageCircle, Shield, Award, Calendar, ArrowRight, Sparkles 
} from 'lucide-react';

import { SettingsProvider, Loading, useSettings, Logo, WhatsAppButton, waLink } from './components/ui.jsx';
import { 
  Home, Listing, Detail, Booking, CustomTour, Contact, About, 
  GalleryPage, TestimonialsPage, LocationPage, LegalPage, NotFound 
} from './pages/Pages.jsx';
import { api, img } from './api.js';

const Admin = lazy(() => import('./admin/Admin.jsx'));

const NAV_LINKS = [
  { path: '/', label: 'Home' },
  { path: '/destinations', label: 'Destinations' },
  { path: '/tour-packages', label: 'Packages' },
  { path: '/cars', label: 'Cabs' },
  { path: '/services', label: 'Services' },
  { path: '/custom-tour', label: 'Custom Tour' },
  { path: '/blog', label: 'Blogs' },
  { path: '/contact', label: 'Contact' }
];

// Global Live Autocomplete Search Component
function GlobalSearch({ isMobile = false, onSelect }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (query.trim().length > 1) {
      const timer = setTimeout(() => {
        api.get('/search', { params: { q: query } })
          .then(res => {
            setResults(res.data || []);
            setIsOpen(true);
          })
          .catch(() => setResults([]));
      }, 200);
      return () => clearTimeout(timer);
    } else {
      setResults([]);
      setIsOpen(false);
    }
  }, [query]);

  const handleSelect = (url) => {
    navigate(url);
    setQuery('');
    setIsOpen(false);
    if (onSelect) onSelect();
  };

  return (
    <div className={`relative ${isMobile ? 'w-full' : 'hidden md:block w-44 lg:w-56'}`}>
      <div className="relative flex items-center">
        <input
          type="text"
          className="w-full bg-slate-100/90 border border-slate-200/90 rounded-full py-2 pl-9 pr-3 text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition"
          placeholder="Search destinations, cabs…"
          aria-label="Global Search"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={() => query.length > 1 && setIsOpen(true)}
        />
        <SearchIcon className="w-3.5 h-3.5 text-teal-700 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
      </div>

      {isOpen && results.length > 0 && (
        <div className={`absolute top-full ${isMobile ? 'left-0 right-0' : 'right-0 w-72 lg:w-80'} mt-2 bg-white border border-slate-200 rounded-xl shadow-2xl p-2 z-50 divide-y divide-slate-100 max-h-72 overflow-y-auto`}>
          {results.map((res, i) => (
            <button
              key={i}
              onClick={() => handleSelect(res.url)}
              className="w-full text-left p-2.5 rounded-lg hover:bg-teal-50 flex items-center gap-3 transition min-h-[44px]"
            >
              {res.image && (
                <img src={img(res.image)} alt="" className="w-8 h-8 rounded object-cover flex-shrink-0" />
              )}
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-mono text-teal-700 uppercase font-semibold block">{res.type}</span>
                <span className="text-xs font-bold text-slate-900 block truncate">{res.label}</span>
                <span className="text-[11px] text-slate-500 truncate block">{res.sub}</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Public Layout Shell (Header, Mobile Menu, Footer, WhatsApp Floating Button)
function LayoutShell({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const s = useSettings();
  const location = useLocation();

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  return (
    <div className="min-h-screen flex flex-col justify-between bg-topo-pattern text-slate-900 selection:bg-teal-600 selection:text-white w-full overflow-x-hidden">
      {/* Top Announcement Bar (Visible on tablets & desktop) */}
      <div className="bg-slate-900/95 backdrop-blur-md text-teal-100 py-1.5 px-4 text-[11px] hidden sm:block border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-2">
          <div className="flex items-center gap-3 text-slate-300">
            <span className="flex items-center gap-1.5">
              <span className="text-rose-400">📍</span>
              <span className="truncate">Near Amb Andaura Railway Station, Una (HP)</span>
            </span>
            <span className="text-slate-600">·</span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>24/7 Helpline: <a href="tel:+919816596713" className="text-white font-bold hover:text-teal-300 transition">+91 98165 96713</a></span>
            </span>
          </div>
          <div className="flex items-center gap-3 text-teal-300">
            <Link to="/booking" className="hover:text-white transition font-medium">Quick Cab Booking</Link>
            <span className="text-slate-600">·</span>
            <Link to="/custom-tour" className="hover:text-white transition font-medium">Build Your Journey</Link>
            <span className="text-slate-600">·</span>
            <Link to="/admin/login" className="text-teal-200 hover:text-white transition font-medium">Admin</Link>
          </div>
        </div>
      </div>

      {/* Main Header / Glass Navbar */}
      <header className="sticky top-0 z-40 bg-white/95 border-b border-slate-200/80 shadow-xs transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-3">
          <Link to="/" className="flex-shrink-0" onClick={() => setMobileOpen(false)}>
            <Logo />
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-5 xl:gap-7 text-xs font-bold tracking-wider uppercase" aria-label="Main Navigation">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) =>
                  `transition whitespace-nowrap ${isActive ? 'text-teal-700 font-extrabold border-b-2 border-teal-600 pb-0.5' : 'text-slate-600 hover:text-teal-700'}`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          {/* Right Action Bar */}
          <div className="flex items-center gap-2 sm:gap-3">
            <GlobalSearch />

            <Link to="/booking" className="btn-primary hidden sm:inline-flex !py-2 !px-4 text-xs font-bold whitespace-nowrap shadow-sm">
              Plan My Trip
            </Link>

            {/* Mobile Hamburger Toggle Button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2.5 text-slate-800 hover:bg-slate-100 rounded-xl transition min-w-[44px] min-h-[44px] flex items-center justify-center cursor-pointer"
              aria-label="Toggle navigation menu"
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X size={26} className="text-teal-700" /> : <Menu size={26} className="text-slate-800" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer (Rendered outside header to guarantee proper full-screen overlay without clipping) */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex flex-col">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-950/60 transition-opacity"
            onClick={() => setMobileOpen(false)}
          />

          {/* Drawer Content */}
          <div className="relative z-10 bg-white w-full max-h-[90vh] flex flex-col shadow-2xl border-b border-slate-200">
            {/* Drawer Header */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <Logo />
              <button
                onClick={() => setMobileOpen(false)}
                className="p-2 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100 min-w-[40px] min-h-[40px] flex items-center justify-center cursor-pointer"
                aria-label="Close menu"
              >
                <X size={24} />
              </button>
            </div>

            {/* Drawer Body */}
            <div className="p-4 overflow-y-auto space-y-4">
              {/* Mobile Search */}
              <GlobalSearch isMobile={true} onSelect={() => setMobileOpen(false)} />

              {/* Navigation Links */}
              <nav className="flex flex-col divide-y divide-slate-100 text-sm font-bold uppercase tracking-wider">
                {NAV_LINKS.map((link) => (
                  <NavLink
                    key={link.path}
                    to={link.path}
                    onClick={() => setMobileOpen(false)}
                    className={({ isActive }) =>
                      `py-3 px-3 rounded-lg flex items-center justify-between transition min-h-[44px] ${isActive ? 'bg-teal-50 text-teal-800 font-extrabold' : 'text-slate-800 hover:bg-slate-50'}`
                    }
                  >
                    <span>{link.label}</span>
                    <ArrowRight size={15} className="text-teal-600 opacity-60" />
                  </NavLink>
                ))}
              </nav>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 space-y-2.5">
                <Link
                  to="/booking"
                  onClick={() => setMobileOpen(false)}
                  className="btn-primary w-full text-center !py-3 text-xs font-bold shadow-md justify-center"
                >
                  <span>Book Cab / Tour Package</span>
                  <ArrowRight size={16} />
                </Link>

                <div className="grid grid-cols-2 gap-2">
                  <a
                    href="tel:+919816596713"
                    className="btn-secondary text-xs !py-2.5 justify-center font-bold"
                  >
                    <Phone size={14} className="text-teal-700" />
                    <span>Call Admin</span>
                  </a>
                  <a
                    href={waLink(s, 'Hello Ranjit Tour & Travels, I want to inquire about cabs / packages.')}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-turquoise text-xs !py-2.5 justify-center font-bold"
                  >
                    <MessageCircle size={15} />
                    <span>WhatsApp</span>
                  </a>
                </div>

                <div className="pt-2 text-center">
                  <Link
                    to="/admin/login"
                    onClick={() => setMobileOpen(false)}
                    className="text-[11px] text-slate-500 hover:text-teal-700 font-medium"
                  >
                    🔐 Admin Portal Login
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Page Content with safe padding for mobile bottom bar */}
      <div className="flex-1 w-full pb-20 sm:pb-0 overflow-x-hidden">
        {children}
      </div>

      {/* FOOTER */}
      <footer className="mt-20 border-t border-slate-200 bg-slate-900 text-slate-300 pt-16 pb-12 px-4">
        <div className="max-w-7xl mx-auto grid sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Col 1: Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold">
                <Compass className="w-6 h-6 animate-spin-slow" />
              </div>
              <div>
                <span className="block font-display font-bold text-lg text-white leading-none">
                  RANJIT <span className="text-teal-400">TOURS</span>
                </span>
                <span className="block text-[9px] tracking-[0.25em] text-teal-300 uppercase font-semibold mt-1">
                  Royal Route Experience
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              {s.footerAbout || 'Ranjit Tour & Travels is your premier north India travel concierge, operating customized tour packages, luxury sedans, Innova Crystas, and tempo travellers across Himachal, Punjab, Kashmir, Ladakh & Rajasthan.'}
            </p>
            <div className="pt-2 text-xs font-mono text-teal-400">
              <span>{s.businessHours || '24x7 Round-The-Clock Dispatch'}</span>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div className="space-y-3 text-xs text-slate-400">
            <h4 className="font-display font-bold text-white text-sm uppercase tracking-wider">Explore Routes</h4>
            <ul className="space-y-2">
              <li><Link to="/" className="hover:text-teal-400 transition">Home</Link></li>
              <li><Link to="/destinations" className="hover:text-teal-400 transition">Popular Destinations</Link></li>
              <li><Link to="/tour-packages" className="hover:text-teal-400 transition">Handcrafted Packages</Link></li>
              <li><Link to="/cars" className="hover:text-teal-400 transition">Innova & SUV Fleet</Link></li>
              <li><Link to="/custom-tour" className="hover:text-teal-400 transition">Build Your Journey</Link></li>
              <li><Link to="/testimonials" className="hover:text-teal-400 transition">Guest Reviews</Link></li>
            </ul>
          </div>

          {/* Col 3: Popular Local Hubs (SEO) */}
          <div className="space-y-3 text-xs text-slate-400">
            <h4 className="font-display font-bold text-white text-sm uppercase tracking-wider">Primary Service Hubs</h4>
            <ul className="space-y-2">
              <li><Link to="/booking?pickup=Amb+Andaura+Railway+Station" className="hover:text-teal-400 transition">Amb Andaura Station Taxi</Link></li>
              <li><Link to="/booking?destination=Mata+Chintpurni" className="hover:text-teal-400 transition">Mata Chintpurni & Jwala Ji Cabs</Link></li>
              <li><Link to="/booking?type=Vande+Bharat+Transfer" className="hover:text-teal-400 transition">Vande Bharat Express Pickup</Link></li>
              <li><Link to="/destinations/dharamshala" className="hover:text-teal-400 transition">Dharamshala & Kangra Devi</Link></li>
              <li><Link to="/destinations/manali" className="hover:text-teal-400 transition">Manali & Solang Valley Tours</Link></li>
              <li><Link to="/destinations/shimla" className="hover:text-teal-400 transition">Shimla & Kufri Holiday</Link></li>
            </ul>
          </div>

          {/* Col 4: Contact & NAP */}
          <div className="space-y-3 text-xs text-slate-400">
            <h4 className="font-display font-bold text-white text-sm uppercase tracking-wider">Dispatch Helpline</h4>
            <p className="text-slate-200 font-medium">Railway Station, Amb Andaura, Una, HP - 177203</p>
            <p>Phone & WhatsApp: <b className="text-teal-400">+91 98165 96713</b></p>
            <p>Email: <b className="text-slate-200">{s.email || 'info@ranjittravels.com'}</b></p>
            <div className="pt-2">
              <WhatsAppButton text="Hello Ranjit Tour & Travels, I want to book a taxi from Amb Andaura / Himachal." className="!py-2 !px-3 text-xs" />
            </div>
          </div>
        </div>

        {/* Legal & Copyright */}
        <div className="max-w-7xl mx-auto pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <span>© {new Date().getFullYear()} {s.businessName || 'Ranjit Tour & Travels'}. All rights reserved.</span>
          <div className="flex flex-wrap gap-4">
            <Link to="/privacy-policy" className="hover:text-teal-400">Privacy Policy</Link>
            <Link to="/terms-and-conditions" className="hover:text-teal-400">Terms & Conditions</Link>
            <Link to="/refund-policy" className="hover:text-teal-400">Refund Policy</Link>
            <Link to="/sitemap" className="hover:text-teal-400">Sitemap</Link>
            <Link to="/admin/login" className="hover:text-teal-400">Admin Portal</Link>
          </div>
        </div>
      </footer>

      {/* Sticky Mobile Booking Bottom Bar (Optimized for iPhone notch & modern Androids) */}
      <div className="sm:hidden fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-xl border-t border-slate-200/90 px-3 pt-2.5 pb-[calc(0.6rem+env(safe-area-inset-bottom,0px))] z-40 flex gap-2 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] items-center">
        <a
          href={`tel:${(s.phone || '+919816596713').replace(/\s+/g, '')}`}
          className="btn-secondary !py-2.5 !px-3 text-xs flex items-center justify-center gap-1.5 font-bold flex-shrink-0 min-h-[44px]"
        >
          <Phone size={15} className="text-teal-700" />
          <span>Call</span>
        </a>
        <a
          href={waLink(s, 'Hello Ranjit Tour & Travels, I want to inquire about a tour package / taxi.')}
          target="_blank"
          rel="noreferrer"
          className="btn-turquoise !py-2.5 !px-3 text-xs flex items-center justify-center gap-1.5 font-bold flex-1 min-h-[44px]"
        >
          <MessageCircle size={16} />
          <span>WhatsApp Us</span>
        </a>
        <Link to="/booking" className="btn-primary !py-2.5 !px-3 text-xs font-bold text-center flex-1 min-h-[44px] justify-center">
          Book Cab
        </Link>
      </div>
    </div>
  );
}

// Main App Router Component
export default function App() {
  return (
    <SettingsProvider>
      <Suspense fallback={<Loading />}>
        <Routes>
          {/* Admin Routes */}
          <Route path="/admin/*" element={<Admin />} />

          {/* Public Website Routes */}
          <Route path="*" element={
            <LayoutShell>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />

                {/* Listings & Details */}
                <Route path="/destinations" element={<Listing kind="destinations" />} />
                <Route path="/destinations/:slug" element={<Detail kind="destinations" />} />

                <Route path="/tour-packages" element={<Listing kind="tour-packages" />} />
                <Route path="/tour-packages/:slug" element={<Detail kind="tour-packages" />} />

                <Route path="/cars" element={<Listing kind="cars" />} />
                <Route path="/cars/:slug" element={<Detail kind="cars" />} />

                <Route path="/services" element={<Listing kind="services" />} />
                <Route path="/services/:slug" element={<Detail kind="services" />} />

                <Route path="/custom-tour" element={<CustomTour />} />
                <Route path="/taxi-booking" element={<Booking />} />
                <Route path="/airport-transfer" element={<Booking />} />

                <Route path="/gallery" element={<GalleryPage />} />
                <Route path="/testimonials" element={<TestimonialsPage />} />

                <Route path="/blog" element={<Listing kind="blog" />} />
                <Route path="/blog/:slug" element={<Detail kind="blog" />} />

                <Route path="/contact" element={<Contact />} />
                <Route path="/booking" element={<Booking />} />

                {/* Local SEO Landing Pages */}
                <Route path="/locations/:city" element={<LocationPage />} />

                {/* Legal Pages */}
                <Route path="/privacy-policy" element={
                  <LegalPage 
                    title="Privacy Policy" 
                    content={`Ranjit Tour & Travels respects your privacy. We collect customer information (such as name, phone number, email, and travel preferences) solely to fulfill tour itineraries, arrange vehicle permits, and communicate booking status. We do not sell or share customer personal information with external advertisers.`}
                  />
                } />
                <Route path="/terms-and-conditions" element={
                  <LegalPage 
                    title="Terms & Conditions" 
                    content={`All bookings are confirmed upon advance payment or authorized confirmation voucher. Chauffeur driving hours adhere to mountain road safety guidelines. Tolls, state tax, and parking charges are included as specified in your booking voucher.`}
                  />
                } />
                <Route path="/refund-policy" element={
                  <LegalPage 
                    title="Refund & Cancellation Policy" 
                    content={`Free cancellation is available up to 7 days before scheduled trip departure. Cancellations made between 2 to 7 days before departure are subject to a 20% administrative retention. Immediate refunds are processed to the original payment source within 3-5 business days.`}
                  />
                } />
                <Route path="/sitemap" element={
                  <LegalPage 
                    title="HTML Sitemap" 
                    content={`• Home: /\n• Destinations: /destinations\n• Tour Packages: /tour-packages\n• Fleet: /cars\n• Services: /services\n• Custom Tour: /custom-tour\n• Blog: /blog\n• Contact: /contact\n• Booking: /booking`}
                  />
                } />

                {/* 404 Page */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </LayoutShell>
          } />
        </Routes>
      </Suspense>
    </SettingsProvider>
  );
}
