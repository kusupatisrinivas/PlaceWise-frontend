import { test, expect } from "@playwright/test";

async function login(
  page,
  email = "hemanth@placewise.edu",
  password = "Student@123",
) {
  await page.goto("/login");
  await page.getByLabel("Email address", { exact: true }).fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page).toHaveURL(/dashboard/);
  await expect(page.locator(".stats-grid")).toBeVisible();
}
async function adminLogin(page) {
  await login(page, "admin@placewise.edu", "Admin@123");
}
async function adminApi(request) {
  const response = await request.post("/api/auth/login", {
    data: { email: "admin@placewise.edu", password: "Admin@123" },
  });
  expect(response.ok()).toBeTruthy();
  const result = await response.json();
  return { Authorization: "Bearer " + result.token };
}
test("student registers, updates skills, applies, and receives an admin selection", async ({
  page,
  request,
}) => {
  const unique = Date.now().toString().slice(-9);
  const email = "e2e" + unique + "@college.edu";
  const name = "Journey Student " + unique;
  let studentId;
  const headers = await adminApi(request);
  try {
    await page.goto("/register");
    await page.getByLabel("Full name", { exact: true }).fill(name);
    await page.getByLabel("Email address", { exact: true }).fill(email);
    await page.getByLabel("Password", { exact: true }).fill("Student@123");
    await page.getByLabel("Roll number", { exact: true }).fill("E2E" + unique);
    await page.getByLabel("Phone number", { exact: true }).fill("9876543210");
    await page.getByLabel("CGPA", { exact: true }).fill("8.5");
    await page
      .getByRole("button", { name: "Create account", exact: true })
      .click();
    await expect(page).toHaveURL(/dashboard/);
    const students = await (
      await request.get("/api/students?search=" + email, { headers })
    ).json();
    studentId = students[0].id;
    await page.getByRole("link", { name: "My profile", exact: true }).click();
    for (const skill of ["java", "sql"]) {
      await page.getByLabel("Add a skill").fill(skill);
      await page.getByLabel("Add a skill").press("Enter");
    }
    await page.getByRole("button", { name: "Save changes" }).click();
    await expect(page.getByText("Your profile is up to date.")).toBeVisible();
    await page
      .getByRole("link", { name: "Placement drives", exact: true })
      .click();
    await page
      .getByPlaceholder("Search by company, role, or location…")
      .fill("TCS");
    await expect(page.locator(".drive-card")).toHaveCount(1);
    await page
      .getByRole("link", { name: "Java Developer", exact: true })
      .click();
    await expect(page.getByText("You're eligible. Go for it!")).toBeVisible();
    await page.getByRole("button", { name: "Apply for this drive" }).click();
    await expect(page.getByText("You're in the running.")).toBeVisible();
    await page.getByRole("link", { name: "Track application" }).click();
    await expect(
      page.getByRole("cell", { name: "Applied", exact: true }),
    ).toBeVisible();
    await page.getByRole("button", { name: "Sign out", exact: true }).click();
    await adminLogin(page);
    await page.getByRole("link", { name: "Applications", exact: true }).click();
    await page
      .getByPlaceholder("Search candidate, company, or role…")
      .fill(name);
    await page
      .getByRole("combobox", { name: "Status for " + name + " at TCS" })
      .selectOption("SELECTED");
    await expect(
      page.getByText("Application moved to Selected."),
    ).toBeVisible();
    await page.getByRole("button", { name: "Sign out", exact: true }).click();
    await login(page, email);
    await expect(
      page
        .locator(".stat-card")
        .filter({ hasText: /^Selected/ })
        .locator("strong"),
    ).toHaveText("1");
    await page
      .getByRole("link", { name: "My applications", exact: true })
      .click();
    await expect(
      page.getByRole("cell", { name: "Selected", exact: true }),
    ).toBeVisible();
  } finally {
    if (studentId)
      await request.delete("/api/students/" + studentId, { headers });
  }
});
test("admin creates, edits, pauses, and deletes a company drive", async ({
  page,
  request,
}) => {
  const name = "E2E Company " + Date.now();
  const headers = await adminApi(request);
  let companyId, driveId;
  try {
    await adminLogin(page);
    await page.getByRole("link", { name: "Companies", exact: true }).click();
    await page
      .getByRole("button", { name: "Add company", exact: true })
      .click();
    await page.getByLabel("Company name").fill(name);
    await page.getByLabel("Location", { exact: true }).fill("Pune");
    await page
      .getByLabel("Website", { exact: true })
      .fill("https://example.com");
    await page
      .getByLabel("About the company")
      .fill("A company created by the browser workflow test.");
    await page
      .getByRole("dialog")
      .getByRole("button", { name: "Add company", exact: true })
      .click();
    await expect(
      page.getByText("A new campus connection added."),
    ).toBeVisible();
    const companies = await (
      await request.get("/api/companies", { headers })
    ).json();
    companyId = companies.find((c) => c.name === name).id;
    await page
      .getByRole("link", { name: "Placement drives", exact: true })
      .click();
    await page
      .getByRole("button", { name: "Create drive", exact: true })
      .click();
    await page
      .getByLabel("Company", { exact: true })
      .selectOption(String(companyId));
    await page.getByLabel("Job title", { exact: true }).fill("Test Engineer");
    await page.getByLabel("Package (LPA)").fill("9");
    await page.getByLabel("Job location").fill("Pune");
    const future = new Date();
    future.setDate(future.getDate() + 10);
    const deadline = future.toISOString().slice(0, 10);
    future.setDate(future.getDate() + 2);
    await page
      .getByLabel("Drive date", { exact: true })
      .fill(future.toISOString().slice(0, 10));
    await page
      .getByLabel("Application deadline", { exact: true })
      .fill(deadline);
    await page
      .getByLabel("Job description", { exact: true })
      .fill("Build and test useful software.");
    await page
      .getByRole("dialog")
      .getByRole("button", { name: "Create drive", exact: true })
      .click();
    await expect(
      page.getByText("Your new placement drive is ready."),
    ).toBeVisible();
    const drives = await (
      await request.get("/api/drives?companyId=" + companyId, { headers })
    ).json();
    driveId = drives[0].id;
    await page.getByLabel("Filter company").selectOption(String(companyId));
    await page
      .getByRole("button", { name: "Edit Test Engineer at " + name })
      .click();
    await page.getByLabel("Package (LPA)").fill("10.5");
    await page.getByRole("button", { name: "Save drive", exact: true }).click();
    await expect(
      page.getByRole("cell", { name: "₹10.5 LPA", exact: true }),
    ).toBeVisible();
    await page
      .getByRole("button", { name: "Pause " + name + " drive", exact: true })
      .click();
    await expect(
      page.getByRole("cell", { name: "Paused", exact: true }),
    ).toBeVisible();
    await page
      .getByRole("button", { name: "Enable " + name + " drive", exact: true })
      .click();
    await expect(
      page.getByRole("cell", { name: "Active", exact: true }),
    ).toBeVisible();
    await page
      .getByRole("button", { name: "Delete Test Engineer at " + name })
      .click();
    await page.getByRole("button", { name: "Cancel", exact: true }).click();
    await expect(
      page.getByRole("cell", { name: "Active", exact: true }),
    ).toBeVisible();
    await page
      .getByRole("button", { name: "Delete Test Engineer at " + name })
      .click();
    await page.getByRole("button", { name: "Delete permanently" }).click();
    await expect(page.getByText("No drives to show")).toBeVisible();
    driveId = null;
    await page.getByRole("link", { name: "Companies", exact: true }).click();
    await page.getByPlaceholder("Search companies or industries…").fill(name);
    await page
      .getByRole("button", { name: "Delete " + name, exact: true })
      .click();
    await page.getByRole("button", { name: "Delete permanently" }).click();
    await expect(page.getByText("No matching partners")).toBeVisible();
    companyId = null;
  } finally {
    if (driveId) await request.delete("/api/drives/" + driveId, { headers });
    if (companyId)
      await request.delete("/api/companies/" + companyId, { headers });
  }
});
test("eligibility blocks an unqualified application and filters run on the API", async ({
  page,
}) => {
  await login(page);
  await page.screenshot({
    path: "../docs/screenshots/student-dashboard.png",
    fullPage: true,
  });
  await page
    .getByRole("link", { name: "Placement drives", exact: true })
    .click();
  await page
    .getByPlaceholder("Search by company, role, or location…")
    .fill("Google");
  await expect(page.locator(".drive-card")).toHaveCount(1);
  await page
    .getByRole("link", { name: "Software Engineer", exact: true })
    .click();
  await expect(page.getByText(/Minimum CGPA required: 9/)).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Apply for this drive" }),
  ).toBeDisabled();
  expect(
    await page.evaluate(() => [localStorage.length, sessionStorage.length]),
  ).toEqual([0, 0]);
  await page.reload();
  await expect(page).toHaveURL(/login/);
});
test("mobile navigation and profile fit the viewport", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await login(page);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBeTruthy();
  await page.screenshot({
    path: "../docs/screenshots/student-mobile.png",
    fullPage: true,
  });
  await page.getByRole("button", { name: "Open navigation" }).click();
  await page.getByRole("link", { name: "My profile", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Save changes" }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBeTruthy();
});
test("public home, login errors, and admin dashboard render cleanly", async ({
  page,
}) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: /Big ambitions/ }),
  ).toBeVisible();
  await page.screenshot({
    path: "../docs/screenshots/home.png",
    fullPage: true,
  });
  await page.getByRole("link", { name: "Sign in", exact: true }).click();
  await page
    .getByLabel("Email address", { exact: true })
    .fill("admin@placewise.edu");
  await page.getByLabel("Password", { exact: true }).fill("WrongPass123");
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page.getByRole("alert")).toHaveText(
    /Email or password is incorrect/,
  );
  await adminLogin(page);
  await expect(
    page.getByRole("img", { name: /students selected/ }),
  ).toBeVisible();
  await page.screenshot({
    path: "../docs/screenshots/admin-dashboard.png",
    fullPage: true,
  });
  expect(errors).toEqual([]);
});
test("API failures show a retry state and recover", async ({ page }) => {
  await login(page);
  await page.route("**/api/students/profile", (route) =>
    route.fulfill({
      status: 503,
      contentType: "application/json",
      body: '{"message":"Temporary service interruption."}',
    }),
  );
  await page.getByRole("link", { name: "My profile", exact: true }).click();
  await expect(page.getByRole("alert")).toContainText(
    "Temporary service interruption.",
  );
  await page.unroute("**/api/students/profile");
  await page.getByRole("button", { name: "Try again" }).click();
  await expect(
    page.getByRole("button", { name: "Save changes" }),
  ).toBeVisible();
});
