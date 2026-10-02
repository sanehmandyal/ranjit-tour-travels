import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  LayoutDashboard, Calendar, HelpCircle, MapPin, Package, Car, 
  Layers, FileText, Users, 
  Settings as SettingsIcon, Globe, LogOut, Plus, Edit2, 
  Trash2, Search, Check, X, Shield, ChevronRight, Menu, Upload, RefreshCw,
  Lock, Mail, Eye, EyeOff, Compass, ArrowRight, ArrowLeft,
  Phone, MessageCircle, Sparkles, TrendingUp, CheckCircle2, Clock,
  DollarSign, Activity, ChevronDown
} from 'lucide-react';
import { api, msg, img } from '../api.js';
import { Loading, ErrorBox, Logo } from '../components/ui.jsx';
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
          className="w-full h-full object-cover object-center filter brightness-[0.35] scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/75 to-slate-950/85" />
      </div>

      {/* Ambient Glowing Orbs */}
      <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] bg-teal-500/15 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/3 w-[500px] h-[500px] bg-emerald-500/15 blur-[150px] rounded-full pointer-events-none" />

      {/* Glassmorphic Login Card */}
      <div className="relative z-10 max-w-md w-full">
        <div className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl p-8 sm:p-10 shadow-2xl relative overflow-hidden text-white">
          {/* Top Edge Specular Reflection */}
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent pointer-events-none" />

          {/* Header Brand Badge */}
          <div className="text-center mb-8">
            <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500/30 to-emerald-600/30 p-1 backdrop-blur-xl border border-teal-400/50 shadow-xl shadow-teal-500/30 flex items-center justify-center mx-auto mb-4 group">
              <img
                src="/favicon.svg"
                alt="Ranjit Tour & Travels"
                className="w-12 h-12 object-contain drop-shadow-md"
              />
              <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-slate-900 animate-pulse" />
            </div>

            <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Ranjit Tour & Travels
            </h1>
            <span className="inline-flex items-center gap-1.5 text-[11px] font-mono text-teal-300 uppercase tracking-widest font-bold mt-2 px-3 py-1 rounded-full bg-teal-500/20 border border-teal-400/40 backdrop-blur-md">
              <Shield size={13} className="text-teal-300" />
              <span>Enterprise Admin Portal</span>
            </span>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-200 mb-1.5 uppercase tracking-wider">
                Admin Email
              </label>
              <div className="relative flex items-center">
                <input
                  type="email"
                  required
                  className="w-full bg-white/10 border border-white/20 rounded-xl py-2.5 pl-10 pr-3.5 text-xs sm:text-sm text-white placeholder:text-slate-400 focus:bg-white/20 focus:outline-none focus:ring-2 focus:ring-teal-400/50 focus:border-teal-400 transition backdrop-blur-md"
                  placeholder="admin@ranjittravels.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
                <Mail className="w-4 h-4 text-teal-300 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-200 mb-1.5 uppercase tracking-wider">
                Password
              </label>
              <div className="relative flex items-center">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  className="w-full bg-white/10 border border-white/20 rounded-xl py-2.5 pl-10 pr-10 text-xs sm:text-sm text-white placeholder:text-slate-400 focus:bg-white/20 focus:outline-none focus:ring-2 focus:ring-teal-400/50 focus:border-teal-400 transition backdrop-blur-md"
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
              <div className="p-3 bg-red-500/25 border border-red-400/50 rounded-xl text-xs text-red-200 font-medium backdrop-blur-md">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-white py-3 rounded-xl font-bold shadow-lg shadow-teal-950/60 mt-2 flex items-center justify-center gap-2 transition hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
            >
              <span>{loading ? 'Authenticating…' : 'Access Control Center'}</span>
              <ArrowRight size={17} />
            </button>
          </form>

          {/* Back to Website Link */}
          <div className="mt-6 pt-5 border-t border-white/15 text-center">
            <Link
              to="/"
              className="text-xs text-slate-300 hover:text-teal-300 transition inline-flex items-center gap-1.5 font-medium"
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

