import type { BuiltInProgram } from "@/lib/built-in-programs";

export const BUILT_IN_JAVASCRIPT_PROGRAMS: BuiltInProgram[] = [
  {
    path: "built-in/playwright-js/LoginWithPlaywright.js",
    title: "Login test with Playwright",
    kind: "java",
    text: `const { test, expect } = require("@playwright/test");

test("user can log in", async ({ page }) => {
  await page.goto(process.env.BASE_URL);
  await page.getByLabel("Email").fill(process.env.TEST_EMAIL);
  await page.getByLabel("Password").fill(process.env.TEST_PASSWORD);
  await page.getByRole("button", { name: "Sign in" }).click();

  await expect(page).toHaveURL(/dashboard/);
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
});

// Keep URLs and credentials in environment variables, not in the test.`,
  },
  {
    path: "built-in/playwright-js/PageObjectLoginTest.js",
    title: "Playwright Page Object Model login test",
    kind: "java",
    text: `const { test, expect } = require("@playwright/test");

class LoginPage {
  constructor(page) {
    this.page = page;
    this.email = page.getByLabel("Email");
    this.password = page.getByLabel("Password");
    this.signIn = page.getByRole("button", { name: "Sign in" });
  }

  async login(email, password) {
    await this.page.goto("/login");
    await this.email.fill(email);
    await this.password.fill(password);
    await this.signIn.click();
  }
}

test("login through a page object", async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.login(process.env.TEST_EMAIL, process.env.TEST_PASSWORD);
  await expect(page).toHaveURL(/dashboard/);
});`,
  },
  {
    path: "built-in/playwright-js/MockApiResponse.js",
    title: "Mock an API response in Playwright",
    kind: "java",
    text: `const { test, expect } = require("@playwright/test");

test("shows campaigns from a mocked response", async ({ page }) => {
  await page.route("**/api/campaigns", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify([{ id: 101, name: "Interview Campaign" }]),
    });
  });

  await page.goto("/campaigns");
  await expect(page.getByText("Interview Campaign")).toBeVisible();
});`,
  },
  {
    path: "built-in/playwright-js/ApiTestWithRequestFixture.js",
    title: "API test with Playwright request fixture",
    kind: "java",
    text: `const { test, expect } = require("@playwright/test");

test("GET user API returns the expected contract", async ({ request }) => {
  const response = await request.get("/api/users/1", {
    headers: { Authorization: \`Bearer \${process.env.API_TOKEN}\` },
  });

  expect(response.status()).toBe(200);
  expect(response.headers()["content-type"]).toContain("application/json");

  const body = await response.json();
  expect(body).toEqual(expect.objectContaining({
    id: expect.any(Number),
    email: expect.any(String),
  }));
});`,
  },
  {
    path: "built-in/axios-api/AxiosGetApiTest.js",
    title: "Axios GET API validation",
    kind: "java",
    text: `const axios = require("axios");

const api = axios.create({
  baseURL: process.env.API_BASE_URL,
  timeout: 10000,
});

describe("GET /users/1", () => {
  test("validates status, headers, and response body", async () => {
    const response = await api.get("/users/1");

    expect(response.status).toBe(200);
    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.data).toEqual(expect.objectContaining({
      id: expect.any(Number),
      email: expect.any(String),
    }));
  });
});`,
  },
  {
    path: "built-in/axios-api/AxiosPostApiTest.js",
    title: "Axios POST API test",
    kind: "java",
    text: `const axios = require("axios");

const api = axios.create({ baseURL: process.env.API_BASE_URL });

describe("POST /users", () => {
  test("creates a user and validates the response", async () => {
    const payload = { name: "Rajat", role: "QA Manager" };
    const response = await api.post("/users", payload);

    expect(response.status).toBe(201);
    expect(response.data.id).toBeDefined();
    expect(response.data.name).toBe(payload.name);
    expect(response.data.role).toBe(payload.role);
  });
});`,
  },
  {
    path: "built-in/axios-api/AxiosBearerTokenTest.js",
    title: "Axios authenticated API test with Bearer token",
    kind: "java",
    text: `const axios = require("axios");

const api = axios.create({ baseURL: process.env.API_BASE_URL });

api.interceptors.request.use((config) => {
  config.headers.Authorization = \`Bearer \${process.env.API_TOKEN}\`;
  return config;
});

test("authorized user can open the profile", async () => {
  const response = await api.get("/profile");

  expect(response.status).toBe(200);
  expect(response.data).toHaveProperty("email");
});

// Never print the token in logs or attach it to test evidence.`,
  },
  {
    path: "built-in/axios-api/AxiosNegativeApiTest.js",
    title: "Axios negative API test",
    kind: "java",
    text: `const axios = require("axios");

const api = axios.create({
  baseURL: process.env.API_BASE_URL,
  validateStatus: () => true,
});

test("returns 404 for an unknown user", async () => {
  const response = await api.get("/users/999999");

  expect(response.status).toBe(404);
  expect(response.data).toEqual(expect.objectContaining({
    error: expect.any(String),
  }));
});`,
  },
  {
    path: "built-in/axios-api/AxiosCrudFlowTest.js",
    title: "Axios chained CRUD API test",
    kind: "java",
    text: `const axios = require("axios");

const api = axios.create({ baseURL: process.env.API_BASE_URL });

test("creates, updates, reads, and deletes a project", async () => {
  const created = await api.post("/projects", { name: "QA Automation" });
  expect(created.status).toBe(201);
  const id = created.data.id;

  const updated = await api.patch(\`/projects/\${id}\`, { name: "API Automation" });
  expect(updated.data.name).toBe("API Automation");

  const fetched = await api.get(\`/projects/\${id}\`);
  expect(fetched.data.id).toBe(id);

  const removed = await api.delete(\`/projects/\${id}\`);
  expect(removed.status).toBe(204);
});`,
  },
  {
    path: "built-in/express-js/ExpressCrudApi.js",
    title: "Express CRUD API",
    kind: "java",
    text: `const express = require("express");

const app = express();
app.use(express.json());

const users = new Map();

app.post("/users", (req, res) => {
  const id = Date.now().toString();
  const user = { id, ...req.body };
  users.set(id, user);
  res.status(201).json(user);
});

app.get("/users/:id", (req, res) => {
  const user = users.get(req.params.id);
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json(user);
});

app.patch("/users/:id", (req, res) => {
  const current = users.get(req.params.id);
  if (!current) return res.status(404).json({ error: "User not found" });
  const updated = { ...current, ...req.body };
  users.set(req.params.id, updated);
  res.json(updated);
});

app.delete("/users/:id", (req, res) => {
  if (!users.delete(req.params.id)) {
    return res.status(404).json({ error: "User not found" });
  }
  res.sendStatus(204);
});

app.listen(process.env.PORT || 3000);`,
  },
  {
    path: "built-in/express-js/ExpressAuthenticationMiddleware.js",
    title: "Express authentication middleware",
    kind: "java",
    text: `const express = require("express");

const app = express();

function authenticate(req, res, next) {
  const header = req.get("authorization") || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";

  if (!token || token !== process.env.API_TOKEN) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  req.user = { role: "qa" };
  next();
}

app.get("/reports", authenticate, (req, res) => {
  res.json({ reports: [], requestedBy: req.user.role });
});

app.listen(process.env.PORT || 3000);`,
  },
  {
    path: "built-in/express-js/ExpressValidationAndErrorHandling.js",
    title: "Express request validation and error handling",
    kind: "java",
    text: `const express = require("express");

const app = express();
app.use(express.json());

app.post("/campaigns", (req, res, next) => {
  try {
    const { name, budget } = req.body;
    if (!name || typeof budget !== "number" || budget <= 0) {
      return res.status(400).json({
        error: "name and a positive budget are required",
      });
    }

    res.status(201).json({ id: Date.now(), name, budget });
  } catch (error) {
    next(error);
  }
});

app.use((error, req, res, next) => {
  console.error(error.message);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(process.env.PORT || 3000);`,
  },
];
