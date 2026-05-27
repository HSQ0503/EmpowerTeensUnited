import { test, expect } from "@playwright/test";

test("home page renders nav and footer chrome", async ({ page }) => {
  await page.goto("/");
  // Nav items are i18n strings — assert by href to stay locale-agnostic.
  await expect(page.locator('header a[href="/about"]')).toBeVisible();
  await expect(page.locator('header a[href="/events"]')).toBeVisible();
  await expect(page.locator('header a[href="/blog"]')).toBeVisible();
  await expect(page.locator('header a[href="/contact"]')).toBeVisible();
  await expect(page.locator('header a[href="/sign-in"]')).toBeVisible();
});

test("sign-in page renders the form", async ({ page }) => {
  await page.goto("/sign-in");
  await expect(page.getByRole("heading", { name: "Welcome back" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Sign in" })).toBeVisible();
});

test("admin route redirects to sign-in when anonymous", async ({ page }) => {
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/sign-in/);
});

test("events list is reachable", async ({ page }) => {
  await page.goto("/events");
  await expect(page.getByRole("heading", { name: /events/i }).first()).toBeVisible();
});

test("contact form renders the message field", async ({ page }) => {
  await page.goto("/contact");
  await expect(page.locator('textarea[name="message"]')).toBeVisible();
});