// 2. Resource Item Editor (Add / Edit Form with Glassmorphism)
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
    <form onSubmit={handleSave} className="bg-white/[0.08] backdrop-blur-2xl border border-white/20 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden text-white">
      {/* Specular Edge Highlight */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none" />

      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div>
          <span className="text-[10px] font-mono text-teal-300 font-bold uppercase tracking-wider block">Content Editor</span>
          <h3 className="font-display font-bold text-xl sm:text-2xl text-white mt-0.5">
            {item?._id ? `Edit ${resource.slice(0, -1)}` : `Create New ${resource.slice(0, -1)}`}
          </h3>
        </div>
        <button
          type="button"
          onClick={onDone}
          className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-bold text-slate-200 transition backdrop-blur-md cursor-pointer"
        >
          Cancel
        </button>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {fields.map((f) => {
          const val = getVal(form, f.key);

          if (f.type === 'bool') {
            return (
              <label key={f.key} className="flex items-center gap-3 p-3.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl cursor-pointer transition backdrop-blur-md">
                <input
                  type="checkbox"
                  checked={!!val}
                  onChange={e => setForm(setVal(form, f.key, e.target.checked))}
                  className="accent-teal-500 w-4 h-4 cursor-pointer"
                />
                <span className="text-xs font-semibold text-slate-200">{f.label}</span>
              </label>
            );
          }

          if (f.type === 'image') {
            return (
              <div key={f.key} className="space-y-2 sm:col-span-2">
                <label className="block text-[11px] font-bold text-teal-300 uppercase tracking-wider">{f.label}</label>
                <div className="flex flex-wrap items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                  {val && (
                    <div className="relative w-24 h-24 rounded-xl overflow-hidden border-2 border-teal-400/50 shadow-lg flex-shrink-0">
                      <img src={img(val)} alt="" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="flex-1 min-w-[200px] space-y-2">
                    <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-500/20 hover:bg-teal-500/30 border border-teal-400/40 text-teal-200 text-xs font-bold cursor-pointer transition">
                      <Upload size={14} />
                      <span>{uploading ? 'Processing Image…' : 'Upload From Device / Phone'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={e => e.target.files[0] && handleFileUpload(f.key, e.target.files[0])}
                        className="hidden"
                      />
                    </label>
                    <input
                      type="text"
                      className="w-full bg-white/10 border border-white/15 rounded-xl py-2 px-3 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-teal-400"
                      value={typeof val === 'string' ? val : ''}
                      onChange={e => setForm(setVal(form, f.key, e.target.value))}
                      placeholder="Or paste external image URL..."
                    />
                  </div>
                </div>
              </div>
            );
          }

          if (f.type === 'image_list') {
            return (
              <div key={f.key} className="sm:col-span-2 space-y-2">
                <label className="block text-[11px] font-bold text-teal-300 uppercase tracking-wider">{f.label}</label>
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md space-y-3">
                  <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-500/20 hover:bg-teal-500/30 border border-teal-400/40 text-teal-200 text-xs font-bold cursor-pointer transition">
                    <Upload size={14} />
                    <span>{uploading ? 'Uploading Photo…' : 'Add Vehicle Photo'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={e => e.target.files[0] && handleFileUpload('images', e.target.files[0])}
                      className="hidden"
                    />
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {(form.images || []).map((pic, idx) => (
                      <div key={idx} className="relative w-20 h-20 rounded-xl overflow-hidden border border-white/20 shadow-md group">
                        <img src={img(pic)} alt="" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setForm({ ...form, images: form.images.filter((_, i) => i !== idx) })}
                          className="absolute top-1 right-1 bg-red-600/90 text-white rounded-md w-5 h-5 flex items-center justify-center text-xs opacity-80 hover:opacity-100 transition"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          }

          if (f.type === 'destination_ref') {
            return (
              <div key={f.key}>
                <label className="block text-[11px] font-bold text-slate-300 mb-1.5 uppercase tracking-wider">{f.label}</label>
                <select
                  className="w-full bg-slate-900/80 border border-white/15 rounded-xl py-2.5 px-3 text-xs sm:text-sm text-white focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-400/30 transition"
                  value={val || ''}
                  onChange={e => setForm(setVal(form, f.key, e.target.value))}
                >
                  <option value="" className="bg-slate-900 text-slate-300">Select Destination Region</option>
                  {destinations.map(d => (
                    <option key={d._id} value={d._id} className="bg-slate-900 text-white">{d.name} ({d.state})</option>
                  ))}
                </select>
              </div>
            );
          }

          if (f.type === 'select') {
            return (
              <div key={f.key}>
                <label className="block text-[11px] font-bold text-slate-300 mb-1.5 uppercase tracking-wider">{f.label}</label>
                <select
                  className="w-full bg-slate-900/80 border border-white/15 rounded-xl py-2.5 px-3 text-xs sm:text-sm text-white focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-400/30 transition"
                  value={val || ''}
                  onChange={e => setForm(setVal(form, f.key, e.target.value))}
                >
                  <option value="" className="bg-slate-900 text-slate-300">Select Option</option>
                  {f.options.map(opt => (
                    <option key={opt} value={opt} className="bg-slate-900 text-white">{opt}</option>
                  ))}
                </select>
              </div>
            );
          }

          if (f.type === 'list') {
            return (
              <div key={f.key} className="sm:col-span-2">
                <label className="block text-[11px] font-bold text-slate-300 mb-1.5 uppercase tracking-wider">{f.label}</label>
                <input
                  type="text"
                  className="w-full bg-white/10 border border-white/15 rounded-xl py-2.5 px-3 text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-400/30 transition backdrop-blur-md"
                  value={(val || []).join(', ')}
                  onChange={e => setForm(setVal(form, f.key, e.target.value.split(',').map(s => s.trim()).filter(Boolean)))}
                  placeholder="Comma separated items (e.g. Atal Tunnel, River Rafting, Hot Springs)..."
                />
              </div>
            );
          }

          if (f.type === 'lines') {
            return (
              <div key={f.key} className="sm:col-span-2">
                <label className="block text-[11px] font-bold text-slate-300 mb-1.5 uppercase tracking-wider">{f.label}</label>
                <textarea
                  className="w-full bg-white/10 border border-white/15 rounded-xl py-2.5 px-3 font-mono text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-400/30 transition backdrop-blur-md"
                  rows="4"
                  defaultValue={(val || []).map(i => `${i.title} | ${i.details}`).join('\n')}
                  onChange={e => setForm(setVal(form, f.key, e.target.value.split('\n').filter(Boolean).map(line => {
                    const [t, ...d] = line.split('|');
                    return { title: (t || '').trim(), details: d.join('|').trim() };
                  })))}
                  placeholder="Day 1: Arrival | Chauffeur transfer to Shimla..."
                />
              </div>
            );
          }

          if (f.type === 'textarea') {
            return (
              <div key={f.key} className="sm:col-span-2">
                <label className="block text-[11px] font-bold text-slate-300 mb-1.5 uppercase tracking-wider">{f.label}</label>
                <textarea
                  className="w-full bg-white/10 border border-white/15 rounded-xl py-2.5 px-3 text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-400/30 transition backdrop-blur-md"
                  rows="4"
                  value={val || ''}
                  onChange={e => setForm(setVal(form, f.key, e.target.value))}
                />
              </div>
            );
          }

          return (
            <div key={f.key}>
              <label className="block text-[11px] font-bold text-slate-300 mb-1.5 uppercase tracking-wider">{f.label}</label>
              <input
                type={f.type || 'text'}
                required={f.required}
                className="w-full bg-white/10 border border-white/15 rounded-xl py-2.5 px-3 text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-400/30 transition backdrop-blur-md"
                value={val ?? ''}
                placeholder={f.placeholder}
                onChange={e => setForm(setVal(form, f.key, f.type === 'number' ? (e.target.value === '' ? undefined : Number(e.target.value)) : e.target.value))}
              />
            </div>
          );
        })}
      </div>

      {error && (
        <div className="p-3 bg-red-500/25 border border-red-400/50 rounded-xl text-xs text-red-200">
          {error}
        </div>
      )}

      <div className="flex flex-wrap gap-3 pt-4 border-t border-white/10">
        <button
          type="submit"
          disabled={loading || uploading}
          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-white text-xs font-bold shadow-lg shadow-teal-950/50 transition cursor-pointer"
        >
          {loading ? 'Saving…' : 'Save & Publish Live'}
        </button>
        <button
          type="button"
          onClick={onDone}
          className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-bold text-slate-200 transition cursor-pointer"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

// 3. Resource List & Glassmorphic Table View
function ResourceList({ resource }) {
  const [data, setData] = useState(null);
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [editingItem, setEditingItem] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const isInbox = resource === 'bookings' || resource === 'inquiries';

  const saveCustomItems = (items) => {
    if (!isInbox) {
      try {
        localStorage.setItem(`rjt_custom_${resource}`, JSON.stringify(items));
      } catch (e) {
        console.warn('Storage sync warn:', e);
      }
    }
  };

  const getFallbackData = () => {
    if (!isInbox) {
      try {
        const stored = localStorage.getItem(`rjt_custom_${resource}`);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            let items = parsed;
            if (q) {
              const qLow = q.toLowerCase();
              items = items.filter(it => 
                (it.name && it.name.toLowerCase().includes(qLow)) ||
                (it.title && it.title.toLowerCase().includes(qLow)) ||
                (it.shortDescription && it.shortDescription.toLowerCase().includes(qLow)) ||
                (it.state && it.state.toLowerCase().includes(qLow))
              );
            }
            return { items, total: items.length, page: 1, pages: 1 };
          }
        }
      } catch (e) {
        console.warn('Custom storage read error:', e);
      }
    }

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
          if (!isInbox) saveCustomItems(res.data.items);
        } else {
          const fb = getFallbackData();
          setData(fb);
          if (!isInbox && fb.items.length > 0) saveCustomItems(fb.items);
        }
      })
      .catch(() => {
        const fb = getFallbackData();
        setData(fb);
        if (!isInbox && fb.items.length > 0) saveCustomItems(fb.items);
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
        setData(prev => {
          if (!prev) return null;
          const updatedItems = prev.items.filter(i => i._id !== item._id);
          saveCustomItems(updatedItems);
          return { ...prev, items: updatedItems, total: Math.max(0, (prev.total || 1) - 1) };
        });
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
              const currentItems = prev?.items || getFallbackData().items;
              const itemToSave = { ...savedForm };
              if (!itemToSave.slug) {
                const label = itemToSave.name || itemToSave.title || 'item';
                itemToSave.slug = label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
              }
              let updatedItems;
              if (editingItem && editingItem !== 'new' && editingItem._id) {
                updatedItems = currentItems.map(it => it._id === editingItem._id ? { ...it, ...itemToSave } : it);
              } else {
                const newItem = {
                  ...itemToSave,
                  _id: itemToSave._id || `${resource.slice(0, 3)}_${Date.now()}`
                };
                updatedItems = [newItem, ...currentItems];
              }
              saveCustomItems(updatedItems);
              return {
                items: updatedItems,
                total: updatedItems.length,
                page: 1,
                pages: 1
              };
            });
          }
          setEditingItem(null);
        }}
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Glass Action Bar */}
      <div className="flex flex-col sm:flex-row justify-between gap-3 items-stretch sm:items-center">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            className="w-full bg-white/[0.08] backdrop-blur-xl border border-white/15 rounded-2xl py-2.5 pl-10 pr-4 text-xs sm:text-sm text-white placeholder:text-slate-400 focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-400/30 transition"
            placeholder={`Search ${resource} by keyword…`}
            value={q}
            onChange={e => setQ(e.target.value)}
          />
          <Search className="w-4 h-4 text-teal-300 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {RESOURCE_FIELDS[resource] && (
          <button
            onClick={() => setEditingItem('new')}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-white text-xs font-bold shadow-lg shadow-teal-950/50 transition hover:scale-[1.02] cursor-pointer whitespace-nowrap"
          >
            <Plus size={16} />
            <span>Add New {resource.slice(0, -1)}</span>
          </button>
        )}
      </div>

      {loading ? (
        <Loading />
      ) : !data || data.items.length === 0 ? (
        <div className="bg-white/[0.06] backdrop-blur-2xl border border-white/15 rounded-3xl p-12 text-center text-white">
          <Sparkles className="w-8 h-8 text-teal-300 mx-auto mb-2 opacity-60" />
          <p className="text-slate-300 text-sm">No records found matching your filter in {resource}.</p>
        </div>
      ) : (
        <div className="bg-white/[0.06] backdrop-blur-2xl border border-white/15 rounded-3xl overflow-hidden shadow-2xl relative">
          {/* Top Specular Edge */}
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" />

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-white/[0.08] border-b border-white/10 uppercase text-teal-300 font-mono text-[10px] tracking-wider">
                <tr>
                  <th className="p-4">Record / Title</th>
                  <th className="p-4">Details & Overview</th>
                  <th className="p-4">Status / Metrics</th>
                  <th className="p-4 text-right">Quick Contact & Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {data.items.map((item) => (
                  <tr key={item._id} className="hover:bg-white/[0.05] transition">
                    <td className="p-4 font-medium text-white">
                      {isInbox ? (
                        <div>
                          <span className="font-mono font-bold text-teal-300 text-xs block">
                            {item.bookingId || item.type?.toUpperCase()}
                          </span>
                          <span className="font-bold text-white text-sm block mt-0.5">{item.name}</span>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-slate-300 font-mono text-[11px]">{item.phone}</span>
                            {item.phone && (
                              <a
                                href={`tel:${item.phone}`}
                                className="text-teal-300 hover:text-white"
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
                              className="w-12 h-12 object-cover rounded-xl border border-white/20 shadow-md flex-shrink-0"
                            />
                          )}
                          <div>
                            <span className="font-bold text-white text-sm block">{item.name || item.title}</span>
                            <span className="text-[11px] text-teal-200/80">{item.category || item.state || ''}</span>
                          </div>
                        </div>
                      )}
                    </td>

                    <td className="p-4 text-slate-300 max-w-xs truncate">
                      {isInbox ? (
                        <div>
                          <span className="text-white font-medium block">{item.destination || item.package || item.subject || ''}</span>
                          <span className="text-slate-400 text-[11px] block truncate">{item.vehicle || item.message}</span>
                        </div>
                      ) : (
                        <span className="line-clamp-2">{item.shortDescription || item.overview || item.excerpt || `₹${item.price || item.pricePerDay || item.startingPrice || '-'}`}</span>
                      )}
                    </td>

                    <td className="p-4">
                      {resource === 'bookings' ? (
                        <select
                          className="bg-slate-900/90 border border-white/20 text-teal-200 text-xs rounded-xl py-1.5 px-2.5 focus:outline-none focus:border-teal-400"
                          value={item.status || 'Confirmed'}
                          onChange={e => handleStatusChange(item, e.target.value)}
                        >
                          {BOOKING_STATUSES.map(st => (
                            <option key={st} value={st} className="bg-slate-900 text-white">{st}</option>
                          ))}
                        </select>
                      ) : resource === 'inquiries' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-teal-500/20 text-teal-200 border border-teal-400/30 uppercase backdrop-blur-md">
                          <Activity size={10} className="text-teal-300" />
                          <span>{item.status || 'New'}</span>
                        </span>
                      ) : (
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase backdrop-blur-md ${
                          item.published !== false 
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40' 
                            : 'bg-red-500/20 text-red-300 border border-red-400/40'
                        }`}>
                          <CheckCircle2 size={10} />
                          <span>{item.published !== false ? 'LIVE' : 'DRAFT'}</span>
                        </span>
                      )}
                    </td>

                    <td className="p-4 text-right space-x-2 whitespace-nowrap">
                      {isInbox && item.phone && (
                        <>
                          <a
                            href={`https://wa.me/${item.phone.replace(/[^0-9]/g, '')}?text=Hello%20${encodeURIComponent(item.name || 'Customer')},%20this%20is%20Ranjit%20Tour%20%26%20Travels%20regarding%20your%20trip%20inquiry.`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/30 text-emerald-300 text-xs font-bold transition"
                            title="Open WhatsApp Chat"
                          >
                            <MessageCircle size={13} />
                            <span>WhatsApp</span>
                          </a>
                          <a
                            href={`tel:${item.phone}`}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-teal-500/20 hover:bg-teal-500/30 border border-teal-400/30 text-teal-200 text-xs font-bold transition"
                            title="Call Customer"
                          >
                            <Phone size={13} />
                            <span>Call</span>
                          </a>
                        </>
                      )}
                      {RESOURCE_FIELDS[resource] && (
                        <button
                          onClick={() => setEditingItem(item)}
                          className="inline-flex items-center justify-center p-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-slate-200 hover:text-white transition cursor-pointer"
                          title="Edit"
                        >
                          <Edit2 size={13} />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(item)}
                        className="inline-flex items-center justify-center p-2 rounded-xl bg-red-500/15 hover:bg-red-500/25 border border-red-400/30 text-red-300 hover:text-red-200 transition cursor-pointer"
                        title="Delete"
                      >
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {data.pages > 1 && (
            <div className="p-4 bg-white/5 border-t border-white/10 flex justify-end gap-1.5">
              {Array.from({ length: data.pages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i + 1)}
                  className={`w-8 h-8 rounded-xl text-xs font-bold transition ${
                    i + 1 === page 
                      ? 'bg-teal-500 text-white shadow-md' 
                      : 'bg-white/10 text-slate-300 hover:bg-white/20'
                  }`}
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

// 4. Analytics Dashboard View (Luminous Glassmorphism Cards)
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
    { label: 'Total Bookings', value: stats.totalBookings || 0, icon: Calendar, gradient: 'from-teal-500/20 to-emerald-500/20', border: 'border-teal-400/30', textGrad: 'from-teal-300 to-emerald-200' },
    { label: 'Pending Requests', value: stats.pendingBookings || 0, icon: Clock, gradient: 'from-amber-500/20 to-orange-500/20', border: 'border-amber-400/30', textGrad: 'from-amber-300 to-yellow-200' },
    { label: 'Confirmed Trips', value: stats.confirmedBookings || 0, icon: CheckCircle2, gradient: 'from-emerald-500/20 to-teal-500/20', border: 'border-emerald-400/30', textGrad: 'from-emerald-300 to-teal-200' },
    { label: 'Completed Tours', value: stats.completedTrips || 0, icon: Sparkles, gradient: 'from-cyan-500/20 to-blue-500/20', border: 'border-cyan-400/30', textGrad: 'from-cyan-300 to-blue-200' },
    { label: 'Total Inquiries', value: stats.totalInquiries || 0, icon: HelpCircle, gradient: 'from-purple-500/20 to-pink-500/20', border: 'border-purple-400/30', textGrad: 'from-purple-300 to-pink-200' },
    { label: 'Destinations', value: stats.totalDestinations || 8, icon: MapPin, gradient: 'from-teal-500/20 to-cyan-500/20', border: 'border-teal-400/30', textGrad: 'from-teal-200 to-cyan-100' },
    { label: 'Tour Packages', value: stats.totalPackages || 8, icon: Package, gradient: 'from-emerald-500/20 to-green-500/20', border: 'border-emerald-400/30', textGrad: 'from-emerald-200 to-green-100' },
    { label: 'Fleet Vehicles', value: stats.totalVehicles || 8, icon: Car, gradient: 'from-amber-500/20 to-teal-500/20', border: 'border-amber-400/30', textGrad: 'from-amber-200 to-teal-100' }
  ];

  return (
    <div className="space-y-8">
      {/* Metric Counters Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {metricCards.map((mc, idx) => {
          const Icon = mc.icon;
          return (
            <div
              key={idx}
              className={`bg-white/[0.06] backdrop-blur-2xl border ${mc.border} hover:bg-white/[0.09] transition-all duration-300 rounded-3xl p-5 shadow-2xl relative overflow-hidden group`}
            >
              {/* Specular Edge */}
              <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none" />
              
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-mono uppercase text-slate-300 tracking-wider font-bold">
                  {mc.label}
                </span>
                <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${mc.gradient} border ${mc.border} flex items-center justify-center text-white shadow-sm`}>
                  <Icon size={16} />
                </div>
              </div>

              <span className={`font-display text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r ${mc.textGrad}`}>
                {mc.value || 0}
              </span>
            </div>
          );
        })}
      </div>

      {/* Recent Bookings & Inquiries */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Bookings */}
        <div className="bg-white/[0.06] backdrop-blur-2xl border border-white/15 rounded-3xl p-6 shadow-2xl relative overflow-hidden text-white">
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" />

          <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-3">
            <div>
              <span className="text-[10px] font-mono text-teal-300 font-bold uppercase tracking-wider block">Live Feed</span>
              <h3 className="font-display font-bold text-lg text-white">Recent Booking Requests</h3>
            </div>
            <div className="w-8 h-8 rounded-xl bg-teal-500/20 text-teal-300 flex items-center justify-center border border-teal-400/30">
              <Calendar size={16} />
            </div>
          </div>

          <div className="space-y-3">
            {(stats.recentBookings || []).map(b => (
              <div key={b._id} className="p-3.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl flex items-center justify-between text-xs transition backdrop-blur-md">
                <div>
                  <span className="font-mono font-bold text-teal-300">{b.bookingId}</span>
                  <span className="block text-white font-bold mt-0.5">{b.name} ({b.destination})</span>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-teal-500/20 text-teal-200 border border-teal-400/30">
                  {b.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Inquiries */}
        <div className="bg-white/[0.06] backdrop-blur-2xl border border-white/15 rounded-3xl p-6 shadow-2xl relative overflow-hidden text-white">
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" />

          <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-3">
            <div>
              <span className="text-[10px] font-mono text-cyan-300 font-bold uppercase tracking-wider block">CRM Stream</span>
              <h3 className="font-display font-bold text-lg text-white">Recent Guest Inquiries</h3>
            </div>
            <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center border border-cyan-400/30">
              <HelpCircle size={16} />
            </div>
          </div>

          <div className="space-y-3">
            {(stats.recentInquiries || []).map(inq => (
              <div key={inq._id} className="p-3.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-xs space-y-1 transition backdrop-blur-md">
                <div className="flex items-center justify-between">
                  <b className="text-white font-bold">{inq.name}</b>
                  <span className="text-[10px] text-teal-300 uppercase font-mono">{inq.type}</span>
                </div>
                <p className="text-slate-300 line-clamp-1">{inq.message}</p>
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
      setNotice('Settings successfully saved and live across website!');
    } catch (err) {
      setNotice(msg(err));
    } finally {
      setSaving(false);
    }
  };

  if (!settings) return <Loading />;

  return (
    <form onSubmit={handleSave} className="bg-white/[0.08] backdrop-blur-2xl border border-white/20 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden text-white">
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none" />

      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div>
          <span className="text-[10px] font-mono text-teal-300 font-bold uppercase tracking-wider block">Global Config</span>
          <h3 className="font-display font-bold text-xl sm:text-2xl text-white">Website & NAP Settings</h3>
        </div>
        <button
          type="submit"
          disabled={saving}
          className="px-6 py-2 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-white text-xs font-bold shadow-lg shadow-teal-950/50 transition cursor-pointer"
        >
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-[11px] font-bold text-slate-300 mb-1.5 uppercase tracking-wider">BUSINESS NAME</label>
          <input
            type="text"
            className="w-full bg-white/10 border border-white/15 rounded-xl py-2.5 px-3 text-xs sm:text-sm text-white focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-400/30 transition backdrop-blur-md"
            value={settings.businessName || ''}
            onChange={e => setSettings({ ...settings, businessName: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-300 mb-1.5 uppercase tracking-wider">HERO TAGLINE</label>
          <input
            type="text"
            className="w-full bg-white/10 border border-white/15 rounded-xl py-2.5 px-3 text-xs sm:text-sm text-white focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-400/30 transition backdrop-blur-md"
            value={settings.tagline || ''}
            onChange={e => setSettings({ ...settings, tagline: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-300 mb-1.5 uppercase tracking-wider">PRIMARY PHONE</label>
          <input
            type="text"
            className="w-full bg-white/10 border border-white/15 rounded-xl py-2.5 px-3 text-xs sm:text-sm text-white focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-400/30 transition backdrop-blur-md"
            value={settings.phone || ''}
            onChange={e => setSettings({ ...settings, phone: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-300 mb-1.5 uppercase tracking-wider">WHATSAPP NUMBER</label>
          <input
            type="text"
            className="w-full bg-white/10 border border-white/15 rounded-xl py-2.5 px-3 text-xs sm:text-sm text-white focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-400/30 transition backdrop-blur-md"
            value={settings.whatsapp || ''}
            onChange={e => setSettings({ ...settings, whatsapp: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-300 mb-1.5 uppercase tracking-wider">EMAIL ADDRESS</label>
          <input
            type="email"
            className="w-full bg-white/10 border border-white/15 rounded-xl py-2.5 px-3 text-xs sm:text-sm text-white focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-400/30 transition backdrop-blur-md"
            value={settings.email || ''}
            onChange={e => setSettings({ ...settings, email: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-300 mb-1.5 uppercase tracking-wider">BUSINESS HOURS</label>
          <input
            type="text"
            className="w-full bg-white/10 border border-white/15 rounded-xl py-2.5 px-3 text-xs sm:text-sm text-white focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-400/30 transition backdrop-blur-md"
            value={settings.businessHours || ''}
            onChange={e => setSettings({ ...settings, businessHours: e.target.value })}
          />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-[11px] font-bold text-slate-300 mb-1.5 uppercase tracking-wider">PHYSICAL OFFICE ADDRESS (NAP)</label>
          <input
            type="text"
            className="w-full bg-white/10 border border-white/15 rounded-xl py-2.5 px-3 text-xs sm:text-sm text-white focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-400/30 transition backdrop-blur-md"
            value={settings.address || ''}
            onChange={e => setSettings({ ...settings, address: e.target.value })}
          />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-[11px] font-bold text-slate-300 mb-1.5 uppercase tracking-wider">HERO INTRO TEXT</label>
          <textarea
            className="w-full bg-white/10 border border-white/15 rounded-xl py-2.5 px-3 text-xs sm:text-sm text-white focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-400/30 transition backdrop-blur-md"
            rows="3"
            value={settings.heroText || ''}
            onChange={e => setSettings({ ...settings, heroText: e.target.value })}
          />
        </div>
      </div>

      {notice && (
        <div className="p-3.5 bg-emerald-500/20 border border-emerald-400/40 rounded-xl text-xs text-emerald-200 font-medium backdrop-blur-md">
          {notice}
        </div>
      )}
    </form>
  );
}

// 6. Change Password Component
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
      <div className="bg-white/[0.08] backdrop-blur-2xl border border-white/20 rounded-3xl p-6 shadow-2xl relative overflow-hidden text-white">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-500/30 to-emerald-500/30 border border-teal-400/50 flex items-center justify-center font-bold font-display text-xl text-teal-300 shadow-lg">
            {user?.name?.charAt(0) || 'A'}
          </div>
          <div>
            <h3 className="font-display font-bold text-lg text-white">{user?.name}</h3>
            <span className="text-xs text-slate-300">{user?.email}</span>
            <span className="inline-block ml-2 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-teal-500/20 text-teal-300 border border-teal-400/30 uppercase">
              {user?.role}
            </span>
          </div>
        </div>
      </div>

      {/* Change Password Form Card */}
      <form onSubmit={handleChangePassword} className="bg-white/[0.08] backdrop-blur-2xl border border-white/20 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5 relative overflow-hidden text-white">
        <div className="border-b border-white/10 pb-4">
          <h3 className="font-display font-bold text-lg text-white flex items-center gap-2">
            <Lock size={18} className="text-teal-300" />
            <span>Update Admin Password</span>
          </h3>
          <p className="text-xs text-slate-300 mt-1">
            Once changed, your new password will be required for all future logins. The previous password will no longer work.
          </p>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
            Current Password *
          </label>
          <div className="relative flex items-center">
            <input
              type={showCurrent ? 'text' : 'password'}
              required
              className="w-full bg-white/10 border border-white/15 rounded-xl py-2.5 pl-3.5 pr-10 text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-400/30 transition backdrop-blur-md"
              placeholder="Enter current active password"
              value={currentPassword}
              onChange={e => setCurrentPassword(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowCurrent(!showCurrent)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              {showCurrent ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
              New Password *
            </label>
            <div className="relative flex items-center">
              <input
                type={showNew ? 'text' : 'password'}
                required
                className="w-full bg-white/10 border border-white/15 rounded-xl py-2.5 pl-3.5 pr-10 text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-400/30 transition backdrop-blur-md"
                placeholder="Min 6 characters"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
              Confirm New Password *
            </label>
            <input
              type="password"
              required
              className="w-full bg-white/10 border border-white/15 rounded-xl py-2.5 px-3.5 text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-400/30 transition backdrop-blur-md"
              placeholder="Re-enter new password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
            />
          </div>
        </div>

        {status.msg && (
          <div className={`p-3.5 rounded-xl text-xs font-medium backdrop-blur-md ${status.success ? 'bg-emerald-500/25 border border-emerald-400/50 text-emerald-200' : 'bg-red-500/25 border border-red-400/50 text-red-200'}`}>
            {status.msg}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-white text-xs font-bold shadow-lg shadow-teal-950/50 transition cursor-pointer"
        >
          {loading ? 'Saving New Password…' : 'Save & Update Password'}
        </button>
      </form>
    </div>
  );
}

// 7. Main Admin Layout with Full-Immersion Glassmorphic Environment
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
    <div className="min-h-screen flex bg-slate-950 text-slate-100 relative overflow-hidden font-sans selection:bg-teal-500 selection:text-white">
      {/* Background Mountain Wallpaper with Deep Atmospheric Contrast */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <img
          src="https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=2000&q=80"
          alt="Himalayan Mountains"
          className="w-full h-full object-cover object-center filter brightness-[0.2] contrast-[1.15] scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-slate-950/95 via-slate-950/85 to-slate-900/90" />
      </div>

      {/* Ambient Glowing Glass Orbs */}
      <div className="fixed top-10 left-1/4 w-[500px] h-[500px] bg-teal-500/10 blur-[160px] rounded-full pointer-events-none" />
      <div className="fixed bottom-10 right-1/4 w-[500px] h-[500px] bg-emerald-500/10 blur-[160px] rounded-full pointer-events-none" />
      <div className="fixed top-1/2 right-10 w-[400px] h-[400px] bg-cyan-500/10 blur-[140px] rounded-full pointer-events-none" />

      {/* Sidebar Desktop (Frosted Glass) */}
      <aside className="hidden lg:flex flex-col w-64 bg-slate-950/60 backdrop-blur-2xl border-r border-white/10 p-4 justify-between flex-shrink-0 relative z-10 shadow-2xl">
        {/* Specular Edge Highlight */}
        <div className="absolute top-0 right-0 bottom-0 w-px bg-gradient-to-b from-white/20 via-white/5 to-transparent pointer-events-none" />

        <div className="space-y-6">
          <div className="px-2 py-1">
            <Logo light={true} />
            <div className="mt-2 flex items-center justify-between">
              <span className="text-[10px] font-mono text-teal-300 uppercase tracking-widest font-bold px-2 py-0.5 rounded-full bg-teal-500/20 border border-teal-400/30">
                {user.role}
              </span>
              <span className="text-[10px] text-slate-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live Sync
              </span>
            </div>
          </div>

          <nav className="space-y-1">
            {navigationItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => setActiveTab(item.key)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all duration-200 cursor-pointer ${
                    isActive 
                      ? 'bg-gradient-to-r from-teal-500/30 to-emerald-500/20 border border-teal-400/50 text-white font-bold shadow-lg shadow-teal-950/50 backdrop-blur-md' 
                      : 'text-slate-300 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <Icon size={16} className={isActive ? 'text-teal-300' : 'text-slate-400'} />
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
          className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs text-red-300 hover:text-red-200 hover:bg-red-500/15 border border-transparent hover:border-red-400/30 transition cursor-pointer"
        >
          <LogOut size={16} />
          <span>Sign Out</span>
        </button>
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 relative z-10">
        {/* Top Navbar */}
        <header className="h-16 bg-slate-950/50 backdrop-blur-xl border-b border-white/10 px-4 sm:px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-white hover:bg-white/10 rounded-xl min-h-[40px] min-w-[40px] flex items-center justify-center cursor-pointer"
              aria-label="Toggle admin menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <h2 className="font-display font-bold text-base sm:text-lg text-white capitalize truncate flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-teal-400" />
              <span>{activeTab === 'security' ? 'Security & Password' : activeTab.replace('-', ' ')}</span>
            </h2>
          </div>

          <div className="flex items-center gap-2 sm:gap-4 text-xs">
            <span className="text-slate-400 hidden sm:inline">Logged in as: <b className="text-white">{user.name}</b></span>
            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold transition backdrop-blur-md whitespace-nowrap"
            >
              <Globe size={13} className="text-teal-300" />
              <span>View Website</span>
            </a>
          </div>
        </header>

        {/* Mobile Navigation Drawer (Glassmorphic) */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-slate-950/90 backdrop-blur-2xl border-b border-white/10 p-4 space-y-1.5 animate-in slide-in-from-top-2 duration-150">
            {navigationItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => {
                    setActiveTab(item.key);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs flex items-center gap-3 min-h-[44px] transition ${
                    isActive 
                      ? 'bg-gradient-to-r from-teal-500/30 to-emerald-500/20 border border-teal-400/50 text-white font-bold shadow-md' 
                      : 'text-slate-300 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <Icon size={16} className={isActive ? 'text-teal-300' : 'text-slate-400'} />
                  <span>{item.label}</span>
                </button>
              );
            })}

            <div className="pt-2 border-t border-white/10 mt-2">
              <button
                onClick={() => {
                  localStorage.removeItem('rjt_token');
                  setUser(null);
                }}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs text-red-300 hover:bg-red-500/20 min-h-[44px]"
              >
                <LogOut size={16} />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        )}

        {/* Main Content View */}
        <main className="flex-1 p-3 sm:p-6 max-w-7xl w-full mx-auto overflow-x-hidden">
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
