export const errorHandler = (err, req, res, next) => {
  console.error('[API Error]:', err);

  const origin = req.headers.origin;
  const allowedOrigins = [
    process.env.CLIENT_URL,
    process.env.VITE_SITE_URL,
    process.env.VITE_API_ORIGIN,
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'https://localhost:5173',
    'https://127.0.0.1:5173',
    'https://ranjittourandtravels.in',
    'https://www.ranjittourandtravels.in'
  ].filter(Boolean);

  if (origin) {
    const hostname = (() => {
      try {
        return new URL(origin).hostname;
      } catch {
        return '';
      }
    })();

    if (allowedOrigins.includes(origin) || hostname.endsWith('.vercel.app') || hostname.endsWith('.netlify.app')) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Credentials', 'true');
      res.setHeader('Vary', 'Origin');
    } else {
      res.setHeader('Access-Control-Allow-Origin', '*');
    }
  } else {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, PUT, PATCH, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Range, Client-Version');

  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message || 'Internal Server Error';

  if (err.name === 'CastError') {
    statusCode = 404;
    message = 'Resource not found or invalid identifier format.';
  }

  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    message = `Duplicate entry: '${field}' value '${err.keyValue?.[field]}' is already in use.`;
  }

  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors).map(val => val.message).join(', ');
  }

  res.status(statusCode).json({
    success: false,
    message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
};
