---
slug: playwright-scraping
title: "Playwright as a Business Scraping Tool: Beyond E2E Testing"
date: "2024-01-03"
readTime: 9
tags: ["Playwright", "Python", "Scraping", "Automation"]
excerpt: "Playwright is not just for tests. When a business portal has no usable API, it is the most robust tool available for automating authentication, navigation, and data extraction — here is how to use it seriously in production."
---

# Playwright as a Business Scraping Tool: Beyond E2E Testing

The overwhelming majority of Playwright articles discuss end-to-end testing. That is its most visible use case, but far from its only one. When a business portal exposes no API — or one that is incomplete, poorly documented, or restricted to select partners — Playwright becomes a first-class automation tool. Here is how to use it seriously, outside a testing context.

## The Concrete Problem: A Portal With No Usable API

Some business portals offer a rich web interface but a limited or absent API. Data extraction, exports, form submission — everything goes through the browser. BeautifulSoup and requests stop there: they cannot handle JavaScript, single-page applications, or complex authentication flows involving MFA or OAuth2 redirections.

Playwright handles all of this natively.

## Scraper Architecture

The goal is a scraper that authenticates reliably, navigates and extracts structured data, can be restarted without human intervention, and runs in a containerised environment.

```python
from playwright.async_api import async_playwright, Browser, Page
from dataclasses import dataclass

@dataclass
class ScraperConfig:
    base_url: str
    username: str
    password: str
    headless: bool = True
    timeout: int = 30_000  # ms

class BusinessScraper:
    def __init__(self, config: ScraperConfig):
        self.config = config
        self._browser: Browser | None = None
        self._page: Page | None = None

    async def __aenter__(self):
        self._playwright = await async_playwright().start()
        self._browser = await self._playwright.chromium.launch(
            headless=self.config.headless,
            args=["--no-sandbox", "--disable-dev-shm-usage"]  # Required in Docker
        )
        context = await self._browser.new_context(
            viewport={"width": 1280, "height": 800},
            locale="en-GB"
        )
        self._page = await context.new_page()
        return self

    async def __aexit__(self, *args):
        await self._browser.close()
        await self._playwright.stop()
```

The context manager ensures the browser closes cleanly even in the event of an exception — essential in production.

## Robust Authentication

Authentication is the most fragile part of any scraper. Portals change their UI, introduce additional security steps, or add delays. A few principles for making it reliable:

```python
async def login(self) -> bool:
    page = self._page
    await page.goto(f"{self.config.base_url}/login", wait_until="networkidle")

    # Wait for the specific element, not just page load
    await page.wait_for_selector("#username", state="visible", timeout=10_000)
    await page.fill("#username", self.config.username)
    await page.fill("#password", self.config.password)

    # Intercept the login response to detect auth failures precisely
    async with page.expect_response(
        lambda r: "/api/auth" in r.url and r.status in (200, 401, 403)
    ) as response_info:
        await page.click('[type="submit"]')

    response = await response_info.value
    if response.status != 200:
        raise AuthenticationError(f"Login failed: HTTP {response.status}")

    await page.wait_for_url(f"{self.config.base_url}/dashboard", timeout=15_000)
    return True
```

Network response interception (`expect_response`) is more reliable than waiting for a CSS selector after the click — it detects authentication failures without depending on how the error message happens to be rendered.

## Extracting Structured Data

Once authenticated, extraction must be deterministic. Playwright allows combining DOM navigation and network interception, depending on which is more stable:

```python
async def extract_certificates(self, period: str) -> list[dict]:
    page = self._page
    await page.goto(
        f"{self.config.base_url}/certificates?period={period}",
        wait_until="networkidle"
    )

    # Strategy 1: intercept the underlying API call when available
    async with page.expect_response(
        lambda r: "/api/certificates" in r.url
    ) as api_response:
        await page.click("#load-certificates")

    data = await (await api_response.value).json()
    return data.get("items", [])

async def extract_table_data(self) -> list[dict]:
    """Strategy 2: extract directly from the DOM."""
    rows = await self._page.query_selector_all("table.data-grid tbody tr")
    results = []

    for row in rows:
        cells = await row.query_selector_all("td")
        values = [await cell.inner_text() for cell in cells]
        results.append({
            "id": values[0].strip(),
            "date": values[1].strip(),
            "volume": float(values[2].replace(",", ".")),
            "status": values[3].strip(),
        })

    return results
```

Strategy 1 (network interception) is preferable when available: raw JSON data is cleaner and less sensitive to layout changes. Strategy 2 (DOM extraction) is the universal fallback.

## Handling File Downloads

Many portals offer Excel or CSV exports via a download button. Playwright handles this natively:

```python
async def download_export(self, output_path: str) -> str:
    async with self._page.expect_download() as download_info:
        await self._page.click("#export-button")

    download = await download_info.value

    if download.failure():
        raise ExportError(f"Download failed: {download.failure()}")

    await download.save_as(output_path)
    return output_path
```

## Running in Docker and OpenShift

Playwright in a container requires Chromium's system dependencies:

```dockerfile
FROM python:3.12-slim

RUN apt-get update && apt-get install -y \
    libnss3 libatk1.0-0 libatk-bridge2.0-0 \
    libcups2 libdrm2 libxkbcommon0 libxcomposite1 \
    libxdamage1 libxfixes3 libxrandr2 libgbm1 \
    libasound2 libpango-1.0-0 libcairo2 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

RUN chown -R 1001:0 /app && chmod -R g=u /app

COPY --chown=1001:0 requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt && playwright install chromium

COPY --chown=1001:0 . .

USER 1001

CMD ["python", "scraper.py"]
```

On OpenShift, `--no-sandbox` is mandatory: containers do not have the privileges required by Chromium's sandbox. This is not a security concern in this context — the sandbox protects against malicious web content, which does not apply to a scraper targeting a known internal portal.

## Orchestrating with a Kubernetes CronJob

```yaml
apiVersion: batch/v1
kind: CronJob
metadata:
  name: business-scraper
spec:
  schedule: "0 6 * * 1-5"
  concurrencyPolicy: Forbid
  jobTemplate:
    spec:
      template:
        spec:
          containers:
            - name: scraper
              image: registry.internal/business-scraper:latest
              env:
                - name: SCRAPER_USERNAME
                  valueFrom:
                    secretKeyRef:
                      name: scraper-credentials
                      key: username
                - name: SCRAPER_PASSWORD
                  valueFrom:
                    secretKeyRef:
                      name: scraper-credentials
                      key: password
          restartPolicy: OnFailure
```

`concurrencyPolicy: Forbid` is critical: if one execution takes longer than expected, you do not want two scrapers authenticating simultaneously with the same account.

## Playwright vs the Alternatives

| Criterion            | requests + BS4 | Selenium | Playwright |
| -------------------- | -------------- | -------- | ---------- |
| SPAs / JavaScript    | No             | Yes      | Yes        |
| Network interception | No             | Partial  | Native     |
| Native async         | No             | No       | Yes        |
| CI/CD stability      | Good           | Fragile  | Good       |
| Docker support       | Simple         | Complex  | Reasonable |
| Modern API           | No             | No       | Yes        |

For simple static sites, `requests` and `BeautifulSoup` remain faster to set up and lighter to operate. However, as soon as complex authentication, dynamic JavaScript, or user interactions are involved — Playwright is the most robust open-source option available today.
