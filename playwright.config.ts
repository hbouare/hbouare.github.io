import { defineConfig, devices } from "@playwright/test"

const PORT = 4173
const BASE_URL = `http://localhost:${PORT}`

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",

  use: {
    baseURL: BASE_URL,
    trace: "on-first-retry",
  },

  // Tests run against the STATIC BUILD, not the dev server. Several of the
  // bugs these tests guard against only appeared in production output —
  // notably Vuetify's deprecation warnings being stripped from prod builds,
  // which is what made the broken theme fail silently.
  webServer: {
    command: "npx serve .output/public -l " + PORT,
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },

  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["Pixel 5"] } },
  ],
})
