import fetch from "node-fetch";

async function test() {
  // Register a store
  const res1 = await fetch("http://localhost:3000/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "test@test.com",
      password: "password",
      storeName: "Test Store",
      storeSlug: "test-store",
      isNewStore: true
    })
  });
  console.log("Register:", await res1.text());

  // Get pending stores
  const res2 = await fetch("http://localhost:3000/api/stores/pending");
  const pendingStores = await res2.json();
  console.log("Pending stores:", pendingStores);

  if (pendingStores.length > 0) {
    const storeId = pendingStores[0].id;
    // Approve store
    const res3 = await fetch("http://localhost:3000/api/stores/approve", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: storeId })
    });
    console.log("Approve:", await res3.text());
  }
}
test();
