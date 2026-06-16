import { test, expect } from "@playwright/test";

const STORAGE_KEY = "hub-storage-v2";

const MOCK_STREAM_BODY = [
  `data: ${JSON.stringify({ type: "token", text: "Hello from Hub test!" })}\n\n`,
  `data: ${JSON.stringify({
    type: "done",
    result: { reply: "Hello from Hub test!", emotion: "happy" },
  })}\n\n`,
].join("");

test.describe("Hub full flow", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript((key) => {
      localStorage.removeItem(key);
      localStorage.removeItem("hub-storage");
    }, STORAGE_KEY);

    await page.route("**/api/ai/status", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          configured: true,
          chat: true,
          voice: true,
        }),
      });
    });

    await page.route("**/api/connect/api-key", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ ok: true, connectorId: "xai" }),
      });
    });

    await page.route("**/api/chat/stream", async (route) => {
      await route.fulfill({
        status: 200,
        headers: { "Content-Type": "text/event-stream" },
        body: MOCK_STREAM_BODY,
      });
    });

    await page.route("**/api/briefing**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          briefing: "Good morning! Your agent is ready.",
          mode: "mock",
        }),
      });
    });

    await page.route("**/api/connect/status", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          connections: { xai: { connected: true } },
        }),
      });
    });
  });

  test("onboarding: brain → avatar → dashboard", async ({ page }) => {
    test.setTimeout(60_000);
    await page.goto("/onboarding");
    await expect(page.getByRole("heading", { name: "Welcome to Hub" })).toBeVisible();

    await expect(page.getByText("Grok connected")).toBeVisible({ timeout: 15_000 });
    await page.getByRole("button", { name: /Continue/i }).click();

    await expect(page.getByRole("heading", { name: "Choose your agent" })).toBeVisible();
    await page.getByRole("button", { name: /VoiceMate/i }).click();
    await page.getByRole("button", { name: /Continue/i }).click();

    await expect(page.getByRole("heading", { name: /Meet VoiceMate/i })).toBeVisible();
    await page.getByRole("button", { name: /Go to Dashboard/i }).click();

    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10_000 });
    await expect(page.getByRole("heading", { name: /Good (morning|afternoon|evening)/i })).toBeVisible();
    await expect(page.getByRole("link", { name: "VoiceMate" })).toBeVisible();
  });

  test("onboarding meet shortcuts complete setup", async ({ page }) => {
    await page.goto("/onboarding");
    await expect(page.getByText("Grok connected")).toBeVisible({ timeout: 15_000 });
    await page.getByRole("button", { name: /Continue/i }).click();
    await page.getByRole("button", { name: /Prism/i }).click();
    await page.getByRole("button", { name: /Continue/i }).click();
    await page.getByRole("button", { name: /^Text$/i }).click();
    await expect(page).toHaveURL(/\/dashboard\/chat/, { timeout: 10_000 });
  });

  test("dashboard pages load", async ({ page }) => {
    await page.addInitScript(
      ({ key, state }) => {
        localStorage.setItem(
          key,
          JSON.stringify({
            state,
            version: 1,
          }),
        );
      },
      {
        key: STORAGE_KEY,
        state: {
          onboardingComplete: true,
          onboardingStep: 2,
          goals: [],
          selectedAvatarId: "voicemate",
          agentName: "",
          proactivity: "balanced",
          autonomy: "balanced",
          theme: "light",
          apiKeys: {},
          connectors: [],
          messages: [],
          activities: [],
          skills: [],
          memories: [],
          pendingApprovals: [],
          currentEmotion: "neutral",
          hasSeenTips: true,
        },
      },
    );

    const routes = [
      "/dashboard",
      "/dashboard/chat",
      "/dashboard/call/voice",
      "/dashboard/call/video",
      "/dashboard/connectors",
      "/dashboard/skills",
      "/dashboard/settings",
    ];

    for (const route of routes) {
      await page.goto(route);
      await expect(page.locator("body")).not.toBeEmpty();
      await expect(page.getByText("Loading Hub…")).toHaveCount(0);
    }
  });

  test("chat sends a message", async ({ page }) => {
    await page.addInitScript(
      ({ key, state }) => {
        localStorage.setItem(key, JSON.stringify({ state, version: 1 }));
      },
      {
        key: STORAGE_KEY,
        state: {
          onboardingComplete: true,
          onboardingStep: 2,
          goals: [],
          selectedAvatarId: "prism",
          agentName: "Prism",
          proactivity: "balanced",
          autonomy: "balanced",
          theme: "light",
          apiKeys: {},
          connectors: [],
          messages: [],
          activities: [],
          skills: [],
          memories: [],
          pendingApprovals: [],
          currentEmotion: "neutral",
          hasSeenTips: true,
        },
      },
    );

    await page.goto("/dashboard/chat");
    await expect(page.getByPlaceholder(/message your agent/i)).toBeVisible({
      timeout: 10_000,
    });
    await page.getByPlaceholder(/message your agent/i).fill("Hello Hub");
    await page.getByRole("button", { name: /send message/i }).click();
    await expect(page.getByText("Hello from Hub test!")).toBeVisible({
      timeout: 10_000,
    });
  });
});
