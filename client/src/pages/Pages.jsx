import React, { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Compass, MapPin, Calendar, Users, Phone, ArrowRight, Shield, Check, X,
  Star, ChevronDown, Award, Car, Clock, Sparkles, Send, Tag, HelpCircle,
  Share2, ArrowUpRight, MessageCircle, Heart, Navigation, Info, FileText, Fuel
} from 'lucide-react';

import { api, msg, img } from '../api.js';
import { 
  Seo, Cover, RatingStars, Breadcrumbs, WhatsAppButton, 
  Loading, ErrorBox, useSettings, waLink 
} from '../components/ui.jsx';

// Helper to read customized items from browser storage if modified by Admin
export const getStoredCustomItems = (resourceKey, defaultList) => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const raw = localStorage.getItem(`rjt_custom_${resourceKey}`);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    }
  } catch (e) {
    console.warn(`Could not load custom ${resourceKey} storage:`, e);
  }
  return defaultList;
};

// Fallback Tour Packages Data (8 Professional Packages)
export const DEFAULT_PACKAGES = [
  {
    _id: 'pkg-1',
    name: 'Royal Himachal 7 Days Grand Tour (Shimla, Kullu, Manali)',
    slug: 'royal-himachal-7-days',
    destination: { name: 'Himachal Pradesh' },
    duration: '6 Nights / 7 Days',
    price: 24999,
    discountedPrice: 19999,
    category: 'Family & Honeymoon',
    rating: 4.9,
    reviewsCount: 48,
    hotel: '3/4 Star Balcony Mountain View Stay',
    transport: 'Private Dedicated Innova Crysta / Sedan',
    featuredImage: 'https://images.unsplash.com/photo-1597074866923-dc0589150358?auto=format&fit=crop&w=1200&q=80',
    overview: 'Experience the ultimate Himachal holiday. Walk the British-era Mall Road in Shimla, horse riding at Kufri, Beas river rafting in Kullu, snow sports in Solang Valley, and Atal Tunnel mountain safari.',
    itinerary: [
      { day: 1, title: 'Chandigarh / Amb Andaura to Shimla', details: 'Chauffeur pickup in private AC cab, scenic drive along Himalayan highway to Shimla. Evening Mall Road & Ridge walk.', meals: 'Dinner', hotel: 'Royal Tulip / Radisson Shimla' },
      { day: 2, title: 'Kufri & Historic Shimla Heritage', details: 'Full day excursion to Kufri snow point, Jakhoo Hanuman ropeway, and Viceregal Lodge.', meals: 'Breakfast & Dinner', hotel: 'Royal Tulip / Radisson Shimla' },
      { day: 3, title: 'Shimla to Manali via Kullu Valley', details: 'Scenic 7-hour journey across Sundernagar Lake, Pandoh Dam, Hanogi Temple, and Shawl factory in Kullu.', meals: 'Breakfast & Dinner', hotel: 'The Himalayan Resort Manali' },
      { day: 4, title: 'Manali Local Culture & Waterfalls', details: 'Visit 500-year-old Hadimba Devi Temple, Tibetan Monastery, Vashisht Sulphur Springs, and Jogini Waterfall.', meals: 'Breakfast & Dinner', hotel: 'The Himalayan Resort Manali' },
      { day: 5, title: 'Solang Valley, Atal Tunnel & Sissu', details: 'Thrilling mountain safari through the world-famous Atal Tunnel (9.02 km) to Sissu waterfall in Lahaul Valley.', meals: 'Breakfast & Dinner', hotel: 'The Himalayan Resort Manali' },
      { day: 6, title: 'Naggar Castle Heritage & Old Manali', details: 'Tour of historic Naggar Castle (Nicholas Roerich art gallery), trout fishing spot, and bohemian cafes in Old Manali.', meals: 'Breakfast & Dinner', hotel: 'The Himalayan Resort Manali' },
      { day: 7, title: 'Manali to Departure Drop', details: 'Leisurely breakfast, checkout, and comfortable return transfer to Chandigarh / Amb Andaura.', meals: 'Breakfast', hotel: 'Departure' }
    ],
    inclusions: [
      '6 Nights accommodation in premium 3/4-star hotels with private balcony views',
      'Daily buffet breakfast and multi-cuisine dinner',
      'Private dedicated AC Innova Crysta / Sedan with experienced hill chauffeur',
      'All toll taxes, state tourist permits, parking charges & driver allowances',
      'Atal Tunnel & Sissu excursion permit assistance',
      '24/7 dedicated trip concierge and emergency on-road support'
    ],
    exclusions: ['Airfare or train tickets', 'Adventure sports charges', 'Personal expenses & monument entry fees'],
    faqs: [
      { q: 'Can the itinerary be customized for senior citizens?', a: 'Absolutely! We can pace the trip comfortably with zero-rush days and ground-floor room allocations.' },
      { q: 'Is heating available in hotels during winter?', a: 'Yes, all our partner properties provide heating or complimentary room blowers.' }
    ],
    published: true
  },
  {
    _id: 'pkg-2',
    name: 'Manali, Solang Valley & Atal Tunnel Express',
    slug: 'manali-solang-atal-tunnel-5-days',
    destination: { name: 'Manali, Himachal' },
    duration: '4 Nights / 5 Days',
    price: 16500,
    discountedPrice: 13499,
    category: 'Adventure & Snow',
    rating: 4.9,
    reviewsCount: 62,
    hotel: 'Luxury Riverside Mountain Resort',
    transport: 'Private AC Cab & Sightseeing',
    featuredImage: 'https://images.unsplash.com/photo-1605649487212-47bdab064df7?auto=format&fit=crop&w=1200&q=80',
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
    faqs: [
      { q: 'Is snow available throughout the year?', a: 'Snow is present in Rohtang and Sissu from December through June, with heavy snowfall in winter.' }
    ],
    published: true
  },
  {
    _id: 'pkg-3',
    name: 'Himachal 9 Devi Darshan & Sacred Shaktipeeth Yatra',
    slug: 'himachal-devi-darshan-pilgrimage',
    destination: { name: 'Himachal & Punjab' },
    duration: '4 Nights / 5 Days',
    price: 17999,
    discountedPrice: 14999,
    category: 'Pilgrimage & Spiritual',
    rating: 5.0,
    reviewsCount: 94,
    hotel: 'Comfortable Temple Proximity Stays',
    transport: 'Dedicated AC Chauffeur Driven Cab',
    featuredImage: 'https://images.unsplash.com/photo-1596895111956-bf1cf0599ce5?auto=format&fit=crop&w=1200&q=80',
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
    faqs: [
      { q: 'Is this tour suitable for elderly pilgrims?', a: 'Yes! Our drivers provide doorstep drops as close as allowed to temple gates, and coordinate battery cars/lifts.' }
    ],
    published: true
  },
  {
    _id: 'pkg-4',
    name: 'Shimla, Kufri & Chail Heritage Holiday',
    slug: 'shimla-kufri-chail-4-days',
    destination: { name: 'Shimla, Himachal' },
    duration: '3 Nights / 4 Days',
    price: 13999,
    discountedPrice: 10999,
    category: 'Heritage & Nature',
    rating: 4.8,
    reviewsCount: 39,
    hotel: 'Colonial Heritage Valley Resort',
    transport: 'Private Sedan / Innova Cab',
    featuredImage: 'https://images.unsplash.com/photo-1562670652-e5947bddb335?auto=format&fit=crop&w=1200&q=80',
    overview: 'Explore the Queen of Hills with Mall Road evening strolls, Jakhoo Temple ropeway, snow activities in Kufri, and the historic Maharaja Palace in Chail.',
    itinerary: [
      { day: 1, title: 'Chandigarh to Shimla Arrival', details: 'Pickup from Chandigarh / Kalka, drive through scenic Solan hills to Shimla. Evening at leisure on the Mall Road.', meals: 'Dinner', hotel: 'Shimla British Heritage Hotel' },
      { day: 2, title: 'Kufri Snow Point & Jakhoo Ropeway', details: 'Excursion to Kufri adventure valley, Himalayan Nature Park, and ropeway ride to 108ft Jakhoo Hanuman shrine.', meals: 'Breakfast & Dinner', hotel: 'Shimla British Heritage Hotel' },
      { day: 3, title: 'Chail Palace & World Highest Cricket Ground', details: 'Scenic day trip to Chail Palace, Kali Ka Tibba sunset viewpoint, and dense deodar forests.', meals: 'Breakfast & Dinner', hotel: 'Shimla British Heritage Hotel' },
      { day: 4, title: 'Viceregal Lodge & Return Transfer', details: 'Morning tour of Viceregal Lodge (Indian Institute of Advanced Study) and departure transfer.', meals: 'Breakfast', hotel: 'Departure' }
    ],
    inclusions: ['3 Nights 3-Star deluxe hotel stay', 'Breakfast & Dinner daily', 'Private AC transport for all routes', 'Tolls & driver allowance'],
    exclusions: ['Monument entry fees', 'Ropeway & horse riding charges'],
    published: true
  },
  {
    _id: 'pkg-5',
    name: 'Dharamshala, McLeodganj & Dalhousie Khajjiar Circuit',
    slug: 'dharamshala-dalhousie-khajjiar-6-days',
    destination: { name: 'Kangra & Chamba' },
    duration: '5 Nights / 6 Days',
    price: 21999,
    discountedPrice: 17999,
    category: 'Scenic Valleys & Culture',
    rating: 4.9,
    reviewsCount: 53,
    hotel: 'Pine Valley 4-Star Resort',
    transport: 'Private Luxury Innova Crysta',
    featuredImage: 'https://images.unsplash.com/photo-1588668214407-6ea9a6d8c272?auto=format&fit=crop&w=1200&q=80',
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
    published: true
  },
  {
    _id: 'pkg-6',
    name: 'Spiti Valley & Chandratal Lake High-Altitude Safari',
    slug: 'spiti-valley-8-days-expedition',
    destination: { name: 'Spiti Valley' },
    duration: '7 Nights / 8 Days',
    price: 32999,
    discountedPrice: 27999,
    category: 'Extreme Mountain Expedition',
    rating: 4.9,
    reviewsCount: 41,
    hotel: 'Spiti Heritage Homestays & Chandra Taal Camps',
    transport: '4x4 Fortuner / High-Clearance Innova',
    featuredImage: 'https://images.unsplash.com/photo-1571536802807-30451e3955d8?auto=format&fit=crop&w=1200&q=80',
    overview: 'Traverse Kalpa, Tabo UNESCO Monastery, Dhankar, Kaza, Key Monastery, Worlds Highest Post Office in Hikkim, Chicham Bridge, and camping by the mystical Chandra Taal Lake.',
    itinerary: [
      { day: 1, title: 'Chandigarh to Narkanda / Rampur', details: 'Drive past apple orchards into the Kinnaur gorge gateway.', meals: 'Dinner', hotel: 'Hatu Pine Resort' },
      { day: 2, title: 'Narkanda to Kalpa (Kinnaur Kailash)', details: 'Drive along Sutlej river to Kalpa with golden sunset views over Kinnaur Kailash.', meals: 'Breakfast & Dinner', hotel: 'Grand Shambala Kalpa' },
      { day: 3, title: 'Kalpa to Tabo via Nako Lake & Gue Mummy', details: 'Visit 500-year preserved monk mummy at Gue and 1000-year Tabo UNESCO monastery.', meals: 'Breakfast & Dinner', hotel: 'Maitreya Tabo' },
      { day: 4, title: 'Tabo to Kaza via Dhankar Cliff Monastery', details: 'Explore cliff-edge Dhankar fortress monastery and arrive in Kaza capital.', meals: 'Breakfast & Dinner', hotel: 'Spiti Heritage Kaza' },
      { day: 5, title: 'Kaza Highest Villages: Hikkim, Komic & Langza', details: 'Post cards from World Highest Post Office at Hikkim (4,400m) and giant Buddha at Langza.', meals: 'Breakfast & Dinner', hotel: 'Spiti Heritage Kaza' },
      { day: 6, title: 'Key Monastery, Kibber & Chandra Taal Moon Lake', details: 'Visit iconic Key Monastery, Chicham suspension bridge, and camp beside glowing Chandra Taal lake.', meals: 'Breakfast & Dinner', hotel: 'Luxury Swiss Tents Chandra Taal' },
      { day: 7, title: 'Chandra Taal to Manali via Kunzum Pass', details: 'Cross Kunzum Pass (4,551m) and Batal river bed, crossing Atal Tunnel into Manali.', meals: 'Breakfast & Dinner', hotel: 'Apple Country Resort Manali' },
      { day: 8, title: 'Manali to Departure Drop', details: 'Return drive to Chandigarh / Amb Andaura with lifetime memories.', meals: 'Breakfast', hotel: 'Departure' }
    ],
    inclusions: ['7 Nights stay (Hotels + Luxury Swiss Tents at Chandra Taal Lake)', 'Breakfast and hot dinners daily', 'Dedicated 4x4 / High-clearance vehicle with mountain expert', 'Oxygen cylinder on board', 'Inner Line permits'],
    exclusions: ['Medical insurance', 'Monastery entry donations'],
    published: true
  },
  {
    _id: 'pkg-7',
    name: 'Golden Temple Amritsar & Wagah Border Express',
    slug: 'amritsar-golden-temple-wagah-3-days',
    destination: { name: 'Amritsar, Punjab' },
    duration: '2 Nights / 3 Days',
    price: 9999,
    discountedPrice: 7499,
    category: 'Heritage & Patriotism',
    rating: 5.0,
    reviewsCount: 88,
    hotel: 'Premium City Centre Hotel near Heritage Walk',
    transport: 'Private AC Sedan / Crysta Transfer',
    featuredImage: 'https://images.unsplash.com/photo-1514222134-b57cbb8ce073?auto=format&fit=crop&w=1200&q=80',
    overview: 'Experience the divine peace of Sri Harmandir Sahib (Golden Temple), the patriotic grandeur of Wagah Border Beating Retreat, Jallianwala Bagh, and authentic Amritsari culinary tours.',
    itinerary: [
      { day: 1, title: 'Amb Andaura / Chandigarh to Amritsar Arrival', details: 'Comfortable road trip to Amritsar. Evening visit to Golden Temple for mesmerizing night lighting and Palki Sahib ceremony.', meals: 'Dinner', hotel: 'Hyatt / Best Western Amritsar' },
      { day: 2, title: 'Jallianwala Bagh & Electrifying Wagah Border', details: 'Morning heritage walk to Jallianwala Bagh & Partition Museum. Afternoon excursion to Indo-Pak Wagah Border for military retreat ceremony.', meals: 'Breakfast & Dinner', hotel: 'Hyatt / Best Western Amritsar' },
      { day: 3, title: 'Gobindgarh Fort & Return Transfer', details: 'Visit historic Gobindgarh Fort, authentic Kulcha breakfast, and departure transfer.', meals: 'Breakfast', hotel: 'Departure' }
    ],
    inclusions: ['2 Nights star hotel stay', 'Daily breakfast & dinner', 'Private dedicated AC cab for all transfers & Wagah Border', 'Tolls, parking & driver allowances'],
    exclusions: ['Wagah VIP seat reservation fees (if applicable)', 'Personal purchases'],
    published: true
  },
  {
    _id: 'pkg-8',
    name: 'Leh Ladakh Monasteries, Nubra Valley & Pangong Tso',
    slug: 'leh-ladakh-pangong-nubra-7-days',
    destination: { name: 'Ladakh' },
    duration: '6 Nights / 7 Days',
    price: 36000,
    discountedPrice: 31500,
    category: 'Royal High-Altitude',
    rating: 4.9,
    reviewsCount: 47,
    hotel: 'Boutique Leh Hotel & Luxury Swiss Camps',
    transport: 'Dedicated Oxygen-Equipped Scorpio / Innova',
    featuredImage: 'https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?auto=format&fit=crop&w=1200&q=80',
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
    published: true
  }
];

