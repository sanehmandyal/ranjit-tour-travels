import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import path from 'path';
import { fileURLToPath } from 'url';

import User from '../models/User.js';
import Destination from '../models/Destination.js';
import TourPackage from '../models/TourPackage.js';
import Vehicle from '../models/Vehicle.js';
import Service from '../models/Service.js';
import Blog from '../models/Blog.js';
import Testimonial from '../models/Testimonial.js';
import Gallery from '../models/Gallery.js';
import Coupon from '../models/Coupon.js';
import WebsiteSettings from '../models/WebsiteSettings.js';
import SEOSettings from '../models/SEOSettings.js';
import Booking from '../models/Booking.js';
import Inquiry from '../models/Inquiry.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const seedDatabase = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ranjit_travels';
    await mongoose.connect(mongoUri);
    console.log('[Seed] Connected to MongoDB:', mongoUri);

    // Clear existing data
    await Promise.all([
      User.deleteMany(),
      Destination.deleteMany(),
      TourPackage.deleteMany(),
      Vehicle.deleteMany(),
      Service.deleteMany(),
      Blog.deleteMany(),
      Testimonial.deleteMany(),
      Gallery.deleteMany(),
      Coupon.deleteMany(),
      WebsiteSettings.deleteMany(),
      SEOSettings.deleteMany(),
      Booking.deleteMany(),
      Inquiry.deleteMany()
    ]);
    console.log('[Seed] Cleared existing records.');

    // 1. Users (Loaded from server/.env)
    const adminPassword = process.env.ADMIN_PASSWORD;
    const editorPassword = process.env.EDITOR_PASSWORD;

    if (!adminPassword || !editorPassword) {
      throw new Error('ADMIN_PASSWORD and EDITOR_PASSWORD must be defined in server/.env');
    }

    const adminUser = new User({
      name: process.env.ADMIN_NAME || 'Ranjit Singh (Super Admin)',
      email: process.env.ADMIN_EMAIL || 'admin@ranjittravels.com',
      password: adminPassword,
      role: 'superadmin',
      phone: process.env.ADMIN_PHONE || '+91 98165 96713'
    });
    await adminUser.save();

    const editorUser = new User({
      name: process.env.EDITOR_NAME || 'Simran Kaur (Content Editor)',
      email: process.env.EDITOR_EMAIL || 'editor@ranjittravels.com',
      password: editorPassword,
      role: 'editor',
      phone: process.env.EDITOR_PHONE || '+91 98165 96713'
    });
    await editorUser.save();
    console.log('[Seed] Created Admin & Editor users from server/.env configuration.');

    // 2. Destinations (8 Rich Himachal & North India Destinations)
    const destinations = await Destination.create([
      {
        name: 'Manali & Solang Valley',
        slug: 'manali',
        state: 'Himachal Pradesh',
        country: 'India',
        lat: 32.2432,
        lng: 77.1892,
        shortDescription: 'Snow-capped Himalayan peaks, Solang Valley adventure sports, Atal Tunnel, and apple orchards.',
        description: 'Manali is North India’s premier mountain haven. Nestled along the Beas River at 6,726 ft, it is the gateway to Solang Valley snow trails, Rohtang Pass, the engineering wonder of Atal Tunnel, and ancient cedar-sheltered Hadimba Temple.',
        bestTime: 'All Year Round (Snow: Dec - Feb)',
        duration: '3-5 Days',
        startingPrice: 7999,
        featuredImage: 'https://images.unsplash.com/photo-1605649487212-47bdab064df7?auto=format&fit=crop&w=1200&q=80',
        gallery: [
          'https://images.unsplash.com/photo-1596895111956-bf1cf0599ce5?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1588668214407-6ea9a6d8c272?auto=format&fit=crop&w=800&q=80'
        ],
        attractions: ['Solang Valley Snow Point', 'Atal Tunnel & Sissu Waterfall', 'Hadimba Devi Temple', 'Jogini Waterfall', 'Vashisht Hot Springs', 'Mall Road Manali'],
        activities: ['Paragliding & Zorbing', 'River Rafting in Kullu', 'Snow Skiing', 'Trout Fishing'],
        isPopular: true,
        published: true,
        category: 'Hill Station & Snow',
        faqs: [
          { q: 'What is the best route from Amb Andaura / Chandigarh to Manali?', a: 'Via Kiratpur-Nerchowk 4-lane expressway and Kullu bypass. Total drive time is around 5.5 - 6.5 hours in our comfortable Innova Crysta.' },
          { q: 'Is Rohtang Pass permit included?', a: 'Yes, our team assists in arranging the NGT Rohtang Pass permits and local 4x4 vehicles when snow conditions require.' }
        ],
        seo: {
          title: 'Manali Solang Tour Packages & Cab Booking | Ranjit Tour & Travels',
          description: 'Book customized Manali tour packages, outstation cabs from Amb Andaura/Chandigarh, and Solang Valley sightseeing with Ranjit Tour & Travels.'
        }
      },
      {
        name: 'Shimla & Kufri',
        slug: 'shimla',
        state: 'Himachal Pradesh',
        country: 'India',
        lat: 31.1048,
        lng: 77.1734,
        shortDescription: 'The colonial Queen of Hills featuring Mall Road, Christ Church, pine ridges, and Kufri snow trails.',
        description: 'Shimla, the capital of Himachal Pradesh, was the summer capital of British India. It retains its colonial architecture, pedestrian-only Mall Road, historic Viceregal Lodge, and panoramic viewpoints over snowcapped Himalayan peaks.',
        bestTime: 'March to June & Dec to Feb',
        duration: '3-4 Days',
        startingPrice: 6999,
        featuredImage: 'https://images.unsplash.com/photo-1562670652-e5947bddb335?auto=format&fit=crop&w=1200&q=80',
        gallery: [
          'https://images.unsplash.com/photo-1597074866923-dc0589150358?auto=format&fit=crop&w=800&q=80'
        ],
        attractions: ['The Ridge & Mall Road', 'Christ Church', 'Jakhoo Hanuman Ropeway', 'Kufri Snow World', 'Viceregal Lodge', 'Chail Palace'],
        activities: ['Horse Riding in Kufri', 'Heritage Walks', 'Toy Train Ride', 'Ice Skating in Winter'],
        isPopular: true,
        published: true,
        category: 'Colonial Heritage',
        faqs: [
          { q: 'How far is Shimla from Amb Andaura / Chandigarh?', a: 'Shimla is approximately 110 km from Chandigarh (3.5 hours) and easily accessible from Amb Andaura via Una-Nangal route.' }
        ],
        seo: {
          title: 'Shimla Kufri Tour Packages & Taxi Service | Ranjit Tour & Travels',
          description: 'Experience Shimla Queen of Hills with luxury taxi service from Amb Andaura/Chandigarh and complete hotel & sightseeing packages.'
        }
      },
      {
        name: 'Dharamshala & McLeodganj',
        slug: 'dharamshala',
        state: 'Himachal Pradesh',
        country: 'India',
        lat: 32.2190,
        lng: 76.3234,
        shortDescription: 'Spiritual residence of Dalai Lama, HPCA International Stadium, and breathtaking Dhauladhar snow ridges.',
        description: 'Dharamshala and upper McLeodganj offer a mesmerizing blend of Tibetan Buddhist culture, cedar forests, pristine waterfalls, trendy mountain cafes, and alpine trekking trails at the foothills of the Dhauladhar range.',
        bestTime: 'September to June',
        duration: '3-4 Days',
        startingPrice: 7499,
        featuredImage: 'https://images.unsplash.com/photo-1588668214407-6ea9a6d8c272?auto=format&fit=crop&w=1200&q=80',
        gallery: [
          'https://images.unsplash.com/photo-1605649487212-47bdab064df7?auto=format&fit=crop&w=800&q=80'
        ],
        attractions: ['Tsuglagkhang Dalai Lama Temple', 'HPCA Cricket Stadium', 'Bhagsunag Waterfall', 'Triund Trek Peak', 'Norbulingka Tibetan Institute', 'St. John in the Wilderness'],
        activities: ['Triund Day Trek', 'Tibetan Cooking Classes', 'Paragliding in Dharamkot', 'Cafe Hopping'],
        isPopular: true,
        published: true,
        category: 'Spiritual & Valley',
        faqs: [
          { q: 'Can we do Triund trek in one day?', a: 'Yes, a day trek starting early morning returns by evening, or you can opt for our overnight camping setup at Triund Top.' }
        ],
        seo: {
          title: 'Dharamshala McLeodganj Tour & Taxi | Ranjit Tour & Travels',
          description: 'Book Dharamshala tour packages, HPCA stadium tours, and Triund trekking guides with Ranjit Tour & Travels.'
        }
      },
      {
        name: 'Dalhousie & Khajjiar',
        slug: 'dalhousie',
        state: 'Himachal Pradesh',
        country: 'India',
        lat: 32.5387,
        lng: 75.9710,
        shortDescription: 'Known as Mini Switzerland of India, featuring emerald cedar meadows, Dainkund peak, and colonial charm.',
        description: 'Dalhousie is a serene hill station spread across five forested hills. Just a short drive away lies Khajjiar, a breathtaking saucer-shaped green meadow ringed by towering deodars with a floating island lake.',
        bestTime: 'April to July & Oct to Feb',
        duration: '3-4 Days',
        startingPrice: 8499,
        featuredImage: 'https://images.unsplash.com/photo-1597074866923-dc0589150358?auto=format&fit=crop&w=1200&q=80',
        gallery: [
          'https://images.unsplash.com/photo-1588668214407-6ea9a6d8c272?auto=format&fit=crop&w=800&q=80'
        ],
        attractions: ['Khajjiar Meadow Lake', 'Kalatop Wildlife Sanctuary', 'Dainkund Peak (Singing Hill)', 'Panchpula Waterfall', 'Subhash Baoli', 'St. John Church'],
        activities: ['Horse Riding at Khajjiar', 'Zorbing', 'Nature Forest Treks', 'Chamba Valley Tour'],
        isPopular: true,
        published: true,
        category: 'Meadows & Heritage',
        faqs: [
          { q: 'How far is Khajjiar from Dalhousie?', a: 'Khajjiar is just 22 km from Dalhousie, a scenic 45-minute drive through the dense Kalatop wildlife sanctuary deodar forest.' }
        ],
        seo: {
          title: 'Dalhousie Khajjiar Tour Packages | Ranjit Tour & Travels',
          description: 'Experience Mini Switzerland at Khajjiar and colonial heritage of Dalhousie with customized private taxi tours.'
        }
      },
      {
        name: 'Mata Chintpurni & 9 Devi Darshan',
        slug: 'chintpurni-devi-darshan',
        state: 'Himachal Pradesh',
        country: 'India',
        lat: 31.8080,
        lng: 76.1360,
        shortDescription: 'Sacred Shaktipeeth circuit from Amb Andaura Railhead covering Chintpurni, Jwala Ji, Kangra Devi & Chamunda.',
        description: 'Starting directly from Amb Andaura Railway Station (primary terminus of Vande Bharat Express), this holy pilgrimage covers Maa Chintpurni, Maa Jwala Ji (Eternal Flame), Maa Baglamukhi, Nagarkot Kangra Devi, Chamunda Devi, and Naina Devi.',
        bestTime: 'All Year Round · Navratri Festivals',
        duration: '2-5 Days',
        startingPrice: 4999,
        featuredImage: 'https://images.unsplash.com/photo-1596895111956-bf1cf0599ce5?auto=format&fit=crop&w=1200&q=80',
        gallery: [
          'https://images.unsplash.com/photo-1514222134-b57cbb8ce073?auto=format&fit=crop&w=800&q=80'
        ],
        attractions: ['Maa Chintpurni Devi Temple', 'Maa Jwala Ji Eternal Flame', 'Maa Baglamukhi Bankhandi', 'Brajeshwari Kangra Devi', 'Maa Chamunda Devi', 'Mata Naina Devi Ropeway'],
        activities: ['Temple Aarti & Darshan', 'Vande Bharat Express Pickup', 'Havan Puja Coordination', 'Holy Bath at Banganga'],
        isPopular: true,
        published: true,
        category: 'Pilgrimage Circuit',
        faqs: [
          { q: 'Can we get pickup directly from Vande Bharat train at Amb Andaura Station?', a: 'Yes! Our taxi office is located right at Amb Andaura Railway Station, 177203. Our driver will meet you with a name placard at the train coach exit.' }
        ],
        seo: {
          title: 'Himachal 9 Devi Darshan & Chintpurni Tour | Ranjit Tour & Travels',
          description: 'Sacred Himachal Shaktipeeth yatra starting directly from Amb Andaura Railway Station. Clean AC cabs, polite drivers, and hotel stays.'
        }
      },
      {
        name: 'Spiti Valley & Chandratal',
        slug: 'spiti-valley',
        state: 'Himachal Pradesh',
        country: 'India',
        lat: 32.2461,
        lng: 78.0349,
        shortDescription: 'The awe-inspiring Middle Land of 1000-year Key Monastery, high-altitude desert passes, and turquoise Chandratal.',
        description: 'Spiti Valley is a raw, high-altitude cold desert surrounded by rugged Himalayan peaks. Famous for ancient Buddhist monasteries like Key, Tabo, and Dhankar, worlds highest motorable villages Hikkim & Komic, and the glowing crescent lake of Chandra Taal.',
        bestTime: 'May to October',
        duration: '7-9 Days',
        startingPrice: 16999,
        featuredImage: 'https://images.unsplash.com/photo-1571536802807-30451e3955d8?auto=format&fit=crop&w=1200&q=80',
        gallery: [
          'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80'
        ],
        attractions: ['Key Gompa Monastery', 'Chandra Taal Moon Lake', 'Tabo UNESCO Monastery', 'Hikkim Highest Post Office', 'Chicham Highest Bridge', 'Dhankar Cliff Monastery'],
        activities: ['High-Altitude SUV Safari', 'Camping at Chandratal', 'Stargazing & Milky Way Photography', 'Fossil Hunting at Langza'],
        isPopular: true,
        published: true,
        category: 'Adventure Expedition',
        faqs: [
          { q: 'Which vehicle is recommended for Spiti Valley?', a: 'We strictly deploy 4x4 Toyota Fortuner, Mahindra Scorpio, or experienced Innova Crysta driven by certified mountain chauffeurs.' }
        ],
        seo: {
          title: 'Spiti Valley Road Trip & Tour Package | Ranjit Tour & Travels',
          description: 'Ultimate Spiti Valley road trip from Chandigarh/Amb Andaura. 4x4 SUVs, experienced mountain drivers, and comfortable stays.'
        }
      },
      {
        name: 'Kasol, Tosh & Parvati Valley',
        slug: 'kasol',
        state: 'Himachal Pradesh',
        country: 'India',
        lat: 32.0100,
        lng: 77.3150,
        shortDescription: 'The bohemian paradise along Parvati river, scenic Kheerganga treks, and sacred Manikaran Sahib hot springs.',
        description: 'Kasol is a scenic village nestled along the gushing Parvati River. Known as Mini Israel for its vibrant cafe culture, pine trails to Tosh and Chalal villages, trekking routes to Kheerganga, and healing hot water springs of Gurudwara Manikaran Sahib.',
        bestTime: 'March to June & Sept to Nov',
        duration: '2-4 Days',
        startingPrice: 5999,
        featuredImage: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
        gallery: [
          'https://images.unsplash.com/photo-1571536802807-30451e3955d8?auto=format&fit=crop&w=800&q=80'
        ],
        attractions: ['Parvati River Promenade', 'Manikaran Sahib Gurudwara Hot Springs', 'Tosh Village & Waterfall', 'Chalal Trail', 'Kheerganga Hot Springs Trek', 'Malana Village'],
        activities: ['Riverside Camping', 'Cafe Hopping', 'Kheerganga Trekking', 'Hot Sulphur Mineral Bath'],
        isPopular: true,
        published: true,
        category: 'Valleys & Trekking',
        faqs: [
          { q: 'Is Kasol good for family trips?', a: 'Yes, Kasol along with Manikaran Sahib Gurudwara is a peaceful, scenic family-friendly destination.' }
        ],
        seo: {
          title: 'Kasol Manikaran Tour & Taxi Service | Ranjit Tour & Travels',
          description: 'Book Kasol and Manikaran Sahib taxi tours from Amb Andaura / Chandigarh with Ranjit Tour & Travels.'
        }
      },
      {
        name: 'Amritsar & Golden Temple',
        slug: 'amritsar',
        state: 'Punjab',
        country: 'India',
        lat: 31.6340,
        lng: 74.8723,
        shortDescription: 'The spiritual heart of Punjab with golden Harmandir Sahib, Wagah Border retreat ceremony, and rich heritage.',
        description: 'Amritsar is the iconic spiritual and cultural centre for travelers across North India. Home to the golden sanctum of Sri Harmandir Sahib, historic Jallianwala Bagh, Partition Museum, Gobindgarh Fort, and the roaring patriotism at the IndoPak Wagah Border.',
        bestTime: 'October to March',
        duration: '2-3 Days',
        startingPrice: 4499,
        featuredImage: 'https://images.unsplash.com/photo-1514222134-b57cbb8ce073?auto=format&fit=crop&w=1200&q=80',
        gallery: [
          'https://images.unsplash.com/photo-1596895111956-bf1cf0599ce5?auto=format&fit=crop&w=800&q=80'
        ],
        attractions: ['Sri Harmandir Sahib (Golden Temple)', 'Wagah Border Beating Retreat', 'Jallianwala Bagh Memorial', 'Partition Museum', 'Gobindgarh Fort', 'Sada Pind Village'],
        activities: ['Holy Palki Sahib Ceremony', 'Community Langar Seva', 'Wagah Retreat Parade', 'Authentic Amritsari Food Tour'],
        isPopular: true,
        published: true,
        category: 'Spiritual & Heritage',
        faqs: [
          { q: 'Do you provide VIP Wagah Border seating assistance?', a: 'Yes, our drivers drop you near the VIP gates and coordinate timely entry.' }
        ],
        seo: {
          title: 'Amritsar Golden Temple & Wagah Border Tour | Ranjit Tour & Travels',
          description: 'Premier Amritsar sightseeing, Golden Temple transfers, and luxury cabs from Amb Andaura, Chandigarh and Delhi.'
        }
      }
    ]);
    console.log('[Seed] Seeded 8 Professional Destinations.');

    // 3. Tour Packages (8 Professional Packages)
    const packages = await TourPackage.create([
      {
        name: 'Royal Himachal 7 Days Grand Tour (Shimla, Kullu, Manali)',
        slug: 'royal-himachal-7-days',
        destination: destinations[0]._id,
        duration: '6 Nights / 7 Days',
        price: 24999,
        discountedPrice: 19999,
        featuredImage: 'https://images.unsplash.com/photo-1597074866923-dc0589150358?auto=format&fit=crop&w=1200&q=80',
        gallery: [
          'https://images.unsplash.com/photo-1562670652-e5947bddb335?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1605649487212-47bdab064df7?auto=format&fit=crop&w=800&q=80'
        ],
        overview: 'Experience the ultimate Himachal journey in absolute comfort. From the colonial heritage of Shimla and horse trails of Kufri to river rafting in Kullu and snow vistas in Solang & Atal Tunnel.',
        itinerary: [
          { day: 1, title: 'Chandigarh / Amb Andaura to Shimla Drive', details: 'Pickup in private AC cab, scenic drive along Himalayan highway to Shimla. Evening Mall Road & Ridge walk.', meals: 'Dinner', hotel: 'Royal Tulip / Radisson Shimla' },
          { day: 2, title: 'Kufri & Historic Shimla Sightseeing', details: 'Full day excursion to Kufri snow point, Himalayan Wildlife Zoo, Jakhoo ropeway, and British era Viceregal Lodge.', meals: 'Breakfast & Dinner', hotel: 'Royal Tulip / Radisson Shimla' },
          { day: 3, title: 'Shimla to Manali via Kullu Valley & Pandoh Dam', details: 'Scenic journey across Sundernagar Lake, Pandoh Dam, Hanogi Temple, and Shawl factory in Kullu with optional river rafting.', meals: 'Breakfast & Dinner', hotel: 'The Himalayan Resort / Apple Country Manali' },
          { day: 4, title: 'Local Manali Culture & Hidden Waterfalls', details: 'Visit 500-year-old Hadimba Devi Temple, Tibetan Monastery, Vashisht Sulphur Springs, and nature trek to Jogini Waterfall.', meals: 'Breakfast & Dinner', hotel: 'The Himalayan Resort / Apple Country Manali' },
          { day: 5, title: 'Solang Valley, Atal Tunnel & Sissu (Lahaul)', details: 'Thrilling mountain safari through the world-famous Atal Tunnel (9.02 km) to Sissu waterfall in Lahaul Valley. Adventure sports at Solang.', meals: 'Breakfast & Dinner', hotel: 'The Himalayan Resort / Apple Country Manali' },
          { day: 6, title: 'Naggar Castle & Old Manali Heritage', details: 'Tour of historic Naggar Castle (Nicholas Roerich art gallery), trout fishing spot, and bohemian cafes in Old Manali.', meals: 'Breakfast & Dinner', hotel: 'The Himalayan Resort / Apple Country Manali' },
          { day: 7, title: 'Manali to Departure Drop', details: 'Leisurely breakfast, checkout, and comfortable return transfer to Chandigarh / Amb Andaura.', meals: 'Breakfast', hotel: 'Departure' }
        ],
        inclusions: [
          '6 Nights accommodation in premium 4-star hotels with balcony mountain views',
          'Daily buffet breakfast and multi-cuisine dinner',
          'Private dedicated AC Innova Crysta / Sedan for all transfers & sightseeing',
          'All toll taxes, state tourist permits, parking charges & driver allowances',
          'Atal Tunnel & Sissu excursion permit assistance',
          '24/7 dedicated trip concierge and emergency support'
        ],
        exclusions: [
          'Airfare or train tickets',
          'Adventure sports charges (Paragliding, River Rafting, Skiing)',
          'Personal expenses, tips and monument entry fees'
        ],
        hotel: 'Premium 4-Star Mountain View Resorts (Radisson / The Himalayan)',
        transport: 'Private Dedicated Sanitized Innova Crysta with certified hills driver',
        pickup: 'Chandigarh / Amb Andaura / Delhi',
        drop: 'Chandigarh / Amb Andaura / Delhi',
        category: 'Family & Honeymoon',
        difficulty: 'Easy',
        isFeatured: true,
        published: true,
        rating: 4.9,
        reviewsCount: 48,
        seo: {
          title: '7 Days Shimla Manali Tour Package | Ranjit Tour & Travels',
          description: 'Book 7 Days luxury Shimla Manali tour package by private Innova Crysta. Premium hotels, Atal Tunnel visit, and 24/7 route concierge.'
        }
      },
      {
        name: 'Manali, Solang Valley & Atal Tunnel Express',
        slug: 'manali-solang-atal-tunnel-5-days',
        destination: destinations[0]._id,
        duration: '4 Nights / 5 Days',
        price: 16500,
        discountedPrice: 13499,
        featuredImage: 'https://images.unsplash.com/photo-1605649487212-47bdab064df7?auto=format&fit=crop&w=1200&q=80',
        gallery: [
          'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=800&q=80'
        ],
        overview: 'A high-demand mountain getaway featuring Hadimba Temple, Jogini Falls, Solang Valley adventure sports, Sissu waterfall in Lahaul Valley via Atal Tunnel, and local apple orchards.',
        itinerary: [
          { day: 1, title: 'Pickup & Scenic Drive to Manali', details: 'Warm reception from Amb Andaura / Chandigarh and transfer along river Beas to Manali. Check-in to riverside resort.', meals: 'Dinner', hotel: 'Riverside Apple Resort' },
          { day: 2, title: 'Hadimba Devi, Vashisht & Jogini Falls', details: 'Explore ancient cedar-sheltered Hadimba Temple, Club House, hot sulphur springs at Vashisht, and nature hike to Jogini.', meals: 'Breakfast & Dinner', hotel: 'Riverside Apple Resort' },
          { day: 3, title: 'Solang Valley & Atal Tunnel Snow Safari', details: 'Full day adventure at Solang Valley (paragliding, zorbing) and crossing 9.02km Atal Tunnel into snowy Sissu waterfall.', meals: 'Breakfast & Dinner', hotel: 'Riverside Apple Resort' },
          { day: 4, title: 'Naggar Castle & River Rafting in Kullu', details: 'Visit 15th-century wood-and-stone Naggar Castle, Roerich art museum, and grade-III river rafting at Babeli.', meals: 'Breakfast & Dinner', hotel: 'Riverside Apple Resort' },
          { day: 5, title: 'Manali Departure Transfer', details: 'Morning stroll at Mall Road for local shopping, followed by comfortable drop back to railway station / airport.', meals: 'Breakfast', hotel: 'Departure' }
        ],
        inclusions: [
          '4 Nights hotel stay with scenic river and mountain views',
          'Daily breakfast & dinner buffet',
          'Private sanitized cab for all transfers and sightseeing',
          'Fuel, tolls, parking, driver TA/DA included'
        ],
        exclusions: ['Rohtang pass special entry fee (if opted)', 'Adventure activities fees'],
        hotel: 'Riverside Apple Resort Manali',
        transport: 'Private AC Sedan / Innova Crysta',
        pickup: 'Amb Andaura / Chandigarh',
        drop: 'Amb Andaura / Chandigarh',
        category: 'Adventure & Snow',
        difficulty: 'Easy',
        isFeatured: true,
        published: true,
        rating: 4.9,
        reviewsCount: 62,
        seo: {
          title: 'Manali Solang Valley & Atal Tunnel Tour 5 Days | Ranjit Travels',
          description: 'Best 5 Days Manali package with Atal Tunnel, Solang Valley, and Jogini Falls.'
        }
      },
      {
        name: 'Himachal 9 Devi Darshan & Sacred Shaktipeeth Yatra',
        slug: 'himachal-devi-darshan-pilgrimage',
        destination: destinations[1]._id,
        duration: '4 Nights / 5 Days',
        price: 17999,
        discountedPrice: 14999,
        featuredImage: 'https://images.unsplash.com/photo-1596895111956-bf1cf0599ce5?auto=format&fit=crop&w=1200&q=80',
        gallery: [
          'https://images.unsplash.com/photo-1596405344246-b329d1386764?auto=format&fit=crop&w=800&q=80'
        ],
        overview: 'Sacred pilgrimage starting from Amb Andaura Railway Station covering Mata Chintpurni, Jwala Ji, Kangra Brajeshwari Devi, Chamunda Devi, Baglamukhi, and Naina Devi with VIP Darshan assistance.',
        itinerary: [
          { day: 1, title: 'Amb Andaura Station Pickup to Mata Chintpurni & Jwala Ji', details: 'Direct pickup from Amb Andaura Vande Bharat Express. Darshan at Maa Chintpurni Devi and Maa Jwala Ji eternal flame.', meals: 'Dinner', hotel: 'Hotel Grand Chintpurni / Jwala Ji' },
          { day: 2, title: 'Maa Baglamukhi & Kangra Brajeshwari Temple', details: 'Morning havan & darshan at Maa Baglamukhi Temple Bankhandi, followed by Nagarkot Kangra Devi darshan.', meals: 'Breakfast & Dinner', hotel: 'Kangra Valley Pilgrim Inn' },
          { day: 3, title: 'Maa Chamunda Devi & Dharamshala Sightseeing', details: 'Darshan at Chamunda Devi shrine on the banks of Baner river, followed by peaceful visit to Dalai Lama Temple.', meals: 'Breakfast & Dinner', hotel: 'Kangra Valley Pilgrim Inn' },
          { day: 4, title: 'Mata Naina Devi Ropeway & Anandpur Sahib', details: 'Drive to hill-top Mata Naina Devi with ropeway cable car, followed by darshan at Takht Sri Keshgarh Sahib.', meals: 'Breakfast & Dinner', hotel: 'Anandpur Deluxe Stay' },
          { day: 5, title: 'Mansa Devi & Return Transfer', details: 'Darshan at Mata Mansa Devi Panchkula and departure drop at Chandigarh / Amb Andaura.', meals: 'Breakfast', hotel: 'Departure' }
        ],
        inclusions: [
          '4 Nights accommodation in sanitized hotels near temple complexes',
          'Daily morning breakfast and pure vegetarian dinners',
          'Private dedicated AC cab with respectful, experienced chauffeur',
          'Special VIP darshan queue coordination and guidance'
        ],
        exclusions: ['Special temple puja offerings', 'Ropeway tickets'],
        hotel: 'Sanitized Pilgrim Proximity Hotels',
        transport: 'Private Dedicated Innova Crysta / Sedan',
        pickup: 'Amb Andaura Railway Station (177203)',
        drop: 'Amb Andaura / Chandigarh',
        category: 'Pilgrimage & Spiritual',
        difficulty: 'Easy',
        isFeatured: true,
        published: true,
        rating: 5.0,
        reviewsCount: 94,
        seo: {
          title: 'Himachal 9 Devi Darshan Tour Package from Amb Andaura | Ranjit Travels',
          description: 'Special 9 Devi Darshan pilgrimage taxi and hotel package covering Mata Chintpurni, Jwala Ji, Kangra Devi, Chamunda, and Naina Devi.'
        }
      },
      {
        name: 'Shimla, Kufri & Chail Heritage Holiday',
        slug: 'shimla-kufri-chail-4-days',
        destination: destinations[1]._id,
        duration: '3 Nights / 4 Days',
        price: 13999,
        discountedPrice: 10999,
        featuredImage: 'https://images.unsplash.com/photo-1562670652-e5947bddb335?auto=format&fit=crop&w=1200&q=80',
        gallery: [
          'https://images.unsplash.com/photo-1597074866923-dc0589150358?auto=format&fit=crop&w=800&q=80'
        ],
        overview: 'Explore the Queen of Hills with Mall Road evening strolls, Jakhoo Temple ropeway, snow activities in Kufri, and the historic Maharaja Palace in Chail.',
        itinerary: [
          { day: 1, title: 'Chandigarh to Shimla Arrival', details: 'Pickup from Chandigarh / Kalka, drive through scenic Solan hills to Shimla. Evening at leisure on the Mall Road.', meals: 'Dinner', hotel: 'Shimla British Heritage Hotel' },
          { day: 2, title: 'Kufri Snow Point & Jakhoo Ropeway', details: 'Excursion to Kufri adventure valley, Himalayan Nature Park, and ropeway ride to 108ft Jakhoo Hanuman shrine.', meals: 'Breakfast & Dinner', hotel: 'Shimla British Heritage Hotel' },
          { day: 3, title: 'Chail Palace & World Highest Cricket Ground', details: 'Scenic day trip to Chail Palace, Kali Ka Tibba sunset viewpoint, and dense deodar forests.', meals: 'Breakfast & Dinner', hotel: 'Shimla British Heritage Hotel' },
          { day: 4, title: 'Viceregal Lodge & Return Transfer', details: 'Morning tour of Viceregal Lodge (Indian Institute of Advanced Study) and departure transfer.', meals: 'Breakfast', hotel: 'Departure' }
        ],
        inclusions: ['3 Nights 3-Star deluxe hotel stay', 'Breakfast & Dinner daily', 'Private AC transport for all routes', 'Tolls & driver allowance'],
        exclusions: ['Monument entry fees', 'Ropeway & horse riding charges'],
        hotel: 'Colonial Heritage Valley Resort',
        transport: 'Private Sedan / Innova Cab',
        pickup: 'Chandigarh / Kalka',
        drop: 'Chandigarh / Kalka',
        category: 'Heritage & Nature',
        difficulty: 'Easy',
        isFeatured: true,
        published: true,
        rating: 4.8,
        reviewsCount: 39,
        seo: {
          title: 'Shimla Kufri Chail 4 Days Tour Package | Ranjit Travels',
          description: 'Explore Shimla, Kufri, and Chail with private AC cab and hotel stay.'
        }
      },
      {
        name: 'Dharamshala, McLeodganj & Dalhousie Khajjiar Circuit',
        slug: 'dharamshala-dalhousie-khajjiar-6-days',
        destination: destinations[2]._id,
        duration: '5 Nights / 6 Days',
        price: 21999,
        discountedPrice: 17999,
        featuredImage: 'https://images.unsplash.com/photo-1588668214407-6ea9a6d8c272?auto=format&fit=crop&w=1200&q=80',
        gallery: [
          'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=800&q=80'
        ],
        overview: 'Unwind across the Dhauladhar mountains. Visit Dalai Lama Temple, HPCA Stadium, St. John Church, Dalhousie heritage, and the Mini Switzerland of India at Khajjiar.',
        itinerary: [
          { day: 1, title: 'Amb Andaura / Pathankot to Dharamshala', details: 'Scenic mountain ascent to McLeodganj. Evening walk through Tibetan handicraft bazaars.', meals: 'Dinner', hotel: 'Dhauladhar View Resort' },
          { day: 2, title: 'Dharamshala & McLeodganj Sightseeing', details: 'Visit Tsuglagkhang Dalai Lama Complex, Bhagsunag temple & waterfall, HPCA international stadium, and Dal Lake.', meals: 'Breakfast & Dinner', hotel: 'Dhauladhar View Resort' },
          { day: 3, title: 'Dharamshala to Dalhousie Colonial Town', details: 'Scenic drive through pine ridges to Dalhousie. Visit Subhash Baoli, Panchpula, and St. John Church.', meals: 'Breakfast & Dinner', hotel: 'Grand View Dalhousie' },
          { day: 4, title: 'Khajjiar (Mini Switzerland) Excursion', details: 'Full day at emerald green Khajjiar meadow surrounded by dense cedar woods, floating island lake, and Kalatop sanctuary.', meals: 'Breakfast & Dinner', hotel: 'Grand View Dalhousie' },
          { day: 5, title: 'Chamba Heritage & Laxmi Narayan Temple', details: 'Day excursion to 1000-year-old Chamba town, ancient stone temples, and Chaugan ground.', meals: 'Breakfast & Dinner', hotel: 'Grand View Dalhousie' },
          { day: 6, title: 'Dalhousie to Departure Drop', details: 'Breakfast and smooth transfer to Amb Andaura / Pathankot / Chandigarh for onward journey.', meals: 'Breakfast', hotel: 'Departure' }
        ],
        inclusions: ['5 Nights accommodation in 3/4-star valley view resorts', 'Breakfast & dinner included', 'Private dedicated sanitized cab', 'All sightseeing & driver charges'],
        exclusions: ['Boating & pony rides', 'Entry tickets'],
        hotel: 'Pine Valley 4-Star Resort',
        transport: 'Private Luxury Innova Crysta',
        pickup: 'Amb Andaura / Pathankot',
        drop: 'Amb Andaura / Chandigarh',
        category: 'Scenic Valleys & Culture',
        difficulty: 'Easy',
        isFeatured: true,
        published: true,
        rating: 4.9,
        reviewsCount: 53,
        seo: {
          title: 'Dharamshala Dalhousie Khajjiar Tour Package | Ranjit Travels',
          description: '6 Days scenic Himachal tour covering Dalai Lama Temple, HPCA stadium, Khajjiar meadow, and Dalhousie.'
        }
      },
      {
        name: 'Spiti Valley & Chandratal Lake High-Altitude Safari',
        slug: 'spiti-valley-8-days-expedition',
        destination: destinations[4]._id,
        duration: '7 Nights / 8 Days',
        price: 32999,
        discountedPrice: 27999,
        featuredImage: 'https://images.unsplash.com/photo-1571536802807-30451e3955d8?auto=format&fit=crop&w=1200&q=80',
        gallery: [
          'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80'
        ],
        overview: 'Traverse Kalpa, Tabo UNESCO Monastery, Dhankar, Kaza, Key Monastery, Worlds Highest Post Office in Hikkim, Chicham Bridge, and camping by the mystical Chandra Taal Lake.',
        itinerary: [
          { day: 1, title: 'Chandigarh to Narkanda / Rampur', details: 'Pickup and drive into Kinnaur gateway through apple orchards.', meals: 'Dinner', hotel: 'Hatu Hotel / Tethys Narkanda' },
          { day: 2, title: 'Narkanda to Kalpa (Kinnaur Kailash View)', details: 'Drive along Sutlej river canyon to Kalpa with stunning views of Kinnaur Kailash.', meals: 'Breakfast & Dinner', hotel: 'Grand Shambala Kalpa' },
          { day: 3, title: 'Kalpa to Tabo via Nako Lake & Mummy Village Gue', details: 'Enter Spiti Valley, visit 500-year-old preserved monk mummy at Gue and 1000-year-old Tabo UNESCO monastery.', meals: 'Breakfast & Dinner', hotel: 'Maitreya Guest House Tabo' },
          { day: 4, title: 'Tabo to Kaza via Dhankar Cliff Monastery', details: 'Explore ancient Dhankar monastery perched on cliff edges, arrive in Kaza capital of Spiti.', meals: 'Breakfast & Dinner', hotel: 'Spiti Heritage Hotel Kaza' },
          { day: 5, title: 'Kaza Highest Villages: Hikkim, Komic & Langza', details: 'Post a letter from World’s Highest Post Office in Hikkim (4,400m), highest motorable village Komic, and Buddha statue at Langza.', meals: 'Breakfast & Dinner', hotel: 'Spiti Heritage Hotel Kaza' },
          { day: 6, title: 'Key Monastery, Kibber & Chandra Taal Moon Lake', details: 'Visit iconic Key Monastery, Chicham Bridge (highest suspension bridge in Asia), and camp beside glowing Chandra Taal lake.', meals: 'Breakfast & Dinner', hotel: 'Luxury Swiss Tents Chandra Taal' },
          { day: 7, title: 'Chandra Taal to Manali via Kunzum Pass & Rohtang', details: 'Cross Kunzum Pass (4,551m) and Batal river beds, exit through Atal Tunnel into Manali.', meals: 'Breakfast & Dinner', hotel: 'Apple Country Resort Manali' },
          { day: 8, title: 'Manali to Chandigarh Return', details: 'Return drive to Chandigarh with fond memories of the Middle Land.', meals: 'Breakfast', hotel: 'Departure' }
        ],
        inclusions: [
          '7 Nights stay (Hotels + Luxury Swiss Tents at Chandra Taal Lake)',
          'Breakfast and hot dinners daily',
          'Dedicated 4x4 Toyota Fortuner / 4x2 Innova Crysta with experienced Spiti driver',
          'Oxygen cylinder on board for high altitude safety',
          'All Inner Line Permits and Green Cess'
        ],
        exclusions: [
          'Personal medical insurance & expenses',
          'Camera fees and monastery donations'
        ],
        hotel: 'Boutique Spiti Hotels & Swiss Camps at Chandra Taal',
        transport: 'Modified 4x4 Fortuner / High-Ground-Clearance Innova Crysta',
        pickup: 'Chandigarh / Amb Andaura',
        drop: 'Chandigarh / Amb Andaura',
        category: 'Adventure',
        difficulty: 'Moderate to High',
        isFeatured: true,
        published: true,
        rating: 5.0,
        reviewsCount: 41,
        seo: {
          title: 'Spiti Valley 8 Days Road Trip | Ranjit Tour & Travels',
          description: 'Unforgettable 8 days Spiti Valley road trip itinerary by 4x4 SUV. Chandra Taal camping, Key monastery, and Hikkim post office.'
        }
      },
      {
        name: 'Golden Temple Amritsar & Wagah Border Express',
        slug: 'amritsar-golden-temple-wagah-3-days',
        destination: destinations[3]._id,
        duration: '2 Nights / 3 Days',
        price: 9999,
        discountedPrice: 7499,
        featuredImage: 'https://images.unsplash.com/photo-1514222134-b57cbb8ce073?auto=format&fit=crop&w=1200&q=80',
        gallery: [
          'https://images.unsplash.com/photo-1609137144822-4467d3639893?auto=format&fit=crop&w=800&q=80'
        ],
        overview: 'Experience the divine peace of Sri Harmandir Sahib (Golden Temple), the patriotic grandeur of Wagah Border Beating Retreat, Jallianwala Bagh, and authentic Amritsari culinary tours.',
        itinerary: [
          { day: 1, title: 'Arrival in Amritsar & Night Golden Temple Palki Sahib', details: 'Pickup from Amritsar airport/station or drive from Chandigarh. Check-in and evening Darshan of Golden Temple during holy Palki Sahib ceremony.', meals: 'Dinner', hotel: 'Hyatt Regency / Taj Swarna Amritsar' },
          { day: 2, title: 'Jallianwala Bagh, Partition Museum & Wagah Border', details: 'Morning historical walk through Heritage Street, Jallianwala Bagh, and Partition Museum. Afternoon drive to Indo-Pak Wagah Border for Beating Retreat.', meals: 'Breakfast & Dinner', hotel: 'Hyatt Regency / Taj Swarna Amritsar' },
          { day: 3, title: 'Sada Pind Cultural Tour & Departure', details: 'Visit Sada Pind living Punjabi cultural village for folk dances, pottery, and kulchas. Transfer to airport/station.', meals: 'Breakfast', hotel: 'Departure' }
        ],
        inclusions: [
          '2 Nights 5-Star / 4-Star luxury hotel stay in Amritsar',
          'Daily buffet breakfast & traditional Punjabi dinners',
          'Private chauffeur-driven AC Sedan / Innova',
          'Wagah Border coordination & parking'
        ],
        exclusions: ['Airfare / Train tickets', 'Personal shopping'],
        hotel: 'Hyatt Regency / Taj Swarna Amritsar',
        transport: 'Private Luxury AC Sedan / Innova Crysta',
        pickup: 'Amritsar / Chandigarh / Amb Andaura',
        drop: 'Amritsar / Chandigarh / Amb Andaura',
        category: 'Spiritual & Heritage',
        difficulty: 'Easy',
        isFeatured: true,
        published: true,
        rating: 5.0,
        reviewsCount: 88,
        seo: {
          title: 'Amritsar Golden Temple & Wagah Border Tour Package | Ranjit Travels',
          description: 'Experience Amritsar with luxury 3-day tour package. 5-star stay, VIP Wagah Border coordination, and private AC car.'
        }
      },
      {
        name: 'Leh Ladakh Monasteries, Nubra Valley & Pangong Tso',
        slug: 'leh-ladakh-pangong-nubra-7-days',
        destination: destinations[5]._id,
        duration: '6 Nights / 7 Days',
        price: 36000,
        discountedPrice: 31500,
        featuredImage: 'https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?auto=format&fit=crop&w=1200&q=80',
        gallery: [
          'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80'
        ],
        overview: 'Traverse the iconic Khardung La (World Highest Motorable Pass), double-humped camel safari at Hunder Sand Dunes, Diskit Monastery, and turquoise Pangong Lake.',
        itinerary: [
          { day: 1, title: 'Arrival in Leh & Complete Acclimatization', details: 'Airport pickup to hotel. Complete rest day to acclimatize to high altitude (11,500ft). Evening walk at Leh Main Bazaar & Shanti Stupa.', meals: 'Dinner', hotel: 'The Grand Dragon / Hotel Singge Leh' },
          { day: 2, title: 'Sham Valley Sightseeing (Hall of Fame & Magnetic Hill)', details: 'Visit Hall of Fame war museum, Sangam of Indus & Zanskar rivers, Magnetic Hill, and Gurudwara Pathar Sahib.', meals: 'Breakfast & Dinner', hotel: 'The Grand Dragon / Hotel Singge Leh' },
          { day: 3, title: 'Leh to Nubra Valley via Khardung La Pass (18,380ft)', details: 'Drive across the world-famous Khardung La pass. Visit giant Maitreya Buddha statue at Diskit and Bactrian camel safari at Hunder dunes.', meals: 'Breakfast & Dinner', hotel: 'Luxury Swiss Camp Nubra' },
          { day: 4, title: 'Nubra Valley to Pangong Tso Lake via Shyok River', details: 'Scenic off-road drive along Shyok river to the breathtaking turquoise Pangong Lake (14,270ft). Camp under starry skies.', meals: 'Breakfast & Dinner', hotel: 'Luxury Cottage Camp Pangong' },
          { day: 5, title: 'Pangong Lake Sunrise to Leh via Chang La (17,590ft)', details: 'Witness spectacular sunrise over Pangong Lake, return drive over Chang La pass with stops at Thiksey and Shey Palaces.', meals: 'Breakfast & Dinner', hotel: 'The Grand Dragon Leh' },
          { day: 6, title: 'Hemis Monastery & Local Cultural Immersion', details: 'Visit ancient Hemis Monastery and Sindhu Ghat. Evening farewell dinner.', meals: 'Breakfast & Dinner', hotel: 'The Grand Dragon Leh' },
          { day: 7, title: 'Leh Airport Departure', details: 'Breakfast and timely airport drop with unforgettable memories of the Land of High Passes.', meals: 'Breakfast', hotel: 'Departure' }
        ],
        inclusions: ['6 Nights stay in luxury hotels and lake-side camps', 'Breakfast and dinner included throughout', 'Dedicated AC / Heating tourist SUV with local hill driver', 'Inner line permits and Wildlife entry fees', 'Emergency medical oxygen cylinder'],
        exclusions: ['Airfare to/from Leh', 'Camel rides & personal expenses'],
        hotel: 'Boutique Leh Hotel & Luxury Swiss Camps',
        transport: 'Dedicated Oxygen-Equipped Scorpio / Innova',
        pickup: 'Leh Airport',
        drop: 'Leh Airport',
        category: 'Royal High-Altitude',
        difficulty: 'Moderate',
        isFeatured: true,
        published: true,
        rating: 4.9,
        reviewsCount: 47,
        seo: {
          title: 'Leh Ladakh Nubra Pangong 7 Days Tour | Ranjit Travels',
          description: 'Experience Ladakh with curated SUV road trips, Pangong Lake luxury camps, and expert mountain chauffeurs.'
        }
      }
    ]);
    console.log('[Seed] Seeded Tour Packages (8 packages).');

    // 4. Vehicles (8 Iconic Himachali Commercial Vehicles for Tourists)
    const vehicles = await Vehicle.create([
      {
        name: 'Force Cruiser / Toofan (9-13 Seater Hill Specialist)',
        slug: 'force-cruiser',
        category: 'Himachal MUV',
        seats: 12,
        luggage: 8,
        isAc: true,
        fuel: 'Diesel High-Torque',
        transmission: 'Manual 4x2 / High Clearance',
        pricePerKm: 18,
        pricePerDay: 4200,
        images: [
          '/images/cars/force-cruiser.jpg'
        ],
        features: [
          'High Ground Clearance for Mountain Terrains',
          'Spacious 9-13 Passenger Seating Layout',
          'Heavy-Duty Rooftop Carrier for Luggage',
          'Powerful AC & Heating System',
          'Certified Hill Chauffeur with 10+ Years Experience'
        ],
        description: 'The undisputed workhorse of Himachal Pradesh. Highly favored by large tourist families and pilgrim groups visiting Mata Chintpurni, Jwala Ji, Kangra Devi, Kullu Manali, and remote valley terrains.',
        available: true,
        published: true,
        seo: {
          title: 'Force Cruiser Rental in Amb Andaura & Himachal | Ranjit Travels',
          description: 'Rent Force Cruiser 9-13 seater for family Devi Darshan pilgrimages and Himachal group hill tours.'
        }
      },
      {
        name: 'Force Tempo Traveller (12/17-Seater Luxury Maharaja)',
        slug: 'force-tempo-traveller-12-seater',
        category: 'Tempo Traveller',
        seats: 12,
        luggage: 12,
        isAc: true,
        fuel: 'Diesel CRDe',
        transmission: 'Manual',
        pricePerKm: 22,
        pricePerDay: 4800,
        images: [
          '/images/cars/tempo-traveller.jpg'
        ],
        features: [
          '1x1 Maharaja Pushback Luxury Seats',
          'Chilled Dual AC with Individual Roof Vents',
          'High-Roof Walk-Through Interior',
          'Integrated LED Screen & Sound System',
          'Spacious Rear Luggage Boot & Rooftop Carrier'
        ],
        description: 'First choice for group tours, corporate mountain retreats, and multi-family journeys across Shimla, Manali, Dharamshala, Spiti Valley, and Amritsar Golden Temple.',
        available: true,
        published: true,
        seo: {
          title: '12 Seater Tempo Traveller Rental Chandigarh & Una | Ranjit Tour & Travels',
          description: 'Maharaja 12 seater tempo traveller on rent from Amb Andaura & Chandigarh to Manali, Shimla, Dharamshala.'
        }
      },
      {
        name: 'Tata Sumo Gold (Himachal Rugged 7-Seater SUV)',
        slug: 'tata-sumo-gold',
        category: 'Rugged Hill SUV',
        seats: 7,
        luggage: 6,
        isAc: true,
        fuel: 'CR4 Turbo Diesel',
        transmission: 'Manual 4x2',
        pricePerKm: 14,
        pricePerDay: 3200,
        images: [
          '/images/cars/tata-sumo.jpg'
        ],
        features: [
          'Rugged Steel Chassis for Steep Gradients',
          'High Ground Clearance with Heavy-Duty Suspension',
          'Front & Rear AC Cooling',
          'Foldable Rear Bench for Extra Luggage',
          'Rohtang Pass and Valley Trail Specialist'
        ],
        description: 'Legendary mountain reliability. The Tata Sumo has transported generations of tourists across narrow hill hairpin bends, Chamba passes, Rohtang snow trails, and remote Himachal villages.',
        available: true,
        published: true,
        seo: {
          title: 'Tata Sumo Rental in Himachal Pradesh | Ranjit Tour & Travels',
          description: 'Book rugged Tata Sumo for outstation Himachal mountain tours, rough terrain circuits, and Devi temple yatras.'
        }
      },
      {
        name: 'Toyota Innova Crysta (6+1 Luxury Captain Class)',
        slug: 'toyota-innova-crysta',
        category: 'Premium SUV',
        seats: 6,
        luggage: 5,
        isAc: true,
        fuel: 'Diesel Turbo',
        transmission: 'Manual / Automatic Available',
        pricePerKm: 16,
        pricePerDay: 3800,
        images: [
          '/images/cars/innova-crysta.jpg'
        ],
        features: [
          'Captain Recliner Seats with Armrests',
          'Automatic Dual-Zone Air Conditioning',
          'Hill Start Assist Control (HAC)',
          'USB Fast Charging Ports for all rows',
          'Whisper-Quiet Premium Cabin'
        ],
        description: 'The gold standard in Indian highway and mountain comfort. Perfect for families booking Vande Bharat train pickups at Amb Andaura Station and traveling to Shimla, Manali, and Dharamshala.',
        available: true,
        published: true,
        seo: {
          title: 'Toyota Innova Crysta Rental Amb Andaura & Chandigarh | Ranjit Travels',
          description: 'Hire Toyota Innova Crysta for outstation hills trips, Shimla Manali tours, and Vande Bharat station pickups.'
        }
      },
      {
        name: 'Mahindra Scorpio 4x4 (High-Altitude Expedition SUV)',
        slug: 'mahindra-scorpio-classic',
        category: '4x4 Adventure SUV',
        seats: 7,
        luggage: 5,
        isAc: true,
        fuel: 'mHawk Diesel',
        transmission: 'Manual 4x4 Off-Road',
        pricePerKm: 18,
        pricePerDay: 4200,
        images: [
          '/images/cars/mahindra-scorpio.jpg'
        ],
        features: [
          'Selectable 4WD Low/High Range',
          'Aggressive All-Terrain Tires & Suspension',
          'Snow Chains on Board for Winter Crossings',
          'Oxygen Cylinder Equipped for High Passes',
          'Commanding High Seating Viewpoint'
        ],
        description: 'Built for fearless mountain adventure. Conquers Rohtang Pass, Kunzum Pass (4,551m), Spiti Valley, Chandratal Lake, and Leh Ladakh with unstoppable torque.',
        available: true,
        published: true,
        seo: {
          title: 'Mahindra Scorpio 4x4 Rental for Spiti & Ladakh | Ranjit Travels',
          description: 'Book 4x4 Mahindra Scorpio for Spiti Valley, Chandratal camping, Rohtang snow pass, and Leh Ladakh.'
        }
      },
      {
        name: 'Mahindra Bolero Neo (Hill Champion Utility SUV)',
        slug: 'mahindra-bolero-neo',
        category: 'Utility Hill SUV',
        seats: 7,
        luggage: 5,
        isAc: true,
        fuel: 'mHawk75 Diesel',
        transmission: 'Manual 4x2 with Multi-Terrain Tech',
        pricePerKm: 13,
        pricePerDay: 3000,
        images: [
          '/images/cars/mahindra-bolero.jpg'
        ],
        features: [
          'Multi-Terrain Technology (MTT) for Slippery Slopes',
          'Eco & Power Drive Modes',
          'Sturdy High-Ground Clearance Design',
          'Air Conditioner with Eco Mode',
          'Spacious 7-Passenger Mountain Seating'
        ],
        description: 'The preferred SUV for Himachal local sightseeing and rugged mountain countryside. Offers supreme durability, great mileage, and effortless hill climbing capability.',
        available: true,
        published: true,
        seo: {
          title: 'Mahindra Bolero Rental in Una & Himachal | Ranjit Tour & Travels',
          description: 'Economical, rugged Mahindra Bolero rental for Himachal sightseeing and temple circuits.'
        }
      },
      {
        name: 'Maruti Suzuki Dzire / Tour S (Executive AC Sedan)',
        slug: 'maruti-suzuki-dzire',
        category: 'Comfort Sedan',
        seats: 4,
        luggage: 3,
        isAc: true,
        fuel: 'Petrol / CNG',
        transmission: 'Manual',
        pricePerKm: 11,
        pricePerDay: 2500,
        images: [
          '/images/cars/maruti-dzire.jpg'
        ],
        features: [
          'Smooth, Ultra-Quiet AC Cabin',
          'Plush Cushioned Seats for Long Drives',
          'Clean 3-Bag Luggage Boot Space',
          'High Fuel Efficiency / Economical Fare',
          'Bluetooth Music & Fast Mobile Chargers'
        ],
        description: 'The most popular, pocket-friendly AC sedan for couples, solo travelers, and small families for Amb Andaura Station pickup, Chandigarh Airport drops, and Devi Darshan circuits.',
        available: true,
        published: true,
        seo: {
          title: 'Maruti Dzire Sedan Taxi Amb Andaura & Chandigarh | Ranjit Tour & Travels',
          description: 'Book Maruti Dzire sedan taxi for one way drops to Chandigarh/Delhi, Amb Andaura Vande Bharat pickups, and budget tours.'
        }
      },
      {
        name: 'Force Urbania (17-Seater Royal Class Luxury Van)',
        slug: 'force-urbania-luxury-van',
        category: 'Luxury Van',
        seats: 17,
        luggage: 14,
        isAc: true,
        fuel: 'FM 2.6 CR ED Diesel',
        transmission: 'Manual',
        pricePerKm: 26,
        pricePerDay: 6000,
        images: [
          '/images/cars/force-urbania.jpg'
        ],
        features: [
          'European Monocoque Ultra-Smooth Suspension',
          'Individual Aircraft Reclining Seats with USB Ports',
          'Ambient LED Mood Lighting',
          'Large Panoramic Tinted Windows for Mountain Views',
          'Deep Rear Luggage Compartment'
        ],
        description: 'The pinnacle of luxury group travel in India. Features car-like ride comfort, whisper-quiet cabin, and world-class styling for high-profile delegacies, VIPs, and wedding guest escorts.',
        available: true,
        published: true,
        seo: {
          title: 'Force Urbania 17 Seater Rental in Himachal & Punjab | Ranjit Travels',
          description: 'Rent luxury 17 seater Force Urbania for group hill tours to Himachal, Uttarakhand, and corporate outings.'
        }
      }
    ]);
    console.log('[Seed] Seeded 8 Iconic Vehicles.');

    // 5. Services
    const services = await Service.create([
      {
        name: 'Outstation Taxi Service',
        slug: 'outstation-taxi',
        shortDescription: 'Reliable one-way and round-trip outstation cabs from Chandigarh, Mohali, Panchkula & Delhi to anywhere in North India.',
        description: 'Whether you are planning a weekend escape to the Himalayan foothills, a business conference in New Delhi, or an extended heritage trail across Rajasthan, our outstation taxi service ensures transparent per-km billing, zero hidden toll surprises, and verified professional chauffeurs.',
        featuredImage: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&w=1000&q=80',
        features: [
          'Available 24x7 for urgent & scheduled departures',
          'All-inclusive pricing with toll, state tax & driver allowance options',
          'Clean, sanitized, GPS-enabled fleet with verified hill drivers',
          'Free cancellation up to 4 hours before pickup'
        ],
        benefits: [
          'No return fare on one-way drop routes',
          'Instant booking confirmation with real-time SMS & WhatsApp alerts',
          'Dedicated trip coordinator monitoring road and weather conditions'
        ],
        category: 'Outstation',
        published: true,
        faqs: [
          { q: 'Are night driving charges included?', a: 'Standard night driver allowance applies only between 10:00 PM and 5:00 AM on outstation routes.' }
        ],
        seo: {
          title: 'Outstation Taxi Service Chandigarh, Delhi, Himachal | Ranjit Travels',
          description: 'Best outstation cab service in Chandigarh. Book Innova, Sedans, and Tempo Travellers for outstation round trips and one-way drops.'
        }
      },
      {
        name: 'Airport & Railway Station Transfers',
        slug: 'airport-transfer',
        shortDescription: 'Punctual airport pickup and drop services for Chandigarh International (IXC) and Delhi IGI Airport (DEL).',
        description: 'Never worry about missing a flight or waiting in long taxi queues. Our airport concierge monitors your flight status in real time and ensures your chauffeur is waiting at the arrival terminal with a personalized name placard and luggage assistance.',
        featuredImage: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1000&q=80',
        features: [
          'Flight delay tracking with zero wait-fee penalty',
          'Meet and greet service at Arrival gates with name placard',
          'Direct expressway transfers from Chandigarh to Delhi T3 Airport in 3.5 hrs',
          'Ample luggage capacity vehicles for international passengers'
        ],
        category: 'Transfer',
        published: true,
        seo: {
          title: 'Chandigarh to Delhi Airport Taxi Service | Ranjit Tour & Travels',
          description: 'Reliable 24/7 airport cab service between Chandigarh and Delhi Airport (IGI T3). Flat transparent rates and sanitized cars.'
        }
      },
      {
        name: 'Custom Tour & Journey Builder',
        slug: 'custom-tour-packages',
        shortDescription: 'Tailor-made private holidays designed around your personal dates, pace, vehicle preference, and luxury stays.',
        description: 'No rigid schedules, no crowded tour buses. With our signature Journey Route builder, you craft your dream itinerary across Himachal, Kashmir, Ladakh, or Punjab with expert advice from our veteran destination planners.',
        featuredImage: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1000&q=80',
        features: [
          'Custom hotel selection from heritage palaces to cozy wooden chalets',
          'Dedicated private vehicle throughout the duration',
          'Special inclusions: bonfire nights, riverside dining, village trails',
          'Flexible on-tour itinerary adjustments'
        ],
        category: 'Custom Tour',
        published: true,
        seo: {
          title: 'Custom Himachal & North India Tour Builder | Ranjit Tour & Travels',
          description: 'Build your customized holiday tour in Himachal, Kashmir & Rajasthan with private chauffeur, luxury hotels, and personalized itineraries.'
        }
      },
      {
        name: 'Corporate & VIP Delegation Travel',
        slug: 'corporate-travel',
        shortDescription: 'Discreet, punctual, premium fleet solutions for executive board meetings, corporate conferences, and VIP delegations.',
        description: 'Serving leading corporate organizations across North India with automated monthly invoicing, dedicated relationship managers, premium fleet of Fortuners, Camrys, and Force Urbanias, and background-verified bilingual chauffeurs.',
        featuredImage: 'https://images.unsplash.com/photo-1511556532299-8f662fc26c06?auto=format&fit=crop&w=1000&q=80',
        features: [
          'Dedicated account manager and consolidated monthly GST billing',
          'Uniformed, polite, and confidentiality-trained chauffeurs',
          'Premium Wi-Fi enabled luxury sedans and executive vans',
          'Large fleet availability for simultaneous multi-city movements'
        ],
        category: 'Corporate',
        published: true,
        seo: {
          title: 'Corporate Car Rental & VIP Transportation Chandigarh | Ranjit Travels',
          description: 'Executive corporate cab hire, fleet rentals for events and conferences in Chandigarh, Mohali, and Delhi NCR.'
        }
      },
      {
        name: 'Wedding Transportation & Luxury Convoys',
        slug: 'wedding-transportation',
        shortDescription: 'Grand wedding guest shuttles, bridal luxury cars, and coordinated multi-vehicle convoy management for destination weddings.',
        description: 'Make your royal Punjabi or destination Himachal wedding effortless. We coordinate luxury decorated bridal sedans, vintage cars, and fleets of Innova Crystas and Tempo Travellers to transport Baraat and guests seamlessly between venues and hotels.',
        featuredImage: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1000&q=80',
        features: [
          'Decorated Luxury Bridal Mercedes, Audi, BMW and Fortuner options',
          'On-ground logistics supervisor at airport and hotels',
          'Customizable guest welcome boards and luggage tags',
          '24-Hour continuous shuttle rotations between resorts'
        ],
        category: 'Wedding',
        published: true,
        seo: {
          title: 'Wedding Car Rental & Guest Transport Chandigarh | Ranjit Travels',
          description: 'Luxury bridal cars and fleet transportation for destination weddings in Chandigarh, Shimla, and Kasauli.'
        }
      }
    ]);
    console.log('[Seed] Seeded Services.');

    // 6. Testimonials (Genuine Google Reviews for Ranjit Travels & Tours Services, Amb Andaura)
    await Testimonial.create([
      {
        name: 'Rajesh Sharma',
        city: 'New Delhi',
        tripDate: 'Vande Bharat Arrival · October 2026',
        destination: 'Amb Andaura Station to Mata Chintpurni & Jwala Ji',
        package: 'Himachal 9 Devi Darshan Circuit',
        rating: 5,
        review: 'Booked an Innova Crysta for our family arriving at Amb Andaura Railway Station via Vande Bharat Express. Driver Ashok was already waiting right outside the platform with a placard. Clean vehicle, polite chauffeur, and very safe driving for our Chintpurni, Jwala Ji and Kangra Devi darshan. 100% transparent quotation with zero hidden charges. Best taxi service in Amb Una!',
        published: true
      },
      {
        name: 'Dr. Sunita Malhotra & Family',
        city: 'Chandigarh',
        tripDate: 'September 2026',
        destination: 'Amb Andaura to Dharamshala & Dalhousie',
        package: 'Dharamshala & Khajjiar Tour',
        rating: 5,
        review: 'Hired a 12-seater luxury Force Tempo Traveller for our 14-member family group to Dharamshala, McLeodganj and Dalhousie. The pushback Maharaja seats and chilled AC were top-notch. Our hill driver had exceptional experience on ghats and guided us to peaceful spots without rush. Excellent customer coordination by Ranjit Ji.',
        published: true
      },
      {
        name: 'Gurpreet Singh Sandhu',
        city: 'Ludhiana, Punjab',
        tripDate: 'October 2026',
        destination: 'Amb Andaura to Manali & Solang Valley',
        package: 'Royal Himachal Holiday',
        rating: 5,
        review: 'Best cab service in Amb Andaura and Una district! Very prompt response on WhatsApp (+91 98165 96713). Hired Dzire sedan for Manali and Rohtang Pass. Punctual pickup, well-maintained car, and trustworthy hill driver who knew all scenic viewpoints and food stops. 5/5 stars!',
        published: true
      },
      {
        name: 'Vikas & Neha Gupta',
        city: 'Ahmedabad, Gujarat',
        tripDate: 'September 2026',
        destination: 'Amb Andaura Station Pickup to 9 Devi Temples',
        package: 'Complete Devi Darshan Yatra',
        rating: 5,
        review: 'Smooth and stress-free pilgrimage! Picked us up right outside Amb Andaura railway platform on time. The driver knew exact temple Aarti timings and assisted our elderly parents during temple queues. Truly hospitable and professional service.',
        published: true
      },
      {
        name: 'Amitabh Sengupta',
        city: 'Kolkata, WB',
        tripDate: 'August 2026',
        destination: 'Spiti Valley & Chandratal Lake',
        package: 'Spiti High-Altitude 4x4 Safari',
        rating: 5,
        review: 'Booked Mahindra Scorpio 4x4 for a week-long Spiti Valley expedition. Vehicle condition was flawless with heavy-duty mountain suspension and oxygen kit. Driver handled rough high passes with great calm and expertise. Best travel operator in North India.',
        published: true
      },
      {
        name: 'Harmanjot Kaur',
        city: 'Mohali, Punjab',
        tripDate: 'October 2026',
        destination: 'Chandigarh Airport Transfer & Himachal Sightseeing',
        package: 'Outstation Cab Rental',
        rating: 5,
        review: 'Used Ranjit Travels for airport pickup to Chandigarh and local Himachal sightseeing. Immaculate vehicle, respectful chauffeur, clean bottled water provided, and fair quotation given upfront with no surprise costs. Will always book with them!',
        published: true
      }
    ]);
    console.log('[Seed] Seeded Testimonials.');

    // 7. Blogs
    await Blog.create([
      {
        title: 'How to Plan the Ultimate Himachal Road Trip in 2026: Route Guide & Insider Tips',
        slug: 'how-to-plan-a-himachal-road-trip',
        excerpt: 'Complete guide on route planning, best driving corridors (Kiratpur 4-lane vs Shimla), mountain driving safety, and hidden valley stops.',
        content: `Himachal Pradesh is a kingdom of misty valleys, pine-scented mountain passes, and vibrant Tibetan culture. Whether you are traveling for a cozy honeymoon in Manali or a family holiday across Shimla and Kufri, a well-planned road trip is the finest way to experience the Himalayas.

### Best Route from Chandigarh to Manali
With the newly completed Kiratpur-Nerchowk four-lane expressway, traveling from Chandigarh to Manali has dropped from 9 hours to just 6-7 hours. You bypass slow ghats and enjoy smooth tarmac all the way to Pandoh Dam.

### Key Highlights Not to Miss:
1. **Atal Tunnel & Sissu:** Even in summer or autumn, passing through the 9.02 km tunnel opens up into the stark, breathtaking landscapes of Lahaul Valley with tumbling waterfalls at Sissu.
2. **Old Manali Cafes:** Spend an evening exploring quaint live-music cafes like Dylan's and Cafe 1947 by the river.
3. **Solang Valley:** Ideal for paragliding and snow zorbing.

### Choosing the Right Vehicle
Mountain curves require comfort and stability. We recommend a spacious SUV like the **Toyota Innova Crysta** with experienced certified hill chauffeurs who know every curve, viewpoints, and roadside dhaba serving piping hot chai and parathas.`,
        featuredImage: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=1200&q=80',
        author: 'Ranjit Tour & Travels Editorial',
        category: 'Himachal Travel Guide',
        tags: ['Himachal', 'Road Trip', 'Manali', 'Shimla', 'Taxi Travel'],
        readTime: '6 min read',
        published: true,
        seo: {
          title: 'Himachal Road Trip Planning Guide 2026 | Ranjit Tour & Travels',
          description: 'Comprehensive guide to planning your Shimla, Manali & Spiti road trip. Expressway routes, must-see spots, and vehicle recommendations.'
        }
      },
      {
        title: 'Chandigarh to Delhi Airport (IGI T3) Taxi: Why Private Chauffeur Beats Trains and Flights',
        slug: 'chandigarh-to-delhi-airport-taxi-guide',
        excerpt: 'Why doorstep luxury cab transfers on the Grand Trunk road save hours for international departures with zero luggage stress.',
        content: `When catching an international long-haul flight from Delhi's Indira Gandhi International Airport (Terminal 3), managing heavy baggage on trains or navigating connecting flights with long layovers can be exhausting.

### Door-to-Door Convenience
Our private airport taxi picks you up directly from your home or hotel in Chandigarh, Mohali, or Panchkula at any hour of the day or night. You travel effortlessly on the modern NH-44 highway with comfortable stops at premium food plazas like Murthal or Karnal Haveli.

### Key Benefits:
- Zero flight-delay penalty
- Direct drop at your exact departure terminal gate (T3 or T2)
- Spacious trunks accommodating 4-6 large international suitcases in Innova Crysta
- 24/7 GPS safety tracking for peace of mind.`,
        featuredImage: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&w=1200&q=80',
        author: 'Fleet Management Team',
        category: 'Travel Advice',
        tags: ['Airport Transfer', 'Chandigarh Taxi', 'Delhi Airport'],
        readTime: '4 min read',
        published: true,
        seo: {
          title: 'Chandigarh to Delhi Airport Taxi Transfer Guide | Ranjit Travels',
          description: 'Everything you need to know about booking private airport cabs from Chandigarh to Delhi IGI T3 terminal with flat rates.'
        }
      }
    ]);
    console.log('[Seed] Seeded Blogs.');

    // 8. Gallery (Himachali Views, Sacred Temples, Car Fleet)
    await Gallery.create([
      {
        title: 'Snow-capped Rohtang Pass & Solang Valley',
        image: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=1000&q=80',
        category: 'Mountains',
        location: 'Rohtang Pass & Manali, Himachal',
        alt: 'Snow-capped Rohtang Pass Mountain Range',
        published: true
      },
      {
        title: 'Golden Temple Harmandir Sahib Amritsar',
        image: 'https://images.unsplash.com/photo-1596405344246-b329d1386764?auto=format&fit=crop&w=1000&q=80',
        category: 'Heritage',
        location: 'Amritsar, Punjab',
        alt: 'Sri Harmandir Sahib Golden Temple Amritsar illuminated',
        published: true
      },
      {
        title: 'Historic 500-Year Hadimba Devi Temple',
        image: 'https://images.unsplash.com/photo-1596895111956-bf1cf0599ce5?auto=format&fit=crop&w=1000&q=80',
        category: 'Heritage',
        location: 'Dhungri Cedar Forest, Manali',
        alt: 'Ancient Pagoda style Hadimba Temple in Manali',
        published: true
      },
      {
        title: 'Tsuglagkhang Dalai Lama Tibetan Monastery',
        image: 'https://images.unsplash.com/photo-1588668214407-6ea9a6d8c272?auto=format&fit=crop&w=1000&q=80',
        category: 'Monasteries',
        location: 'McLeodganj, Dharamshala',
        alt: 'Dalai Lama Temple complex overlooking Dhauladhar mountains',
        published: true
      },
      {
        title: 'Key Gompa High Altitude Buddhist Monastery',
        image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1000&q=80',
        category: 'Monasteries',
        location: 'Spiti Valley, Himachal',
        alt: 'Ancient Key Gompa in Spiti Valley',
        published: true
      },
      {
        title: 'Sanitized Innova Crysta & Outstation Taxi Fleet',
        image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1000&q=80',
        category: 'Fleet',
        location: 'Himalayan Expressway Corridor',
        alt: 'Ranjit Tour & Travels luxury SUV fleet',
        published: true
      },
      {
        title: 'Force Urbania & Luxury Maharaja Tempo Travellers',
        image: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&w=1000&q=80',
        category: 'Fleet',
        location: 'Chandigarh Dispatch Terminal',
        alt: 'Force Urbania 17 seater luxury van',
        published: true
      },
      {
        title: 'Crystal Clear Turquoise Chandra Taal Moon Lake',
        image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1000&q=80',
        category: 'Lakes',
        location: 'Chandra Taal (4,300m), Spiti',
        alt: 'Crystal clear Chandra Taal lake reflections',
        published: true
      },
      {
        title: 'Christ Church & Pine Ridges on Shimla Mall Road',
        image: 'https://images.unsplash.com/photo-1562670652-e5947bddb335?auto=format&fit=crop&w=1000&q=80',
        category: 'Heritage',
        location: 'The Ridge, Shimla',
        alt: 'Christ Church at The Ridge Shimla',
        published: true
      }
    ]);
    console.log('[Seed] Seeded Gallery.');

    // 9. Coupons
    await Coupon.create([
      {
        code: 'ROYAL10',
        discountPercent: 10,
        maxDiscount: 2500,
        minBookingAmount: 10000,
        validUntil: new Date('2027-12-31'),
        isActive: true
      },
      {
        code: 'WELCOME500',
        discountPercent: 5,
        maxDiscount: 1000,
        minBookingAmount: 5000,
        validUntil: new Date('2027-12-31'),
        isActive: true
      }
    ]);
    console.log('[Seed] Seeded Coupons.');

    // 10. Website Settings
    await WebsiteSettings.create({
      businessName: 'Ranjit Tour & Travels',
      tagline: 'Your Journey. Our Route. Royal Route Experience.',
      phone: '+91 98165 96713',
      alternatePhone: '+91 98165 96713',
      whatsapp: '+91 98165 96713',
      email: 'info@ranjittravels.com',
      bookingEmail: 'bookings@ranjittravels.com',
      address: 'Railway Station, Amb Andaura, District Una, Himachal Pradesh, India 177203',
      city: 'Amb Andaura, Una',
      state: 'Himachal Pradesh',
      country: 'India',
      pincode: '177203',
      lat: 31.6844,
      lng: 76.1340,
      googleMapsUrl: 'https://maps.google.com/?q=Amb+Andaura+Railway+Station,Himachal+Pradesh,177203',
      businessHours: 'Open 24 Hours · 7 Days a Week (Round-the-Clock Chauffeur Dispatch)',
      stats: [
        { label: 'Years of Travel Excellence', value: '18+' },
        { label: 'Happy Travelers Curated', value: '45,000+' },
        { label: 'Destinations Covered', value: '85+' },
        { label: 'Premium Fleet Vehicles', value: '120+' },
        { label: 'Successful Hill Trips', value: '32,000+' }
      ],
      socialLinks: {
        facebook: 'https://facebook.com/ranjittourtravels',
        instagram: 'https://instagram.com/ranjittourtravels',
        youtube: 'https://youtube.com/@ranjittourtravels',
        twitter: 'https://twitter.com/ranjittravels',
        tripadvisor: 'https://tripadvisor.com'
      },
      heroTitle: 'Your Journey. Our Route.',
      heroSubtitle: 'Curating authentic royal journeys, mountain expeditions, and premium outstation taxi services across North India.',
      heroText: 'Experience luxury road journeys across Himachal, Punjab, Kashmir, Ladakh and Rajasthan. Travel with certified mountain chauffeurs, modern sanitized vehicles, and 24/7 dedicated route concierge.',
      heroBadge: '30.9010° N · 75.8573° E — Royal Route Experience',
      ctaText: 'Plan My Journey',
      footerAbout: 'Ranjit Tour & Travels is your premier north India travel concierge, operating customized tour packages, luxury sedans, Innova Crystas, and tempo travellers across Himachal, Punjab, Kashmir, Ladakh & Rajasthan.',
      analyticsId: 'G-RANJIT2026',
      googleSearchConsole: 'google-site-verification=rjt_google_verification_code'
    });
    console.log('[Seed] Seeded Website Settings.');

    // 11. Initial Sample Bookings for Dashboard demonstration
    await Booking.create([
      {
        bookingId: 'RJT-2026-0001',
        name: 'Arjun Kapoor',
        phone: '+91 98111 22334',
        email: 'arjun.kapoor@example.com',
        destination: 'Manali & Solang Valley',
        package: 'Royal Himachal 7 Days Grand Tour (Shimla, Kullu, Manali)',
        vehicle: 'Toyota Innova Crysta (Luxury 7-Seater)',
        travelDate: '2026-10-15',
        returnDate: '2026-10-21',
        travelers: 4,
        pickup: 'Chandigarh Airport (IXC)',
        drop: 'Chandigarh Airport (IXC)',
        tripType: 'Tour Package',
        budget: '₹80,000',
        status: 'Confirmed',
        specialRequirements: 'Need baby seat and non-smoking driver.',
        message: 'Family vacation with parents and kids.'
      },
      {
        bookingId: 'RJT-2026-0002',
        name: 'Sunita Sharma',
        phone: '+91 98222 33445',
        email: 'sunita.sharma@example.com',
        destination: 'Spiti Valley & Chandra Taal',
        package: 'Spiti Valley 8 Days Complete Expedition',
        vehicle: 'Toyota Fortuner 4x4 (Royal SUV)',
        travelDate: '2026-10-25',
        returnDate: '2026-11-02',
        travelers: 2,
        pickup: 'Chandigarh Sector 35',
        drop: 'Chandigarh Sector 35',
        tripType: 'Tour Package',
        status: 'In Progress',
        message: 'Photographer couple, need extra time for sunset shoots at Chandra Taal.'
      }
    ]);

    await Inquiry.create([
      {
        name: 'Rohit Verma',
        phone: '+91 98333 44556',
        email: 'rohit.v@example.com',
        type: 'contact',
        subject: 'Corporate Offsite in Kasauli for 30 Executives',
        message: 'Looking for 2 Force Urbanias and resort booking assistance in Kasauli for next weekend.',
        status: 'New'
      }
    ]);
    console.log('[Seed] Seeded initial Bookings & Inquiries.');

    console.log('\n=============================================');
    console.log(' SEEDING COMPLETED SUCCESSFULLY!');
    console.log(` Admin Login: ${process.env.ADMIN_EMAIL || 'admin@ranjittravels.com'}`);
    console.log(' Password:    (configured in server/.env)');
    console.log(` Editor:      ${process.env.EDITOR_EMAIL || 'editor@ranjittravels.com'}`);
    console.log('=============================================\n');

    process.exit(0);
  } catch (error) {
    console.error('[Seed Error]:', error);
    process.exit(1);
  }
};

seedDatabase();
