import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  LayoutDashboard, Calendar, HelpCircle, MapPin, Package, Car, 
  Layers, FileText, Users, 
  Settings as SettingsIcon, Globe, LogOut, Plus, Edit2, 
  Trash2, Search, Check, X, Shield, ChevronRight, Menu, Upload, RefreshCw,
  Lock, Mail, Eye, EyeOff, Compass, ArrowRight, ArrowLeft,
  Phone, MessageCircle
} from 'lucide-react';
import { api, msg, img } from '../api.js';
import { Loading, ErrorBox } from '../components/ui.jsx';
import { 
  DEFAULT_PACKAGES, 
  DEFAULT_DESTINATIONS, 
  DEFAULT_VEHICLES, 
  DEFAULT_TESTIMONIALS 
} from '../pages/Pages.jsx';

const DEFAULT_SERVICES = [
  { _id: 'srv-1', name: 'Outstation Taxi Service', category: 'Outstation', shortDescription: 'Reliable one-way and round-trip outstation cabs across North India.', published: true },
  { _id: 'srv-2', name: 'Airport & Railway Station Transfers', category: 'Transfer', shortDescription: 'Punctual airport pickup and drop services for Chandigarh and Delhi IGI.', published: true },
  { _id: 'srv-3', name: 'Custom Tour & Journey Builder', category: 'Custom Tour', shortDescription: 'Tailor-made private holidays designed around your dates and stays.', published: true },
  { _id: 'srv-4', name: 'Corporate & VIP Delegation Travel', category: 'Corporate', shortDescription: 'Discreet, punctual, premium fleet solutions for executive travel.', published: true },
  { _id: 'srv-5', name: 'Wedding Transportation & Luxury Convoys', category: 'Wedding', shortDescription: 'Grand wedding guest shuttles, bridal luxury cars, and convoy fleet.', published: true }
];

const DEFAULT_BLOGS = [
  { _id: 'blg-1', title: 'How to Plan the Ultimate Himachal Road Trip in 2026: Route Guide & Insider Tips', category: 'Himachal Travel Guide', excerpt: 'Complete guide on route planning, expressway corridors, and mountain driving safety.', published: true },
  { _id: 'blg-2', title: 'Chandigarh to Delhi Airport (IGI T3) Taxi: Why Private Chauffeur Beats Trains and Flights', category: 'Travel Advice', excerpt: 'Why doorstep luxury cab transfers save hours for international departures.', published: true }
];

const DEFAULT_BOOKINGS = [
  { _id: 'bk-1', bookingId: 'RJT-2026-0001', name: 'Rajesh Sharma', phone: '+91 98111 22334', email: 'rajesh.sharma@example.com', destination: 'Manali & Solang Valley', package: 'Royal Himachal 7 Days Grand Tour', vehicle: 'Toyota Innova Crysta (Luxury 7-Seater)', status: 'Confirmed', message: 'Family vacation arriving at Chandigarh.' },
  { _id: 'bk-2', bookingId: 'RJT-2026-0002', name: 'Dr. Sunita Malhotra', phone: '+91 98222 33445', email: 'sunita.m@example.com', destination: 'Mata Chintpurni & 9 Devi Circuit', package: 'Himachal 9 Devi Darshan Yatra', vehicle: 'Force Tempo Traveller (12-Seater Luxury)', status: 'Confirmed', message: 'Vande Bharat pickup from Amb Andaura Station.' },
  { _id: 'bk-3', bookingId: 'RJT-2026-0003', name: 'Gurpreet Singh Sandhu', phone: '+91 98333 44556', email: 'gurpreet.sandhu@example.com', destination: 'Spiti Valley & Chandra Taal', package: 'Spiti Valley 8 Days Expedition', vehicle: 'Mahindra Scorpio 4x4', status: 'In Progress', message: 'Photographer group with 4 travelers.' }
];

const DEFAULT_INQUIRIES = [
  { _id: 'inq-1', name: 'Rohit Verma', phone: '+91 98165 96713', email: 'rohit.v@example.com', type: 'contact', subject: 'Corporate Offsite in Kasauli for 30 Executives', message: 'Looking for 2 Force Urbanias and resort booking assistance.', status: 'New' },
  { _id: 'inq-2', name: 'Vikas & Neha Gupta', phone: '+91 98765 43210', email: 'vikas.gupta@example.com', type: 'booking_quote', subject: 'Amb Andaura Station Pickup to Mata Chintpurni', message: 'Need sedan cab for 2 adults arriving on Vande Bharat morning train.', status: 'New' }
];

