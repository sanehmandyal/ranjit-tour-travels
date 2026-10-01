import Destination from '../models/Destination.js';
import TourPackage from '../models/TourPackage.js';
import Vehicle from '../models/Vehicle.js';
import Service from '../models/Service.js';
import Blog from '../models/Blog.js';

export const getSitemap = async (req, res, next) => {
  try {
    const baseUrl = process.env.CLIENT_URL || 'https://ranjittourandtravels.com';

    const [destinations, packages, vehicles, services, blogs] = await Promise.all([
      Destination.find({ published: true }).select('slug updatedAt'),
      TourPackage.find({ published: true }).select('slug updatedAt'),
      Vehicle.find({ published: true }).select('slug updatedAt'),
      Service.find({ published: true }).select('slug updatedAt'),
      Blog.find({ published: true }).select('slug updatedAt')
    ]);

    const staticUrls = [
      '',
      '/about',
      '/destinations',
      '/tour-packages',
      '/cars',
      '/services',
      '/custom-tour',
      '/gallery',
      '/blog',
      '/testimonials',
      '/contact',
      '/booking',
      '/privacy-policy',
      '/terms-and-conditions',
      '/refund-policy',
      '/sitemap'
    ];

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    staticUrls.forEach(url => {
      xml += `  <url>\n    <loc>${baseUrl}${url}</loc>\n    <changefreq>daily</changefreq>\n    <priority>${url === '' ? '1.0' : '0.8'}</priority>\n  </url>\n`;
    });

    destinations.forEach(item => {
      xml += `  <url>\n    <loc>${baseUrl}/destinations/${item.slug}</loc>\n    <lastmod>${item.updatedAt ? item.updatedAt.toISOString().split('T')[0] : '2026-10-01'}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.9</priority>\n  </url>\n`;
    });

    packages.forEach(item => {
      xml += `  <url>\n    <loc>${baseUrl}/tour-packages/${item.slug}</loc>\n    <lastmod>${item.updatedAt ? item.updatedAt.toISOString().split('T')[0] : '2026-10-01'}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.9</priority>\n  </url>\n`;
    });

    vehicles.forEach(item => {
      xml += `  <url>\n    <loc>${baseUrl}/cars/${item.slug}</loc>\n    <lastmod>${item.updatedAt ? item.updatedAt.toISOString().split('T')[0] : '2026-10-01'}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
    });

    services.forEach(item => {
      xml += `  <url>\n    <loc>${baseUrl}/services/${item.slug}</loc>\n    <lastmod>${item.updatedAt ? item.updatedAt.toISOString().split('T')[0] : '2026-10-01'}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
    });

    blogs.forEach(item => {
      xml += `  <url>\n    <loc>${baseUrl}/blog/${item.slug}</loc>\n    <lastmod>${item.updatedAt ? item.updatedAt.toISOString().split('T')[0] : '2026-10-01'}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.7</priority>\n  </url>\n`;
    });

    xml += `</urlset>`;

    res.header('Content-Type', 'application/xml');
    res.send(xml);
  } catch (err) {
    next(err);
  }
};

export const getRobots = (req, res) => {
  const baseUrl = process.env.CLIENT_URL || 'https://ranjittourandtravels.com';
  const robots = `User-agent: *
Allow: /
Disallow: /admin
Disallow: /api/

Sitemap: ${baseUrl}/sitemap.xml
`;
  res.header('Content-Type', 'text/plain');
  res.send(robots);
};
