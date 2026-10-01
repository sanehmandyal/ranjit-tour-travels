import Destination from '../models/Destination.js';
import TourPackage from '../models/TourPackage.js';
import Vehicle from '../models/Vehicle.js';
import Service from '../models/Service.js';
import Blog from '../models/Blog.js';

export const globalSearch = async (req, res, next) => {
  try {
    const q = req.query.q || '';
    if (!q || q.trim().length === 0) {
      return res.json([]);
    }

    const reg = { $regex: q.trim(), $options: 'i' };

    const [destinations, packages, vehicles, services, blogs] = await Promise.all([
      Destination.find({ published: true, $or: [{ name: reg }, { state: reg }] }).limit(4).select('name slug state featuredImage startingPrice'),
      TourPackage.find({ published: true, $or: [{ name: reg }, { category: reg }, { overview: reg }] }).limit(4).select('name slug duration price discountedPrice featuredImage'),
      Vehicle.find({ published: true, $or: [{ name: reg }, { category: reg }] }).limit(4).select('name slug category seats pricePerDay images'),
      Service.find({ published: true, $or: [{ name: reg }, { shortDescription: reg }] }).limit(4).select('name slug shortDescription featuredImage'),
      Blog.find({ published: true, $or: [{ title: reg }, { category: reg }] }).limit(4).select('title slug excerpt featuredImage')
    ]);

    const results = [
      ...destinations.map(d => ({
        type: 'Destination',
        label: `${d.name} (${d.state})`,
        sub: `Starting from ₹${d.startingPrice}`,
        url: `/destinations/${d.slug}`,
        image: d.featuredImage
      })),
      ...packages.map(p => ({
        type: 'Package',
        label: p.name,
        sub: `${p.duration} · ₹${p.discountedPrice || p.price}`,
        url: `/tour-packages/${p.slug}`,
        image: p.featuredImage
      })),
      ...vehicles.map(v => ({
        type: 'Vehicle',
        label: `${v.name} (${v.category})`,
        sub: `${v.seats} Seats · ₹${v.pricePerDay}/day`,
        url: `/cars/${v.slug}`,
        image: v.images?.[0]
      })),
      ...services.map(s => ({
        type: 'Service',
        label: s.name,
        sub: s.shortDescription,
        url: `/services/${s.slug}`,
        image: s.featuredImage
      })),
      ...blogs.map(b => ({
        type: 'Blog',
        label: b.title,
        sub: b.excerpt,
        url: `/blog/${b.slug}`,
        image: b.featuredImage
      }))
    ];

    res.json(results);
  } catch (err) {
    next(err);
  }
};
