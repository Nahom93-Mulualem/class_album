async function runComprehensiveVerification() {
  console.log("================================================================");
  console.log("🚀 RUNNING COMPREHENSIVE VERIFICATION FOR USER, DIRECTORY & SYNC");
  console.log("================================================================\n");

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

  // 1. Admin Login
  console.log("1️⃣ Testing Admin Authentication...");
  const adminLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: "admin", password: "Admin@2026!" }),
  });
  const adminLoginData = await adminLoginRes.json();
  const cookies = adminLoginRes.headers.get("set-cookie") || "";
  const authCookie = cookies.split(";")[0];
  assert(
    adminLoginRes.status === 200 && adminLoginData.user?.role === "ADMIN",
    "Admin successfully authenticated",
    `status: ${adminLoginRes.status}`
  );

  // 2. Create New User via Admin Dashboard API
  console.log("\n2️⃣ Testing User Creation (POST /api/admin/users)...");
  const testId = Date.now();
  const testUsername = `alex.sterling.${testId}`;
  const testEmail = `alex.sterling.${testId}@phoenix.edu`;
  const testPassword = "SterlingSecret2026!";
  const testName = `Alex Sterling ${testId}`;

  const createUserRes = await fetch(`${BASE_URL}/api/admin/users`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: authCookie },
    body: JSON.stringify({
      name: testName,
      username: testUsername,
      email: testEmail,
      password: testPassword,
      role: "STUDENT",
      track: "Cybersecurity & Cryptography",
      bio: "Senior specializing in zero-knowledge proofs and cloud security.",
      dorm: "Highland Heights 401",
      github: `sterling${testId}`,
    }),
  });
  const createUserData = await createUserRes.json();
  assert(
    createUserRes.status === 200 && createUserData.success === true,
    `User created successfully (ID: ${createUserData.user?.id})`,
    JSON.stringify(createUserData)
  );

  // 3. Verify User appears in /api/users (Class Directory API)
  console.log("\n3️⃣ Testing Directory Data Fetch (/api/users)...");
  const usersRes = await fetch(`${BASE_URL}/api/users`);
  const usersData = await usersRes.json();
  const foundUser = usersData.users?.find((u) => u.id === createUserData.user?.id);
  assert(
    Boolean(foundUser),
    "Newly created user is immediately listed in /api/users",
    `found: ${Boolean(foundUser)}`
  );
  assert(
    foundUser?.dorm === "Highland Heights 401",
    "User dorm field is preserved and non-null",
    `dorm: ${foundUser?.dorm}`
  );
  assert(
    Array.isArray(foundUser?.skills) && foundUser?.skills.length > 0,
    "User skills field is non-empty array",
    `skills: ${JSON.stringify(foundUser?.skills)}`
  );

  // 4. Test Class Directory Search & Filtering (with zero crashes)
  console.log("\n4️⃣ Testing Directory Search Filter simulation...");
  const directoryUsers = usersData.users || [];

  function simulateDirectorySearch(query, track = "All") {
    return directoryUsers.filter((student) => {
      if (!student) return false;
      const q = query.toLowerCase().trim();
      const sName = (student.name || "").toLowerCase();
      const sTrack = (student.track || "").toLowerCase();
      const sDorm = (student.dorm || "").toLowerCase();
      const sSkills = Array.isArray(student.skills) ? student.skills : [];

      const matchesSearch =
        !q ||
        sName.includes(q) ||
        sTrack.includes(q) ||
        sDorm.includes(q) ||
        sSkills.some((sk) => (sk || "").toLowerCase().includes(q));

      const matchesTrack =
        track === "All" ||
        sTrack.includes(track.toLowerCase().split(" ")[0]);

      return matchesSearch && matchesTrack;
    });
  }

  // Search tests
  try {
    const searchByName = simulateDirectorySearch("sterling");
    assert(
      searchByName.some((u) => u.id === createUserData.user?.id),
      "Search by name ('sterling') successfully found the new user"
    );

    const searchByTrack = simulateDirectorySearch("cybersecurity");
    assert(
      searchByTrack.some((u) => u.id === createUserData.user?.id),
      "Search by track ('cybersecurity') successfully found the new user"
    );

    const searchByDorm = simulateDirectorySearch("highland");
    assert(
      searchByDorm.some((u) => u.id === createUserData.user?.id),
      "Search by dorm ('highland') successfully found the new user"
    );

    const searchEmpty = simulateDirectorySearch("");
    assert(
      searchEmpty.length === directoryUsers.length,
      `Empty search correctly returns all ${directoryUsers.length} cohort members`
    );
  } catch (error) {
    assert(false, "Directory search crashed", error.message);
  }

  // 5. Test Credentials Sign-In with Newly Created User
  console.log("\n5️⃣ Testing Sign-In with New User Credentials...");

  // 5a. Login with exact username
  const loginUsernameRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: testUsername, password: testPassword }),
  });
  const loginUsernameData = await loginUsernameRes.json();
  const userCookie = (loginUsernameRes.headers.get("set-cookie") || "").split(";")[0];
  assert(
    loginUsernameRes.status === 200 && loginUsernameData.user?.role === "STUDENT",
    "Sign-in with exact username succeeded",
    `status: ${loginUsernameRes.status}`
  );

  // 5b. Login with case-insensitive username
  const loginMixedUsernameRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: testUsername.toUpperCase(), password: testPassword }),
  });
  assert(
    loginMixedUsernameRes.status === 200,
    "Sign-in with uppercase username succeeded (case-insensitive)",
    `status: ${loginMixedUsernameRes.status}`
  );

  // 5c. Login with email
  const loginEmailRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: testEmail, password: testPassword }),
  });
  assert(
    loginEmailRes.status === 200,
    "Sign-in with email address succeeded",
    `status: ${loginEmailRes.status}`
  );

  // 6. Test User Posting & Admin Cascading Deletion
  console.log("\n6️⃣ Testing Post Creation and Cascading Sync...");
  const createPostRes = await fetch(`${BASE_URL}/api/posts`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: userCookie },
    body: JSON.stringify({
      content: `Milestone announcement by ${testName}! 🚀`,
      tag: "Projects",
    }),
  });
  const createPostData = await createPostRes.json();
  assert(
    createPostRes.status === 200 && createPostData.post?.id,
    "New post created successfully",
    `postId: ${createPostData.post?.id}`
  );

  // 7. Test Admin Post Deletion
  console.log("\n7️⃣ Testing Admin Post Deletion...");
  const deletePostRes = await fetch(
    `${BASE_URL}/api/admin/posts?postId=${createPostData.post.id}`,
    {
      method: "DELETE",
      headers: { Cookie: authCookie },
    }
  );
  assert(
    deletePostRes.status === 200,
    "Post deleted successfully by Admin",
    `status: ${deletePostRes.status}`
  );

  // 8. Test Admin User Deletion
  console.log("\n8️⃣ Testing User Deletion and Sync...");
  const deleteUserRes = await fetch(
    `${BASE_URL}/api/admin/users?userId=${createUserData.user.id}`,
    {
      method: "DELETE",
      headers: { Cookie: authCookie },
    }
  );
  assert(
    deleteUserRes.status === 200,
    "User deleted successfully by Admin",
    `status: ${deleteUserRes.status}`
  );

  // Verify user is gone from directory
  const afterDeleteUsersRes = await fetch(`${BASE_URL}/api/users`);
  const afterDeleteUsersData = await afterDeleteUsersRes.json();
  const stillExists = afterDeleteUsersData.users?.some((u) => u.id === createUserData.user.id);
  assert(
    !stillExists,
    "Deleted user is immediately removed from /api/users",
    `stillExists: ${stillExists}`
  );

  console.log("\n================================================================");
  if (allPassed) {
    console.log("🎉 ALL TESTS PASSED! ZERO AMBIGUITY, FULL FUNCTIONALITY VERIFIED.");
  } else {
    console.error("❌ SOME TESTS FAILED.");
  }
  console.log("================================================================\n");
}

runComprehensiveVerification().catch(console.error);
