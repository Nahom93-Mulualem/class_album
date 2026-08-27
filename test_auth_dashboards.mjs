async function verifyAuthAndDashboards() {
  console.log("🚀 Starting Auth & Role-Based Dashboard Verification...\n");
  const BASE_URL = "http://localhost:3000";

  let allPassed = true;

  function assert(condition, label, details = "") {
    if (condition) {
      console.log(`   ✅ PASS: ${label}`);
    } else {
      console.error(`   ❌ FAIL: ${label} ${details ? `(${details})` : ""}`);
      allPassed = false;
    }
  }

  // 1. Test unauthenticated redirect on /
  console.log("1️⃣ Testing unauthenticated access to / (should redirect to /login)...");
  const unauthFeedRes = await fetch(`${BASE_URL}/`, { redirect: "manual" });
  assert(
    unauthFeedRes.status === 307 || unauthFeedRes.status === 302,
    "Unauthenticated access to / redirected",
    `status ${unauthFeedRes.status}`
  );
  const unauthFeedLocation = unauthFeedRes.headers.get("location") || "";
  assert(
    unauthFeedLocation.includes("/login"),
    "Redirect target is /login",
    `location: ${unauthFeedLocation}`
  );

  // 2. Test unauthenticated redirect on /admin
  console.log("\n2️⃣ Testing unauthenticated access to /admin (should redirect to /login)...");
  const unauthAdminRes = await fetch(`${BASE_URL}/admin`, { redirect: "manual" });
  assert(
    unauthAdminRes.status === 307 || unauthAdminRes.status === 302,
    "Unauthenticated access to /admin redirected",
    `status ${unauthAdminRes.status}`
  );
  const unauthAdminLocation = unauthAdminRes.headers.get("location") || "";
  assert(
    unauthAdminLocation.includes("/login"),
    "Redirect target is /login",
    `location: ${unauthAdminLocation}`
  );

  // 3. Test unauthenticated access to /login (should load 200)
  console.log("\n3️⃣ Testing access to /login...");
  const loginPageRes = await fetch(`${BASE_URL}/login`, { redirect: "manual" });
  assert(
    loginPageRes.status === 200,
    "Login page serves status 200 directly",
    `status ${loginPageRes.status}`
  );

  // 4. Test Student Login (alex.chen)
  console.log("\n4️⃣ Testing Student Login (alex.chen)...");
  const studentLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: "alex.chen", password: "Student@2026!" }),
  });
  const studentLoginData = await studentLoginRes.json();
  const studentCookieHeader = studentLoginRes.headers.get("set-cookie") || "";
  const studentCookie = studentCookieHeader.split(";")[0];

  assert(
    studentLoginRes.ok && studentLoginData.user?.role === "STUDENT",
    `Student authenticated (${studentLoginData.user?.name}, role: ${studentLoginData.user?.role})`
  );

  // 5. Test Student visiting / (User Dashboard) -> Should serve 200
  console.log("\n5️⃣ Testing Student accessing User Dashboard (/)...");
  const studentFeedRes = await fetch(`${BASE_URL}/`, {
    headers: { Cookie: studentCookie },
    redirect: "manual",
  });
  assert(
    studentFeedRes.status === 200,
    "Student successfully granted access to User Dashboard (/)",
    `status ${studentFeedRes.status}`
  );

  // 6. Test Student visiting /admin (Admin Dashboard) -> Should be blocked & redirected to /
  console.log("\n6️⃣ Testing Student attempting to access Admin Dashboard (/admin)...");
  const studentAdminRes = await fetch(`${BASE_URL}/admin`, {
    headers: { Cookie: studentCookie },
    redirect: "manual",
  });
  assert(
    studentAdminRes.status === 307 || studentAdminRes.status === 302,
    "Student blocked from /admin and redirected",
    `status ${studentAdminRes.status}`
  );
  const studentAdminRedirect = studentAdminRes.headers.get("location") || "";
  assert(
    studentAdminRedirect.includes("error=access_denied_admin_only") || studentAdminRedirect.startsWith("/"),
    "Redirected to student lounge with access denied query",
    `location: ${studentAdminRedirect}`
  );

  // 7. Test Student visiting /login -> Should redirect to /
  console.log("\n7️⃣ Testing Student visiting /login while authenticated...");
  const studentVisitLogin = await fetch(`${BASE_URL}/login`, {
    headers: { Cookie: studentCookie },
    redirect: "manual",
  });
  assert(
    studentVisitLogin.status === 307 || studentVisitLogin.status === 302,
    "Logged-in student visiting /login redirected to User Dashboard (/)",
    `location: ${studentVisitLogin.headers.get("location")}`
  );

  // 8. Test Admin Login (admin)
  console.log("\n8️⃣ Testing Admin Login (admin)...");
  const adminLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: "admin", password: "Admin@2026!" }),
  });
  const adminLoginData = await adminLoginRes.json();
  const adminCookieHeader = adminLoginRes.headers.get("set-cookie") || "";
  const adminCookie = adminCookieHeader.split(";")[0];

  assert(
    adminLoginRes.ok && adminLoginData.user?.role === "ADMIN",
    `Admin authenticated (${adminLoginData.user?.name}, role: ${adminLoginData.user?.role})`
  );

  // 9. Test Admin visiting /admin (Admin Dashboard) -> Should serve 200
  console.log("\n9️⃣ Testing Admin accessing Admin Dashboard (/admin)...");
  const adminDashRes = await fetch(`${BASE_URL}/admin`, {
    headers: { Cookie: adminCookie },
    redirect: "manual",
  });
  assert(
    adminDashRes.status === 200,
    "Admin successfully granted access to Admin Dashboard (/admin)",
    `status ${adminDashRes.status}`
  );

  // 10. Test Admin visiting / (Student Lounge) -> Should serve 200 (admin can view student feed)
  console.log("\n🔟 Testing Admin viewing Student Lounge (/)...");
  const adminFeedRes = await fetch(`${BASE_URL}/`, {
    headers: { Cookie: adminCookie },
    redirect: "manual",
  });
  assert(
    adminFeedRes.status === 200,
    "Admin can also view the Student Lounge (Feed)",
    `status ${adminFeedRes.status}`
  );

  // 11. Test Admin visiting /login -> Should redirect to /admin
  console.log("\n1️⃣1️⃣ Testing Admin visiting /login while authenticated...");
  const adminVisitLogin = await fetch(`${BASE_URL}/login`, {
    headers: { Cookie: adminCookie },
    redirect: "manual",
  });
  assert(
    (adminVisitLogin.status === 307 || adminVisitLogin.status === 302) &&
      (adminVisitLogin.headers.get("location") || "").includes("/admin"),
    "Logged-in admin visiting /login redirected to Admin Dashboard (/admin)",
    `location: ${adminVisitLogin.headers.get("location")}`
  );

  // 12. Test Logout
  console.log("\n1️⃣2️⃣ Testing Logout API...");
  const logoutRes = await fetch(`${BASE_URL}/api/auth/logout`, {
    method: "POST",
    headers: { Cookie: adminCookie },
  });
  const logoutCookieHeader = logoutRes.headers.get("set-cookie") || "";
  assert(
    logoutRes.ok && logoutCookieHeader.includes("Max-Age=0"),
    "Logout revoked auth cookie"
  );

  // 13. Verify request after logout is redirected to /login
  console.log("\n1️⃣3️⃣ Verifying protected route after logout...");
  const postLogoutRes = await fetch(`${BASE_URL}/admin`, {
    headers: { Cookie: "phoenix_auth_token=" },
    redirect: "manual",
  });
  assert(
    postLogoutRes.status === 307 || postLogoutRes.status === 302,
    "Access to /admin immediately blocked after logout and redirected to /login"
  );

  console.log("\n========================================================");
  if (allPassed) {
    console.log("🎉 ALL AUTH & DASHBOARD TESTS PASSED WITH 100% SUCCESS! 🚀");
  } else {
    console.error("❌ SOME TESTS FAILED! Please inspect errors above.");
    process.exit(1);
  }
}

verifyAuthAndDashboards().catch((err) => {
  console.error("Test error:", err);
  process.exit(1);
});