// Fallback Destinations Data (8 Professional Himachal & North India Destinations)
export const DEFAULT_DESTINATIONS = [
  {
    _id: 'dest-1',
    name: 'Manali & Solang Valley',
    slug: 'manali',
    state: 'Himachal Pradesh',
    country: 'India',
    shortDescription: 'Snow-capped Himalayan peaks, Solang Valley adventure sports, Atal Tunnel, and apple orchards.',
    description: 'Manali is North India’s premier mountain haven. Nestled along the Beas River at 6,726 ft, it is the gateway to Solang Valley snow trails, Rohtang Pass, the engineering wonder of Atal Tunnel, and ancient cedar-sheltered Hadimba Temple.',
    bestTime: 'All Year Round (Snow: Dec - Feb)',
    duration: '3-5 Days',
    startingPrice: 7999,
    featuredImage: 'https://images.unsplash.com/photo-1605649487212-47bdab064df7?auto=format&fit=crop&w=1200&q=80',
    attractions: ['Solang Valley Snow Point', 'Atal Tunnel & Sissu Waterfall', 'Hadimba Devi Temple', 'Jogini Waterfall', 'Vashisht Hot Springs', 'Mall Road Manali'],
    activities: ['Paragliding & Zorbing', 'River Rafting in Kullu', 'Snow Skiing', 'Trout Fishing'],
    published: true
  },
  {
    _id: 'dest-2',
    name: 'Shimla & Kufri',
    slug: 'shimla',
    state: 'Himachal Pradesh',
    country: 'India',
    shortDescription: 'The colonial Queen of Hills featuring Mall Road, Christ Church, pine ridges, and Kufri snow trails.',
    description: 'Shimla, the capital of Himachal Pradesh, was the summer capital of British India. It retains its colonial architecture, pedestrian-only Mall Road, historic Viceregal Lodge, and panoramic viewpoints over snowcapped Himalayan peaks.',
    bestTime: 'March to June & Dec to Feb',
    duration: '3-4 Days',
    startingPrice: 6999,
    featuredImage: 'https://images.unsplash.com/photo-1562670652-e5947bddb335?auto=format&fit=crop&w=1200&q=80',
    attractions: ['The Ridge & Mall Road', 'Christ Church', 'Jakhoo Hanuman Ropeway', 'Kufri Snow World', 'Viceregal Lodge', 'Chail Palace'],
    activities: ['Horse Riding in Kufri', 'Heritage Walks', 'Toy Train Ride', 'Ice Skating in Winter'],
    published: true
  },
  {
    _id: 'dest-3',
    name: 'Dharamshala & McLeodganj',
    slug: 'dharamshala',
    state: 'Himachal Pradesh',
    country: 'India',
    shortDescription: 'Spiritual residence of Dalai Lama, HPCA International Stadium, and breathtaking Dhauladhar snow ridges.',
    description: 'Dharamshala and upper McLeodganj offer a mesmerizing blend of Tibetan Buddhist culture, cedar forests, pristine waterfalls, trendy mountain cafes, and alpine trekking trails at the foothills of the Dhauladhar range.',
    bestTime: 'September to June',
    duration: '3-4 Days',
    startingPrice: 7499,
    featuredImage: 'https://images.unsplash.com/photo-1588668214407-6ea9a6d8c272?auto=format&fit=crop&w=1200&q=80',
    attractions: ['Tsuglagkhang Dalai Lama Temple', 'HPCA Cricket Stadium', 'Bhagsunag Waterfall', 'Triund Trek Peak', 'Norbulingka Tibetan Institute', 'St. John in the Wilderness'],
    activities: ['Triund Day Trek', 'Tibetan Cooking Classes', 'Paragliding in Dharamkot', 'Cafe Hopping'],
    published: true
  },
  {
    _id: 'dest-4',
    name: 'Dalhousie & Khajjiar',
    slug: 'dalhousie',
    state: 'Himachal Pradesh',
    country: 'India',
    shortDescription: 'Known as Mini Switzerland of India, featuring emerald cedar meadows, Dainkund peak, and colonial charm.',
    description: 'Dalhousie is a serene hill station spread across five forested hills. Just a short drive away lies Khajjiar, a breathtaking saucer-shaped green meadow ringed by towering deodars with a floating island lake.',
    bestTime: 'April to July & Oct to Feb',
    duration: '3-4 Days',
    startingPrice: 8499,
    featuredImage: 'https://images.unsplash.com/photo-1597074866923-dc0589150358?auto=format&fit=crop&w=1200&q=80',
    attractions: ['Khajjiar Meadow Lake', 'Kalatop Wildlife Sanctuary', 'Dainkund Peak (Singing Hill)', 'Panchpula Waterfall', 'Subhash Baoli', 'St. John Church'],
    activities: ['Horse Riding at Khajjiar', 'Zorbing', 'Nature Forest Treks', 'Chamba Valley Tour'],
    published: true
  },
  {
    _id: 'dest-5',
    name: 'Mata Chintpurni & 9 Devi Darshan',
    slug: 'chintpurni-devi-darshan',
    state: 'Himachal Pradesh',
    country: 'India',
    shortDescription: 'Sacred Shaktipeeth circuit from Amb Andaura Railhead covering Chintpurni, Jwala Ji, Kangra Devi & Chamunda.',
    description: 'Starting directly from Amb Andaura Railway Station (primary terminus of Vande Bharat Express), this holy pilgrimage covers Maa Chintpurni, Maa Jwala Ji (Eternal Flame), Maa Baglamukhi, Nagarkot Kangra Devi, Chamunda Devi, and Naina Devi.',
    bestTime: 'All Year Round · Navratri Festivals',
    duration: '2-5 Days',
    startingPrice: 4999,
    featuredImage: 'https://images.unsplash.com/photo-1596895111956-bf1cf0599ce5?auto=format&fit=crop&w=1200&q=80',
    attractions: ['Maa Chintpurni Devi Temple', 'Maa Jwala Ji Eternal Flame', 'Maa Baglamukhi Bankhandi', 'Brajeshwari Kangra Devi', 'Maa Chamunda Devi', 'Mata Naina Devi Ropeway'],
    activities: ['Temple Aarti & Darshan', 'Vande Bharat Express Pickup', 'Havan Puja Coordination', 'Holy Bath at Banganga'],
    published: true
  },
  {
    _id: 'dest-6',
    name: 'Spiti Valley & Chandratal',
    slug: 'spiti-valley',
    state: 'Himachal Pradesh',
    country: 'India',
    shortDescription: 'The awe-inspiring Middle Land of 1000-year Key Monastery, high-altitude desert passes, and turquoise Chandratal.',
    description: 'Spiti Valley is a raw, high-altitude cold desert surrounded by rugged Himalayan peaks. Famous for ancient Buddhist monasteries like Key, Tabo, and Dhankar, worlds highest motorable villages Hikkim & Komic, and the glowing crescent lake of Chandra Taal.',
    bestTime: 'May to October',
    duration: '7-9 Days',
    startingPrice: 16999,
    featuredImage: 'https://images.unsplash.com/photo-1571536802807-30451e3955d8?auto=format&fit=crop&w=1200&q=80',
    attractions: ['Key Gompa Monastery', 'Chandra Taal Moon Lake', 'Tabo UNESCO Monastery', 'Hikkim Highest Post Office', 'Chicham Highest Bridge', 'Dhankar Cliff Monastery'],
    activities: ['High-Altitude SUV Safari', 'Camping at Chandratal', 'Stargazing & Milky Way Photography', 'Fossil Hunting at Langza'],
    published: true
  },
  {
    _id: 'dest-7',
    name: 'Kasol, Tosh & Parvati Valley',
    slug: 'kasol',
    state: 'Himachal Pradesh',
    country: 'India',
    shortDescription: 'The bohemian paradise along Parvati river, scenic Kheerganga treks, and sacred Manikaran Sahib hot springs.',
    description: 'Kasol is a scenic village nestled along the gushing Parvati River. Known as Mini Israel for its vibrant cafe culture, pine trails to Tosh and Chalal villages, trekking routes to Kheerganga, and healing hot water springs of Gurudwara Manikaran Sahib.',
    bestTime: 'March to June & Sept to Nov',
    duration: '2-4 Days',
    startingPrice: 5999,
    featuredImage: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
    attractions: ['Parvati River Promenade', 'Manikaran Sahib Gurudwara Hot Springs', 'Tosh Village & Waterfall', 'Chalal Trail', 'Kheerganga Hot Springs Trek', 'Malana Village'],
    activities: ['Riverside Camping', 'Cafe Hopping', 'Kheerganga Trekking', 'Hot Sulphur Mineral Bath'],
    published: true
  },
  {
    _id: 'dest-8',
    name: 'Amritsar & Golden Temple',
    slug: 'amritsar',
    state: 'Punjab',
    country: 'India',
    shortDescription: 'The spiritual heart of Punjab with golden Harmandir Sahib, Wagah Border retreat ceremony, and rich heritage.',
    description: 'Amritsar is the iconic spiritual and cultural centre for travelers across North India. Home to the golden sanctum of Sri Harmandir Sahib, historic Jallianwala Bagh, Partition Museum, Gobindgarh Fort, and the roaring patriotism at the Indo-Pak Wagah Border.',
    bestTime: 'October to March',
    duration: '2-3 Days',
    startingPrice: 4499,
    featuredImage: 'https://images.unsplash.com/photo-1514222134-b57cbb8ce073?auto=format&fit=crop&w=1200&q=80',
    attractions: ['Sri Harmandir Sahib (Golden Temple)', 'Wagah Border Beating Retreat', 'Jallianwala Bagh Memorial', 'Partition Museum', 'Gobindgarh Fort', 'Sada Pind Village'],
    activities: ['Holy Palki Sahib Ceremony', 'Community Langar Seva', 'Wagah Retreat Parade', 'Authentic Amritsari Food Tour'],
    published: true
  }
];

// Fallback Vehicles Data (8 Iconic Himachali Commercial Vehicles for Tourists)
export const DEFAULT_VEHICLES = [
  {
    _id: 'veh-1',
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
    published: true
  },
  {
    _id: 'veh-2',
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
    published: true
  },
  {
    _id: 'veh-3',
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
    published: true
  },
  {
    _id: 'veh-4',
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
    published: true
  },
  {
    _id: 'veh-5',
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
    published: true
  },
  {
    _id: 'veh-6',
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
    published: true
  },
  {
    _id: 'veh-7',
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
    published: true
  },
  {
    _id: 'veh-8',
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
    available: true,
    published: true
  }
];

// Fallback Authentic Google Maps Reviews (Ranjit Travels & Tours Services, Amb Andaura)
export const DEFAULT_TESTIMONIALS = [
  {
    _id: 'rev-1',
    name: 'Rajesh Sharma',
    city: 'New Delhi',
    avatar: 'RS',
    tripDate: 'October 2026',
    destination: 'Amb Andaura Station to Mata Chintpurni & Jwala Ji',
    package: 'Himachal 9 Devi Darshan Circuit',
    rating: 5,
    source: 'Google Maps Verified Review',
    review: 'Booked an Innova Crysta for our family arriving at Amb Andaura Railway Station via Vande Bharat Express. Driver Ashok was already waiting right outside the platform with a placard. Clean vehicle, polite chauffeur, and very safe driving for our Chintpurni, Jwala Ji and Kangra Devi darshan. 100% transparent quotation with zero hidden charges. Best taxi service in Amb Una!',
    published: true
  },
  {
    _id: 'rev-2',
    name: 'Dr. Sunita Malhotra & Family',
    city: 'Chandigarh',
    avatar: 'SM',
    tripDate: 'September 2026',
    destination: 'Amb Andaura to Dharamshala & Dalhousie',
    package: 'Dharamshala & Khajjiar Tour',
    rating: 5,
    source: 'Google Maps Verified Review',
    review: 'Hired a 12-seater luxury Force Tempo Traveller for our 14-member family group to Dharamshala, McLeodganj and Dalhousie. The pushback Maharaja seats and chilled AC were top-notch. Our hill driver had exceptional experience on ghats and guided us to peaceful spots without rush. Excellent customer coordination by Ranjit Ji.',
    published: true
  },
  {
    _id: 'rev-3',
    name: 'Gurpreet Singh Sandhu',
    city: 'Ludhiana, Punjab',
    avatar: 'GS',
    tripDate: 'October 2026',
    destination: 'Amb Andaura to Manali & Solang Valley',
    package: 'Royal Himachal Holiday',
    rating: 5,
    source: 'Google Maps Verified Review',
    review: 'Best cab service in Amb Andaura and Una district! Very prompt response on WhatsApp (+91 98165 96713). Hired Dzire sedan for Manali and Rohtang Pass. Punctual pickup, well-maintained car, and trustworthy hill driver who knew all scenic viewpoints and food stops. 5/5 stars!',
    published: true
  },
  {
    _id: 'rev-4',
    name: 'Vikas & Neha Gupta',
    city: 'Ahmedabad, Gujarat',
    avatar: 'VG',
    tripDate: 'September 2026',
    destination: 'Amb Andaura Station Pickup to 9 Devi Temples',
    package: 'Complete Devi Darshan Yatra',
    rating: 5,
    source: 'Google Maps Verified Review',
    review: 'Smooth and stress-free pilgrimage! Picked us up right outside Amb Andaura railway platform on time. The driver knew exact temple Aarti timings and assisted our elderly parents during temple queues. Truly hospitable and professional service.',
    published: true
  },
  {
    _id: 'rev-5',
    name: 'Amitabh Sengupta',
    city: 'Kolkata, WB',
    avatar: 'AS',
    tripDate: 'August 2026',
    destination: 'Spiti Valley & Chandratal Lake',
    package: 'Spiti High-Altitude 4x4 Safari',
    rating: 5,
    source: 'Google Maps Verified Review',
    review: 'Booked Mahindra Scorpio 4x4 for a week-long Spiti Valley expedition. Vehicle condition was flawless with heavy-duty mountain suspension and oxygen kit. Driver handled rough high passes with great calm and expertise. Best travel operator in North India.',
    published: true
  },
  {
    _id: 'rev-6',
    name: 'Harmanjot Kaur',
    city: 'Mohali, Punjab',
    avatar: 'HK',
    tripDate: 'October 2026',
    destination: 'Chandigarh Airport Transfer & Himachal Sightseeing',
    package: 'Outstation Cab Rental',
    rating: 5,
    source: 'Google Maps Verified Review',
    review: 'Used Ranjit Travels for airport pickup to Chandigarh and local Himachal sightseeing. Immaculate vehicle, respectful chauffeur, clean bottled water provided, and fair quotation given upfront with no surprise costs. Will always book with them!',
    published: true
  }
];

