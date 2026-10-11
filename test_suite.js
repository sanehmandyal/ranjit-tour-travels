import app from './server/server.js';
import http from 'http';

const server = http.createServer(app);
const PORT = 5099;

server.listen(PORT, async () => {
  console.log(`\n==================================================`);
  console.log(`RUNNING FULL BACKEND & AUTH VERIFICATION SUITE (${PORT})`);
  console.log(`==================================================\n`);

  let passed = 0;
  let failed = 0;

  const assert = (condition, title, details = '') => {
    if (condition) {
      console.log(` [PASS] ${title}`);
      passed++;
    } else {
      console.error(` [FAIL] ${title} ${details ? `-> ${details}` : ''}`);
      failed++;
    }
  };

  try {
    // 1. CORS Preflight from Production Origin
    {
      const res = await fetch(`http://localhost:${PORT}/api/destinations/chintpurni-devi-darshan`, {
        method: 'OPTIONS',
        headers: {
          'Origin': 'https://ranjittourandtravels.in',
          'Access-Control-Request-Method': 'GET',
          'Access-Control-Request-Headers': 'authorization,content-type'
        }
      });
      assert(res.status === 204, 'CORS preflight from production domain returns 204', `Got status ${res.status}`);
      assert(res.headers.get('access-control-allow-origin') === 'https://ranjittourandtravels.in', 'CORS preflight has matching Access-Control-Allow-Origin header');
      assert(res.headers.get('access-control-allow-credentials') === 'true', 'CORS preflight allows credentials');
    }

    // 2. CORS Preflight from Vercel Preview Origin
    {
      const res = await fetch(`http://localhost:${PORT}/api/auth/login`, {
        method: 'OPTIONS',
        headers: {
          'Origin': 'https://ranjit-preview-123.vercel.app',
          'Access-Control-Request-Method': 'POST',
          'Access-Control-Request-Headers': 'content-type'
        }
      });
      assert(res.status === 204, 'CORS preflight from *.vercel.app returns 204');
      assert(res.headers.get('access-control-allow-origin') === 'https://ranjit-preview-123.vercel.app', 'CORS preflight matches Vercel preview origin');
    }

    // 3. CORS Preflight from Localhost Dev Origin
    {
      const res = await fetch(`http://localhost:${PORT}/api/auth/login`, {
        method: 'OPTIONS',
        headers: {
          'Origin': 'http://localhost:5173',
          'Access-Control-Request-Method': 'POST'
        }
      });
      assert(res.status === 204, 'CORS preflight from http://localhost:5173 returns 204');
      assert(res.headers.get('access-control-allow-origin') === 'http://localhost:5173', 'CORS preflight matches dev origin');
    }

    // 4. POST /api/auth/login - Validation (missing fields)
    {
      const res = await fetch(`http://localhost:${PORT}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Origin': 'https://ranjittourandtravels.in' },
        body: JSON.stringify({})
      });
      assert(res.status === 400, 'POST /api/auth/login returns 400 for empty body', `Got status ${res.status}`);
      assert(res.headers.get('access-control-allow-origin') === 'https://ranjittourandtravels.in', 'CORS header present on 400 error response');
    }

    // 5. POST /api/auth/login - Invalid credentials
    {
      const res = await fetch(`http://localhost:${PORT}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'admin@ranjittravels.com', password: 'WrongPassword' })
      });
      assert(res.status === 401, 'POST /api/auth/login returns 401 for wrong password', `Got status ${res.status}`);
    }

    // 6. POST /api/auth/login - Valid credentials
    let authToken = '';
    {
      const res = await fetch(`http://localhost:${PORT}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Origin': 'https://ranjittourandtravels.in' },
        body: JSON.stringify({ email: 'admin@ranjittravels.com', password: 'Ranjit@123' })
      });
      assert(res.status === 200, 'POST /api/auth/login returns 200 for valid credentials', `Got status ${res.status}`);
      const data = await res.json();
      assert(Boolean(data.token), 'Login response contains JWT token');
      assert(data.user?.email === 'admin@ranjittravels.com', 'Login response contains correct user');
      assert(data.user?.role === 'superadmin', 'User has superadmin role');
      authToken = data.token;
    }

    // 7. GET /api/auth/me - Unauthenticated
    {
      const res = await fetch(`http://localhost:${PORT}/api/auth/me`, {
        headers: { 'Origin': 'https://ranjittourandtravels.in' }
      });
      assert(res.status === 401, 'GET /api/auth/me returns 401 when no token is provided');
      assert(res.headers.get('access-control-allow-origin') === 'https://ranjittourandtravels.in', 'CORS header present on 401 response');
    }

    // 8. GET /api/auth/me - Authenticated with JWT
    {
      const res = await fetch(`http://localhost:${PORT}/api/auth/me`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      assert(res.status === 200, 'GET /api/auth/me returns 200 with valid JWT token', `Got status ${res.status}`);
      const data = await res.json();
      assert(data.data?.email === 'admin@ranjittravels.com', 'GET /api/auth/me returned correct authenticated user');
    }

    // 9. GET /api/auth/me - Authenticated with session token
    {
      const sessionToken = 'rjt_session_' + Buffer.from(JSON.stringify({
        id: 'master_superadmin_id',
        email: 'admin@ranjittravels.com',
        role: 'superadmin',
        time: Date.now()
      })).toString('base64');

      const res = await fetch(`http://localhost:${PORT}/api/auth/me`, {
        headers: { 'Authorization': `Bearer ${sessionToken}` }
      });
      assert(res.status === 200, 'GET /api/auth/me returns 200 with rjt_session_ token', `Got status ${res.status}`);
    }

    // 10. GET /api/stats - Protected endpoint (Unauthenticated)
    {
      const res = await fetch(`http://localhost:${PORT}/api/stats`);
      assert(res.status === 401, 'GET /api/stats returns 401 when unauthenticated');
    }

    // 11. GET /api/stats - Protected endpoint (Authenticated)
    {
      const res = await fetch(`http://localhost:${PORT}/api/stats`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      assert(res.status === 200, 'GET /api/stats returns 200 when authenticated', `Got status ${res.status}`);
      const data = await res.json();
      assert(typeof data.totalDestinations === 'number', 'Stats contains totalDestinations metric');
      assert(Array.isArray(data.recentBookings), 'Stats contains recentBookings array');
    }

    // 12. GET /api/destinations/chintpurni-devi-darshan - Public destination endpoint
    {
      const res = await fetch(`http://localhost:${PORT}/api/destinations/chintpurni-devi-darshan`, {
        headers: { 'Origin': 'https://ranjittourandtravels.in' }
      });
      assert(res.status === 200, 'GET /api/destinations/chintpurni-devi-darshan returns 200', `Got status ${res.status}`);
      assert(res.headers.get('access-control-allow-origin') === 'https://ranjittourandtravels.in', 'Destination response has CORS headers');
      const data = await res.json();
      assert(Boolean(data.name || data.slug), 'Destination response contains destination data');
      assert(data.name.includes('Chintpurni'), 'Destination is Mata Chintpurni & 9 Devi Darshan');
    }

    // 13. GET non-existent destination returns 404 with CORS headers (not 500)
    {
      const res = await fetch(`http://localhost:${PORT}/api/destinations/non-existent-destination-slug-xyz`, {
        headers: { 'Origin': 'https://ranjittourandtravels.in' }
      });
      assert(res.status === 404, 'GET invalid destination returns 404 (not 500)', `Got status ${res.status}`);
      assert(res.headers.get('access-control-allow-origin') === 'https://ranjittourandtravels.in', '404 response has CORS headers');
    }

  } catch (err) {
    console.error('Test suite runtime error:', err);
    failed++;
  } finally {
    console.log(`\n==================================================`);
    console.log(`RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log(`==================================================\n`);
    server.close();
    process.exit(failed > 0 ? 1 : 0);
  }
});
