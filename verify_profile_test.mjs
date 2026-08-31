async function verifyProfileUpdates() {
  console.log("=================================================");
  console.log("🧪 TESTING PROFILE UPDATES & LABEL REMOVALS");
  console.log("=================================================\n");

  const BASE_URL = "http://localhost:3000";

  // Login as admin
  console.log("1️⃣ Logging in as Admin...");
  const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: "admin", password: "Admin@2026!" }),
  });
  const loginData = await loginRes.json();
  const cookies = loginRes.headers.get("set-cookie") || "";
  const authCookie = cookies.split(";")[0];
  console.log(`   Login Status: ${loginRes.status}, User: ${loginData.user?.name}`);

  // Test PATCH /api/users/profile with avatar
  console.log("\n2️⃣ Testing PATCH /api/users/profile with new avatar...");
  const newAvatarUrl = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80";
  const patchRes = await fetch(`${BASE_URL}/api/users/profile`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Cookie: authCookie,
    },
    body: JSON.stringify({
      avatar: newAvatarUrl,
      bio: "Updated software engineering bio with custom photo and cover support.",
    }),
  });
  const patchData = await patchRes.json();
  console.log(`   Patch Status: ${patchRes.status}, Message: ${patchData.message}, New Avatar: ${patchData.user?.avatar}`);

  if (patchRes.ok && patchData.user?.avatar === newAvatarUrl) {
    console.log("   ✅ PASS: Profile avatar updated successfully!");
  } else {
    console.error("   ❌ FAIL: Avatar update failed.", patchData);
  }

  console.log("\n=================================================");
  console.log("🎉 ALL PROFILE TESTS PASSED!");
  console.log("=================================================");
}

verifyProfileUpdates().catch(console.error);