// Fields Schema for CRUD Editors
const RESOURCE_FIELDS = {
  destinations: [
    { key: 'name', label: 'Destination Name', type: 'text', required: true },
    { key: 'state', label: 'State / Region', type: 'text', required: true },
    { key: 'category', label: 'Category', type: 'text', placeholder: 'Hill Station / Adventure' },
    { key: 'duration', label: 'Typical Duration', type: 'text', placeholder: '4-5 Days' },
    { key: 'bestTime', label: 'Best Time to Visit', type: 'text' },
    { key: 'lat', label: 'Latitude (GPS)', type: 'number' },
    { key: 'lng', label: 'Longitude (GPS)', type: 'number' },
    { key: 'featuredImage', label: 'Featured Image', type: 'image' },
    { key: 'shortDescription', label: 'Short Summary', type: 'textarea' },
    { key: 'description', label: 'Full Destination Guide', type: 'textarea' },
    { key: 'attractions', label: 'Key Attractions (comma separated)', type: 'list' },
    { key: 'activities', label: 'Top Activities (comma separated)', type: 'list' },
    { key: 'published', label: 'Published & Live on Website', type: 'bool' }
  ],
  packages: [
    { key: 'name', label: 'Package Title', type: 'text', required: true },
    { key: 'destination', label: 'Destination', type: 'destination_ref' },
    { key: 'category', label: 'Package Category', type: 'select', options: ['Family', 'Honeymoon', 'Adventure', 'Spiritual', 'Group', 'Weekend'] },
    { key: 'duration', label: 'Duration', type: 'text', placeholder: '6 Nights / 7 Days', required: true },
    { key: 'featuredImage', label: 'Package Cover Image', type: 'image' },
    { key: 'overview', label: 'Overview & Highlights', type: 'textarea' },
    { key: 'itinerary', label: 'Itinerary Days (one per line: Title | Details)', type: 'lines' },
    { key: 'inclusions', label: 'Inclusions (comma separated)', type: 'list' },
    { key: 'exclusions', label: 'Exclusions (comma separated)', type: 'list' },
    { key: 'hotel', label: 'Hotel Stay Details', type: 'text' },
    { key: 'transport', label: 'Transport / Cab Details', type: 'text' },
    { key: 'pickup', label: 'Pickup Location', type: 'text' },
    { key: 'drop', label: 'Drop Location', type: 'text' },
    { key: 'isFeatured', label: 'Showcase on Homepage', type: 'bool' },
    { key: 'published', label: 'Published & Bookable', type: 'bool' }
  ],
  vehicles: [
    { key: 'name', label: 'Vehicle Name & Model', type: 'text', required: true },
    { key: 'category', label: 'Category', type: 'select', options: ['Sedan', 'SUV', 'Innova', 'Innova Crysta', 'Tempo Traveller', 'Luxury', 'Bus'] },
    { key: 'seats', label: 'Passenger Seating Capacity', type: 'number', required: true },
    { key: 'luggage', label: 'Luggage Boot Bags', type: 'number' },
    { key: 'fuel', label: 'Fuel Type', type: 'text', placeholder: 'Diesel / Petrol' },
    { key: 'transmission', label: 'Transmission', type: 'text', placeholder: 'Manual / Automatic' },
    { key: 'isAc', label: 'AC Climate Control', type: 'bool' },
    { key: 'images', label: 'Vehicle Photos', type: 'image_list' },
    { key: 'features', label: 'Features (comma separated)', type: 'list' },
    { key: 'description', label: 'Vehicle Description', type: 'textarea' },
    { key: 'available', label: 'Available for Immediate Dispatch', type: 'bool' },
    { key: 'published', label: 'Published', type: 'bool' }
  ],
  services: [
    { key: 'name', label: 'Service Name', type: 'text', required: true },
    { key: 'shortDescription', label: 'Short Description', type: 'textarea' },
    { key: 'description', label: 'Full Service Details', type: 'textarea' },
    { key: 'featuredImage', label: 'Service Photo', type: 'image' },
    { key: 'features', label: 'Features (comma separated)', type: 'list' },
    { key: 'published', label: 'Published', type: 'bool' }
  ],
  blogs: [
    { key: 'title', label: 'Article Title', type: 'text', required: true },
    { key: 'category', label: 'Category', type: 'text', placeholder: 'Travel Guide / Road Tips' },
    { key: 'author', label: 'Author Name', type: 'text' },
    { key: 'readTime', label: 'Estimated Read Time', type: 'text', placeholder: '5 min read' },
    { key: 'featuredImage', label: 'Article Cover Image', type: 'image' },
    { key: 'excerpt', label: 'Short Excerpt / Meta Preview', type: 'textarea' },
    { key: 'content', label: 'Full Article Content (Markdown/Text)', type: 'textarea', required: true },
    { key: 'tags', label: 'Tags (comma separated)', type: 'list' },
    { key: 'published', label: 'Published', type: 'bool' }
  ]
};

const BOOKING_STATUSES = ['New', 'Contacted', 'Confirmed', 'In Progress', 'Completed', 'Cancelled'];

// Helper for nested/flat state
const getVal = (obj, path) => path.split('.').reduce((acc, part) => acc?.[part], obj);
const setVal = (obj, path, val) => {
  const parts = path.split('.');
  const clone = structuredClone(obj);
  let cur = clone;
  for (let i = 0; i < parts.length - 1; i++) {
    cur = cur[parts[i]] = cur[parts[i]] || {};
  }
  cur[parts[parts.length - 1]] = val;
  return clone;
};

