import { test, expect } from "playwright/test";
for (const path of [
  "/app?stay=1",
  "/app/live?stay=1&view=building",
  "/app/enter?vertical=hotel&go=1",
])
  test(`anonymous direct access to ${path} requires signup`, async ({
    request,
  }) => {
    const response = await request.get(path, { maxRedirects: 0 });
    expect(response.status()).toBe(307);
    const location = response.headers()["location"];
    expect(location).toContain("/signup?");
    const url = new URL(location);
    expect(url.searchParams.get("intent")).toBe("demo");
    expect(url.searchParams.get("next")).toMatch(/^\/app/);
  });
test("a forged session cookie cannot unlock product HTML", async ({
  request,
}) => {
  const response = await request.get("/app/live?stay=1", {
    maxRedirects: 0,
    headers: { cookie: "better-auth.session_token=not-a-valid-signed-session" },
  });
  expect(response.status()).toBe(307);
  expect(response.headers()["location"]).toContain("/signup?");
  expect(await response.text()).not.toContain("Property explorer");
});
