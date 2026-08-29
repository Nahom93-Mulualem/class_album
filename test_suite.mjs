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
  console.log("🎓 Phoenix Class Album - Comprehensive Test Suite");
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

  // 1. Test unauthenticated redirect on root /
  const unauthRoot = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/',
    method: 'GET',
  });
  assert(
    unauthRoot.statusCode === 307 && unauthRoot.headers.location?.includes('/login'),
    "Unauthenticated visitor to / is redirected to /login"
  );

  // 2. Test unauthenticated redirect on protected /directory
  const unauthDir = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/directory',
    method: 'GET',
  });
  assert(
    unauthDir.statusCode === 307 && unauthDir.headers.location?.includes('/login?redirect=%2Fdirectory'),
    "Unauthenticated visitor to /directory is redirected to /login?redirect=%2Fdirectory"
  );

  // 3. Test unauthenticated redirect on protected /admin
  const unauthAdmin = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/admin',
    method: 'GET',
  });
  assert(
    unauthAdmin.statusCode === 307 && unauthAdmin.headers.location?.includes('/login?redirect=%2Fadmin'),
    "Unauthenticated visitor to /admin is redirected to /login?redirect=%2Fadmin"
  );

  // 4. Test login page is accessible
  const loginPage = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/login',
    method: 'GET',
  });
  assert(loginPage.statusCode === 200, "Login page loads successfully with 200 OK");

  // 5. Test Student Authentication (alex.chen)
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
    console.log("Failed to parse student body:", studentLoginRes.body);
  }

  assert(
    studentLoginRes.statusCode === 200 &&
      studentData.user?.role === "STUDENT" &&
      studentCookieStr.length > 0,
    `Student authentication succeeds with role STUDENT (status=${studentLoginRes.statusCode}, role=${studentData.user?.role}, cookie=${studentCookieStr ? 'YES' : 'NO'})`
  );

  // 6. Test Student Access to / (Feed)
  const studentFeedRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/',
    method: 'GET',
    headers: {
      Cookie: studentCookieStr,
    },
  });
  assert(
    studentFeedRes.statusCode === 200,
    "Authenticated student has full access to Class Feed (200 OK)"
  );

  // 7. Test Student Access to /admin (Should be blocked and redirected)
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
      studentAdminAttempt.headers.location?.includes('error=access_denied_admin_only'),
    "Student attempting /admin is blocked and redirected to /?error=access_denied_admin_only"
  );

  // 8. Test Admin Authentication (admin)
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
    console.log("Failed to parse admin body:", adminLoginRes.body);
  }

  assert(
    adminLoginRes.statusCode === 200 &&
      adminData.user?.role === "ADMIN" &&
      adminCookieStr.length > 0,
    `Admin authentication succeeds with role ADMIN (status=${adminLoginRes.statusCode}, role=${adminData.user?.role}, cookie=${adminCookieStr ? 'YES' : 'NO'})`
  );

  // 9. Test Admin Access to /admin
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
    "Authenticated Admin has full access to Admin Dashboard (200 OK)"
  );

  // 10. Test Admin API Stats
  const adminStatsRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/admin/stats',
    method: 'GET',
    headers: {
      Cookie: adminCookieStr,
    },
  });
  const statsData = JSON.parse(adminStatsRes.body);
  assert(
    adminStatsRes.statusCode === 200 && statsData.stats?.totalUsers >= 50,
    `Admin API stats fetched successfully (Total Cohort Members: ${statsData.stats?.totalUsers})`
  );

  // 11. Test Logout Endpoint
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