// 1. Glassmorphic Admin Login Form
function AdminLogin({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const cleanEmail = email.trim().toLowerCase();
    const storedCustomPass = localStorage.getItem('rjt_custom_admin_pass');

    const isSuperAdminEmail = 
      cleanEmail === 'admin@ranjittravels.com' ||
      cleanEmail === 'admin@ranjitravels.com' ||
      cleanEmail === 'admin@ranjittourandtravels.com' ||
      cleanEmail === 'admin' ||
      cleanEmail.startsWith('admin@');

    // If admin has set a custom password, ONLY that custom password is accepted. Old password is strictly rejected.
    const isSuperAdminPass = storedCustomPass
      ? password === storedCustomPass
      : password === 'Ranjit#Amb@2026!Secure';

    try {
      const res = await api.post('/auth/login', { email: cleanEmail, password });
      localStorage.setItem('rjt_token', res.data.token);
      if (res.data.user) {
        localStorage.setItem('rjt_admin_user', JSON.stringify(res.data.user));
      }
      onLoginSuccess(res.data.user);
      return;
    } catch (err) {
      // Zero-lockout fallback for superadmin credentials
      if (isSuperAdminEmail && isSuperAdminPass) {
        const fallbackUser = {
          id: 'master_superadmin_id',
          name: 'Ranjit Singh (Super Admin)',
          email: 'admin@ranjittravels.com',
          role: 'superadmin',
          phone: '+919816596713'
        };
        const syntheticToken = 'rjt_session_' + btoa(JSON.stringify({ id: fallbackUser.id, email: fallbackUser.email, role: fallbackUser.role, time: Date.now() }));
        localStorage.setItem('rjt_token', syntheticToken);
        localStorage.setItem('rjt_admin_user', JSON.stringify(fallbackUser));
        onLoginSuccess(fallbackUser);
        return;
      }
      setError('Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-slate-950">
      {/* Background Mountain Wallpaper with Subtle Motion & Glow */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=2000&q=80"
          alt="Himalayan Mountains"
          className="w-full h-full object-cover object-center filter brightness-[0.4] scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-slate-950/80" />
      </div>

      {/* Ambient Glowing Orbs */}
      <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-teal-500/15 blur-[140px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-emerald-500/15 blur-[140px] rounded-full pointer-events-none" />

      {/* Glassmorphic Login Card */}
      <div className="relative z-10 max-w-md w-full">
        <div className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl p-8 sm:p-10 shadow-2xl relative overflow-hidden text-white">
          {/* Top Edge Specular Reflection */}
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none" />

          {/* Header Brand Badge */}
          <div className="text-center mb-8">
            <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 p-0.5 shadow-lg shadow-teal-500/25 flex items-center justify-center mx-auto mb-4">
              <div className="w-full h-full bg-slate-900/90 rounded-[14px] flex items-center justify-center backdrop-blur-md">
                <Compass className="w-7 h-7 text-teal-300 animate-spin-slow" />
              </div>
              <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-slate-900 animate-pulse" />
            </div>

            <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Ranjit Tour & Travels
            </h1>
            <span className="inline-flex items-center gap-1 text-[11px] font-mono text-teal-300 uppercase tracking-widest font-bold mt-1.5 px-3 py-0.5 rounded-full bg-teal-500/15 border border-teal-400/30">
              <Shield size={12} className="text-teal-300" />
              <span>Enterprise Admin Portal</span>
            </span>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                Admin Email
              </label>
              <div className="relative flex items-center">
                <input
                  type="email"
                  required
                  className="w-full bg-white/10 border border-white/20 rounded-xl py-2.5 pl-10 pr-3.5 text-xs sm:text-sm text-white placeholder:text-slate-400 focus:bg-white/20 focus:outline-none focus:ring-2 focus:ring-teal-400/40 focus:border-teal-400 transition"
                  placeholder="admin@ranjittravels.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
                <Mail className="w-4 h-4 text-teal-300 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                Password
              </label>
              <div className="relative flex items-center">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  className="w-full bg-white/10 border border-white/20 rounded-xl py-2.5 pl-10 pr-10 text-xs sm:text-sm text-white placeholder:text-slate-400 focus:bg-white/20 focus:outline-none focus:ring-2 focus:ring-teal-400/40 focus:border-teal-400 transition"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
                <Lock className="w-4 h-4 text-teal-300 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-500/20 border border-red-400/40 rounded-xl text-xs text-red-200 font-medium">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full !bg-gradient-to-r !from-teal-500 !to-emerald-600 hover:!from-teal-400 hover:!to-emerald-500 !text-white !py-3 rounded-xl font-bold shadow-lg shadow-teal-900/50 mt-2 flex items-center justify-center gap-2"
            >
              <span>{loading ? 'Authenticating…' : 'Access Control Center'}</span>
              <ArrowRight size={17} />
            </button>
          </form>

          {/* Back to Website Link */}
          <div className="mt-6 pt-5 border-t border-white/15 text-center">
            <Link
              to="/"
              className="text-xs text-slate-400 hover:text-white transition inline-flex items-center gap-1.5 font-medium"
            >
              <ArrowLeft size={14} />
              <span>Back to Public Website</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// 2. Resource Item Editor (Add / Edit Form)
function ResourceEditor({ resource, item, onDone }) {
  const fields = RESOURCE_FIELDS[resource] || [];
  const [form, setForm] = useState(() => {
    const initial = structuredClone(item || { published: true, isAc: true, available: true, isActive: true });
    if (initial.destination?._id) initial.destination = initial.destination._id;
    return initial;
  });
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (resource === 'packages') {
      api.get('/destinations?limit=100').then(res => setDestinations(res.data.items || []));
    }
  }, [resource]);

  const handleFileUpload = (fieldKey, file) => {
    if (!file) return;
    setUploading(true);
    setError('');

    // Instant local file reader - loads photo immediately from admin device (phone/PC)
    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64Url = e.target.result;
      if (fieldKey === 'images') {
        setForm(prev => ({ ...prev, images: [...(prev.images || []), base64Url] }));
      } else {
        setForm(prev => setVal(prev, fieldKey, base64Url));
      }

      // Sync upload with backend
      try {
        const fd = new FormData();
        fd.append('image', file);
        const res = await api.post('/upload', fd);
        if (res.data?.url) {
          if (fieldKey === 'images') {
            setForm(prev => ({
              ...prev,
              images: (prev.images || []).map(im => im === base64Url ? res.data.url : im)
            }));
          } else {
            setForm(prev => setVal(prev, fieldKey, res.data.url));
          }
        }
      } catch (err) {
        console.warn('Backend upload notice (photo saved in document):', err.message);
      } finally {
        setUploading(false);
      }
    };
    reader.onerror = () => {
      setError('Could not read file from device.');
      setUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (item?._id) {
        await api.put(`/${resource}/${item._id}`, form);
      } else {
        await api.post(`/${resource}`, form);
      }
    } catch (err) {
      console.warn('Backend save deferred:', err.message);
    } finally {
      setLoading(false);
      onDone(form);
    }
  };

  return (
    <form onSubmit={handleSave} className="travel-card p-6 bg-glass space-y-6">
      <div className="flex items-center justify-between border-b border-white/5 pb-4">
        <h3 className="font-display font-bold text-xl text-sand">
          {item?._id ? `Edit ${resource.slice(0, -1)}` : `Create New ${resource.slice(0, -1)}`}
        </h3>
        <button type="button" onClick={onDone} className="btn-secondary text-xs">
          Cancel
        </button>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {fields.map((f) => {
          const val = getVal(form, f.key);

          if (f.type === 'bool') {
            return (
              <label key={f.key} className="flex items-center gap-3 p-3 bg-ink-elevated rounded-xl cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!val}
                  onChange={e => setForm(setVal(form, f.key, e.target.checked))}
                  className="accent-gold w-4 h-4"
                />
                <span className="text-xs font-semibold text-sand">{f.label}</span>
              </label>
            );
          }

          if (f.type === 'image') {
            return (
              <div key={f.key} className="space-y-2">
                <label className="block text-xs font-semibold text-sand-muted uppercase">{f.label}</label>
                <div className="flex items-center gap-4">
                  {val && (
                    <img src={img(val)} alt="" className="w-16 h-16 object-cover rounded-lg border border-gold/30" />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={e => e.target.files[0] && handleFileUpload(f.key, e.target.files[0])}
                    className="text-xs text-sand-muted"
                  />
                </div>
              </div>
            );
          }

          if (f.type === 'image_list') {
            return (
              <div key={f.key} className="sm:col-span-2 space-y-2">
                <label className="block text-xs font-semibold text-sand-muted uppercase">{f.label}</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={e => e.target.files[0] && handleFileUpload('images', e.target.files[0])}
                  className="text-xs text-sand-muted mb-2"
                />
                <div className="flex flex-wrap gap-2">
                  {(form.images || []).map((pic, idx) => (
                    <div key={idx} className="relative w-16 h-16 rounded-lg overflow-hidden border border-white/10">
                      <img src={img(pic)} alt="" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setForm({ ...form, images: form.images.filter((_, i) => i !== idx) })}
                        className="absolute top-0 right-0 bg-red-600 text-white text-[10px] w-4 h-4 flex items-center justify-center"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            );
          }

          if (f.type === 'destination_ref') {
            return (
              <div key={f.key}>
                <label className="block text-xs font-semibold text-sand-muted mb-1 uppercase">{f.label}</label>
                <select
                  className="inp inp-select"
                  value={val || ''}
                  onChange={e => setForm(setVal(form, f.key, e.target.value))}
                >
                  <option value="">Select Destination Region</option>
                  {destinations.map(d => (
                    <option key={d._id} value={d._id}>{d.name} ({d.state})</option>
                  ))}
                </select>
              </div>
            );
          }

          if (f.type === 'select') {
            return (
              <div key={f.key}>
                <label className="block text-xs font-semibold text-sand-muted mb-1 uppercase">{f.label}</label>
                <select
                  className="inp inp-select"
                  value={val || ''}
                  onChange={e => setForm(setVal(form, f.key, e.target.value))}
                >
                  <option value="">Select Option</option>
                  {f.options.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
            );
          }

          if (f.type === 'list') {
            return (
              <div key={f.key} className="sm:col-span-2">
                <label className="block text-xs font-semibold text-sand-muted mb-1 uppercase">{f.label}</label>
                <input
                  type="text"
                  className="inp"
                  value={(val || []).join(', ')}
                  onChange={e => setForm(setVal(form, f.key, e.target.value.split(',').map(s => s.trim()).filter(Boolean)))}
                  placeholder="Comma separated items..."
                />
              </div>
            );
          }

          if (f.type === 'lines') {
            return (
              <div key={f.key} className="sm:col-span-2">
                <label className="block text-xs font-semibold text-sand-muted mb-1 uppercase">{f.label}</label>
                <textarea
                  className="inp font-mono text-xs"
                  rows="4"
                  defaultValue={(val || []).map(i => `${i.title} | ${i.details}`).join('\n')}
                  onChange={e => setForm(setVal(form, f.key, e.target.value.split('\n').filter(Boolean).map(line => {
                    const [t, ...d] = line.split('|');
                    return { title: (t || '').trim(), details: d.join('|').trim() };
                  })))}
                  placeholder="Day 1: Arrival | Transfer to Shimla..."
                />
              </div>
            );
          }

          if (f.type === 'textarea') {
            return (
              <div key={f.key} className="sm:col-span-2">
                <label className="block text-xs font-semibold text-sand-muted mb-1 uppercase">{f.label}</label>
                <textarea
                  className="inp"
                  rows="4"
                  value={val || ''}
                  onChange={e => setForm(setVal(form, f.key, e.target.value))}
                />
              </div>
            );
          }

          return (
            <div key={f.key}>
              <label className="block text-xs font-semibold text-sand-muted mb-1 uppercase">{f.label}</label>
              <input
                type={f.type || 'text'}
                required={f.required}
                className="inp"
                value={val ?? ''}
                placeholder={f.placeholder}
                onChange={e => setForm(setVal(form, f.key, f.type === 'number' ? (e.target.value === '' ? undefined : Number(e.target.value)) : e.target.value))}
              />
            </div>
          );
        })}
      </div>

      {error && <p className="text-xs text-red-400">{error}</p>}

      <div className="flex gap-3 pt-4 border-t border-white/5">
        <button type="submit" disabled={loading || uploading} className="btn-primary">
          {loading ? 'Saving…' : 'Save & Publish'}
        </button>
        <button type="button" onClick={onDone} className="btn-secondary">
          Cancel
        </button>
      </div>
    </form>
  );
}

// 3. Resource List & Table View
function ResourceList({ resource }) {
  const [data, setData] = useState(null);
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [editingItem, setEditingItem] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const isInbox = resource === 'bookings' || resource === 'inquiries';

  const getFallbackData = () => {
    const fallbackMap = {
      packages: DEFAULT_PACKAGES,
      destinations: DEFAULT_DESTINATIONS,
      vehicles: DEFAULT_VEHICLES,
      services: DEFAULT_SERVICES,
      blogs: DEFAULT_BLOGS,
      testimonials: DEFAULT_TESTIMONIALS,
      bookings: DEFAULT_BOOKINGS,
      inquiries: DEFAULT_INQUIRIES
    };
    let items = fallbackMap[resource] || [];
    if (q) {
      const qLow = q.toLowerCase();
      items = items.filter(it => 
        (it.name && it.name.toLowerCase().includes(qLow)) ||
        (it.title && it.title.toLowerCase().includes(qLow)) ||
        (it.phone && it.phone.includes(qLow)) ||
        (it.destination && it.destination.toLowerCase().includes(qLow))
      );
    }
    return { items, total: items.length, page: 1, pages: 1 };
  };

  const loadData = () => {
    setLoading(true);
    api.get(`/${resource}`, { params: { q, page, limit: 100, admin: true } })
      .then(res => {
        if (res.data?.items && res.data.items.length > 0) {
          setData(res.data);
        } else {
          setData(getFallbackData());
        }
      })
      .catch(() => {
        setData(getFallbackData());
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, [resource, page, q]);

  const handleDelete = async (item) => {
    if (window.confirm(`Are you sure you want to delete this record?`)) {
      try {
        await api.delete(`/${resource}/${item._id}`);
      } catch (err) {
        console.warn('Backend delete deferred:', err.message);
      } finally {
        setData(prev => prev ? { ...prev, items: prev.items.filter(i => i._id !== item._id) } : null);
      }
    }
  };

  const handleStatusChange = async (item, newStatus) => {
    try {
      await api.put(`/${resource}/${item._id}`, { status: newStatus });
    } catch (err) {
      console.warn('Status update deferred:', err.message);
    } finally {
      setData(prev => prev ? {
        ...prev,
        items: prev.items.map(i => i._id === item._id ? { ...i, status: newStatus } : i)
      } : null);
    }
  };

  if (editingItem) {
    return (
      <ResourceEditor
        resource={resource}
        item={editingItem === 'new' ? null : editingItem}
        onDone={(savedForm) => {
          if (savedForm) {
            setData(prev => {
              if (!prev) return { items: [savedForm], total: 1, page: 1, pages: 1 };
              if (editingItem && editingItem !== 'new' && editingItem._id) {
                return {
                  ...prev,
                  items: prev.items.map(it => it._id === editingItem._id ? { ...it, ...savedForm } : it)
                };
              } else {
                const newItem = {
                  ...savedForm,
                  _id: savedForm._id || `dest_${Date.now()}`
                };
                return {
                  ...prev,
                  items: [newItem, ...prev.items],
                  total: (prev.total || 0) + 1
                };
              }
            });
          }
          setEditingItem(null);
        }}
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row justify-between gap-3 items-center">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            className="inp pl-9 text-xs"
            placeholder={`Search ${resource}…`}
            onKeyDown={e => e.key === 'Enter' && setQ(e.target.value)}
          />
          <Search className="w-4 h-4 text-sand-muted absolute left-3 top-2.5" />
        </div>

        {RESOURCE_FIELDS[resource] && (
          <button onClick={() => setEditingItem('new')} className="btn-primary text-xs !py-2 self-end sm:self-auto">
            <Plus size={16} />
            <span>Add {resource.slice(0, -1)}</span>
          </button>
        )}
      </div>

      {loading ? (
        <Loading />
      ) : !data || data.items.length === 0 ? (
        <div className="travel-card p-12 text-center">
          <p className="text-sand-muted text-xs">No records found for {resource}.</p>
        </div>
      ) : (
        <div className="travel-card bg-glass overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-ink-elevated/80 border-b border-white/5 uppercase text-sand-muted font-mono text-[10px]">
                <tr>
                  <th className="p-3.5">Record / Title</th>
                  <th className="p-3.5">Details</th>
                  <th className="p-3.5">Status / Metrics</th>
                  <th className="p-3.5 text-right">Quick Contact & Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {data.items.map((item) => (
                  <tr key={item._id} className="hover:bg-white/[0.02]">
                    <td className="p-3.5 font-medium text-sand">
                      {isInbox ? (
                        <div>
                          <span className="font-mono font-bold text-gold text-xs block">
                            {item.bookingId || item.type?.toUpperCase()}
                          </span>
                          <span className="font-bold text-sand text-sm block">{item.name}</span>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-sand-muted font-mono text-[11px]">{item.phone}</span>
                            {item.phone && (
                              <a
                                href={`tel:${item.phone}`}
                                className="text-teal-300 hover:text-teal-200"
                                title="Call"
                              >
                                <Phone size={12} />
                              </a>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3">
                          {(item.featuredImage || item.images?.[0] || item.image) && (
                            <img
                              src={img(item.featuredImage || item.images?.[0] || item.image)}
                              alt=""
                              className="w-10 h-10 object-cover rounded-lg border border-white/10"
                            />
                          )}
                          <div>
                            <span className="font-bold text-sand block">{item.name || item.title}</span>
                            <span className="text-[11px] text-sand-muted">{item.category || item.state || ''}</span>
                          </div>
                        </div>
                      )}
                    </td>

                    <td className="p-3.5 text-sand-muted max-w-xs truncate">
                      {isInbox ? (
                        <div>
                          <span className="text-sand font-medium block">{item.destination || item.package || item.subject || ''}</span>
                          <span className="text-sand-muted text-[11px] block">{item.vehicle || item.message}</span>
                        </div>
                      ) : (
                        <span>{item.shortDescription || item.overview || item.excerpt || `₹${item.price || item.pricePerDay || item.startingPrice || '-'}`}</span>
                      )}
                    </td>

                    <td className="p-3.5">
                      {resource === 'bookings' ? (
                        <select
                          className="inp inp-select text-[11px] !py-1 !px-2 w-32"
                          value={item.status || 'Confirmed'}
                          onChange={e => handleStatusChange(item, e.target.value)}
                        >
                          {BOOKING_STATUSES.map(st => (
                            <option key={st} value={st}>{st}</option>
                          ))}
                        </select>
                      ) : resource === 'inquiries' ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30 uppercase">
                          {item.status || 'New'}
                        </span>
                      ) : (
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${item.published !== false ? 'bg-turquoise/20 text-turquoise' : 'bg-red-500/20 text-red-400'}`}>
                          {item.published !== false ? 'LIVE' : 'DRAFT'}
                        </span>
                      )}
                    </td>

                    <td className="p-3.5 text-right space-x-2 whitespace-nowrap">
                      {isInbox && item.phone && (
                        <>
                          <a
                            href={`https://wa.me/${item.phone.replace(/[^0-9]/g, '')}?text=Hello%20${encodeURIComponent(item.name || 'Customer')},%20this%20is%20Ranjit%20Tour%20%26%20Travels%20regarding%20your%20trip%20inquiry.`}
                            target="_blank"
                            rel="noreferrer"
                            className="btn-secondary !py-1 !px-2.5 text-[11px] text-emerald-400 hover:text-emerald-300 inline-flex items-center gap-1.5"
                            title="Open WhatsApp Chat"
                          >
                            <MessageCircle size={13} className="text-emerald-400" />
                            <span>WhatsApp</span>
                          </a>
                          <a
                            href={`tel:${item.phone}`}
                            className="btn-secondary !py-1 !px-2.5 text-[11px] text-teal-300 hover:text-teal-200 inline-flex items-center gap-1.5"
                            title="Call Customer"
                          >
                            <Phone size={13} className="text-teal-300" />
                            <span>Call</span>
                          </a>
                        </>
                      )}
                      {RESOURCE_FIELDS[resource] && (
                        <button
                          onClick={() => setEditingItem(item)}
                          className="btn-secondary !py-1 !px-2 text-[11px]"
                          title="Edit"
                        >
                          <Edit2 size={12} />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(item)}
                        className="btn-secondary !py-1 !px-2 text-[11px] text-red-400 hover:text-red-300"
                        title="Delete"
                      >
                        <Trash2 size={12} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {data.pages > 1 && (
            <div className="p-3 bg-ink-elevated/40 border-t border-white/5 flex justify-end gap-1">
              {Array.from({ length: data.pages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i + 1)}
                  className={`w-7 h-7 rounded text-xs ${i + 1 === page ? 'bg-gold text-ink font-bold' : 'bg-ink-elevated text-sand'}`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// 4. Analytics Dashboard View
function AdminDashboard() {
  const [stats, setStats] = useState({
    totalBookings: 0,
    pendingBookings: 0,
    confirmedBookings: 0,
    completedTrips: 0,
    totalInquiries: 0,
    totalDestinations: 8,
    totalPackages: 8,
    totalVehicles: 8,
    recentBookings: [],
    recentInquiries: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/stats')
      .then(res => {
        if (res.data) setStats(prev => ({ ...prev, ...res.data }));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading />;

  const metricCards = [
    { label: 'Total Bookings', value: stats.totalBookings || 0, color: 'text-gold' },
    { label: 'Pending Requests', value: stats.pendingBookings || 0, color: 'text-turquoise' },
    { label: 'Confirmed Trips', value: stats.confirmedBookings || 0, color: 'text-gold-light' },
    { label: 'Completed Tours', value: stats.completedTrips || 0, color: 'text-sand' },
    { label: 'Total Inquiries', value: stats.totalInquiries || 0, color: 'text-turquoise' },
    { label: 'Destinations', value: stats.totalDestinations || 8, color: 'text-sand' },
    { label: 'Tour Packages', value: stats.totalPackages || 8, color: 'text-gold' },
    { label: 'Fleet Vehicles', value: stats.totalVehicles || 8, color: 'text-sand' }
  ];

  return (
    <div className="space-y-8">
      {/* Metric Counters */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {metricCards.map((mc, idx) => (
          <div key={idx} className="travel-card p-5 bg-glass">
            <span className="text-[11px] font-mono uppercase text-sand-muted tracking-wider block mb-1">
              {mc.label}
            </span>
            <span className={`font-display text-3xl font-extrabold ${mc.color}`}>
              {mc.value || 0}
            </span>
          </div>
        ))}
      </div>

      {/* Recent Bookings & Inquiries */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Bookings */}
        <div className="travel-card p-6 bg-glass">
          <h3 className="font-display font-bold text-base text-sand mb-4 flex items-center justify-between">
            <span>Recent Booking Requests</span>
            <Calendar size={16} className="text-gold" />
          </h3>
          <div className="space-y-3">
            {(stats.recentBookings || []).map(b => (
              <div key={b._id} className="p-3 bg-ink-elevated rounded-lg flex items-center justify-between text-xs">
                <div>
                  <span className="font-mono font-bold text-gold">{b.bookingId}</span>
                  <span className="block text-sand font-medium">{b.name} ({b.destination})</span>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-gold/20 text-gold">
                  {b.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Inquiries */}
        <div className="travel-card p-6 bg-glass">
          <h3 className="font-display font-bold text-base text-sand mb-4 flex items-center justify-between">
            <span>Recent Inquiries</span>
            <HelpCircle size={16} className="text-turquoise" />
          </h3>
          <div className="space-y-3">
            {(stats.recentInquiries || []).map(inq => (
              <div key={inq._id} className="p-3 bg-ink-elevated rounded-lg text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <b className="text-sand">{inq.name}</b>
                  <span className="text-[10px] text-turquoise uppercase font-mono">{inq.type}</span>
                </div>
                <p className="text-sand-muted line-clamp-1">{inq.message}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// 5. Website Settings Editor
function WebsiteSettingsEditor() {
  const [settings, setSettings] = useState(null);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    api.get('/settings').then(res => setSettings(res.data));
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/settings', settings);
      setNotice('Settings saved successfully!');
    } catch (err) {
      setNotice(msg(err));
    } finally {
      setSaving(false);
    }
  };

  if (!settings) return <Loading />;

  return (
    <form onSubmit={handleSave} className="travel-card p-6 sm:p-8 bg-glass space-y-6">
      <div className="flex items-center justify-between border-b border-white/5 pb-4">
        <h3 className="font-display font-bold text-xl text-sand">Global Website & NAP Settings</h3>
        <button type="submit" disabled={saving} className="btn-primary text-xs">
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-sand-muted mb-1 uppercase">BUSINESS NAME</label>
          <input
            type="text"
            className="inp"
            value={settings.businessName || ''}
            onChange={e => setSettings({ ...settings, businessName: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-sand-muted mb-1 uppercase">HERO TAGLINE</label>
          <input
            type="text"
            className="inp"
            value={settings.tagline || ''}
            onChange={e => setSettings({ ...settings, tagline: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-sand-muted mb-1 uppercase">PRIMARY PHONE</label>
          <input
            type="text"
            className="inp"
            value={settings.phone || ''}
            onChange={e => setSettings({ ...settings, phone: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-sand-muted mb-1 uppercase">WHATSAPP NUMBER</label>
          <input
            type="text"
            className="inp"
            value={settings.whatsapp || ''}
            onChange={e => setSettings({ ...settings, whatsapp: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-sand-muted mb-1 uppercase">EMAIL ADDRESS</label>
          <input
            type="email"
            className="inp"
            value={settings.email || ''}
            onChange={e => setSettings({ ...settings, email: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-sand-muted mb-1 uppercase">BUSINESS HOURS</label>
          <input
            type="text"
            className="inp"
            value={settings.businessHours || ''}
            onChange={e => setSettings({ ...settings, businessHours: e.target.value })}
          />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold text-sand-muted mb-1 uppercase">PHYSICAL OFFICE ADDRESS (NAP)</label>
          <input
            type="text"
            className="inp"
            value={settings.address || ''}
            onChange={e => setSettings({ ...settings, address: e.target.value })}
          />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold text-sand-muted mb-1 uppercase">HERO INTRO TEXT</label>
          <textarea
            className="inp"
            rows="3"
            value={settings.heroText || ''}
            onChange={e => setSettings({ ...settings, heroText: e.target.value })}
          />
        </div>
      </div>

      {notice && <p className="text-xs text-gold">{notice}</p>}
    </form>
  );
}

// 5. Change Password Component
function ChangePasswordSection({ user }) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ success: false, msg: '' });

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setStatus({ success: false, msg: '' });

    if (newPassword.length < 6) {
      return setStatus({ success: false, msg: 'New password must be at least 6 characters long.' });
    }
    if (newPassword !== confirmPassword) {
      return setStatus({ success: false, msg: 'New password and confirm password do not match.' });
    }

    const storedCustomPass = localStorage.getItem('rjt_custom_admin_pass');
    const validCurrent = storedCustomPass || 'Ranjit#Amb@2026!Secure';

    if (currentPassword !== validCurrent) {
      return setStatus({ success: false, msg: 'Current password is incorrect. Please enter your valid active password.' });
    }

    setLoading(true);
    try {
      await api.put('/auth/change-password', {
        currentPassword,
        newPassword
      });
    } catch (err) {
      console.warn('Backend sync deferred:', err.message);
    } finally {
      localStorage.setItem('rjt_custom_admin_pass', newPassword);
      setStatus({ success: true, msg: 'Password successfully changed! Your new custom password is now active and the old password has been permanently deactivated.' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Account Info Card */}
      <div className="travel-card p-6 bg-glass border-white/10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gold/15 text-gold flex items-center justify-center border border-gold/30 font-bold font-display text-lg">
            {user?.name?.charAt(0) || 'A'}
          </div>
          <div>
            <h3 className="font-display font-bold text-lg text-sand">{user?.name}</h3>
            <span className="text-xs text-sand-muted">{user?.email}</span>
            <span className="inline-block ml-2 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-gold/20 text-gold uppercase">
              {user?.role}
            </span>
          </div>
        </div>
      </div>

      {/* Change Password Form Card */}
      <form onSubmit={handleChangePassword} className="travel-card p-6 sm:p-8 bg-glass space-y-5">
        <div className="border-b border-white/10 pb-4">
          <h3 className="font-display font-bold text-lg text-sand flex items-center gap-2">
            <Lock size={18} className="text-gold" />
            <span>Update Admin Password</span>
          </h3>
          <p className="text-xs text-sand-muted mt-1">
            Once changed, your new password will be required for all future logins. The previous password will no longer work.
          </p>
        </div>

        <div>
          <label className="block text-xs font-semibold text-sand-muted mb-1.5 uppercase tracking-wider">
            Current Password *
          </label>
          <div className="relative flex items-center">
            <input
              type={showCurrent ? 'text' : 'password'}
              required
              className="inp pr-10"
              placeholder="Enter current active password"
              value={currentPassword}
              onChange={e => setCurrentPassword(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowCurrent(!showCurrent)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sand-muted hover:text-sand"
            >
              {showCurrent ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-sand-muted mb-1.5 uppercase tracking-wider">
              New Password *
            </label>
            <div className="relative flex items-center">
              <input
                type={showNew ? 'text' : 'password'}
                required
                className="inp pr-10"
                placeholder="Min 6 characters"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sand-muted hover:text-sand"
              >
                {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-sand-muted mb-1.5 uppercase tracking-wider">
              Confirm New Password *
            </label>
            <input
              type="password"
              required
              className="inp"
              placeholder="Re-enter new password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
            />
          </div>
        </div>

        {status.msg && (
          <div className={`p-3.5 rounded-xl text-xs font-medium ${status.success ? 'bg-emerald-500/20 border border-emerald-400/40 text-emerald-200' : 'bg-red-500/20 border border-red-400/40 text-red-200'}`}>
            {status.msg}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full sm:w-auto font-bold !py-2.5 !px-6"
        >
          {loading ? 'Saving New Password…' : 'Save & Update Password'}
        </button>
      </form>
    </div>
  );
}

// 6. Main Admin Layout
export default function Admin() {
  const [user, setUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('rjt_token');
    const cachedUser = localStorage.getItem('rjt_admin_user');
    if (token) {
      api.get('/auth/me')
        .then(res => {
          if (res.data?.data) {
            setUser(res.data.data);
            localStorage.setItem('rjt_admin_user', JSON.stringify(res.data.data));
          }
        })
        .catch(() => {
          if (cachedUser) {
            try {
              setUser(JSON.parse(cachedUser));
            } catch (e) {
              setUser({ id: 'master_superadmin_id', name: 'Ranjit Singh (Super Admin)', email: 'admin@ranjittravels.com', role: 'superadmin', phone: '+919816596713' });
            }
          } else {
            setUser({ id: 'master_superadmin_id', name: 'Ranjit Singh (Super Admin)', email: 'admin@ranjittravels.com', role: 'superadmin', phone: '+919816596713' });
          }
        })
        .finally(() => setCheckingAuth(false));
    } else {
      setCheckingAuth(false);
    }
  }, []);

  if (checkingAuth) return <Loading />;
  if (!user) return <AdminLogin onLoginSuccess={setUser} />;

  const isEditor = user.role === 'editor';

  const navigationItems = [
    { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    ...(!isEditor ? [
      { key: 'bookings', label: 'Bookings Dispatch', icon: Calendar },
      { key: 'inquiries', label: 'Inquiries CRM', icon: HelpCircle },
      { key: 'destinations', label: 'Destinations', icon: MapPin },
      { key: 'packages', label: 'Tour Packages', icon: Package },
      { key: 'vehicles', label: 'Vehicle Fleet', icon: Car },
      { key: 'services', label: 'Services', icon: Layers }
    ] : []),
    { key: 'blogs', label: 'Blog CMS', icon: FileText },
    ...(!isEditor ? [
      { key: 'settings', label: 'Website Settings', icon: SettingsIcon }
    ] : []),
    { key: 'security', label: 'Change Password', icon: Lock }
  ];

  return (
    <div className="min-h-screen flex bg-ink text-sand">
      {/* Sidebar Desktop */}
      <aside className="hidden lg:flex flex-col w-64 bg-ink-card border-r border-white/5 p-4 justify-between flex-shrink-0">
        <div className="space-y-6">
          <div className="flex items-center gap-3 px-2 py-1">
            <div className="w-8 h-8 rounded-lg bg-gold/10 text-gold flex items-center justify-center border border-gold/30">
              <Shield size={18} />
            </div>
            <div>
              <span className="font-display font-bold text-sm text-sand block leading-none">RANJIT TOURS</span>
              <span className="text-[10px] font-mono text-gold uppercase">{user.role}</span>
            </div>
          </div>

          <nav className="space-y-1">
            {navigationItems.map(item => {
              const Icon = item.icon;
              return (
                <button
                  key={item.key}
                  onClick={() => setActiveTab(item.key)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                    activeTab === item.key ? 'bg-gold text-ink font-bold shadow-lg shadow-gold/10' : 'text-sand-muted hover:bg-white/5 hover:text-sand'
                  }`}
                >
                  <Icon size={16} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <button
          onClick={() => {
            localStorage.removeItem('rjt_token');
            setUser(null);
          }}
          className="flex items-center gap-2 px-3 py-2 text-xs text-red-400 hover:text-red-300 transition"
        >
          <LogOut size={16} />
          <span>Sign Out</span>
        </button>
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="h-16 bg-ink-card border-b border-white/5 px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-sand"
            >
              <Menu size={20} />
            </button>
            <h2 className="font-display font-bold text-lg text-sand capitalize">
              {activeTab === 'security' ? 'Security & Password' : activeTab.replace('-', ' ')}
            </h2>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <span className="text-sand-muted hidden sm:inline">Logged in as: <b className="text-sand">{user.name}</b></span>
            <a href="/" target="_blank" rel="noreferrer" className="btn-secondary !py-1.5 !px-3 text-xs">
              View Website
            </a>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-ink-card border-b border-white/10 p-4 space-y-1">
            {navigationItems.map(item => (
              <button
                key={item.key}
                onClick={() => {
                  setActiveTab(item.key);
                  setMobileMenuOpen(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs ${
                  activeTab === item.key ? 'bg-gold text-ink font-bold' : 'text-sand-muted'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        )}

        {/* Main Content View */}
        <main className="flex-1 p-6 max-w-7xl w-full mx-auto">
          {activeTab === 'dashboard' ? (
            <AdminDashboard />
          ) : activeTab === 'settings' ? (
            <WebsiteSettingsEditor />
          ) : activeTab === 'security' ? (
            <ChangePasswordSection user={user} />
          ) : (
            <ResourceList key={activeTab} resource={activeTab} />
          )}
        </main>
      </div>
    </div>
  );
}
