async function runMemoryVaultDeletionVerification() {
  console.log("================================================================");
  console.log("🚀 VERIFYING MEMORY VAULT POST CREATION, FAST DELETION & DB SYNC");
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

  // 1. Authenticate Admin
  console.log("1️⃣ Authenticating Admin Account...");
  const adminLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: "admin", password: "Admin@2026!" }),
  });
  const adminCookie = (adminLoginRes.headers.get("set-cookie") || "").split(";")[0];
  assert(adminLoginRes.status === 200, "Admin login succeeded", `status: ${adminLoginRes.status}`);

  // 2. Authenticate Student (alex.chen)
  console.log("\n2️⃣ Authenticating Senior Student (alex.chen)...");
  const studentLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: "alex.chen", password: "Student@2026!" }),
  });
  const studentCookie = (studentLoginRes.headers.get("set-cookie") || "").split(";")[0];
  assert(studentLoginRes.status === 200, "Student login succeeded", `status: ${studentLoginRes.status}`);

  // 3. Upload a new memory to Memory Vault as Student
  console.log("\n3️⃣ Uploading New Memory Post to Vault (POST /api/memories)...");
  const timestamp = Date.now();
  const testTitle = `Capstone Demo Day Robotics Milestone ${timestamp}`;
  const testStory = "Presented our autonomous aerial mapping rover at the Senior Tech Expo 2026!";

  const createMemoryRes = await fetch(`${BASE_URL}/api/memories`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: studentCookie },
    body: JSON.stringify({
      title: testTitle,
      story: testStory,
      category: "Graduation",
      year: "2026",
      date: "May 2026",
      location: "Main Engineering Quad",
      image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1200",
      aspect: "featured",
    }),
  });
  const createMemoryData = await createMemoryRes.json();
  const createdMemoryId = createMemoryData.memory?.id;
  assert(
    createMemoryRes.status === 200 && Boolean(createdMemoryId),
    `Memory uploaded successfully (ID: ${createdMemoryId})`,
    JSON.stringify(createMemoryData)
  );

  // 4. Verify Memory appears in /api/memories (Live Memory Vault API)
  console.log("\n4️⃣ Verifying Memory in Public Vault API (/api/memories)...");
  const getMemoriesRes = await fetch(`${BASE_URL}/api/memories`);
  const getMemoriesData = await getMemoriesRes.json();
  const foundInVault = (getMemoriesData.memories || []).find((m) => m.id === createdMemoryId);
  assert(
    Boolean(foundInVault),
    "Uploaded memory is immediately returned by /api/memories",
    `found: ${Boolean(foundInVault)}`
  );
  assert(
    foundInVault?.title === testTitle,
    "Memory title matches perfectly in DB",
    `title: ${foundInVault?.title}`
  );

  // 5. Verify Memory appears in Admin Dashboard API (/api/admin/memories)
  console.log("\n5️⃣ Verifying Memory in Admin Dashboard API (/api/admin/memories)...");
  const getAdminMemoriesRes = await fetch(`${BASE_URL}/api/admin/memories`, {
    headers: { Cookie: adminCookie },
  });
  const getAdminMemoriesData = await getAdminMemoriesRes.json();
  const foundInAdmin = (getAdminMemoriesData.memories || []).find((m) => m.id === createdMemoryId);
  assert(
    Boolean(foundInAdmin),
    "Uploaded memory is immediately listed in Admin Memory Vault moderation",
    `found: ${Boolean(foundInAdmin)}`
  );

  // 6. Test Admin Deletion of Memory Post (DELETE /api/admin/memories?memoryId=...)
  console.log("\n6️⃣ Testing Admin Memory Deletion (DELETE /api/admin/memories)...");
  const deleteMemoryRes = await fetch(
    `${BASE_URL}/api/admin/memories?memoryId=${createdMemoryId}`,
    {
      method: "DELETE",
      headers: { Cookie: adminCookie },
    }
  );
  const deleteMemoryData = await deleteMemoryRes.json();
  assert(
    deleteMemoryRes.status === 200 && deleteMemoryData.success === true,
    "Admin successfully deleted the memory post from PostgreSQL",
    JSON.stringify(deleteMemoryData)
  );

  // 7. Verify Database reflects deletion immediately across all endpoints
  console.log("\n7️⃣ Verifying Fast DB Update across endpoints after deletion...");
  const verifyVaultAfterDeleteRes = await fetch(`${BASE_URL}/api/memories`);
  const verifyVaultAfterDeleteData = await verifyVaultAfterDeleteRes.json();
  const stillInVault = (verifyVaultAfterDeleteData.memories || []).some(
    (m) => m.id === createdMemoryId
  );
  assert(
    !stillInVault,
    "Deleted memory is instantly removed from public /api/memories",
    `stillInVault: ${stillInVault}`
  );

  const verifyAdminAfterDeleteRes = await fetch(`${BASE_URL}/api/admin/memories`, {
    headers: { Cookie: adminCookie },
  });
  const verifyAdminAfterDeleteData = await verifyAdminAfterDeleteRes.json();
  const stillInAdmin = (verifyAdminAfterDeleteData.memories || []).some(
    (m) => m.id === createdMemoryId
  );
  assert(
    !stillInAdmin,
    "Deleted memory is instantly removed from /api/admin/memories",
    `stillInAdmin: ${stillInAdmin}`
  );

  // 8. Test Security: Unauthorized Student cannot delete other student's memories
  console.log("\n8️⃣ Testing Security & Permission Boundaries...");
  // Create another memory as admin
  const mem2Res = await fetch(`${BASE_URL}/api/memories`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: adminCookie },
    body: JSON.stringify({
      title: "Faculty Special Commendation",
      story: "Honoring our department advisors.",
      category: "Graduation",
      year: "2026",
      image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1200",
    }),
  });
  const mem2Data = await mem2Res.json();
  const mem2Id = mem2Data.memory?.id;

  // Student tries to delete Admin's memory via /api/memories/[id]
  const studentUnauthorizedDeleteRes = await fetch(`${BASE_URL}/api/memories/${mem2Id}`, {
    method: "DELETE",
    headers: { Cookie: studentCookie },
  });
  assert(
    studentUnauthorizedDeleteRes.status === 403,
    "Student is forbidden from deleting another user's memory (403 Forbidden)",
    `status: ${studentUnauthorizedDeleteRes.status}`
  );

  // Clean up mem2 as admin
  await fetch(`${BASE_URL}/api/admin/memories?memoryId=${mem2Id}`, {
    method: "DELETE",
    headers: { Cookie: adminCookie },
  });

  console.log("\n================================================================");
  if (allPassed) {
    console.log("🎉 ALL MEMORY VAULT CREATION & FAST DELETION TESTS PASSED!");
  } else {
    console.error("❌ SOME TESTS FAILED.");
  }
  console.log("================================================================\n");
}

runMemoryVaultDeletionVerification().catch(console.error);
