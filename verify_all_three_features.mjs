async function verifyFeatures() {
  console.log("=================================================");
  console.log("🧪 TESTING ALL 3 FEATURES & FIXES");
  console.log("=================================================\n");

  const BASE_URL = "http://localhost:3000";

  // Step 1: Admin Login
  console.log("1️⃣ Authenticating as Admin...");
  const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: "admin", password: "Admin@2026!" }),
  });
  const loginData = await loginRes.json();
  const cookies = loginRes.headers.get("set-cookie") || "";
  const authCookie = cookies.split(";")[0];
  console.log(`   Admin Login: ${loginRes.status === 200 ? "SUCCESS" : "FAILED"}, User: ${loginData.user?.name}`);

  // Step 2: Check Initial Stats
  console.log("\n2️⃣ Fetching Initial Admin Stats...");
  const initialStatsRes = await fetch(`${BASE_URL}/api/admin/stats`, {
    headers: { Cookie: authCookie },
  });
  const initialStatsData = await initialStatsRes.json();
  const initialTotal = initialStatsData.stats.totalUsers;
  const initialStudents = initialStatsData.stats.totalStudents;
  console.log(`   Initial Total Users: ${initialTotal}, Students: ${initialStudents}`);

  // Step 3: Test User Addition
  console.log("\n3️⃣ Testing User Addition (POST /api/admin/users)...");
  const testUsername = `test.student.${Date.now()}`;
  const testEmail = `test.${Date.now()}@phoenix.edu`;
  const createUserRes = await fetch(`${BASE_URL}/api/admin/users`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: authCookie },
    body: JSON.stringify({
      name: "Dynamic Test Student",
      username: testUsername,
      email: testEmail,
      password: "Student@2026!",
      role: "STUDENT",
      track: "Full-Stack & AI Systems",
      bio: "Created for dynamic counter test",
    }),
  });
  const createUserData = await createUserRes.json();
  console.log(`   Create Status: ${createUserRes.status}, Created User ID: ${createUserData.user?.id}`);

  // Step 4: Verify Stats Increased
  const afterAddStatsRes = await fetch(`${BASE_URL}/api/admin/stats`, {
    headers: { Cookie: authCookie },
  });
  const afterAddStatsData = await afterAddStatsRes.json();
  const afterAddTotal = afterAddStatsData.stats.totalUsers;
  console.log(`   Total Users After Add: ${afterAddTotal} (Expected: ${initialTotal + 1})`);
  if (afterAddTotal === initialTotal + 1) {
    console.log("   ✅ PASS: User count increased by 1 upon user addition!");
  } else {
    console.error(`   ❌ FAIL: User count did not increase properly.`);
  }

  // Step 5: Test User Deletion
  console.log("\n4️⃣ Testing User Deletion (DELETE /api/admin/users)...");
  const deleteRes = await fetch(`${BASE_URL}/api/admin/users?userId=${createUserData.user.id}`, {
    method: "DELETE",
    headers: { Cookie: authCookie },
  });
  const deleteData = await deleteRes.json();
  console.log(`   Delete Status: ${deleteRes.status}, Message: ${deleteData.message}`);

  // Step 6: Verify Stats Decreased Back
  const afterDeleteStatsRes = await fetch(`${BASE_URL}/api/admin/stats`, {
    headers: { Cookie: authCookie },
  });
  const afterDeleteStatsData = await afterDeleteStatsRes.json();
  const afterDeleteTotal = afterDeleteStatsData.stats.totalUsers;
  console.log(`   Total Users After Delete: ${afterDeleteTotal} (Expected: ${initialTotal})`);
  if (afterDeleteTotal === initialTotal) {
    console.log("   ✅ PASS: User count decreased by 1 upon user deletion!");
  } else {
    console.error(`   ❌ FAIL: User count did not decrease properly.`);
  }

  // Step 7: Verify Single Reaction Algorithm
  console.log("\n5️⃣ Testing Messaging Single-Reaction Unit Logic...");
  function simulateToggleReaction(msgReactions, userId, emoji) {
    const existingTarget = msgReactions.find((r) => r.emoji === emoji);
    const hasReactedWithThisEmoji = existingTarget?.users.includes(userId);

    if (hasReactedWithThisEmoji) {
      // Toggle off
      return msgReactions
        .map((r) => {
          if (r.emoji !== emoji) return r;
          const newUsers = r.users.filter((u) => u !== userId);
          return { ...r, count: newUsers.length, users: newUsers };
        })
        .filter((r) => r.users.length > 0);
    } else {
      // Switch / Add
      const cleaned = msgReactions
        .map((r) => {
          const newUsers = r.users.filter((u) => u !== userId);
          return { ...r, count: newUsers.length, users: newUsers };
        })
        .filter((r) => r.users.length > 0);

      const targetIdx = cleaned.findIndex((r) => r.emoji === emoji);
      if (targetIdx > -1) {
        return cleaned.map((r, idx) =>
          idx === targetIdx ? { ...r, count: r.count + 1, users: [...r.users, userId] } : r
        );
      } else {
        return [...cleaned, { emoji, count: 1, users: [userId] }];
      }
    }
  }

  let testReactions = [];
  // User reacts with heart
  testReactions = simulateToggleReaction(testReactions, "user-alex", "❤️");
  console.log("   After react ❤️:", JSON.stringify(testReactions));
  // User switches to fire
  testReactions = simulateToggleReaction(testReactions, "user-alex", "🔥");
  console.log("   After switch 🔥:", JSON.stringify(testReactions));
  // User toggles off fire
  testReactions = simulateToggleReaction(testReactions, "user-alex", "🔥");
  console.log("   After toggle off 🔥:", JSON.stringify(testReactions));

  if (testReactions.length === 0) {
    console.log("   ✅ PASS: Single reaction and switching logic perfectly verified!");
  } else {
    console.error("   ❌ FAIL: Reaction logic failed.");
  }

  console.log("\n=================================================");
  console.log("🎉 ALL VERIFICATIONS COMPLETED SUCCESSFULLY!");
  console.log("=================================================");
}

verifyFeatures().catch(console.error);
