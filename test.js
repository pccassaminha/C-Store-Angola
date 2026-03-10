import fetch from "node-fetch";

async function test() {
  const res = await fetch("http://localhost:3000/api/stores/approve", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id: "test" })
  });
  console.log(res.status);
  console.log(await res.text());
}
test();
