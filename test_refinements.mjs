const BASE_URL = "http://localhost:3000";

async function runTests() {
  console.log("🧪 Starting Phoenix Lounge Refinements Verification...\n");
  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`   ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`   ❌ FAIL: ${message}`);
      failed++;
    }
  }

  try {
    // Step 1: Login as student (alex.chen / Student@2026!)
    console.log("1️⃣ Testing Student Authentication...");
    const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: "alex.chen", password: "Student@2026!" }),
    });
    assert(loginRes.status === 200, "Student alex.chen logged in successfully");

    const rawCookie = loginRes.headers.getSetCookie ? loginRes.headers.getSetCookie() : [loginRes.headers.get("set-cookie")];
    const cookieHeader = (rawCookie || []).filter(Boolean).map((c) => c.split(";")[0]).join("; ");
    assert(cookieHeader.includes("phoenix_auth_token"), "Auth token cookie present in response");

    // Step 2: Test Change Password with invalid current password
    console.log("\n2️⃣ Testing Password Management Validations...");
    const wrongPassRes = await fetch(`${BASE_URL}/api/auth/change-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookieHeader,
      },
      body: JSON.stringify({
        currentPassword: "wrongpassword123",
        newPassword: "newpassword123",
        confirmPassword: "newpassword123",
      }),
    });
    assert(wrongPassRes.status === 400, "Rejects incorrect current password with 400 status");

    // Step 3: Test Password mismatch
    const mismatchRes = await fetch(`${BASE_URL}/api/auth/change-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookieHeader,
      },
      body: JSON.stringify({
        currentPassword: "Student@2026!",
        newPassword: "newpassword123",
        confirmPassword: "mismatchpassword",
      }),
    });
    assert(mismatchRes.status === 400, "Rejects mismatched confirmation password with 400 status");

    // Step 4: Successfully change password to studentNew456!
    console.log("\n3️⃣ Testing Successful Student Password Change & Re-login...");
    const changeRes = await fetch(`${BASE_URL}/api/auth/change-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookieHeader,
      },
      body: JSON.stringify({
        currentPassword: "Student@2026!",
        newPassword: "studentNew456!",
        confirmPassword: "studentNew456!",
      }),
    });
    const changeData = await changeRes.json();
    assert(changeRes.status === 200 && changeData.success, "Password changed successfully to studentNew456!");

    // Test logging in with old password (should fail)
    const oldLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: "alex.chen", password: "Student@2026!" }),
    });
    assert(oldLoginRes.status === 401, "Old password rejected after password change");

    // Test logging in with NEW password (should succeed)
    const newLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: "alex.chen", password: "studentNew456!" }),
    });
    assert(newLoginRes.status === 200, "New password authenticated successfully");

    const newRawCookie = newLoginRes.headers.getSetCookie ? newLoginRes.headers.getSetCookie() : [newLoginRes.headers.get("set-cookie")];
    const newCookieHeader = (newRawCookie || []).filter(Boolean).map((c) => c.split(";")[0]).join("; ");

    // Revert password back to Student@2026! so workspace tests remain consistent
    const revertRes = await fetch(`${BASE_URL}/api/auth/change-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: newCookieHeader,
      },
      body: JSON.stringify({
        currentPassword: "studentNew456!",
        newPassword: "Student@2026!",
        confirmPassword: "Student@2026!",
      }),
    });
    assert(revertRes.status === 200, "Password reverted cleanly back to original password");

    // Step 5: Test Real-time Messaging API
    console.log("\n4️⃣ Testing Persistent Messaging & Read Receipts API...");
    // Get Sarah Jenkins ID from student list or DB
    const meRes = await fetch(`${BASE_URL}/api/auth/me`, {
      headers: { Cookie: cookieHeader },
    });
    const meData = await meRes.json();
    assert(meData.user?.username === "alex.chen", "Verified authenticated user is alex.chen");

    // Send a message
    const sendMsgRes = await fetch(`${BASE_URL}/api/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookieHeader,
      },
      body: JSON.stringify({
        receiverId: meData.user.id, // self test message or partner
        text: "Hello from automated test!",
      }),
    });
    const sendMsgData = await sendMsgRes.json();
    assert(sendMsgRes.status === 200 && sendMsgData.message?.text === "Hello from automated test!", "POST /api/messages successfully created message");

    // Fetch messages
    const getMsgRes = await fetch(`${BASE_URL}/api/messages?partnerId=${meData.user.id}`, {
      headers: { Cookie: cookieHeader },
    });
    const getMsgData = await getMsgRes.json();
    assert(Array.isArray(getMsgData.messages) && getMsgData.messages.length > 0, "GET /api/messages returned messages array");

    // Mark as read
    const markReadRes = await fetch(`${BASE_URL}/api/messages/read`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookieHeader,
      },
      body: JSON.stringify({
        partnerId: meData.user.id,
      }),
    });
    const markReadData = await markReadRes.json();
    assert(markReadRes.status === 200 && markReadData.success, "PATCH /api/messages/read marked messages as read");

    // Step 6: Test Change Username Feature
    console.log("\n5️⃣ Testing Change Username & Validation API...");
    // 6a: Test invalid characters
    const invalidCharRes = await fetch(`${BASE_URL}/api/auth/change-username`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: cookieHeader },
      body: JSON.stringify({
        currentPassword: "Student@2026!",
        newUsername: "alex with spaces",
      }),
    });
    assert(invalidCharRes.status === 400, "Rejects username containing spaces or invalid characters");

    // 6b: Test too short username (< 4 chars)
    const shortUserRes = await fetch(`${BASE_URL}/api/auth/change-username`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: cookieHeader },
      body: JSON.stringify({
        currentPassword: "Student@2026!",
        newUsername: "ale",
      }),
    });
    assert(shortUserRes.status === 400, "Rejects username with less than 4 characters (e.g. 'ale')");

    // 6c: Test too long username (> 12 chars)
    const longUserRes = await fetch(`${BASE_URL}/api/auth/change-username`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: cookieHeader },
      body: JSON.stringify({
        currentPassword: "Student@2026!",
        newUsername: "alexander.phoenix",
      }),
    });
    assert(longUserRes.status === 400, "Rejects username with more than 12 characters (e.g. 'alexander.phoenix')");

    // 6d: Test duplicate username rejection (try changing to admin username)
    const dupUserRes = await fetch(`${BASE_URL}/api/auth/change-username`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: cookieHeader },
      body: JSON.stringify({
        currentPassword: "Student@2026!",
        newUsername: "admin",
      }),
    });
    assert(dupUserRes.status === 409, "Rejects duplicate/taken username with 409 Conflict");

    // 6e: Successfully change username (between 4 and 12 chars: 'alex.phx')
    console.log("\n6️⃣ Testing Successful Username Change & Old Username Invalidation...");
    const changeUserRes = await fetch(`${BASE_URL}/api/auth/change-username`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: cookieHeader },
      body: JSON.stringify({
        currentPassword: "Student@2026!",
        newUsername: "alex.phx",
      }),
    });
    const changeUserData = await changeUserRes.json();
    assert(changeUserRes.status === 200 && changeUserData.username === "alex.phx", "Username changed successfully to @alex.phx (between 4 and 12 chars)");

    // Test logging in with OLD username (must fail)
    const oldUserLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: "alex.chen", password: "Student@2026!" }),
    });
    assert(oldUserLoginRes.status === 401, "Old username 'alex.chen' rejected after change");

    // Test logging in with NEW username (must succeed)
    const newUserLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: "alex.phx", password: "Student@2026!" }),
    });
    assert(newUserLoginRes.status === 200, "New username 'alex.phx' authenticated successfully");

    const userCookieRaw = newUserLoginRes.headers.getSetCookie ? newUserLoginRes.headers.getSetCookie() : [newUserLoginRes.headers.get("set-cookie")];
    const userCookieHeader = (userCookieRaw || []).filter(Boolean).map((c) => c.split(";")[0]).join("; ");

    // Step 7: Test Simultaneous Username + Password Change (Change Credentials API)
    console.log("\n7️⃣ Testing Simultaneous Username & Password Update (First-login / Both Credentials)...");
    const changeBothRes = await fetch(`${BASE_URL}/api/auth/change-credentials`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: userCookieHeader },
      body: JSON.stringify({
        currentPassword: "Student@2026!",
        newUsername: "alex.chen",
        newPassword: "UpdatedSeniorPass2026!",
        confirmPassword: "UpdatedSeniorPass2026!",
      }),
    });
    const changeBothData = await changeBothRes.json();
    assert(changeBothRes.status === 200 && changeBothData.success, "Updated both username and password simultaneously");

    // Test login with new credentials (alex.chen + UpdatedSeniorPass2026!)
    const bothLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: "alex.chen", password: "UpdatedSeniorPass2026!" }),
    });
    assert(bothLoginRes.status === 200, "Logged in with new username + new password");

    const finalRaw = bothLoginRes.headers.getSetCookie ? bothLoginRes.headers.getSetCookie() : [bothLoginRes.headers.get("set-cookie")];
    const finalCookie = (finalRaw || []).filter(Boolean).map((c) => c.split(";")[0]).join("; ");

    // Revert password back to original Student@2026!
    const revertBackRes = await fetch(`${BASE_URL}/api/auth/change-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: finalCookie },
      body: JSON.stringify({
        currentPassword: "UpdatedSeniorPass2026!",
        newPassword: "Student@2026!",
        confirmPassword: "Student@2026!",
      }),
    });
    assert(revertBackRes.status === 200, "Reverted credentials back to default (alex.chen / Student@2026!)");

    console.log("\n========================================================");
    if (failed === 0) {
      console.log(`🎉 ALL ${passed} TESTS PASSED SUCCESSFULLY!`);
    } else {
      console.error(`❌ ${failed} TESTS FAILED out of ${passed + failed}`);
      process.exit(1);
    }
  } catch (err) {
    console.error("Test execution failed:", err);
    process.exit(1);
  }
}

runTests();
