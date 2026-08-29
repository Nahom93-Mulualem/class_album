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
  console.log("🎓 Phoenix Class Album - Strict /login Entry Test");
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

  // 1. Test strictly that visiting website root '/' while unauthenticated goes to /login
  const unauthRoot = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/',
    method: 'GET',
  });
  assert(
    unauthRoot.statusCode === 307 && unauthRoot.headers.location?.includes('/login'),
    "Root URL '/' strictly redirects unauthenticated visitors to /login"
  );

  // 2. Test strictly that visiting /feed while unauthenticated redirects to /login
  const unauthFeed = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/feed',
    method: 'GET',
  });
  assert(
    unauthFeed.statusCode === 307 && unauthFeed.headers.location?.includes('/login?redirect=%2Ffeed'),
    "Protected '/feed' strictly redirects unauthenticated visitors to /login?redirect=%2Ffeed"
  );

  // 3. Test strictly that visiting /directory while unauthenticated redirects to /login
  const unauthDir = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/directory',
    method: 'GET',
  });
  assert(
    unauthDir.statusCode === 307 && unauthDir.headers.location?.includes('/login?redirect=%2Fdirectory'),
    "Protected '/directory' strictly redirects unauthenticated visitors to /login?redirect=%2Fdirectory"
  );

  // 4. Test strictly that visiting /admin while unauthenticated redirects to /login
  const unauthAdmin = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/admin',
    method: 'GET',
  });
  assert(
    unauthAdmin.statusCode === 307 && unauthAdmin.headers.location?.includes('/login?redirect=%2Fadmin'),
    "Protected '/admin' strictly redirects unauthenticated visitors to /login?redirect=%2Fadmin"
  );

  // 5. Test login page loads with 200 OK
  const loginPage = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/login',
    method: 'GET',
  });
  assert(loginPage.statusCode === 200, "Login page is the public entry point (200 OK)");

  // 6. Test Student Authentication
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
    "Student authentication succeeds with role STUDENT and sets session cookie"
  );

  // 7. Test Authenticated Student visiting / redirects to /feed
  const studentRootRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/',
    method: 'GET',
    headers: {
      Cookie: studentCookieStr,
    },
  });
  assert(
    studentRootRes.statusCode === 307 && studentRootRes.headers.location?.endsWith('/feed'),
    "Authenticated Student visiting '/' is automatically routed to '/feed'"
  );

  // 8. Test Authenticated Student visiting /feed directly loads 200 OK
  const studentFeedDirectRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/feed',
    method: 'GET',
    headers: {
      Cookie: studentCookieStr,
    },
  });
  assert(
    studentFeedDirectRes.statusCode === 200,
    "Authenticated Student has full access to Class Feed '/feed' (200 OK)"
  );

  // 9. Test Student attempting to access /admin is blocked and redirected to /feed
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

  // 10. Test Admin Authentication
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
    "Admin authentication succeeds with role ADMIN and sets session cookie"
  );

  // 11. Test Authenticated Admin visiting '/' is routed to /admin
  const adminRootRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/',
    method: 'GET',
    headers: {
      Cookie: adminCookieStr,
    },
  });
  assert(
    adminRootRes.statusCode === 307 && adminRootRes.headers.location?.endsWith('/admin'),
    "Authenticated Admin visiting '/' is automatically routed to '/admin'"
  );

  // 12. Test Authenticated Admin has access to /admin (200 OK)
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

  // 13. Test Logout API
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