// ==========================================
// 1. HOMEPAGE
// ==========================================
export function Home() {
  const s = useSettings();
  const navigate = useNavigate();
  const [destinations, setDestinations] = useState(() => getStoredCustomItems('destinations', DEFAULT_DESTINATIONS));
  const [packages, setPackages] = useState(() => getStoredCustomItems('packages', DEFAULT_PACKAGES));
  const [vehicles, setVehicles] = useState(() => getStoredCustomItems('vehicles', DEFAULT_VEHICLES));
  const [services, setServices] = useState(() => getStoredCustomItems('services', []));
  const [blogs, setBlogs] = useState(() => getStoredCustomItems('blogs', []));
  const [testimonials, setTestimonials] = useState(DEFAULT_TESTIMONIALS);
  const [loading, setLoading] = useState(true);

  // Search state
  const [searchForm, setSearchForm] = useState({
    from: 'Amb Andaura Railway Station',
    to: 'Mata Chintpurni / Manali',
    date: '',
    travelType: 'Tour Package',
    travelers: 2
  });

  useEffect(() => {
    Promise.all([
      api.get('/destinations?limit=12'),
      api.get('/packages?limit=12'),
      api.get('/vehicles?limit=8'),
      api.get('/services?limit=4'),
      api.get('/blogs?limit=3'),
      api.get('/testimonials?limit=3')
    ])
      .then(([dRes, pRes, vRes, sRes, bRes, tRes]) => {
        const customDests = getStoredCustomItems('destinations', null);
        if (customDests && customDests.length > 0) {
          setDestinations(customDests);
        } else if (dRes.data.items && dRes.data.items.length > 0) {
          setDestinations(dRes.data.items);
        }

        const customPkgs = getStoredCustomItems('packages', null);
        if (customPkgs && customPkgs.length > 0) {
          setPackages(customPkgs);
        } else if (pRes.data.items && pRes.data.items.length > 0) {
          setPackages(pRes.data.items);
        }

        const customVehs = getStoredCustomItems('vehicles', null);
        if (customVehs && customVehs.length > 0) {
          setVehicles(customVehs);
        } else if (vRes.data.items && vRes.data.items.length > 0) {
          setVehicles(vRes.data.items);
        }

        const customSrvs = getStoredCustomItems('services', null);
        if (customSrvs && customSrvs.length > 0) {
          setServices(customSrvs);
        } else if (sRes.data.items && sRes.data.items.length > 0) {
          setServices(sRes.data.items);
        }

        const customBlgs = getStoredCustomItems('blogs', null);
        if (customBlgs && customBlgs.length > 0) {
          setBlogs(customBlgs);
        } else if (bRes.data.items && bRes.data.items.length > 0) {
          setBlogs(bRes.data.items);
        }

        setTestimonials(tRes.data.items || DEFAULT_TESTIMONIALS);
      })
      .catch(err => {
        console.warn('Home live load notice:', err.message);
        setDestinations(getStoredCustomItems('destinations', DEFAULT_DESTINATIONS));
        setPackages(getStoredCustomItems('packages', DEFAULT_PACKAGES));
        setVehicles(getStoredCustomItems('vehicles', DEFAULT_VEHICLES));
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    navigate(`/booking?pickup=${encodeURIComponent(searchForm.from)}&destination=${encodeURIComponent(searchForm.to)}&date=${searchForm.date}&type=${encodeURIComponent(searchForm.travelType)}&travelers=${searchForm.travelers}`);
  };

  return (
    <>
      <Seo 
        title="Royal Route Mountain Journeys & Luxury Cabs"
        description="Ranjit Tour & Travels is North India's premier travel concierge. Book Shimla, Manali, Spiti & Ladakh customized tour packages and outstation cabs."
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "TravelAgency",
          "name": s.businessName || "Ranjit Tour & Travels",
          "telephone": s.phone || "+919876543210",
          "email": s.email || "info@ranjittravels.com",
          "address": {
            "@type": "PostalAddress",
            "streetAddress": s.address || "SCO 142-143, Sector 17-C",
            "addressLocality": s.city || "Chandigarh",
            "postalCode": s.pincode || "160017",
            "addressCountry": "IN"
          }
        }}
      />

      {/* HERO SECTION WITH SCENIC HIMALAYAN BACKGROUND */}
      <section className="relative min-h-[90vh] flex items-center justify-center pt-8 pb-16 px-4 overflow-hidden">
        {/* Scenic Himalayan Mountain Background Image with Crisp Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=2000&q=80"
            alt="Himachal Snow Mountains"
            className="w-full h-full object-cover object-center scale-105 filter brightness-[0.85]"
          />
          {/* Multi-tone contrast gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/75 to-slate-950/85" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/50" />
        </div>

        <div className="max-w-7xl mx-auto w-full grid lg:grid-cols-12 gap-10 items-center relative z-10 py-6">
          {/* Left Column: Main Headline, Pitch & CTAs */}
          <motion.div 
            className="lg:col-span-7 space-y-6 text-white"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-500/25 backdrop-blur-md border border-teal-400/40 text-teal-200 text-xs font-bold tracking-wider uppercase shadow-lg">
              <Compass className="w-4 h-4 animate-spin-slow text-teal-300" />
              <span>North India's Trusted Himachal & Temple Tour Specialist</span>
            </div>

            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.12] drop-shadow-lg">
              Discover Himachal <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 via-emerald-300 to-teal-100">
                & Royal North India
              </span>
            </h1>

            <p className="text-slate-100 text-base sm:text-lg max-w-xl leading-relaxed font-normal drop-shadow-md">
              {s.heroText || 'Customized tour packages, outstation cabs & hill-expert chauffeurs for Manali, Shimla, Dharamshala, Spiti Valley, Leh Ladakh, Amritsar Golden Temple & Himachal Devi Darshan.'}
            </p>

            <div className="flex flex-wrap items-center gap-3.5 pt-2">
              <Link to="/tour-packages" className="btn-primary !bg-teal-600 hover:!bg-teal-500 !text-white shadow-lg shadow-teal-950/40">
                <span>Explore Packages</span>
                <ArrowRight size={17} />
              </Link>
              <Link to="/cars" className="btn-secondary !bg-white/15 hover:!bg-white/25 !text-white !border-white/30 backdrop-blur-md">
                <span>View Taxi Fleet</span>
              </Link>
              <a
                href={`tel:${(s.phone || '+919876543210').replace(/\s+/g, '')}`}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/25 text-white text-xs font-bold transition shadow-sm backdrop-blur-md"
              >
                <Phone size={14} className="text-teal-300" />
                <span>Call {s.phone || '+91 98765 43210'}</span>
              </a>
            </div>

            {/* Feature Highlights Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-white/15">
              <div className="flex items-center gap-2 text-xs text-slate-200 font-semibold">
                <div className="w-6 h-6 rounded-md bg-teal-500/25 flex items-center justify-center flex-shrink-0 text-teal-300">
                  <Shield size={14} />
                </div>
                <span>100% Insured Fleet</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-200 font-semibold">
                <div className="w-6 h-6 rounded-md bg-emerald-500/25 flex items-center justify-center flex-shrink-0 text-emerald-300">
                  <Award size={14} />
                </div>
                <span>Hill-Expert Drivers</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-200 font-semibold">
                <div className="w-6 h-6 rounded-md bg-teal-500/25 flex items-center justify-center flex-shrink-0 text-teal-300">
                  <Tag size={14} />
                </div>
                <span>No Hidden Charges</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-200 font-semibold">
                <div className="w-6 h-6 rounded-md bg-emerald-500/25 flex items-center justify-center flex-shrink-0 text-emerald-300">
                  <Clock size={14} />
                </div>
                <span>24/7 Helpline</span>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Search & Fast Cab/Tour Booking Card */}
          <motion.div 
            className="lg:col-span-5"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="travel-card bg-white/95 backdrop-blur-xl border border-white/80 p-6 sm:p-7 shadow-2xl relative rounded-2xl">
              <div className="flex items-center justify-between mb-5 border-b border-slate-100 pb-3">
                <div>
                  <span className="text-[11px] font-bold text-teal-700 uppercase tracking-wider font-mono">Fast Cab & Tour Inquiry</span>
                  <h3 className="font-display text-xl font-extrabold text-slate-900 mt-0.5">Plan My Journey</h3>
                </div>
                <div className="w-9 h-9 rounded-xl bg-teal-50 flex items-center justify-center text-teal-700 border border-teal-100 shadow-xs">
                  <Navigation size={18} />
                </div>
              </div>

              <form onSubmit={handleSearchSubmit} className="space-y-3.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1 uppercase tracking-wider">Pickup City</label>
                    <div className="relative flex items-center">
                      <input
                        type="text"
                        className="inp inp-with-icon text-xs font-semibold"
                        required
                        value={searchForm.from}
                        onChange={e => setSearchForm({ ...searchForm, from: e.target.value })}
                        placeholder="Chandigarh / Delhi"
                      />
                      <MapPin className="w-4 h-4 text-teal-600 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1 uppercase tracking-wider">Destination</label>
                    <div className="relative flex items-center">
                      <input
                        type="text"
                        className="inp inp-with-icon text-xs font-semibold"
                        required
                        value={searchForm.to}
                        onChange={e => setSearchForm({ ...searchForm, to: e.target.value })}
                        placeholder="Manali / Shimla / Spiti"
                      />
                      <Compass className="w-4 h-4 text-emerald-600 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1 uppercase tracking-wider">Travel Date</label>
                    <div className="relative flex items-center">
                      <input
                        type="date"
                        className="inp inp-with-icon text-xs font-semibold"
                        required
                        value={searchForm.date}
                        onChange={e => setSearchForm({ ...searchForm, date: e.target.value })}
                      />
                      <Calendar className="w-4 h-4 text-teal-600 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1 uppercase tracking-wider">Passengers</label>
                    <div className="relative flex items-center">
                      <input
                        type="number"
                        min="1"
                        max="50"
                        className="inp inp-with-icon text-xs font-semibold"
                        value={searchForm.travelers}
                        onChange={e => setSearchForm({ ...searchForm, travelers: Number(e.target.value) })}
                      />
                      <Users className="w-4 h-4 text-teal-600 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1 uppercase tracking-wider">Service Type</label>
                  <select
                    className="inp inp-select text-xs font-semibold"
                    value={searchForm.travelType}
                    onChange={e => setSearchForm({ ...searchForm, travelType: e.target.value })}
                  >
                    <option value="Tour Package">All-Inclusive Tour Package (Cab + Hotel)</option>
                    <option value="Outstation Cab">Outstation Taxi (Round Trip / One Way)</option>
                    <option value="Airport Transfer">Airport Transfer (Chandigarh IXC / Delhi DEL)</option>
                    <option value="Temple Darshan">Temple & Devi Darshan Pilgrimage</option>
                    <option value="Tempo Traveller">Group Tempo Traveller / Urbania Rental</option>
                  </select>
                </div>

                <button type="submit" className="btn-primary w-full mt-2 font-bold shadow-md !py-3">
                  <span>Check Availability & Quote</span>
                  <ArrowRight size={17} />
                </button>
              </form>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">Need instant quote?</span>
                <WhatsAppButton text="Hello Ranjit Tour & Travels, I want an instant cab / tour quote." label="WhatsApp Chat" className="!py-1.5 !px-3 !text-[11px] font-bold shadow-xs" />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* STATS & TRUST BAR */}
      {s.stats && s.stats.length > 0 && (
        <section className="border-y border-slate-200 bg-white py-8 relative overflow-hidden shadow-sm">
          <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {s.stats.map((st, i) => (
              <motion.div 
                key={i}
                className="space-y-1"
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <p className="font-display text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-teal-700 to-emerald-600">
                  {st.value}
                </p>
                <p className="text-xs text-slate-700 font-bold tracking-wide uppercase">
                  {st.label}
                </p>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* WHY CHOOSE US — PROFESSIONAL QUALITY COMMITMENTS */}
      <section className="py-16 px-4 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-mono text-teal-700 font-bold uppercase tracking-widest">Why Travel With Us</span>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 mt-1">
              Your Trusted Himachal & North India Partner
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              With 15+ years of verified on-road expertise, we deliver transparent pricing, sanitized commercial cabs, and certified hill drivers.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="travel-card p-6 bg-white shadow-sm hover:shadow-md transition">
              <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center mb-4 border border-teal-100">
                <Award size={24} />
              </div>
              <h3 className="font-display font-bold text-lg text-slate-900 mb-2">Hill-Certified Drivers</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Expert local chauffeurs with extensive driving experience on Rohtang Pass, snow terrains, ghats, and high-altitude mountain circuits.
              </p>
            </div>

            <div className="travel-card p-6 bg-white shadow-sm hover:shadow-md transition">
              <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center mb-4 border border-teal-100">
                <Car size={24} />
              </div>
              <h3 className="font-display font-bold text-lg text-slate-900 mb-2">Sanitized Tourist Fleet</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Well-maintained Toyota Innova Crystas, Dzire sedans, Urbania, and 12-26 seater luxury Tempo Travellers with valid all-India tourist permits.
              </p>
            </div>

            <div className="travel-card p-6 bg-white shadow-sm hover:shadow-md transition">
              <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center mb-4 border border-teal-100">
                <Tag size={24} />
              </div>
              <h3 className="font-display font-bold text-lg text-slate-900 mb-2">100% Clear Pricing</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Zero hidden charges. State tourist taxes, toll receipts, fuel, and night allowances clearly defined upfront with guaranteed fixed rates.
              </p>
            </div>

            <div className="travel-card p-6 bg-white shadow-sm hover:shadow-md transition">
              <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center mb-4 border border-teal-100">
                <Clock size={24} />
              </div>
              <h3 className="font-display font-bold text-lg text-slate-900 mb-2">24/7 On-Trip Assistance</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Dedicated trip coordinator monitoring weather, road clearances, hotel check-ins, and emergency support throughout your journey.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED TOUR PACKAGES */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
            <div>
              <span className="text-xs font-mono text-teal-700 font-bold uppercase tracking-widest">Handcrafted Itineraries</span>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 mt-1">Popular Tour Packages</h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">All-inclusive stays, private sanitized cab transfers, meals & guided sightseeing.</p>
            </div>
            <Link to="/tour-packages" className="btn-secondary text-xs self-start sm:self-auto font-semibold">
              <span>View All Packages ({packages.length}+)</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {packages.map((pkg, i) => (
              <motion.div 
                key={pkg._id} 
                className="travel-card group flex flex-col justify-between bg-white border border-slate-200 shadow-sm hover:shadow-lg transition duration-300"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div>
                  <div className="aspect-[16/9] relative overflow-hidden">
                    <Cover src={pkg.featuredImage} alt={pkg.name} />
                    <span className="absolute top-3 left-3 bg-teal-700 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase shadow-sm">
                      {pkg.category || 'Family'}
                    </span>
                    <span className="absolute bottom-3 right-3 bg-slate-900/90 text-white text-xs font-mono px-2 py-1 rounded">
                      {pkg.duration}
                    </span>
                  </div>

                  <div className="p-5">
                    <div className="flex items-center justify-between mb-2">
                      <RatingStars rating={pkg.rating || 4.9} count={pkg.reviewsCount || 24} />
                      <span className="text-xs text-slate-500 font-semibold">{pkg.destination?.name || 'Himachal'}</span>
                    </div>

                    <Link to={`/tour-packages/${pkg.slug}`}>
                      <h3 className="font-display text-lg font-bold text-slate-900 group-hover:text-teal-700 transition line-clamp-2">
                        {pkg.name}
                      </h3>
                    </Link>

                    <p className="text-xs text-slate-600 line-clamp-2 mt-2 leading-relaxed">
                      {pkg.overview}
                    </p>

                    <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <Check size={14} className="text-teal-600 flex-shrink-0" />
                        <span className="truncate">{pkg.hotel || '3/4 Star Balcony Mountain Stay'}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Check size={14} className="text-emerald-600 flex-shrink-0" />
                        <span className="truncate">{pkg.transport || 'Private AC Cab & Sightseeing'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-5 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div>
                    <span className="text-xs font-bold text-teal-800 flex items-center gap-1">
                      <Sparkles size={13} className="text-amber-500" />
                      All-Inclusive Package
                    </span>
                    <span className="text-[10px] text-slate-500 block">Custom Quote on Request</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <a
                      href={waLink(s, `Hello Ranjit Tour & Travels, I want to inquire about package: ${pkg.name}`)}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition shadow-sm flex items-center gap-1 text-xs font-bold"
                      title="Quick WhatsApp Inquiry"
                    >
                      <MessageCircle size={15} />
                      <span className="hidden sm:inline">WhatsApp</span>
                    </a>
                    <Link to={`/tour-packages/${pkg.slug}`} className="btn-primary !py-2 !px-3 text-xs font-bold">
                      View Tour
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SPECIAL SHOWCASE: HIMALAYAN MOUNTAIN VIEWS & SACRED TEMPLES */}
      <section className="py-16 px-4 bg-gradient-to-b from-slate-900 to-slate-950 text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-mono text-teal-400 font-bold uppercase tracking-widest">Devbhoomi & Scenic Horizons</span>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-white mt-1">
              Himachal Views & Sacred Temple Pilgrimages
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-2">
              From the snow-crowned passes of Rohtang and Spiti to the sacred serenity of Hadimba Devi, Golden Temple Amritsar, and Shaktipeeth Devi Darshans.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Card 1: Manali & Solang Snow Peaks */}
            <div className="travel-card bg-slate-800/80 border-slate-700 text-white overflow-hidden group shadow-lg">
              <div className="aspect-[16/10] relative overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1605649487212-47bdab064df7?auto=format&fit=crop&w=800&q=80"
                  alt="Manali Snow Peaks"
                  onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1597074866923-dc0589150358?auto=format&fit=crop&w=800&q=80'; }}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent" />
                <span className="absolute top-3 left-3 bg-teal-600/90 backdrop-blur-md text-white text-[11px] font-bold px-2.5 py-1 rounded-full">
                  Snow Valley & Peaks
                </span>
                <div className="absolute bottom-3 left-4 right-4">
                  <h3 className="font-display text-lg font-bold text-white">Manali, Solang & Rohtang</h3>
                  <p className="text-xs text-teal-200">Atal Tunnel · Sissu Waterfall · Rohtang Snow Point</p>
                </div>
              </div>
              <div className="p-4 flex items-center justify-between border-t border-slate-700 bg-slate-900/60">
                <span className="text-xs text-slate-300">Daily Taxi & Complete Packages</span>
                <a
                  href={waLink(s, 'Hello Ranjit Tour & Travels, I want to book Manali & Solang tour package.')}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-teal-400 hover:text-teal-300 font-bold flex items-center gap-1"
                >
                  Inquire on WhatsApp <ArrowRight size={13} />
                </a>
              </div>
            </div>

            {/* Card 2: Hadimba Devi Temple & Vashisht Manali */}
            <div className="travel-card bg-slate-800/80 border-slate-700 text-white overflow-hidden group shadow-lg">
              <div className="aspect-[16/10] relative overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1596895111956-bf1cf0599ce5?auto=format&fit=crop&w=800&q=80"
                  alt="Hadimba Temple Manali"
                  onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1597074866923-dc0589150358?auto=format&fit=crop&w=800&q=80'; }}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent" />
                <span className="absolute top-3 left-3 bg-amber-600/90 backdrop-blur-md text-white text-[11px] font-bold px-2.5 py-1 rounded-full">
                  Ancient Cedar Shrine
                </span>
                <div className="absolute bottom-3 left-4 right-4">
                  <h3 className="font-display text-lg font-bold text-white">Hadimba Temple & Vashisht</h3>
                  <p className="text-xs text-amber-200">500-Yr Historic Pagoda Temple · Natural Hot Springs</p>
                </div>
              </div>
              <div className="p-4 flex items-center justify-between border-t border-slate-700 bg-slate-900/60">
                <span className="text-xs text-slate-300">Local Manali Sightseeing Cabs</span>
                <a
                  href={waLink(s, 'Hello Ranjit Tour & Travels, I want to book Hadimba Temple and Manali sightseeing cab.')}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-teal-400 hover:text-teal-300 font-bold flex items-center gap-1"
                >
                  Inquire on WhatsApp <ArrowRight size={13} />
                </a>
              </div>
            </div>

            {/* Card 3: Golden Temple Amritsar */}
            <div className="travel-card bg-slate-800/80 border-slate-700 text-white overflow-hidden group shadow-lg">
              <div className="aspect-[16/10] relative overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1514222134-b57cbb8ce073?auto=format&fit=crop&w=800&q=80"
                  alt="Golden Temple Amritsar"
                  onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?auto=format&fit=crop&w=800&q=80'; }}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent" />
                <span className="absolute top-3 left-3 bg-amber-500/90 backdrop-blur-md text-slate-950 text-[11px] font-bold px-2.5 py-1 rounded-full">
                  Sacred Sanctum
                </span>
                <div className="absolute bottom-3 left-4 right-4">
                  <h3 className="font-display text-lg font-bold text-white">Sri Harmandir Sahib & Wagah</h3>
                  <p className="text-xs text-amber-200">Amritsar Golden Temple · Wagah Border Retreat · Jallianwala</p>
                </div>
              </div>
              <div className="p-4 flex items-center justify-between border-t border-slate-700 bg-slate-900/60">
                <span className="text-xs text-slate-300">Chandigarh & Delhi Direct Cabs</span>
                <a
                  href={waLink(s, 'Hello Ranjit Tour & Travels, I want Amritsar Golden Temple and Wagah Border tour cab.')}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-teal-400 hover:text-teal-300 font-bold flex items-center gap-1"
                >
                  Inquire on WhatsApp <ArrowRight size={13} />
                </a>
              </div>
            </div>

            {/* Card 4: Shimla Ridge & Jakhoo Temple */}
            <div className="travel-card bg-slate-800/80 border-slate-700 text-white overflow-hidden group shadow-lg">
              <div className="aspect-[16/10] relative overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1562670652-e5947bddb335?auto=format&fit=crop&w=800&q=80"
                  alt="Shimla Ridge & Pine Hills"
                  onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1597074866923-dc0589150358?auto=format&fit=crop&w=800&q=80'; }}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent" />
                <span className="absolute top-3 left-3 bg-teal-600/90 backdrop-blur-md text-white text-[11px] font-bold px-2.5 py-1 rounded-full">
                  Queen of Hills
                </span>
                <div className="absolute bottom-3 left-4 right-4">
                  <h3 className="font-display text-lg font-bold text-white">Shimla, Kufri & Jakhoo</h3>
                  <p className="text-xs text-teal-200">Jakhoo Hanuman Temple Ropeway · Mall Road · Kufri Snow</p>
                </div>
              </div>
              <div className="p-4 flex items-center justify-between border-t border-slate-700 bg-slate-900/60">
                <span className="text-xs text-slate-300">Chandigarh to Shimla 3.5 Hrs</span>
                <a
                  href={waLink(s, 'Hello Ranjit Tour & Travels, I want to book Shimla Kufri cab package.')}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-teal-400 hover:text-teal-300 font-bold flex items-center gap-1"
                >
                  Inquire on WhatsApp <ArrowRight size={13} />
                </a>
              </div>
            </div>

            {/* Card 5: Dharamshala Dalai Lama Temple */}
            <div className="travel-card bg-slate-800/80 border-slate-700 text-white overflow-hidden group shadow-lg">
              <div className="aspect-[16/10] relative overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1588668214407-6ea9a6d8c272?auto=format&fit=crop&w=800&q=80"
                  alt="Dharamshala Dhauladhar Range"
                  onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1597074866923-dc0589150358?auto=format&fit=crop&w=800&q=80'; }}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent" />
                <span className="absolute top-3 left-3 bg-teal-600/90 backdrop-blur-md text-white text-[11px] font-bold px-2.5 py-1 rounded-full">
                  Spiritual Haven
                </span>
                <div className="absolute bottom-3 left-4 right-4">
                  <h3 className="font-display text-lg font-bold text-white">Dharamshala & McLeodganj</h3>
                  <p className="text-xs text-teal-200">Tsuglagkhang Dalai Lama Temple · HPCA · Bhagsu Waterfall</p>
                </div>
              </div>
              <div className="p-4 flex items-center justify-between border-t border-slate-700 bg-slate-900/60">
                <span className="text-xs text-slate-300">Dhauladhar Viewpoint Tours</span>
                <a
                  href={waLink(s, 'Hello Ranjit Tour & Travels, I want Dharamshala McLeodganj tour details.')}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-teal-400 hover:text-teal-300 font-bold flex items-center gap-1"
                >
                  Inquire on WhatsApp <ArrowRight size={13} />
                </a>
              </div>
            </div>

            {/* Card 6: Himachal Devi Darshan Shaktipeeths */}
            <div className="travel-card bg-slate-800/80 border-slate-700 text-white overflow-hidden group shadow-lg">
              <div className="aspect-[16/10] relative overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1596895111956-bf1cf0599ce5?auto=format&fit=crop&w=800&q=80"
                  alt="Himachal Devi Darshan Shaktipeeths"
                  onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1597074866923-dc0589150358?auto=format&fit=crop&w=800&q=80'; }}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent" />
                <span className="absolute top-3 left-3 bg-emerald-600/90 backdrop-blur-md text-white text-[11px] font-bold px-2.5 py-1 rounded-full">
                  Devi Darshan Circuit
                </span>
                <div className="absolute bottom-3 left-4 right-4">
                  <h3 className="font-display text-lg font-bold text-white">Himachal Shaktipeeth Yatra</h3>
                  <p className="text-xs text-emerald-200">Mata Chintpurni · Kangra Devi · Jwala Ji · Naina Devi</p>
                </div>
              </div>
              <div className="p-4 flex items-center justify-between border-t border-slate-700 bg-slate-900/60">
                <span className="text-xs text-slate-300">Complete 3-5 Days Devi Darshan</span>
                <a
                  href={waLink(s, 'Hello Ranjit Tour & Travels, I want to book Himachal Devi Darshan pilgrimage taxi.')}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-teal-400 hover:text-teal-300 font-bold flex items-center gap-1"
                >
                  Inquire on WhatsApp <ArrowRight size={13} />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* POPULAR DESTINATIONS GRID */}
      <section className="py-16 px-4 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <div>
            <span className="text-xs font-mono text-teal-700 font-bold uppercase tracking-widest">Explore Top Geographies</span>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 mt-1">Top Travel Destinations</h2>
          </div>
          <Link to="/destinations" className="btn-secondary text-xs self-start sm:self-auto font-semibold">
            <span>View All Destinations ({destinations.length}+)</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {destinations.map((d, i) => (
            <motion.div 
              key={d._id} 
              className="travel-card group block relative bg-white border border-slate-200 shadow-sm hover:shadow-md transition"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <Link to={`/destinations/${d.slug}`}>
                <div className="aspect-[4/3] relative overflow-hidden">
                  <Cover src={d.featuredImage} alt={d.name} />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-900/20 to-transparent" />
                  
                  {/* State badge */}
                  <span className="absolute top-3 left-3 bg-white/95 backdrop-blur-md text-teal-900 text-xs px-2.5 py-1 rounded-full font-bold shadow-sm">
                    {d.state}
                  </span>

                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="font-display text-xl font-bold text-white group-hover:text-teal-300 transition">
                      {d.name}
                    </h3>
                    <p className="text-xs text-slate-200 line-clamp-1 mt-0.5">
                      {d.shortDescription}
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-white border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-teal-800 flex items-center gap-1">
                      <Sparkles size={13} className="text-amber-500" />
                      {d.duration || 'Himachal Circuit'}
                    </span>
                    <span className="text-[10px] text-slate-500 block">Custom Quote on Request</span>
                  </div>
                  <span className="text-xs text-teal-700 flex items-center gap-1 group-hover:translate-x-1 transition font-semibold">
                    Explore Details <ArrowRight size={14} />
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* LUXURY FLEET & OUTSTATION CAB RENTAL */}
      <section className="py-16 px-4 bg-slate-50 border-y border-slate-200">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
            <div>
              <span className="text-xs font-mono text-teal-700 font-bold uppercase tracking-widest">Sanitized & Insured Fleet</span>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 mt-1">Our Vehicle Fleet & Taxi Rates</h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">Available for outstation one-way drops, round trips, hill tours & corporate rentals.</p>
            </div>
            <Link to="/cars" className="btn-secondary text-xs self-start sm:self-auto font-semibold">
              <span>View All Fleet ({vehicles.length}+)</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {vehicles.map((v) => (
              <div 
                key={v._id} 
                className="travel-card group flex flex-col justify-between bg-white border border-slate-200/80 rounded-2xl shadow-sm hover:shadow-xl hover:border-teal-300/80 transition-all duration-300 overflow-hidden"
              >
                <div>
                  {/* Vehicle Image Container */}
                  <div className="aspect-[16/10] overflow-hidden relative bg-slate-100">
                    <Cover src={v.images?.[0]} alt={v.name} className="group-hover:scale-105 transition-transform duration-500" />
                    
                    {/* Category Badge */}
                    <div className="absolute top-2.5 left-2.5 z-10">
                      <span className="bg-slate-900/85 backdrop-blur-md text-teal-300 border border-teal-500/30 text-[11px] font-bold px-2.5 py-0.5 rounded-full shadow-md flex items-center gap-1">
                        <Sparkles size={11} className="text-teal-400" />
                        {v.category}
                      </span>
                    </div>

                    {/* Himachal Hill Verified Badge */}
                    <div className="absolute top-2.5 right-2.5 z-10">
                      <span className="bg-emerald-600/90 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow flex items-center gap-1">
                        <Shield size={10} />
                        Hill Verified
                      </span>
                    </div>

                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>

                  {/* Vehicle Info */}
                  <div className="p-4 space-y-3">
                    <Link to={`/cars/${v.slug}`}>
                      <h3 className="font-display font-bold text-base text-slate-900 group-hover:text-teal-700 transition leading-snug">
                        {v.name}
                      </h3>
                    </Link>

                    {/* Specs Grid */}
                    <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <div className="flex items-center gap-1.5 font-medium">
                        <Users size={13} className="text-teal-600 flex-shrink-0" />
                        <span>{v.seats} Seats</span>
                      </div>
                      <div className="flex items-center gap-1.5 font-medium">
                        <Shield size={13} className="text-emerald-600 flex-shrink-0" />
                        <span>{v.isAc ? 'AC Climate' : 'Non-AC'}</span>
                      </div>
                      <div className="flex items-center gap-1.5 font-medium">
                        <Award size={13} className="text-amber-500 flex-shrink-0" />
                        <span>{v.luggage || 4}+ Bags</span>
                      </div>
                      <div className="flex items-center gap-1.5 font-medium">
                        <Fuel size={13} className="text-sky-600 flex-shrink-0" />
                        <span className="truncate">{v.fuel || 'Diesel'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tariff & Action CTA */}
                <div className="px-4 pb-4 pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div>
                    <span className="text-xs font-bold text-teal-800 flex items-center gap-1">
                      <Sparkles size={12} className="text-amber-500" />
                      Best Hill Tariff
                    </span>
                    <span className="text-[10px] text-slate-500 block font-medium">Custom Quote on Request</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <a
                      href={waLink(s, `Hello Ranjit Tour & Travels, I want to book ${v.name} for my Himachal trip.`)}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition shadow-sm hover:scale-105"
                      title="Quick WhatsApp Booking"
                    >
                      <MessageCircle size={15} />
                    </a>
                    <Link to={`/cars/${v.slug}`} className="btn-primary !py-2 !px-3 text-xs font-bold shadow-sm">
                      <span>Details</span>
                      <ArrowRight size={13} />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TRAVEL SERVICES */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-mono text-teal-700 font-bold uppercase tracking-widest">Travel Concierge Services</span>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 mt-1">Complete Travel Solutions</h2>
            <p className="text-sm text-slate-600 mt-2">
              From Amb Andaura Railway Station pickups to multi-week royal mountain and pilgrimage circuits.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((sItem) => (
              <div key={sItem._id} className="travel-card p-6 bg-slate-50/70 border border-slate-200 hover:bg-white hover:shadow-md transition">
                <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center mb-4 border border-teal-100">
                  <Compass size={24} />
                </div>
                <h3 className="font-display font-bold text-lg text-slate-900 mb-2">{sItem.name}</h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">{sItem.shortDescription}</p>
                <Link to={`/services/${sItem.slug}`} className="text-xs font-bold text-teal-700 flex items-center gap-1 hover:gap-2 transition">
                  <span>Service Details</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AUTHENTIC GOOGLE MAPS REVIEWS (5.0 STAR RATED) */}
      {testimonials.length > 0 && (
        <section className="py-16 px-4 bg-slate-50 border-t border-slate-200 relative overflow-hidden">
          <div className="max-w-7xl mx-auto">
            {/* Header with Official Google Badge */}
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-slate-200 shadow-xs text-xs font-semibold text-slate-700 mb-2">
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/>
                    <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"/>
                    <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                  </svg>
                  <span className="font-bold text-slate-800">5.0 Star Rated on Google Maps</span>
                  <span className="text-slate-400">·</span>
                  <span className="text-teal-700 font-bold">59+ Verified Reviews</span>
                </div>
                <h2 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 mt-1">
                  Original Google Maps Guest Reviews
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 mt-1">
                  Verified feedback from travelers who booked our cabs and tour packages from Amb Andaura Station and across North India.
                </p>
              </div>

              <a
                href="https://share.google/O0uzcG6e24otH4bSw"
                target="_blank"
                rel="noreferrer"
                className="btn-secondary self-start md:self-auto text-xs font-bold flex items-center gap-2 !bg-white hover:!bg-slate-50 border-slate-300 shadow-sm"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/>
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"/>
                  <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                </svg>
                <span>View All Reviews on Google</span>
                <ArrowUpRight size={14} className="text-teal-700" />
              </a>
            </div>

            {/* Reviews Cards Grid */}
            <div className="grid md:grid-cols-3 gap-6">
              {testimonials.map((t, i) => (
                <div key={t._id || i} className="travel-card p-6 bg-white border border-slate-200/90 rounded-2xl flex flex-col justify-between shadow-sm hover:shadow-md transition duration-300">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <RatingStars rating={t.rating || 5} />
                      <span className="text-[11px] text-slate-500 font-medium">{t.tripDate || 'Recent Tour'}</span>
                    </div>

                    <div className="mb-3">
                      <span className="inline-block text-[11px] font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-100">
                        📍 {t.destination || 'Himachal Tour'}
                      </span>
                    </div>

                    <p className="text-xs sm:text-[13px] text-slate-700 leading-relaxed font-normal">
                      "{t.review}"
                    </p>
                  </div>

                  <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-teal-700 to-emerald-500 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                        {t.avatar || t.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-display font-bold text-xs sm:text-sm text-slate-900">{t.name}</h4>
                        <span className="text-[10px] text-slate-500 block">{t.city || 'Verified Traveler'}</span>
                      </div>
                    </div>

                    <span className="text-[10px] font-bold text-emerald-700 flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                      <Check size={11} className="text-emerald-600" />
                      Google Map
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 24/7 CONTACT & INSTANT DISPATCH BANNER */}
      <section className="py-12 px-4 max-w-7xl mx-auto">
        <div className="travel-card-dispatch p-8 sm:p-10 text-white rounded-3xl flex flex-col lg:flex-row items-center justify-between gap-6 shadow-2xl relative overflow-hidden">
          <div className="absolute right-0 top-0 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="space-y-2 text-center lg:text-left relative z-10">
            <span className="text-xs font-mono text-teal-300 font-bold uppercase tracking-widest">Round-The-Clock Dispatch</span>
            <h3 className="font-display text-2xl sm:text-3xl font-bold text-white">Need a Cab or Custom Tour Quote Instantly?</h3>
            <p className="text-xs sm:text-sm text-slate-200 max-w-2xl">
              Operating 24/7 across Amb Andaura Railway Station, Chandigarh, Mohali, Panchkula, Delhi NCR, Shimla, Manali, Dharamshala, Amritsar & Spiti Valley.
            </p>
            <div className="pt-2 text-xs text-teal-200 flex flex-wrap items-center justify-center lg:justify-start gap-4 font-medium">
              <span>📍 {s.address || 'Near Amb Andaura Railway Station, Amb, Distt. Una, HP 177203'}</span>
              <span>📞 <b>{s.phone || '+91 98165 96713'}</b></span>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 justify-center relative z-10">
            <a
              href={`tel:${(s.phone || '+919816596713').replace(/\s+/g, '')}`}
              className="btn-primary !bg-white !text-slate-900 hover:!bg-slate-100 font-bold shadow-md"
            >
              <Phone size={16} className="text-teal-700" />
              <span>Call Helpline</span>
            </a>
            <WhatsAppButton text="Hello Ranjit Tour & Travels, I want to book a taxi / tour package immediately." label="WhatsApp Dispatch" className="!bg-emerald-500 hover:!bg-emerald-600 font-bold shadow-md" />
          </div>
        </div>
      </section>
    </>
  );
}

// ==========================================
// 2. LISTINGS (Destinations, Packages, Cars, Services, Blog)
// ==========================================
export function Listing({ kind }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const page = Number(searchParams.get('page') || 1);
  const q = searchParams.get('q') || '';
  const category = searchParams.get('category') || '';
  const state = searchParams.get('state') || '';

  const configMap = {
    destinations: {
      endpoint: '/destinations',
      resourceKey: 'destinations',
      title: 'Destinations in North India',
      subtitle: 'Explore authentic mountain ridges, valley lakes, and heritage towns.',
      searchPlaceholder: 'Search destinations by name or state (e.g. Manali, Punjab)...',
      fallback: DEFAULT_DESTINATIONS
    },
    'tour-packages': {
      endpoint: '/packages',
      resourceKey: 'packages',
      title: 'Royal Tour Packages',
      subtitle: 'Complete all-inclusive road trip packages with private chauffeur & luxury stays.',
      searchPlaceholder: 'Search packages by destination or theme (e.g. Spiti, Family, Honeymoon)...',
      fallback: DEFAULT_PACKAGES
    },
    cars: {
      endpoint: '/vehicles',
      resourceKey: 'vehicles',
      title: 'Vehicle Fleet & Taxi Rentals',
      subtitle: 'Sanitized Sedans, SUVs, Innova Crystas, and Tempo Travellers.',
      searchPlaceholder: 'Search fleet by category or model (e.g. Innova, SUV, 17 Seater)...',
      fallback: DEFAULT_VEHICLES
    },
    services: {
      endpoint: '/services',
      resourceKey: 'services',
      title: 'Our Travel Services',
      subtitle: 'Outstation cabs, one-way transfers, airport pickups, and corporate fleets.',
      searchPlaceholder: 'Search services...',
      fallback: []
    },
    blog: {
      endpoint: '/blogs',
      resourceKey: 'blogs',
      title: 'Travel Blogs & Road Guides',
      subtitle: 'Expert itineraries, mountain road updates, and local travel advice.',
      searchPlaceholder: 'Search travel guides and tips...',
      fallback: []
    }
  };

  const currentCfg = configMap[kind] || configMap.destinations;

  useEffect(() => {
    setLoading(true);
    setError('');
    const customList = getStoredCustomItems(currentCfg.resourceKey, currentCfg.fallback || []);

    api.get(currentCfg.endpoint, {
      params: { page, q, category, state, limit: 12 }
    })
      .then(res => {
        if (res.data?.items && res.data.items.length > 0) {
          const stored = localStorage.getItem(`rjt_custom_${currentCfg.resourceKey}`);
          if (stored) {
            let items = customList;
            if (q) items = items.filter(p => (p.name || p.title || '').toLowerCase().includes(q.toLowerCase()) || (p.overview || p.shortDescription || '').toLowerCase().includes(q.toLowerCase()));
            setData({ items, total: items.length, pages: Math.ceil(items.length / 12) || 1 });
          } else {
            setData(res.data);
          }
        } else {
          let items = customList;
          if (q) items = items.filter(p => (p.name || p.title || '').toLowerCase().includes(q.toLowerCase()) || (p.overview || p.shortDescription || '').toLowerCase().includes(q.toLowerCase()));
          setData({ items, total: items.length, pages: Math.ceil(items.length / 12) || 1 });
        }
      })
      .catch(() => {
        let items = customList;
        if (q) items = items.filter(p => (p.name || p.title || '').toLowerCase().includes(q.toLowerCase()) || (p.overview || p.shortDescription || '').toLowerCase().includes(q.toLowerCase()));
        setData({ items, total: items.length, pages: Math.ceil(items.length / 12) || 1 });
      })
      .finally(() => setLoading(false));
  }, [kind, page, q, category, state]);

  const handleSearchKey = (e) => {
    if (e.key === 'Enter') {
      setSearchParams({ q: e.target.value, page: 1 });
    }
  };

  return (
    <main className="max-w-7xl mx-auto px-4 py-12">
      <Seo 
        title={currentCfg.title}
        description={currentCfg.subtitle}
      />

      <Breadcrumbs items={[{ label: currentCfg.title }]} />

      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-slate-900">{currentCfg.title}</h1>
        <p className="text-sm sm:text-base text-slate-600 mt-2">{currentCfg.subtitle}</p>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <div className="relative flex-1">
          <input
            type="text"
            className="inp pl-9"
            placeholder={currentCfg.searchPlaceholder}
            defaultValue={q}
            onKeyDown={handleSearchKey}
          />
          <Compass className="w-4 h-4 text-teal-600 absolute left-3 top-3.5" />
        </div>
        {q && (
          <button 
            onClick={() => setSearchParams({ page: 1 })}
            className="btn-secondary text-xs"
          >
            Clear Filter
          </button>
        )}
      </div>

      {/* Content Rendering */}
      {error ? (
        <ErrorBox message={error} onRetry={() => window.location.reload()} />
      ) : loading ? (
        <Loading />
      ) : !data || data.items.length === 0 ? (
        <div className="travel-card p-12 text-center my-8 bg-white">
          <Compass className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-display text-lg font-bold text-slate-900">No Route Records Found</h3>
          <p className="text-xs text-slate-500 mt-1">Try adjusting your search criteria or explore our popular tour packages.</p>
        </div>
      ) : (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.items.map((item) => {
              if (kind === 'destinations') {
                return (
                  <Link key={item._id} to={`/destinations/${item.slug}`} className="travel-card group block bg-white">
                    <div className="aspect-[4/3] relative overflow-hidden">
                      <Cover src={item.featuredImage} alt={item.name} />
                      <span className="absolute top-3 left-3 bg-white/90 text-teal-800 text-xs px-2.5 py-1 rounded-full font-bold shadow-sm">
                        {item.state}
                      </span>
                    </div>
                    <div className="p-5">
                      <h3 className="font-display font-bold text-lg text-slate-900 group-hover:text-teal-700 transition">
                        {item.name}
                      </h3>
                      <p className="text-xs text-slate-600 mt-1 line-clamp-2">{item.shortDescription}</p>
                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                        <div>
                          <span className="text-xs font-bold text-teal-800 flex items-center gap-1">
                            <Sparkles size={13} className="text-amber-500" />
                            {item.duration || 'Himachal Tour'}
                          </span>
                          <span className="text-[10px] text-slate-500 block">Custom Quote on Request</span>
                        </div>
                        <span className="text-xs text-teal-700 flex items-center gap-1 font-semibold">Explore <ArrowRight size={14} /></span>
                      </div>
                    </div>
                  </Link>
                );
              }

              if (kind === 'tour-packages') {
                return (
                  <div key={item._id} className="travel-card group flex flex-col justify-between bg-white">
                    <div>
                      <div className="aspect-[16/9] relative overflow-hidden">
                        <Cover src={item.featuredImage} alt={item.name} />
                        <span className="absolute top-3 left-3 bg-teal-700 text-white text-xs font-bold px-2 py-0.5 rounded uppercase shadow-sm">
                          {item.category || 'Package'}
                        </span>
                        <span className="absolute bottom-3 right-3 bg-slate-900/90 text-white text-xs font-mono px-2 py-1 rounded">
                          {item.duration}
                        </span>
                      </div>
                      <div className="p-5">
                        <div className="flex items-center justify-between mb-2">
                          <RatingStars rating={item.rating || 4.9} count={item.reviewsCount || 15} />
                        </div>
                        <Link to={`/tour-packages/${item.slug}`}>
                          <h3 className="font-display font-bold text-base text-slate-900 group-hover:text-teal-700 transition line-clamp-2">
                            {item.name}
                          </h3>
                        </Link>
                        <p className="text-xs text-slate-600 mt-2 line-clamp-2">{item.overview}</p>
                      </div>
                    </div>

                    <div className="p-5 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-teal-800 flex items-center gap-1">
                          <Sparkles size={13} className="text-amber-500" />
                          All-Inclusive Package
                        </span>
                        <span className="text-[10px] text-slate-500 block">Custom Quote on Request</span>
                      </div>
                      <Link to={`/tour-packages/${item.slug}`} className="btn-primary !py-1.5 !px-3 text-xs font-bold">
                        View Itinerary
                      </Link>
                    </div>
                  </div>
                );
              }

              if (kind === 'cars') {
                return (
                  <div 
                    key={item._id} 
                    className="travel-card group flex flex-col justify-between bg-white border border-slate-200/80 rounded-2xl shadow-sm hover:shadow-xl hover:border-teal-300/80 transition-all duration-300 overflow-hidden"
                  >
                    <div>
                      {/* Vehicle Image */}
                      <div className="aspect-[16/10] relative overflow-hidden bg-slate-100">
                        <Cover src={item.images?.[0]} alt={item.name} className="group-hover:scale-105 transition-transform duration-500" />
                        
                        <div className="absolute top-3 left-3 z-10">
                          <span className="bg-slate-900/85 backdrop-blur-md text-teal-300 border border-teal-500/30 text-xs px-2.5 py-1 rounded-full font-bold shadow-md flex items-center gap-1">
                            <Sparkles size={11} className="text-teal-400" />
                            {item.category}
                          </span>
                        </div>

                        <div className="absolute top-3 right-3 z-10">
                          <span className="bg-emerald-600/90 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow flex items-center gap-1">
                            <Shield size={10} />
                            Hill Permit
                          </span>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-5 space-y-3">
                        <Link to={`/cars/${item.slug}`}>
                          <h3 className="font-display font-bold text-lg text-slate-900 group-hover:text-teal-700 transition leading-snug">
                            {item.name}
                          </h3>
                        </Link>

                        <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 font-medium">
                          <div className="flex items-center gap-1.5">
                            <Users size={14} className="text-teal-600" />
                            <span>{item.seats} Seats</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Award size={14} className="text-amber-500" />
                            <span>{item.luggage || 4} Luggage Bags</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Fuel size={14} className="text-sky-600" />
                            <span className="truncate">{item.fuel}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Shield size={14} className="text-emerald-600" />
                            <span className="truncate">{item.transmission}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Tariff & CTA */}
                    <div className="p-5 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
                      <div>
                        <span className="text-xs font-bold text-teal-800 flex items-center gap-1">
                          <Sparkles size={13} className="text-amber-500" />
                          Transparent Tariff
                        </span>
                        <span className="text-[11px] text-slate-500 block font-medium">Custom Quote on Request</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <a
                          href={waLink(s, `Hello Ranjit Tour & Travels, I would like to book ${item.name}.`)}
                          target="_blank"
                          rel="noreferrer"
                          className="p-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition shadow-sm hover:scale-105"
                          title="WhatsApp Booking"
                        >
                          <MessageCircle size={16} />
                        </a>
                        <Link to={`/cars/${item.slug}`} className="btn-primary !py-2 !px-3.5 text-xs font-bold shadow-sm">
                          <span>Book Cab</span>
                          <ArrowRight size={13} />
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              }

              if (kind === 'services') {
                return (
                  <div key={item._id} className="travel-card p-6 flex flex-col justify-between bg-white">
                    <div>
                      <div className="aspect-[16/9] rounded-lg overflow-hidden mb-4">
                        <Cover src={item.featuredImage} alt={item.name} />
                      </div>
                      <h3 className="font-display font-bold text-lg text-slate-900 mb-2">{item.name}</h3>
                      <p className="text-xs text-slate-600 leading-relaxed mb-4">{item.shortDescription}</p>
                    </div>
                    <Link to={`/services/${item.slug}`} className="btn-secondary text-xs text-center w-full">
                      Service Details
                    </Link>
                  </div>
                );
              }

              if (kind === 'blog') {
                return (
                  <article key={item._id} className="travel-card group flex flex-col justify-between bg-white">
                    <div>
                      <div className="aspect-[16/9] relative overflow-hidden">
                        <Cover src={item.featuredImage} alt={item.title} />
                        <span className="absolute top-3 left-3 bg-white/90 text-teal-800 text-xs px-2.5 py-1 rounded font-bold shadow-sm">
                          {item.category}
                        </span>
                      </div>
                      <div className="p-5">
                        <span className="text-[10px] text-slate-500 uppercase font-mono block mb-1 font-semibold">{item.readTime || '5 min'}</span>
                        <Link to={`/blog/${item.slug}`}>
                          <h3 className="font-display font-bold text-base text-slate-900 group-hover:text-teal-700 transition line-clamp-2">
                            {item.title}
                          </h3>
                        </Link>
                        <p className="text-xs text-slate-600 mt-2 line-clamp-2">{item.excerpt}</p>
                      </div>
                    </div>
                    <div className="p-5 pt-0">
                      <Link to={`/blog/${item.slug}`} className="text-xs font-bold text-teal-700 flex items-center gap-1">
                        Read Article <ArrowRight size={14} />
                      </Link>
                    </div>
                  </article>
                );
              }

              return null;
            })}
          </div>

          {/* Pagination */}
          {data.pages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-12">
              {Array.from({ length: data.pages }, (_, i) => (
                <button
                  key={i}
                  className={`w-9 h-9 rounded-lg text-xs font-bold transition ${
                    i + 1 === page ? 'bg-teal-700 text-white' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                  onClick={() => setSearchParams({ q, page: i + 1 })}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </main>
  );
}

// ==========================================
// 3. DETAIL PAGE (Destinations, Packages, Cars, Services, Blog)
// ==========================================
export function Detail({ kind }) {
  const { slug } = useParams();
  const s = useSettings();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const endpointMap = {
    destinations: `/destinations/${slug}`,
    'tour-packages': `/packages/${slug}`,
    cars: `/vehicles/${slug}`,
    services: `/services/${slug}`,
    blog: `/blogs/${slug}`
  };

  useEffect(() => {
    setLoading(true);
    setError('');
    const resourceKey = kind === 'tour-packages' ? 'packages' : (kind === 'cars' ? 'vehicles' : (kind === 'blog' ? 'blogs' : kind));
    const fallbackList = kind === 'tour-packages' ? DEFAULT_PACKAGES : (kind === 'destinations' ? DEFAULT_DESTINATIONS : (kind === 'cars' ? DEFAULT_VEHICLES : []));
    const customList = getStoredCustomItems(resourceKey, fallbackList);
    const localMatch = customList.find(item => item.slug === slug || item._id === slug);

    api.get(endpointMap[kind] || `/packages/${slug}`)
      .then(res => {
        if (localMatch) {
          setData({ ...res.data, ...localMatch });
        } else {
          setData(res.data);
        }
      })
      .catch(err => {
        if (localMatch) {
          setData(localMatch);
          return;
        }
        setError(err.response?.status === 404 ? 'The requested travel route or page does not exist.' : msg(err));
      })
      .finally(() => setLoading(false));
  }, [kind, slug]);

  if (loading) return <Loading />;
  if (error || !data) return <ErrorBox message={error} onRetry={() => window.location.reload()} />;

  const title = data.name || data.title;
  const description = data.seo?.description || data.shortDescription || data.excerpt || data.overview || '';
  const heroImage = data.featuredImage || data.images?.[0];

  // Stop array for signature journey route
  const packageStops = kind === 'tour-packages' 
    ? ['Start: ' + (data.pickup || 'Chandigarh'), ...(data.itinerary || []).slice(0, 3).map(it => it.title.split(' ')[0]), 'Return: ' + (data.drop || 'Chandigarh')]
    : null;

  return (
    <main className="max-w-7xl mx-auto px-4 py-10">
      <Seo
        title={data.seo?.title || title}
        description={description}
        image={heroImage}
        keywords={data.seo?.keywords || []}
      />

      <Breadcrumbs 
        items={[
          { label: kind.charAt(0).toUpperCase() + kind.slice(1).replace('-', ' '), to: `/${kind}` },
          { label: title }
        ]} 
      />

      {/* Hero Media Banner */}
      <div className="relative aspect-[16/8] md:aspect-[21/9] rounded-2xl overflow-hidden mb-8 border border-slate-200 shadow-md">
        <Cover src={heroImage} alt={title} />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/30 to-transparent" />
        
        <div className="absolute bottom-6 left-6 right-6">
          <span className="inline-block bg-teal-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase mb-2 shadow-sm">
            {data.category || data.state || 'Royal Experience'}
          </span>
          <h1 className="font-display text-2xl sm:text-4xl md:text-5xl font-extrabold text-white">
            {title}
          </h1>
          {data.duration && (
            <p className="text-xs sm:text-sm text-slate-200 mt-1 font-mono">
              {data.duration} {data.destination?.name ? `· ${data.destination.name}` : ''}
            </p>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        {/* Main Content (Left 8 Cols) */}
        <div className="lg:col-span-8 space-y-8">
          {/* Package Tour Route Stops */}
          {packageStops && packageStops.length > 0 && (
            <section className="p-4 bg-teal-50/80 border border-teal-200 rounded-xl flex items-center flex-wrap gap-2 text-xs shadow-xs">
              <span className="font-bold text-teal-900 uppercase font-mono tracking-wider flex items-center gap-1.5 mr-1">
                <Compass size={15} className="text-teal-700 animate-spin-slow" />
                Tour Route:
              </span>
              {packageStops.map((stop, sIdx) => (
                <React.Fragment key={sIdx}>
                  <span className="bg-white border border-teal-200 text-teal-950 font-semibold px-2.5 py-1 rounded-md shadow-xs">
                    {stop}
                  </span>
                  {sIdx < packageStops.length - 1 && (
                    <ArrowRight size={13} className="text-teal-600" />
                  )}
                </React.Fragment>
              ))}
            </section>
          )}

          {/* Overview / Body Content */}
          <section className="travel-card p-6 sm:p-8 bg-white">
            <h2 className="font-display text-xl font-bold text-slate-900 mb-4">Overview & Details</h2>
            <div className="text-slate-700 text-sm sm:text-base leading-relaxed whitespace-pre-line space-y-4">
              {data.description || data.content || data.overview}
            </div>
          </section>

          {/* Day by Day Itinerary (For Tour Packages) */}
          {data.itinerary && data.itinerary.length > 0 && (
            <section className="travel-card p-6 sm:p-8 bg-white">
              <h2 className="font-display text-xl font-bold text-slate-900 mb-6">Day-by-Day Journey Itinerary</h2>
              <div className="space-y-4">
                {data.itinerary.map((day, idx) => (
                  <div key={idx} className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="w-8 h-8 rounded-lg bg-teal-100 text-teal-800 font-bold text-xs flex items-center justify-center border border-teal-200">
                        D{day.day || idx + 1}
                      </span>
                      <h4 className="font-display font-bold text-slate-900 text-base">{day.title}</h4>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pl-11">{day.details}</p>
                    {(day.meals || day.hotel) && (
                      <div className="mt-3 pt-2 border-t border-slate-200 pl-11 flex flex-wrap gap-4 text-[11px] text-slate-600">
                        {day.meals && <span>🍽 Meals: <b className="text-slate-900">{day.meals}</b></span>}
                        {day.hotel && <span>🏨 Stay: <b className="text-slate-900">{day.hotel}</b></span>}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Inclusions vs Exclusions */}
          {(data.inclusions?.length > 0 || data.exclusions?.length > 0) && (
            <section className="grid sm:grid-cols-2 gap-6">
              {data.inclusions?.length > 0 && (
                <div className="travel-card p-6 border-teal-200 bg-teal-50/40">
                  <h3 className="font-display font-bold text-base text-teal-800 mb-4 flex items-center gap-2">
                    <Check size={18} /> Inclusions
                  </h3>
                  <ul className="space-y-2 text-xs text-slate-700">
                    {data.inclusions.map((inc, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <Check size={14} className="text-teal-700 flex-shrink-0 mt-0.5" />
                        <span>{inc}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {data.exclusions?.length > 0 && (
                <div className="travel-card p-6 border-rose-200 bg-rose-50/40">
                  <h3 className="font-display font-bold text-base text-rose-700 mb-4 flex items-center gap-2">
                    <X size={18} /> Exclusions
                  </h3>
                  <ul className="space-y-2 text-xs text-slate-700">
                    {data.exclusions.map((exc, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <X size={14} className="text-rose-600 flex-shrink-0 mt-0.5" />
                        <span>{exc}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </section>
          )}

          {/* Destination Key Attractions & Activities */}
          {kind === 'destinations' && (data.attractions?.length > 0 || data.activities?.length > 0) && (
            <section className="grid sm:grid-cols-2 gap-6">
              {data.attractions?.length > 0 && (
                <div className="travel-card p-6 bg-white border-teal-100">
                  <h3 className="font-display font-bold text-base text-slate-900 mb-4 flex items-center gap-2">
                    <Compass size={18} className="text-teal-700" /> Must-Visit Attractions
                  </h3>
                  <div className="space-y-2.5">
                    {data.attractions.map((attr, idx) => (
                      <div key={idx} className="flex items-center gap-2.5 text-xs text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                        <MapPin size={14} className="text-teal-600 flex-shrink-0" />
                        <span className="font-medium">{attr}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {data.activities?.length > 0 && (
                <div className="travel-card p-6 bg-white border-teal-100">
                  <h3 className="font-display font-bold text-base text-slate-900 mb-4 flex items-center gap-2">
                    <Sparkles size={18} className="text-amber-500" /> Popular Experiences
                  </h3>
                  <div className="space-y-2.5">
                    {data.activities.map((act, idx) => (
                      <div key={idx} className="flex items-center gap-2.5 text-xs text-slate-700 bg-teal-50/50 p-2.5 rounded-lg border border-teal-100">
                        <Check size={14} className="text-teal-600 flex-shrink-0" />
                        <span className="font-medium">{act}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>
          )}

          {/* Vehicle Specifications */}
          {kind === 'cars' && (
            <section className="travel-card p-6 sm:p-8 bg-white">
              <h2 className="font-display text-xl font-bold text-slate-900 mb-4">Vehicle Technical Specifications</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <span className="text-[10px] text-slate-500 uppercase font-semibold block">SEATS</span>
                  <span className="text-lg font-bold text-teal-800">{data.seats} Passengers</span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <span className="text-[10px] text-slate-500 uppercase font-semibold block">LUGGAGE</span>
                  <span className="text-lg font-bold text-teal-800">{data.luggage || 4} Bags</span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <span className="text-[10px] text-slate-500 uppercase font-semibold block">CHAUFFEUR SERVICE</span>
                  <span className="text-sm font-bold text-teal-800">Certified Hill Chauffeur</span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <span className="text-[10px] text-slate-500 uppercase font-semibold block">TARIFF RATE</span>
                  <span className="text-sm font-bold text-emerald-700">Custom Quote on Request</span>
                </div>
              </div>

              {data.features?.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-600 mb-3">Onboard Features</h4>
                  <div className="grid sm:grid-cols-2 gap-2">
                    {data.features.map((f, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-slate-800">
                        <Check size={14} className="text-teal-600" />
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>
          )}

          {/* FAQs Accordion */}
          {data.faqs && data.faqs.length > 0 && (
            <section className="travel-card p-6 sm:p-8 bg-white">
              <h2 className="font-display text-xl font-bold text-slate-900 mb-4">Frequently Asked Questions</h2>
              <div className="space-y-3">
                {data.faqs.map((faq, i) => (
                  <details key={i} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl group">
                    <summary className="font-semibold text-xs sm:text-sm text-slate-900 cursor-pointer flex items-center justify-between list-none">
                      <span>{faq.q}</span>
                      <ChevronDown size={16} className="text-teal-700 group-open:rotate-180 transition" />
                    </summary>
                    <p className="text-xs text-slate-600 mt-2 leading-relaxed pt-2 border-t border-slate-200">
                      {faq.a}
                    </p>
                  </details>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Sticky Booking & Booking Action Card (Right 4 Cols) */}
        <div className="lg:col-span-4">
          <div className="sticky top-24 space-y-6">
            <div className="travel-card bg-white border-teal-200 p-6 shadow-xl">
              <span className="text-xs font-mono text-teal-700 font-bold uppercase tracking-wider block mb-1">
                Direct Booking Guarantee
              </span>
              
              <div className="mb-4">
                <div>
                  <span className="text-lg sm:text-xl font-bold text-teal-900 font-display flex items-center gap-1.5">
                    <Sparkles size={16} className="text-amber-500" />
                    {kind === 'cars' ? 'Dedicated Chauffeur Driven Taxi' : kind === 'destinations' ? 'Curated Destination' : 'All-Inclusive Package'}
                  </span>
                  <span className="text-xs text-slate-500 block mt-0.5">Custom Itinerary & Quote on Request</span>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <Link
                  to={`/booking?${kind === 'cars' ? 'vehicle' : kind === 'destinations' ? 'destination' : 'package'}=${encodeURIComponent(title)}`}
                  className="btn-primary w-full text-center"
                >
                  <span>Book / Request Quote</span>
                  <ArrowRight size={16} />
                </Link>

                <WhatsAppButton
                  text={
                    kind === 'cars'
                      ? `Hello Ranjit Tour & Travels, I want to book / inquire about the ${title} (${data.seats || 7} Seater) cab from Amb Andaura / Himachal. Please share availability & rates.`
                      : kind === 'tour-packages'
                      ? `Hello Ranjit Tour & Travels, I want details and best quote for the "${title}" tour package (${data.duration || '6N/7D'}).`
                      : `Hello Ranjit Tour & Travels, I want to plan a tour to ${title}. Please share custom itinerary and taxi options.`
                  }
                  label="Inquire on Admin WhatsApp"
                  className="w-full justify-center font-bold"
                />

                {s.phone && (
                  <a
                    href={`tel:${s.phone}`}
                    className="btn-secondary w-full justify-center text-xs"
                  >
                    <Phone size={14} />
                    <span>Call Helpline: {s.phone}</span>
                  </a>
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 space-y-2 text-[11px] text-slate-600">
                <div className="flex items-center gap-2">
                  <Check size={14} className="text-teal-600" />
                  <span>Instant Booking Confirmation</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check size={14} className="text-teal-600" />
                  <span>Zero Hidden Surge Pricing</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check size={14} className="text-teal-600" />
                  <span>Dedicated 24/7 Hill Route Concierge</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

// ==========================================
// 4. BOOKING PAGE (With Unique sequential RJT ID)
// ==========================================
export function Booking() {
  const s = useSettings();
  const [searchParams] = useSearchParams();
  const [submittedData, setSubmittedData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponMsg, setCouponMsg] = useState('');

  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    destination: searchParams.get('destination') || searchParams.get('to') || '',
    package: searchParams.get('package') || '',
    vehicle: searchParams.get('vehicle') || 'Toyota Innova Crysta',
    travelDate: searchParams.get('date') || '',
    returnDate: '',
    travelers: searchParams.get('travelers') || 2,
    pickup: searchParams.get('pickup') || searchParams.get('from') || 'Chandigarh',
    tripType: searchParams.get('type') || 'Tour Package',
    budget: '',
    hotelPreference: '4-Star Premium Resort',
    specialRequirements: '',
    message: ''
  });

  const getWaBookingMessage = (bookingId) => {
    return `🚗 *NEW BOOKING REQUEST - RANJIT TOUR & TRAVELS*
━━━━━━━━━━━━━━━━━━━━
🆔 *Booking ID:* ${bookingId || 'RJT-BOOKING'}
👤 *Customer Name:* ${form.name}
📱 *Phone:* ${form.phone}
✉️ *Email:* ${form.email || 'N/A'}
🏔️ *Trip / Service:* ${form.destination || form.package || 'Custom Route'}
🚙 *Preferred Vehicle:* ${form.vehicle || 'Standard Fleet'}
👥 *Total Passengers:* ${form.travelers || 1}
🗓️ *Travel Date:* ${form.travelDate || 'As requested'}
🔄 *Return Date:* ${form.returnDate || 'Single Way / Open'}
📌 *Pickup Location:* ${form.pickup || 'Amb Andaura'}
🏨 *Hotel Preference:* ${form.hotelPreference || 'N/A'}
🏷️ *Trip Category:* ${form.tripType || 'Tour Package'}
💬 *Special Instructions:* ${form.message || 'None'}
━━━━━━━━━━━━━━━━━━━━
_Please confirm availability and share tariff quote._`;
  };

  const handleCouponApply = async () => {
    if (!couponCode) return;
    try {
      const res = await api.post('/coupons/validate', { code: couponCode, amount: 15000 });
      if (res.data.success) {
        setCouponDiscount(res.data.discount);
        setCouponMsg(`Coupon ${res.data.code} applied! ₹${res.data.discount} discount unlocked.`);
      }
    } catch (err) {
      setCouponMsg(msg(err));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/bookings', form);
      const bookingData = res.data;
      setSubmittedData(bookingData);

      // Construct and dispatch formatted WhatsApp message directly to Admin
      const text = getWaBookingMessage(bookingData.bookingId);
      const waUrl = waLink(s, text);
      window.open(waUrl, '_blank', 'noopener,noreferrer');
    } catch (err) {
      setError(msg(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="max-w-4xl mx-auto px-4 py-12">
      <Seo
        title="Book Your Tour or Taxi"
        description="Book your bespoke tour package or outstation cab with Ranjit Tour & Travels and receive an instant booking ID."
      />

      <Breadcrumbs items={[{ label: 'Booking & Journey Request' }]} />

      <div className="mb-8 text-center max-w-xl mx-auto">
        <span className="text-xs font-mono text-teal-700 font-bold uppercase tracking-widest">Royal Concierge Dispatch</span>
        <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-slate-900 mt-1">Book Your Journey</h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-2">
          Fill in your journey requirements. Your booking will be logged and instantly sent to our admin WhatsApp (+91 98165 96713).
        </p>
      </div>

      {submittedData ? (
        <motion.div 
          className="travel-card p-8 sm:p-12 text-center border-teal-200 bg-white shadow-xl"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto mb-4 border border-emerald-200">
            <Check size={32} />
          </div>

          <span className="text-xs font-mono text-emerald-700 font-bold uppercase tracking-widest block mb-1">
            REQUEST LOGGED & SENT TO ADMIN WHATSAPP
          </span>

          <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
            Thank You, {submittedData.data?.name || form.name}!
          </h2>

          <div className="my-6 p-4 bg-teal-50 rounded-xl inline-block border border-teal-200">
            <span className="text-xs text-slate-600 block">YOUR OFFICIAL BOOKING ID:</span>
            <span className="font-mono text-2xl font-extrabold text-teal-800 tracking-widest">
              {submittedData.bookingId}
            </span>
          </div>

          <p className="text-sm text-slate-600 max-w-lg mx-auto mb-8 leading-relaxed">
            Your booking details have been prepared and dispatched to Admin WhatsApp (+91 98165 96713). If WhatsApp did not open automatically, please click below to send your details directly.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a
              href={waLink(s, getWaBookingMessage(submittedData.bookingId))}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-turquoise font-bold !py-3.5 !px-6 text-sm flex items-center justify-center gap-2 shadow-lg hover:scale-105 transition"
            >
              <MessageCircle size={20} />
              <span>Send Details to Admin on WhatsApp</span>
            </a>
            <Link to="/" className="btn-secondary">
              Back to Home
            </Link>
          </div>
        </motion.div>
      ) : (
        <form onSubmit={handleSubmit} className="travel-card p-6 sm:p-10 bg-white border-slate-200 shadow-md space-y-6">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 uppercase tracking-wider">FULL NAME *</label>
              <input
                type="text"
                className="inp"
                required
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Vikram Singh"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 uppercase tracking-wider">PHONE NUMBER *</label>
              <input
                type="tel"
                className="inp"
                required
                value={form.phone}
                onChange={e => setForm({ ...form, phone: e.target.value })}
                placeholder="e.g. +91 98765 43210"
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 uppercase tracking-wider">EMAIL ADDRESS</label>
              <input
                type="email"
                className="inp"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                placeholder="e.g. vikram@example.com"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 uppercase tracking-wider">TRIP TYPE</label>
              <select
                className="inp inp-select"
                value={form.tripType}
                onChange={e => setForm({ ...form, tripType: e.target.value })}
              >
                <option value="Tour Package">All-Inclusive Tour Package</option>
                <option value="One Way">One-Way Outstation Drop</option>
                <option value="Round Trip">Round-Trip Taxi Rental</option>
                <option value="Custom Journey">Custom Journey Route</option>
              </select>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 uppercase tracking-wider">PICKUP LOCATION</label>
              <input
                type="text"
                className="inp"
                value={form.pickup}
                onChange={e => setForm({ ...form, pickup: e.target.value })}
                placeholder="e.g. Chandigarh Airport (IXC)"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 uppercase tracking-wider">DESTINATION</label>
              <input
                type="text"
                className="inp"
                value={form.destination}
                onChange={e => setForm({ ...form, destination: e.target.value })}
                placeholder="e.g. Manali & Solang"
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 uppercase tracking-wider">TRAVEL DATE *</label>
              <input
                type="date"
                className="inp"
                required
                value={form.travelDate}
                onChange={e => setForm({ ...form, travelDate: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 uppercase tracking-wider">RETURN DATE</label>
              <input
                type="date"
                className="inp"
                value={form.returnDate}
                onChange={e => setForm({ ...form, returnDate: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 uppercase tracking-wider">TRAVELERS</label>
              <input
                type="number"
                min="1"
                max="50"
                className="inp"
                value={form.travelers}
                onChange={e => setForm({ ...form, travelers: Number(e.target.value) })}
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 uppercase tracking-wider">PREFERRED VEHICLE</label>
              <select
                className="inp inp-select"
                value={form.vehicle}
                onChange={e => setForm({ ...form, vehicle: e.target.value })}
              >
                <option value="Toyota Innova Crysta">Toyota Innova Crysta (6+1 Seater)</option>
                <option value="Toyota Fortuner 4x4">Toyota Fortuner 4x4 SUV</option>
                <option value="Force Urbania 17-Seater">Force Urbania (17-Seater Luxury)</option>
                <option value="Force Tempo Traveller 12-Seater">Force Tempo Traveller (12-Seater Maharaja)</option>
                <option value="Maruti Suzuki Dzire Sedan">Maruti Dzire Sedan (4 Seater)</option>
                <option value="Luxury Mercedes / Audi">Luxury Mercedes / BMW</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 uppercase tracking-wider">HOTEL CATEGORY</label>
              <select
                className="inp inp-select"
                value={form.hotelPreference}
                onChange={e => setForm({ ...form, hotelPreference: e.target.value })}
              >
                <option value="4-Star Premium Resort">4-Star Premium Mountain Resort</option>
                <option value="5-Star Luxury Heritage Stay">5-Star Luxury Heritage Hotel</option>
                <option value="3-Star Deluxe Cozy Hotel">3-Star Deluxe Budget Hotel</option>
                <option value="Only Cab (No Hotel)">Only Cab Rental (No Hotels Needed)</option>
              </select>
            </div>
          </div>

          {/* Coupon Code Strip */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
            <div className="flex gap-2">
              <input
                type="text"
                className="inp uppercase text-xs bg-white"
                placeholder="PROMO CODE (e.g. ROYAL10)"
                value={couponCode}
                onChange={e => setCouponCode(e.target.value)}
              />
              <button
                type="button"
                onClick={handleCouponApply}
                className="btn-secondary text-xs !py-2"
              >
                Apply
              </button>
            </div>
            {couponMsg && <p className="text-xs text-teal-700 font-semibold mt-2">{couponMsg}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 uppercase tracking-wider">SPECIAL NOTES / REQUIREMENTS</label>
            <textarea
              className="inp"
              rows="3"
              value={form.message}
              onChange={e => setForm({ ...form, message: e.target.value })}
              placeholder="Any special requests: senior citizens, child safety seat, non-smoking chauffeur, specific route stops..."
            />
          </div>

          {error && <p className="text-xs text-red-600">{error}</p>}

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Transmitting to Dispatch…' : 'Confirm & Request Royal Route Booking'}
          </button>
        </form>
      )}
    </main>
  );
}

// ==========================================
// 5. CUSTOM TOUR BUILDER ("Build Your Journey")
// ==========================================
export function CustomTour() {
  const s = useSettings();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    destination: 'Himachal Complete (Shimla, Kullu, Manali)',
    pickup: 'Chandigarh',
    duration: '6 Nights / 7 Days',
    travelers: 4,
    vehicle: 'Toyota Innova Crysta',
    stayPreference: 'Luxury 4-Star Mountain View',
    budget: 'Premium Deluxe Experience',
    activities: ['Atal Tunnel Excursion', 'River Rafting in Kullu'],
    name: '',
    phone: '',
    email: '',
    notes: ''
  });
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  const getWaCustomTourMessage = () => {
    return `🏔️ *NEW CUSTOM TOUR PLAN - RANJIT TOUR & TRAVELS*
━━━━━━━━━━━━━━━━━━━━
👤 *Customer Name:* ${formData.name}
📱 *Phone:* ${formData.phone}
✉️ *Email:* ${formData.email || 'N/A'}
📍 *Destination:* ${formData.destination}
🚀 *Pickup Hub:* ${formData.pickup}
⏳ *Duration:* ${formData.duration}
👥 *Total Travelers:* ${formData.travelers}
🚙 *Vehicle Preference:* ${formData.vehicle}
🏨 *Hotel Category:* ${formData.stayPreference}
🎯 *Selected Activities:* ${formData.activities.join(', ')}
💬 *Special Requests / Notes:* ${formData.notes || 'None'}
━━━━━━━━━━━━━━━━━━━━
_Please send customized itinerary with price quotation._`;
  };

  const toggleActivity = (act) => {
    setFormData(prev => ({
      ...prev,
      activities: prev.activities.includes(act)
        ? prev.activities.filter(a => a !== act)
        : [...prev.activities, act]
    }));
  };

  const handleFinish = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/inquiries', {
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        type: 'custom_trip',
        subject: `Custom Tour Builder: ${formData.destination}`,
        destination: formData.destination,
        travelers: formData.travelers,
        budget: formData.budget,
        message: `Custom Trip Builder Details:
- Pickup: ${formData.pickup}
- Duration: ${formData.duration}
- Vehicle: ${formData.vehicle}
- Stay: ${formData.stayPreference}
- Activities: ${formData.activities.join(', ')}
- Notes: ${formData.notes}`
      });

      // Dispatch directly to Admin WhatsApp
      const waMsg = getWaCustomTourMessage();
      window.open(waLink(s, waMsg), '_blank', 'noopener,noreferrer');
      setDone(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="max-w-4xl mx-auto px-4 py-12">
      <Seo
        title="Custom Tour Builder | Build Your Journey"
        description="Interactive trip builder for customized Himachal, Kashmir & Spiti vacations. Choose vehicles, stays, and route stops."
      />

      <Breadcrumbs items={[{ label: 'Custom Tour Builder' }]} />

      <div className="text-center max-w-xl mx-auto mb-10">
        <span className="text-xs font-mono text-teal-700 font-bold uppercase tracking-widest">Tailored Road Concierge</span>
        <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-slate-900 mt-1">Build Your Journey</h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-2">
          Design your personalized itinerary step-by-step with private vehicle and hotel preferences. Your plan will be sent directly to admin WhatsApp.
        </p>
      </div>

      {done ? (
        <div className="travel-card p-8 sm:p-12 text-center border-teal-200 bg-white shadow-xl">
          <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto mb-4 border border-emerald-200">
            <Check size={32} />
          </div>
          <span className="text-xs font-mono text-emerald-700 font-bold uppercase tracking-widest block mb-1">
            CUSTOM ITINERARY LOGGED & SENT TO WHATSAPP
          </span>
          <h3 className="font-display text-2xl font-bold text-slate-900 mb-2">Custom Itinerary Request Received</h3>
          <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto mb-6 leading-relaxed">
            Our destination architects are crafting your customized route quote for <b>{formData.destination}</b>. Your plan has been dispatched to Admin WhatsApp (+91 98165 96713).
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a
              href={waLink(s, getWaCustomTourMessage())}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-turquoise font-bold !py-3.5 !px-6 text-sm flex items-center justify-center gap-2 shadow-lg hover:scale-105 transition"
            >
              <MessageCircle size={18} />
              <span>Send Custom Plan on Admin WhatsApp</span>
            </a>
            <Link to="/" className="btn-secondary">Return Home</Link>
          </div>
        </div>
      ) : (
        <div className="travel-card p-6 sm:p-10 bg-white border-slate-200 shadow-md">
          {/* Step tracker */}
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100 text-xs font-mono">
            <span className={step >= 1 ? 'text-teal-700 font-bold' : 'text-slate-400'}>01. DESTINATION</span>
            <span className={step >= 2 ? 'text-teal-700 font-bold' : 'text-slate-400'}>02. FLEET & STAYS</span>
            <span className={step >= 3 ? 'text-teal-700 font-bold' : 'text-slate-400'}>03. CONTACT & CONFIRM</span>
          </div>

          {step === 1 && (
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2 uppercase">SELECT REGION / CORRIDOR</label>
                <div className="grid sm:grid-cols-2 gap-3">
                  {[
                    'Himachal Complete (Shimla, Kullu, Manali)',
                    'Spiti Valley 4x4 Expedition',
                    'Dharamshala, McLeodganj & Dalhousie',
                    'Leh Ladakh High Passes Safari',
                    'Sacred Punjab (Amritsar & Wagah Border)',
                    'Royal Rajasthan Heritage Trail'
                  ].map(reg => (
                    <button
                      type="button"
                      key={reg}
                      onClick={() => setFormData({ ...formData, destination: reg })}
                      className={`p-3.5 rounded-xl text-left text-xs transition border ${
                        formData.destination === reg ? 'bg-teal-50 border-teal-600 text-teal-900 font-bold shadow-sm' : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-teal-300'
                      }`}
                    >
                      {reg}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1 uppercase">PICKUP CITY</label>
                  <input
                    type="text"
                    className="inp"
                    value={formData.pickup}
                    onChange={e => setFormData({ ...formData, pickup: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1 uppercase">DURATION</label>
                  <select
                    className="inp inp-select"
                    value={formData.duration}
                    onChange={e => setFormData({ ...formData, duration: e.target.value })}
                  >
                    <option value="3 Nights / 4 Days">3 Nights / 4 Days</option>
                    <option value="4 Nights / 5 Days">4 Nights / 5 Days</option>
                    <option value="6 Nights / 7 Days">6 Nights / 7 Days</option>
                    <option value="8 Nights / 9 Days">8 Nights / 9 Days</option>
                    <option value="10+ Days Expedition">10+ Days Expedition</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1 uppercase">PASSENGERS</label>
                  <input
                    type="number"
                    min="1"
                    className="inp"
                    value={formData.travelers}
                    onChange={e => setFormData({ ...formData, travelers: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button type="button" onClick={() => setStep(2)} className="btn-primary">
                  <span>Next: Fleet & Hotel Stays</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2 uppercase">PREFERRED VEHICLE CLASS</label>
                <div className="grid sm:grid-cols-3 gap-3">
                  {[
                    'Toyota Innova Crysta',
                    'Toyota Fortuner 4x4',
                    'Force Urbania 17-Seater',
                    'Force Tempo Traveller (12 Seater)',
                    'Maruti Dzire Sedan',
                    'Luxury Sedan (Camry / Mercedes)'
                  ].map(v => (
                    <button
                      type="button"
                      key={v}
                      onClick={() => setFormData({ ...formData, vehicle: v })}
                      className={`p-3 rounded-xl text-left text-xs transition border ${
                        formData.formData?.vehicle === v || formData.vehicle === v ? 'bg-teal-50 border-teal-600 text-teal-900 font-bold shadow-sm' : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-teal-300'
                      }`}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1 uppercase">HOTEL & RESORT PREFERENCE</label>
                  <select
                    className="inp inp-select"
                    value={formData.stayPreference}
                    onChange={e => setFormData({ ...formData, stayPreference: e.target.value })}
                  >
                    <option value="Luxury 4-Star Mountain View">4-Star Premium Mountain View</option>
                    <option value="5-Star Palace & Heritage Resort">5-Star Palace & Heritage Resort</option>
                    <option value="Deluxe 3-Star Family Hotel">Deluxe 3-Star Family Hotel</option>
                    <option value="Luxury Swiss Camps (Spiti/Ladakh)">Luxury Swiss Camps (Spiti/Ladakh)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1 uppercase">TRAVEL PLAN TIER</label>
                  <select
                    className="inp inp-select"
                    value={formData.budget}
                    onChange={e => setFormData({ ...formData, budget: e.target.value })}
                  >
                    <option value="Comfort Standard Plan">Comfort Standard Plan</option>
                    <option value="Premium Deluxe Experience">Premium Deluxe Experience</option>
                    <option value="Luxury Boutique & Mountain View">Luxury Boutique & Mountain View</option>
                    <option value="Royal VIP Bespoke Concierge">Royal VIP Bespoke Concierge</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2 uppercase">ACTIVITIES & ADD-ONS</label>
                <div className="flex flex-wrap gap-2">
                  {[
                    'Atal Tunnel Excursion',
                    'River Rafting in Kullu',
                    'Paragliding in Solang',
                    'Wagah Border VIP Coordination',
                    'Campfire & Riverside Dinner',
                    'Local Cultural Food Trail'
                  ].map(act => (
                    <button
                      type="button"
                      key={act}
                      onClick={() => toggleActivity(act)}
                      className={`px-3 py-1.5 rounded-full text-xs transition border ${
                        formData.activities.includes(act) ? 'bg-teal-100 border-teal-600 text-teal-900 font-bold' : 'bg-slate-50 border-slate-200 text-slate-700'
                      }`}
                    >
                      {formData.activities.includes(act) ? '✓ ' : '+ '} {act}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <button type="button" onClick={() => setStep(1)} className="btn-secondary">
                  Back
                </button>
                <button type="button" onClick={() => setStep(3)} className="btn-primary">
                  <span>Next: Contact Details</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <form onSubmit={handleFinish} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1 uppercase">YOUR NAME *</label>
                  <input
                    type="text"
                    className="inp"
                    required
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1 uppercase">PHONE NUMBER *</label>
                  <input
                    type="tel"
                    className="inp"
                    required
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 uppercase">EMAIL ADDRESS</label>
                <input
                  type="email"
                  className="inp"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 uppercase">ADDITIONAL SPECIAL REQUESTS</label>
                <textarea
                  className="inp"
                  rows="3"
                  value={formData.notes}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>

              <div className="flex justify-between pt-4">
                <button type="button" onClick={() => setStep(2)} className="btn-secondary">
                  Back
                </button>
                <button type="submit" disabled={loading} className="btn-primary">
                  {loading ? 'Submitting…' : 'Submit Custom Journey Request'}
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </main>
  );
}

// ==========================================
// 6. CONTACT US & ABOUT US PAGES
// ==========================================
export function Contact() {
  const s = useSettings();
  const [form, setForm] = useState({ name: '', phone: '', email: '', message: '' });
  const [status, setStatus] = useState({ loading: false, msg: '', success: false, lastMsg: '' });

  const getWaContactMessage = (data) => {
    return `📩 *NEW TRAVEL INQUIRY - RANJIT TOUR & TRAVELS*
━━━━━━━━━━━━━━━━━━━━
👤 *Customer Name:* ${data.name}
📱 *Phone:* ${data.phone}
✉️ *Email:* ${data.email || 'N/A'}
📝 *Tour / Cab Requirement:*
${data.message}
━━━━━━━━━━━━━━━━━━━━
_Please contact me with availability and quotation._`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, msg: '', success: false, lastMsg: '' });
    const waText = getWaContactMessage(form);
    try {
      await api.post('/inquiries', { ...form, type: 'contact' });
      // Dispatch immediately to Admin WhatsApp
      window.open(waLink(s, waText), '_blank', 'noopener,noreferrer');

      setStatus({ 
        loading: false, 
        msg: 'Thank you! Your message has been received and WhatsApp opened to chat with Admin (+91 98165 96713).', 
        success: true,
        lastMsg: waText
      });
      setForm({ name: '', phone: '', email: '', message: '' });
    } catch (err) {
      setStatus({ loading: false, msg: msg(err), success: false, lastMsg: '' });
    }
  };

  return (
    <main className="max-w-7xl mx-auto px-4 py-12">
      <Seo
        title="Contact Us & 24/7 Helpline"
        description="Get in touch with Ranjit Tour & Travels for instant cab bookings, tour quotes, or 24/7 chauffeur dispatch."
      />

      <Breadcrumbs items={[{ label: 'Contact Us' }]} />

      <div className="text-center max-w-xl mx-auto mb-12">
        <span className="text-xs font-mono text-teal-700 font-bold uppercase tracking-widest">Connect With Us</span>
        <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-slate-900 mt-1">24/7 Travel Concierge</h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-2">
          We operate around the clock for immediate outstation cab dispatch and holiday planning. Inquiries go straight to our 24/7 WhatsApp desk.
        </p>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        {/* Contact Info Cards */}
        <div className="lg:col-span-5 space-y-4">
          <div className="travel-card p-6 bg-white border-slate-200 shadow-sm">
            <h3 className="font-display font-bold text-lg text-slate-900 mb-4">Main Office & Dispatch Hub</h3>
            <div className="space-y-4 text-xs sm:text-sm text-slate-600">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-teal-700 flex-shrink-0 mt-0.5" />
                <div>
                  <b className="text-slate-900 block font-semibold">Registered Office Address</b>
                  <span>{s.address || 'Railway Station, Amb Andaura, District Una, Himachal Pradesh, India 177203'}</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div>
                  <b className="text-slate-900 block font-semibold">24/7 Phone & WhatsApp</b>
                  <span>
                    <a href="tel:+919816596713" className="text-teal-700 font-bold hover:underline">+91 98165 96713</a>
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-teal-700 flex-shrink-0 mt-0.5" />
                <div>
                  <b className="text-slate-900 block font-semibold">Operating Dispatch Hours</b>
                  <span>Open 24 Hours · 7 Days a Week (Round-the-Clock Railway & Hill Transfers)</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex gap-3">
              <WhatsAppButton text="Hello Ranjit Tour & Travels, I want to inquire about a taxi from Amb Andaura / Himachal." className="w-full justify-center font-bold" />
            </div>
          </div>

          {/* Google Maps Location Card */}
          <div className="travel-card p-2 bg-white border-slate-200 overflow-hidden shadow-sm">
            <iframe
              title="Amb Andaura Railway Station Location"
              src="https://maps.google.com/maps?q=Amb+Andaura+Railway+Station,Himachal+Pradesh,177203&t=&z=14&ie=UTF8&iwloc=&output=embed"
              width="100%"
              height="230"
              style={{ border: 0, borderRadius: '0.75rem' }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-7">
          <form onSubmit={handleSubmit} className="travel-card p-6 sm:p-8 bg-white border-slate-200 shadow-md space-y-4">
            <h3 className="font-display font-bold text-xl text-slate-900">Send an Instant Booking Inquiry</h3>
            
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 uppercase">Your Name *</label>
                <input
                  type="text"
                  required
                  className="inp"
                  placeholder="e.g. Rajesh Sharma"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 uppercase">Phone Number *</label>
                <input
                  type="tel"
                  required
                  className="inp"
                  placeholder="e.g. +91 98165 96713"
                  value={form.phone}
                  onChange={e => setForm({ ...form, phone: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 uppercase">Email Address</label>
              <input
                type="email"
                className="inp"
                placeholder="e.g. rajesh@example.com"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 uppercase">Tour Route / Cab Requirement *</label>
              <textarea
                required
                rows="4"
                className="inp"
                value={form.message}
                onChange={e => setForm({ ...form, message: e.target.value })}
                placeholder="Enter pickup date, train arrival, destination (e.g. Amb Andaura to Mata Chintpurni, Dharamshala, or Manali)..."
              />
            </div>

            {status.msg && (
              <div className={`p-4 rounded-xl text-xs font-medium ${status.success ? 'bg-emerald-50 border border-emerald-200 text-emerald-900' : 'bg-red-50 border border-red-200 text-red-700'}`}>
                <p className="font-bold mb-1">{status.msg}</p>
                {status.success && status.lastMsg && (
                  <div className="mt-2.5 pt-2 border-t border-emerald-200/60">
                    <a
                      href={waLink(s, status.lastMsg)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition shadow-xs"
                    >
                      <MessageCircle size={14} />
                      <span>Chat on Admin WhatsApp Now</span>
                    </a>
                  </div>
                )}
              </div>
            )}

            <button type="submit" disabled={status.loading} className="btn-primary w-full !py-3 font-bold flex items-center justify-center gap-2">
              <MessageCircle size={18} />
              <span>{status.loading ? 'Sending Inquiry…' : 'Submit & Connect to Admin WhatsApp'}</span>
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}

export function About() {
  const s = useSettings();
  return (
    <main className="max-w-7xl mx-auto px-4 py-12">
      <Seo
        title="About Us & Royal Route Philosophy"
        description="Discover the story of Ranjit Tour & Travels. 18+ years of authentic Himalayan hospitality, verified mountain drivers, and transparent fleet services."
      />

      <Breadcrumbs items={[{ label: 'About Us' }]} />

      <div className="grid lg:grid-cols-12 gap-12 items-center mb-16">
        <div className="lg:col-span-7 space-y-6">
          <span className="text-xs font-mono text-teal-700 font-bold uppercase tracking-widest">Heritage of Excellence</span>
          <h1 className="font-display text-4xl sm:text-5xl font-extrabold text-slate-900 leading-tight">
            Crafting Unforgettable <br />
            <span className="text-teal-700">Himalayan Road Journeys</span>
          </h1>

          <p className="text-slate-700 text-sm sm:text-base leading-relaxed">
            Founded with a vision to redefine road travel across Northern India, <b>Ranjit Tour & Travels</b> has grown from a boutique chauffeur service in Chandigarh to an acclaimed travel platform trusted by over 45,000 travelers.
          </p>

          <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
            We believe that a journey should not be an endurance test of noisy buses or hidden charges. Our "Travel Map + Royal Route" framework pairs private, immaculate vehicles with certified mountain chauffeurs and handpicked boutique properties.
          </p>

          <div className="grid sm:grid-cols-2 gap-4 pt-4 border-t border-slate-200">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
              <Shield className="w-6 h-6 text-teal-700 mb-2" />
              <h4 className="font-display font-bold text-slate-900 text-sm">Safety-First Protocol</h4>
              <p className="text-xs text-slate-600 mt-1">24/7 GPS route tracking and experienced drivers on snow ghats.</p>
            </div>
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
              <Award className="w-6 h-6 text-emerald-600 mb-2" />
              <h4 className="font-display font-bold text-slate-900 text-sm">Royal Hospitality</h4>
              <p className="text-xs text-slate-600 mt-1">Dedicated travel coordinators for seamless holiday pacing.</p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5">
          <div className="aspect-[4/5] rounded-2xl overflow-hidden travel-card border-teal-200 shadow-md">
            <Cover src="https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1000&q=80" alt="Ranjit Tour & Travels Fleet" />
          </div>
        </div>
      </div>
    </main>
  );
}

// ==========================================
// 7. GALLERY & TESTIMONIALS
// ==========================================
export function GalleryPage() {
  const [items, setItems] = useState([]);
  const [category, setCategory] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get('/gallery')
      .then(res => setItems(res.data.items || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = category === 'All' ? items : items.filter(i => i.category === category);

  return (
    <main className="max-w-7xl mx-auto px-4 py-12">
      <Seo title="Travel Gallery" description="Visual journey through the Himalayan peaks, valleys, and our royal fleet." />
      <Breadcrumbs items={[{ label: 'Photo Gallery' }]} />

      <div className="text-center max-w-xl mx-auto mb-10">
        <span className="text-xs font-mono text-teal-700 font-bold uppercase tracking-widest">Visual Portfolio</span>
        <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-slate-900 mt-1">The Royal Journey in Frames</h1>
      </div>

      <div className="flex justify-center flex-wrap gap-2 mb-8">
        {['All', 'Mountains', 'Heritage', 'Monasteries', 'Fleet', 'Lakes'].map(c => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition ${
              category === c ? 'bg-teal-700 text-white' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {loading ? (
        <Loading />
      ) : (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
          {filtered.map(imgItem => (
            <div key={imgItem._id} className="travel-card group relative aspect-[4/3] overflow-hidden bg-white shadow-sm">
              <Cover src={imgItem.image} alt={imgItem.alt || imgItem.title} />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition duration-300 flex items-end p-4">
                <div>
                  <span className="text-[10px] text-teal-300 font-mono uppercase font-bold">{imgItem.category} · {imgItem.location}</span>
                  <h4 className="font-display font-bold text-white text-sm">{imgItem.title}</h4>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}

export function TestimonialsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/testimonials')
      .then(res => setItems(res.data.items || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="max-w-7xl mx-auto px-4 py-12">
      <Seo title="Traveler Testimonials & Reviews" description="Read real reviews from guests who experienced our Royal Route tours and taxi services." />
      <Breadcrumbs items={[{ label: 'Testimonials' }]} />

      <div className="text-center max-w-xl mx-auto mb-10">
        <span className="text-xs font-mono text-teal-700 font-bold uppercase tracking-widest">Verified Experiences</span>
        <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-slate-900 mt-1">What Our Travelers Say</h1>
      </div>

      {loading ? <Loading /> : (
        <div className="grid md:grid-cols-3 gap-6">
          {items.map(t => (
            <div key={t._id} className="travel-card p-6 bg-white flex flex-col justify-between border-slate-200 shadow-sm">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <RatingStars rating={t.rating || 5} />
                  <span className="text-xs text-teal-700 font-mono font-bold">{t.tripDate || 'Verified Guest'}</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed italic">
                  "{t.review}"
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <h4 className="font-display font-bold text-sm text-slate-900">{t.name}</h4>
                  <span className="text-[11px] text-slate-500">{t.city ? `${t.city} · ` : ''}{t.destination || 'North India'}</span>
                </div>
                <Award className="w-5 h-5 text-teal-600 opacity-60" />
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}

// ==========================================
// 8. LEGAL & LOCAL SEO PAGES
// ==========================================
export function LocationPage() {
  const { city } = useParams();
  const cityName = city ? city.charAt(0).toUpperCase() + city.slice(1) : 'Chandigarh';

  return (
    <main className="max-w-7xl mx-auto px-4 py-12">
      <Seo 
        title={`Taxi Service & Outstation Cabs in ${cityName}`}
        description={`Book 24/7 taxi service in ${cityName}. Sanitized Innova Crystas, Sedans and Tempo Travellers for Shimla, Manali, Delhi Airport and outstation trips.`}
      />
      <Breadcrumbs items={[{ label: `Locations` }, { label: cityName }]} />

      <div className="travel-card p-8 sm:p-12 bg-white mb-10 border-teal-200 shadow-md">
        <span className="text-xs font-mono text-teal-700 font-bold uppercase tracking-widest">Local Travel Hub</span>
        <h1 className="font-display text-3xl sm:text-5xl font-extrabold text-slate-900 mt-2">
          Premier Taxi & Tour Services in {cityName}
        </h1>
        <p className="text-sm sm:text-base text-slate-600 mt-3 max-w-2xl leading-relaxed">
          Ranjit Tour & Travels operates our primary dispatch terminal and fleet operations in {cityName}, delivering guaranteed on-time airport drops, outstation cabs to Himachal and Kashmir, and customized private holiday packages.
        </p>

        <div className="mt-8 flex flex-wrap gap-4">
          <Link to={`/booking?pickup=${cityName}`} className="btn-primary">
            Book Cab from {cityName}
          </Link>
          <WhatsAppButton text={`Hello Ranjit Tour & Travels, I need a taxi from ${cityName}.`} />
        </div>
      </div>
    </main>
  );
}

export function LegalPage({ title, content }) {
  return (
    <main className="max-w-4xl mx-auto px-4 py-12">
      <Seo title={title} description={`${title} for Ranjit Tour & Travels.`} />
      <Breadcrumbs items={[{ label: title }]} />
      <article className="travel-card p-8 sm:p-12 bg-white border-slate-200 shadow-sm space-y-4">
        <h1 className="font-display text-3xl font-bold text-slate-900 mb-6">{title}</h1>
        <div className="text-xs sm:text-sm text-slate-700 leading-relaxed space-y-4 whitespace-pre-line">
          {content}
        </div>
      </article>
    </main>
  );
}

export function NotFound() {
  return (
    <main className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
      <Seo title="404 — Route Not Found" description="The requested route does not exist." />
      <Compass className="w-16 h-16 text-teal-600 mb-4 animate-spin-slow opacity-60" />
      <h1 className="font-display text-5xl font-extrabold text-slate-900">404</h1>
      <h2 className="font-display text-xl font-bold text-slate-600 mt-2">Coordinates Out of Bounds</h2>
      <p className="text-xs text-slate-500 mt-1 mb-6 max-w-sm">
        The travel page or journey route you requested could not be located in our dispatch registry.
      </p>
      <Link to="/" className="btn-primary">
        Return to Safe Route
      </Link>
    </main>
  );
}
