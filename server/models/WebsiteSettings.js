import mongoose from 'mongoose';

const websiteSettingsSchema = new mongoose.Schema({
  businessName: { type: String, default: 'Ranjit Tour & Travels' },
  tagline: { type: String, default: 'Your Journey. Our Route. Royal Route Experience.' },
  logo: { type: String, default: '' },
  logoDark: { type: String, default: '' },
  phone: { type: String, default: '+91 98765 43210' },
  alternatePhone: { type: String, default: '+91 98123 45678' },
  whatsapp: { type: String, default: '+91 98765 43210' },
  email: { type: String, default: 'info@ranjittravels.com' },
  bookingEmail: { type: String, default: 'bookings@ranjittravels.com' },
  address: { type: String, default: 'SCO 142-143, Sector 17-C, Chandigarh, India, 160017' },
  city: { type: String, default: 'Chandigarh' },
  state: { type: String, default: 'Punjab / Chandigarh UT' },
  country: { type: String, default: 'India' },
  pincode: { type: String, default: '160017' },
  lat: { type: Number, default: 30.7333 },
  lng: { type: Number, default: 76.7794 },
  googleMapsUrl: { type: String, default: 'https://maps.google.com/?q=Chandigarh,India' },
  businessHours: { type: String, default: 'Mon - Sun: 24/7 Assistance & Taxi Dispatch' },
  stats: [{
    label: { type: String },
    value: { type: String }
  }],
  socialLinks: {
    facebook: { type: String, default: 'https://facebook.com/ranjittourtravels' },
    instagram: { type: String, default: 'https://instagram.com/ranjittourtravels' },
    youtube: { type: String, default: 'https://youtube.com/@ranjittourtravels' },
    twitter: { type: String, default: 'https://twitter.com/ranjittravels' },
    tripadvisor: { type: String, default: 'https://tripadvisor.com' }
  },
  heroTitle: { type: String, default: 'Your Journey. Our Route.' },
  heroSubtitle: { type: String, default: 'Experience luxury northern India road trips, customized mountain tours, and 24/7 premium outstation cab services.' },
  heroText: { type: String, default: 'Curating authentic journeys across Himachal, Punjab, Rajasthan, Kashmir and Ladakh with royal hospitality and certified chauffeurs.' },
  heroBadge: { type: String, default: '30.9010° N · 75.8573° E — Royal Route Experience' },
  ctaText: { type: String, default: 'Plan My Trip' },
  footerAbout: { type: String, default: 'Ranjit Tour & Travels is your premier north India travel concierge, operating customized tour packages, luxury sedans, Innova Crystas, and tempo travellers across Himachal, Punjab, Kashmir, Ladakh & Rajasthan.' },
  analyticsId: { type: String, default: 'G-RANJIT2026' },
  googleSearchConsole: { type: String, default: 'google-site-verification=rjt_google_verification_code' }
}, { timestamps: true });

export default mongoose.model('WebsiteSettings', websiteSettingsSchema);
