const test = require("node:test");
const assert = require("node:assert/strict");
const request = require("supertest");
const app = require("../server");

async function registerAndLogin(suffix = "") {
  const username = `user_${Date.now()}${suffix}`;
  const email = `${username}@mail.com`;
  const password = "password123";
  await request(app).post("/api/auth/register").send({ username, email, password }).expect(201);
  const login = await request(app).post("/api/auth/login").send({ email, password }).expect(200);
  return login.body.token;
}

test("health endpoint works", async () => {
  const res = await request(app).get("/api/health").expect(200);
  assert.equal(res.body.status, "ok");
});

test("auth + problems paginated flow", async () => {
  const token = await registerAndLogin("_a");
  const res = await request(app)
    .get("/api/problems?page=1&limit=2")
    .set("Authorization", `Bearer ${token}`)
    .expect(200);
  assert.ok(Array.isArray(res.body.items));
  assert.equal(res.body.page, 1);
  assert.equal(res.body.limit, 2);
});

test("reject blocked code patterns", async () => {
  const token = await registerAndLogin("_b");
  const problems = await request(app).get("/api/problems?page=1&limit=1").set("Authorization", `Bearer ${token}`).expect(200);
  const pid = problems.body.items[0].id;
  const badCode = "function solve(input) { while (true) {} }";
  const res = await request(app)
    .post("/api/submissions/run")
    .set("Authorization", `Bearer ${token}`)
    .send({ problemId: pid, code: badCode })
    .expect(400);
  assert.match(res.body.error, /restricted pattern|exceeds limit|Code is required/i);
});
