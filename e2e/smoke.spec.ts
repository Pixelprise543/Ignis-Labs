import { expect, test } from "@playwright/test";

/**
 * PC3 smoke tests for the demo-critical flows that live in the experience
 * shell. PC2 pages (Explore, Compare, Rankings, Materials, Coverage,
 * Timeline) are covered by their own owner; here a missing page must still
 * render the shell's EmptyState instead of breaking the build.
 *
 * The project config launches bundled Chromium. This suite uses the installed
 * Chrome channel so it also runs on machines without `playwright install`.
 */
test.use({ channel: "chrome" });

test.describe("experience shell", () => {
  test("home renders and the scenario bar drives the orb and URL", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      "Fire behaves differently when nothing falls",
    );
    await expect(page.getByText("Experiments in library")).toBeVisible();

    const orb = page.locator('svg[aria-label^="Schematic flame shape"] path');
    const before = await orb.getAttribute("d");

    await page.getByRole("button", { name: "Mars transit" }).click();

    await expect(page).toHaveURL(/scenario=mars/);
    await expect(page.getByText("Top insights for Mars transit")).toBeVisible();
    await expect
      .poll(async () => orb.getAttribute("d"))
      .not.toBe(before);
  });

  test("Ask Ignis answers offline with valid citations", async ({ page }) => {
    await page.goto("/");

    await page.locator("aside").getByRole("button", { name: "Ask Ignis" }).click();
    const dialog = page.getByRole("dialog", { name: "Ask Ignis" });
    await expect(dialog).toBeVisible();

    await dialog
      .getByLabel("Ask a fire-safety question")
      .fill("Is a 34% oxygen cabin riskier on the Moon?");
    await dialog.getByLabel("Ask a fire-safety question").press("Enter");

    await expect(dialog.getByText("Offline fallback")).toBeVisible();
    await expect(dialog.getByText("Cited experiments", { exact: true })).toBeVisible();
    await expect(dialog.locator("button[title]").first()).toBeVisible();

    // Every chip must resolve to a real experiment, never an alarm-red orphan.
    await expect(dialog.locator("button.border-ig-alarm")).toHaveCount(0);
    await expect(page.locator("body")).toHaveCSS("overflow", "hidden");

    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
  });

  test("insights filter by severity and keep evidence chips resolvable", async ({ page }) => {
    await page.goto("/insights");

    await expect(page.getByRole("heading", { name: "Fire-safety insights" })).toBeVisible();

    const high = page.getByRole("tab", { name: /^High/ });
    await high.click();
    await expect(high).toHaveAttribute("aria-selected", "true");

    await expect(page.locator("article").first()).toBeVisible();
    await expect(page.locator("button.border-ig-alarm")).toHaveCount(0);
  });

  test("simulator recalculates and explains its drivers", async ({ page }) => {
    await page.goto("/simulator");

    await expect(page.getByRole("heading", { name: "What-if risk simulator" })).toBeVisible();
    const risk = page.locator('[aria-label^="Estimated risk"]');
    const before = await risk.getAttribute("aria-label");

    await page.getByRole("button", { name: "34% O2 lunar cabin" }).click();

    await expect(page.getByText("Score share").first()).toBeVisible();
    await expect.poll(async () => risk.getAttribute("aria-label")).not.toBe(before);
    await expect(page.getByText("Decision-support estimate", { exact: false }).first()).toBeVisible();
  });

  test("brief previews the generated markdown", async ({ page }) => {
    await page.goto("/brief");

    await expect(page.getByRole("heading", { name: "Mission safety brief", exact: true })).toBeVisible();
    await expect(page.locator(".ig-markdown")).toContainText("Ignis Mission Safety Brief");
    await expect(page.getByRole("button", { name: "Copy Markdown" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Download .md" })).toBeVisible();
  });

  test("print mode drops the shell chrome", async ({ page }) => {
    await page.goto("/brief");
    await page.emulateMedia({ media: "print" });

    await expect(page.locator("aside")).toBeHidden();
    await expect(page.locator('nav[aria-label="Main"]').first()).toBeHidden();
    await expect(page.locator(".ig-markdown")).toContainText("Ignis Mission Safety Brief");
  });

  test("command palette navigates with the keyboard", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    await page.keyboard.press("Meta+k");
    const palette = page.getByRole("dialog", { name: "Command palette" });
    await expect(palette).toBeVisible();

    await palette.getByPlaceholder(/Jump to a view/).fill("glossary");
    await page.keyboard.press("Enter");

    await expect(page).toHaveURL(/\/glossary(\?|$)/);
    await expect(page.getByRole("heading", { name: "Glossary", exact: true })).toBeVisible();
  });
});

test.describe("mobile shell", () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test("bottom tabs and the More sheet expose every view", async ({ page }) => {
    await page.goto("/");

    await expect(page.locator("aside")).toBeHidden();
    const tabs = page.locator('nav[aria-label="Main"]').filter({ hasText: "More" });
    await expect(tabs).toBeVisible();

    await tabs.getByRole("button", { name: "More" }).click();
    const sheet = page.getByRole("dialog", { name: "All views" });
    await expect(sheet).toBeVisible();
    await expect(sheet.getByRole("link", { name: "Method" })).toBeVisible();

    await sheet.getByRole("link", { name: "Glossary" }).click();
    await expect(page).toHaveURL(/\/glossary(\?|$)/);
  });
});
