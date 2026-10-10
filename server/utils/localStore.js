import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { 
  defaultDestinations, 
  defaultVehicles, 
  defaultServices, 
  defaultTestimonials, 
  defaultBlogs, 
  defaultGallery, 
  defaultCoupons, 
  defaultWebsiteSettings,
  defaultPackages 
} from '../seed/seed.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '..', 'data');
const STORE_PATH = path.join(DATA_DIR, 'store.json');

const getInitialData = () => {
  return {
    destinations: defaultDestinations.map((d, i) => ({ ...d, _id: `dest_${i + 1}`, id: `dest_${i + 1}` })),
    packages: (defaultPackages || []).map((p, i) => ({ ...p, _id: `pkg_${i + 1}`, id: `pkg_${i + 1}` })),
    vehicles: defaultVehicles.map((v, i) => ({ ...v, _id: `veh_${i + 1}`, id: `veh_${i + 1}` })),
    services: defaultServices.map((s, i) => ({ ...s, _id: `srv_${i + 1}`, id: `srv_${i + 1}` })),
    blogs: defaultBlogs.map((b, i) => ({ ...b, _id: `blog_${i + 1}`, id: `blog_${i + 1}` })),
    testimonials: defaultTestimonials.map((t, i) => ({ ...t, _id: `test_${i + 1}`, id: `test_${i + 1}` })),
    gallery: defaultGallery.map((g, i) => ({ ...g, _id: `gal_${i + 1}`, id: `gal_${i + 1}` })),
    coupons: defaultCoupons.map((c, i) => ({ ...c, _id: `cpn_${i + 1}`, id: `cpn_${i + 1}` })),
    settings: { ...defaultWebsiteSettings, _id: 'settings_master', id: 'settings_master' },
    adminPassword: 'Ranjit@123',
    bookings: [],
    inquiries: []
  };
};

let inMemoryStore = null;

const loadStore = () => {
  if (inMemoryStore) return inMemoryStore;
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(STORE_PATH)) {
      const raw = fs.readFileSync(STORE_PATH, 'utf-8');
      inMemoryStore = JSON.parse(raw);
    } else {
      inMemoryStore = getInitialData();
      fs.writeFileSync(STORE_PATH, JSON.stringify(inMemoryStore, null, 2), 'utf-8');
    }
  } catch (err) {
    console.warn('[LocalStore Load Warning]:', err.message);
    inMemoryStore = getInitialData();
  }
  return inMemoryStore;
};

const saveStore = () => {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(STORE_PATH, JSON.stringify(inMemoryStore || getInitialData(), null, 2), 'utf-8');
  } catch (err) {
    console.warn('[LocalStore Save Warning]:', err.message);
  }
};

const cleanStr = (s) => (s || '').toString().toLowerCase().replace(/[^a-z0-9]/g, '');

export const localStore = {
  getCollection: (name) => {
    const store = loadStore();
    return store[name] || [];
  },

  getItem: (collectionName, idOrSlug) => {
    const items = localStore.getCollection(collectionName);
    const target = cleanStr(idOrSlug);
    return items.find(it => {
      if (!it) return false;
      const iId = cleanStr(it._id || it.id);
      const iSlug = cleanStr(it.slug);
      const iName = cleanStr(it.name || it.title);
      return iId === target || iSlug === target || iName === target || (iSlug && target.includes(iSlug));
    }) || null;
  },

  upsertItem: (collectionName, data) => {
    const store = loadStore();
    if (!store[collectionName]) store[collectionName] = [];
    const items = store[collectionName];

    const targetSlug = cleanStr(data.slug || data.name || data.title);
    const targetId = cleanStr(data._id || data.id);

    const matchIdx = items.findIndex(it => {
      if (!it) return false;
      const iId = cleanStr(it._id || it.id);
      const iSlug = cleanStr(it.slug);
      const iName = cleanStr(it.name || it.title);
      return (targetId && iId === targetId) || (targetSlug && (iSlug === targetSlug || iName === targetSlug));
    });

    const itemToSave = {
      ...data,
      _id: data._id || (matchIdx >= 0 ? items[matchIdx]._id : `${collectionName.slice(0, 3)}_${Date.now()}`),
      updatedAt: new Date().toISOString()
    };

    if (matchIdx >= 0) {
      items[matchIdx] = { ...items[matchIdx], ...itemToSave };
    } else {
      itemToSave.createdAt = new Date().toISOString();
      items.unshift(itemToSave);
    }

    saveStore();
    return itemToSave;
  },

  deleteItem: (collectionName, idOrSlug) => {
    const store = loadStore();
    if (!store[collectionName]) return false;
    const target = cleanStr(idOrSlug);
    store[collectionName] = store[collectionName].filter(it => {
      const iId = cleanStr(it._id || it.id);
      const iSlug = cleanStr(it.slug);
      return iId !== target && iSlug !== target;
    });
    saveStore();
    return true;
  },

  getSettings: () => {
    const store = loadStore();
    return store.settings || defaultWebsiteSettings;
  },

  updateSettings: (newSettings) => {
    const store = loadStore();
    store.settings = { ...(store.settings || defaultWebsiteSettings), ...newSettings, updatedAt: new Date().toISOString() };
    saveStore();
    return store.settings;
  },

  getAdminPassword: () => {
    const store = loadStore();
    return store.adminPassword || 'Ranjit@123';
  },

  setAdminPassword: (newPassword) => {
    const store = loadStore();
    store.adminPassword = newPassword;
    saveStore();
    return newPassword;
  }
};
