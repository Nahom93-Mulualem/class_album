import http from 'http';

async function request(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data,
        });
      });
    });
    req.on('error', reject);
    if (postData) {
      req.write(postData);
    }
    req.end();
  });
}

async function runTests() {
  console.log("==================================================");
  console.log("🎓 Phoenix Class Album - Mandatory Login Entry Tests");
  console.log("==================================================\n");

  let passed = 0;
  let total = 0;

  function assert(condition, testName) {
    total++;
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${testName}`);
    }
  }

  // 1. Test strictly that visiting root 'http://localhost:3000/' renders the Login Page (200 OK) without auto-redirecting to /admin or /feed
  const rootRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/',
    method: 'GET',
  });
  assert(
    rootRes.statusCode === 200,
    "http://localhost:3000/ directly opens the Login Page (200 OK) without auto-redirecting to /admin or /feed"
  );

  // 2. Test strictly that visiting 'http://localhost:3000/login' opens the Login Page (200 OK)
  const loginPageRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/login',
    method: 'GET',
  });
  assert(
    loginPageRes.statusCode === 200,
    "http://localhost:3000/login opens the Login Page (200 OK)"
  );

  // 3. Test that an unauthenticated user attempting /feed is redirected to /login
  const unauthFeed = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/feed',
    method: 'GET',
  });
  assert(
    unauthFeed.statusCode === 307 && unauthFeed.headers.location?.includes('/login?redirect=%2Ffeed'),
    "Unauthenticated access to '/feed' is protected and redirects to /login?redirect=%2Ffeed"
  );

  // 4. Test that an unauthenticated user attempting /directory is redirected to /login
  const unauthDir = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/directory',
    method: 'GET',
  });
  assert(
    unauthDir.statusCode === 307 && unauthDir.headers.location?.includes('/login?redirect=%2Fdirectory'),
    "Unauthenticated access to '/directory' is protected and redirects to /login?redirect=%2Fdirectory"
  );

  // 5. Test that an unauthenticated user attempting /admin is redirected to /login
  const unauthAdmin = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/admin',
    method: 'GET',
  });
  assert(
    unauthAdmin.statusCode === 307 && unauthAdmin.headers.location?.includes('/login?redirect=%2Fadmin'),
    "Unauthenticated access to '/admin' is protected and redirects to /login?redirect=%2Fadmin"
  );

  // 6. Test Student Authentication via Login Form
  const studentLoginPayload = JSON.stringify({
    username: "alex.chen",
    password: "Student@2026!",
  });
  const studentLoginRes = await request(
    {
      hostname: 'localhost',
      port: 3000,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(studentLoginPayload),
      },
    },
    studentLoginPayload
  );

  const studentCookies = studentLoginRes.headers['set-cookie'];
  const studentCookieStr = Array.isArray(studentCookies) ? studentCookies.map((c) => c.split(';')[0]).join('; ') : (studentCookies || '');
  let studentData = {};
  try {
    studentData = JSON.parse(studentLoginRes.body);
  } catch {
    // ignore
  }

  assert(
    studentLoginRes.statusCode === 200 &&
      studentData.user?.role === "STUDENT" &&
      studentCookieStr.length > 0,
    "Student authentication succeeds with role STUDENT and receives session token"
  );

  // 7. Test Authenticated Student accessing /feed (200 OK)
  const studentFeedRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/feed',
    method: 'GET',
    headers: {
      Cookie: studentCookieStr,
    },
  });
  assert(
    studentFeedRes.statusCode === 200,
    "Authenticated Student has full access to Class Feed '/feed' (200 OK)"
  );

  // 8. Test Authenticated Student attempting /admin is blocked and redirected to /feed
  const studentAdminAttempt = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/admin',
    method: 'GET',
    headers: {
      Cookie: studentCookieStr,
    },
  });
  assert(
    studentAdminAttempt.statusCode === 307 &&
      studentAdminAttempt.headers.location?.includes('/feed?error=access_denied_admin_only'),
    "Student attempting '/admin' is blocked and redirected to '/feed?error=access_denied_admin_only'"
  );

  // 9. Test Admin Authentication via Login Form
  const adminLoginPayload = JSON.stringify({
    username: "admin",
    password: "Admin@2026!",
  });
  const adminLoginRes = await request(
    {
      hostname: 'localhost',
      port: 3000,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(adminLoginPayload),
      },
    },
    adminLoginPayload
  );

  const adminCookies = adminLoginRes.headers['set-cookie'];
  const adminCookieStr = Array.isArray(adminCookies) ? adminCookies.map((c) => c.split(';')[0]).join('; ') : (adminCookies || '');
  let adminData = {};
  try {
    adminData = JSON.parse(adminLoginRes.body);
  } catch {
    // ignore
  }

  assert(
    adminLoginRes.statusCode === 200 &&
      adminData.user?.role === "ADMIN" &&
      adminCookieStr.length > 0,
    "Admin authentication succeeds with role ADMIN and receives session token"
  );

  // 10. Test Authenticated Admin accessing /admin (200 OK)
  const adminDashboardRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/admin',
    method: 'GET',
    headers: {
      Cookie: adminCookieStr,
    },
  });
  assert(
    adminDashboardRes.statusCode === 200,
    "Authenticated Admin has full access to Admin Dashboard '/admin' (200 OK)"
  );

  // 11. Test that even with an Admin Cookie, visiting root '/' still opens the Login Page without auto-bypassing
  const adminVisitingRoot = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/',
    method: 'GET',
    headers: {
      Cookie: adminCookieStr,
    },
  });
  assert(
    adminVisitingRoot.statusCode === 200,
    "Root URL 'http://localhost:3000/' does NOT auto-redirect to /admin even when an admin session cookie exists"
  );

  // 12. Test Logout Endpoint
  const logoutRes = await request(
    {
      hostname: 'localhost',
      port: 3000,
      path: '/api/auth/logout',
      method: 'POST',
      headers: {
        Cookie: adminCookieStr,
      },
    },
    '{}'
  );
  assert(
    logoutRes.statusCode === 200,
    "Logout API successfully terminates session and clears cookie"
  );

  console.log("\n==================================================");
  console.log(`Results: ${passed} / ${total} Tests Passed (${Math.round((passed / total) * 100)}%)`);
  console.log("==================================================");
}

runTests();
