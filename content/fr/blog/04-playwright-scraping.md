---
slug: playwright-scraping-metier
title: "Playwright comme outil de scraping métier : au-delà des tests E2E"
date: "2025-03-13"
readTime: 9
tags: ["Playwright", "Python", "Scraping", "Automatisation"]
excerpt: "Playwright n'est pas réservé aux tests. Sur des portails métier sans API, c'est l'outil le plus robuste pour automatiser l'authentification, la navigation et l'extraction de données — voici comment l'utiliser en production."
---

# Playwright comme outil de scraping métier : au-delà des tests E2E

La plupart des articles sur Playwright parlent de tests E2E. C'est son usage le plus visible, mais pas le seul. Quand un portail métier n'expose pas d'API — ou que celle-ci est incomplète, mal documentée, ou réservée à des partenaires — Playwright devient un outil d'automatisation de premier ordre. Voici comment l'utiliser sérieusement, hors contexte de test.

## Le cas concret : un portail sans API exploitable

Certains portails métier exposent une interface web riche mais une API limitée ou absente. L'extraction de données, les exports, la soumission de formulaires — tout passe par le navigateur. BeautifulSoup et requests s'arrêtent là : ils ne gèrent pas JavaScript, les SPAs, ni les flux d'authentification complexes (MFA, redirections OAuth2).

Playwright gère tout ça nativement.

## Architecture du scraper

L'objectif est un scraper qui s'authentifie de façon fiable, navigue et extrait des données structurées, est relançable sans intervention humaine, et s'exécute en environnement conteneurisé.

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

class MetierScraper:
    def __init__(self, config: ScraperConfig):
        self.config = config
        self._browser: Browser | None = None
        self._page: Page | None = None

    async def __aenter__(self):
        self._playwright = await async_playwright().start()
        self._browser = await self._playwright.chromium.launch(
            headless=self.config.headless,
            args=["--no-sandbox", "--disable-dev-shm-usage"]  # Requis en Docker
        )
        context = await self._browser.new_context(
            viewport={"width": 1280, "height": 800},
            locale="fr-FR"
        )
        self._page = await context.new_page()
        return self

    async def __aexit__(self, *args):
        await self._browser.close()
        await self._playwright.stop()
```

Le context manager garantit la fermeture propre du navigateur même en cas d'exception — indispensable en production.

## Authentification robuste

L'authentification est la partie la plus fragile d'un scraper. Les portails changent leur UI, ajoutent des étapes de sécurité, ou introduisent des délais. Quelques principes pour la rendre solide :

```python
async def login(self) -> bool:
    page = self._page
    await page.goto(f"{self.config.base_url}/login", wait_until="networkidle")

    # Attendre l'élément précis, pas juste le chargement de la page
    await page.wait_for_selector("#username", state="visible", timeout=10_000)
    await page.fill("#username", self.config.username)
    await page.fill("#password", self.config.password)

    # Intercepter la réponse de login pour détecter les erreurs d'auth
    async with page.expect_response(
        lambda r: "/api/auth" in r.url and r.status in (200, 401, 403)
    ) as response_info:
        await page.click('[type="submit"]')

    response = await response_info.value
    if response.status != 200:
        raise AuthenticationError(f"Login échoué : HTTP {response.status}")

    await page.wait_for_url(f"{self.config.base_url}/dashboard", timeout=15_000)
    return True
```

L'interception de réponse réseau (`expect_response`) est plus fiable qu'attendre un sélecteur CSS après le clic — elle détecte les erreurs d'authentification sans dépendre de la mise en forme du message d'erreur affiché.

## Extraction de données structurées

Une fois authentifié, l'extraction doit être déterministe. Playwright permet de combiner navigation DOM et interception réseau selon ce qui est le plus stable :

```python
async def extract_certificates(self, period: str) -> list[dict]:
    page = self._page
    await page.goto(
        f"{self.config.base_url}/certificates?period={period}",
        wait_until="networkidle"
    )

    # Stratégie 1 : intercepter l'appel API sous-jacent si disponible
    async with page.expect_response(
        lambda r: "/api/certificates" in r.url
    ) as api_response:
        await page.click("#load-certificates")

    data = await (await api_response.value).json()
    return data.get("items", [])

async def extract_table_data(self) -> list[dict]:
    """Stratégie 2 : extraire directement depuis le DOM."""
    rows = await self._page.query_selector_all("table.data-grid tbody tr")
    results = []

    for row in rows:
        cells = await row.query_selector_all("td")
        values = [await cell.inner_text() for cell in cells]
        results.append({
            "id": values[0].strip(),
            "date": values[1].strip(),
            "volume": float(values[2].replace(" ", "").replace(",", ".")),
            "status": values[3].strip(),
        })

    return results
```

La stratégie 1 (interception réseau) est préférable quand elle est disponible : les données JSON brutes sont plus propres et moins sensibles aux changements de mise en page. La stratégie 2 (extraction DOM) est le fallback universel.

## Gestion des exports fichiers

Beaucoup de portails proposent des exports Excel ou CSV via un bouton de téléchargement. Playwright gère ça nativement :

```python
async def download_export(self, output_path: str) -> str:
    async with self._page.expect_download() as download_info:
        await self._page.click("#export-button")

    download = await download_info.value

    if download.failure():
        raise ExportError(f"Téléchargement échoué : {download.failure()}")

    await download.save_as(output_path)
    return output_path
```

## Exécution en Docker / OpenShift

Playwright en conteneur nécessite les dépendances système de Chromium :

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

Sur OpenShift, `--no-sandbox` est obligatoire : les conteneurs ne disposent pas des privilèges nécessaires au sandbox Chromium. Ce n'est pas un risque dans ce contexte — le sandbox protège contre du contenu web malveillant, ce qui ne s'applique pas à un scraper ciblant un portail interne connu.

## Orchestration avec un CronJob Kubernetes

```yaml
apiVersion: batch/v1
kind: CronJob
metadata:
  name: metier-scraper
spec:
  schedule: "0 6 * * 1-5"
  concurrencyPolicy: Forbid
  jobTemplate:
    spec:
      template:
        spec:
          containers:
          - name: scraper
            image: registry.internal/metier-scraper:latest
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

`concurrencyPolicy: Forbid` est critique : si une exécution prend plus longtemps que prévu, on ne veut pas deux scrapers qui s'authentifient simultanément avec le même compte.

## Ce que Playwright apporte par rapport aux alternatives

| Critère | requests + BS4 | Selenium | Playwright |
|---|---|---|---|
| SPAs / JavaScript | Non | Oui | Oui |
| Interception réseau | Non | Partiel | Natif |
| Async natif | Non | Non | Oui |
| Stabilité en CI/CD | Bonne | Fragile | Bonne |
| Support Docker | Simple | Complexe | Raisonnable |
| API moderne | Non | Non | Oui |

Sur des sites statiques simples, `requests` + `BeautifulSoup` reste plus rapide à mettre en place. Mais dès qu'il y a de l'authentification complexe, du JavaScript dynamique, ou des interactions utilisateur à reproduire — Playwright est le choix le plus solide disponible en open-source aujourd'hui.
