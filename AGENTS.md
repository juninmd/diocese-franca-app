# AGENTS.md

Diocese of Franca app: a REST API (`backend/`) that scrapes https://diocesefranca.org.br/ into JSON, and an Expo / React Native app with a web build (`mobile/`).

## Stack

- Backend: TypeScript (strict), Node.js, Express 5, Axios, Cheerio, html-entities; Jest (ts-jest) and Supertest. pnpm 10.
- Mobile: TypeScript (strict), Expo SDK 54, React Native, React Navigation 7, expo-notifications, expo-location; Playwright for E2E.
- No linter is configured.

## Commands

```bash
# API (from backend/)
pnpm install && pnpm build && pnpm start   # PORT, default 3000
pnpm dev                                   # tsx watch
pnpm typecheck                             # CI gate
pnpm test                                  # Jest: 118 tests in 14 suites, includes data/ JSON integrity
pnpm scrape                                # needs network; rewrites backend/data/*.json
pnpm sync:diocese                          # needs network; rewrites backend/data/*.json

# App (from mobile/)
pnpm install && pnpm start
pnpm typecheck                             # CI gate

# E2E (from mobile/; needs the API on :3000 with real data)
npx expo export -p web && npx playwright test   # serves dist on :3001; rewrites mobile/screenshots/
```

E2E specs include `offline_cache.spec.ts`, `foranias_and_clergy.spec.ts`, and `scraper_enhanced.spec.ts`.

## Structure

- `backend/src/routes/`: API routes. `backend/src/utils/`: one responsibility per module (`fileStore`, `catalog`, `geocode`, `chapelParser`, `nextMass`). `backend/src/middleware/cache.ts`. `backend/src/scraper.ts`.
- `backend/src/types.ts`: API domain types. `backend/data/`: scraped JSON, plus the manual `depara.json` and the `addressCoords.json` cache.
- `mobile/src/`: components, hooks (`useData.ts`), services (`api.ts`, `cache.ts`), theme, context (`SearchContext.tsx`), navigation (`navigation/types.ts`), domain types (`types.ts`).
- `mobile/e2e/`: Playwright specs. `backend/tests/` and `mobile/src/utils/__tests__/`: unit tests.

## Conventions

- Keep files short (informal limit about 180 lines); one module per responsibility. Avoid `any`.
- Remote data in the app goes through `useResource` / `mobile/src/hooks/useData.ts` (stale-while-revalidate cache in `services/cache.ts`). Screens do not call `services/api.ts` directly.
- Backend routes read the catalog through `utils/catalog.getCatalog()` (cached by mtime). Data responses carry `Cache-Control`.
- The next mass is computed on the device (`utils/massTime.computeNextMass`). The backend `utils/nextMass` uses America/Sao_Paulo.
- Notifications: always `await Notifications.requestPermissionsAsync()` before `scheduleNotificationAsync()`.
- Theme tokens are in `mobile/src/theme/index.ts` ("Vitral Vivo"). Light and dark follow the system. `colors.primary` follows the liturgical color (`theme/liturgy.ts`); both are resolved at app start. Text on `primary` uses `colors.onPrimary`; dark heroes use `colors.hero*`. Fonts: Fraunces (titles), Manrope (UI).
- Motion: use `FadeIn`, `PressableScale`, `Pop`, `Pulse` from `components/ui/Motion.tsx`; they respect reduced motion via `hooks/useReduceMotion`. Universal search: `useSearch().open()`.
- Empty and error states use a warm tone ("Puxa, ..."). Use `activeOpacity={0.8}` on list and detail touches.
- Playwright locators use regex (`getByText(/Diocese de Franca/i)`), because React Native Web breaks multi-line text.
- Chapels: `utils/chapelParser.ts` writes `chapels[].masses` (`{ dayOfWeek, time }`) and `chapels[].massNotes` for irregular times (e.g. "1º domingo do mês"). Only `churches.json` holds them, not `masses.json`.
- Geocoding: `utils/geocode.ts` (Nominatim, 1 request/s), cached in `data/addressCoords.json` by id. It re-queries only when the address changes. `manual: true` pins a coordinate. Results more than 12 km from the city center are discarded. `coordinatesPrecision` is `address`, or `city` as fallback.
- Parsers: site HTML is sometimes pasted from Word, and `htmlText` treats source line breaks as spaces. Validate changes to `massParser` or `parishParser` against real pages (ids 2014–2265), not only fixtures.

## Gotchas

- The scraper never overwrites a JSON file with an empty or much smaller result (`utils/fileStore.writeIfSane`). It keeps priest ids, because app favorites depend on them.
- Manual data fixes go in `backend/data/depara.json`; the scraper does not overwrite it.
- `mobile/.env.example` documents `API_BASE_URL`, but the code does not read it yet. The URL lives in `mobile/src/services/api.ts`.
- Deploy: the API image is `ghcr.io/juninmd/diocese-franca-api` (`backend/Dockerfile`, `docker.yml`, pushes only from master). Manifests are in `juninmd/app-charts/diocese-franca` (ArgoCD). Outside dev the app uses `https://diocese-franca.antonio-code.duckdns.org`; web on localhost uses `http://localhost:3000`.
- Android APK: `android-apk.yml` (expo prebuild, then `gradlew assembleRelease`) publishes fixed links: `releases/download/apk-latest/diocese-franca.apk` (master) and `apk-preview` (PRs).
- CI: `typecheck.yml` runs backend typecheck, test, and build, and mobile typecheck. `validate.yml` and `security.yml` call reusable workflows from `juninmd/base-actions` (validation and Gitleaks). `release-drafter.yml` only updates the draft release.
- Playwright output (`test-results/`) is generated and gitignored.

## Do not

- Do not commit `.env`. Use `.env.example` and variable names only.
- Do not hardcode another API URL outside `mobile/src/services/api.ts`.
- Do not edit lockfiles (`pnpm-lock.yaml`) by hand.
- Do not use mocks in place of real data in integration and E2E tests.

<!-- base-actions-main-policy -->
## GitHub Actions — padrão obrigatório (@main)

- Referencie as actions internas sempre pelo branch, nunca por SHA:
  - `uses: juninmd/base-actions/<action>@main`
  - `uses: juninmd/base-actions/.github/workflows/<arquivo>.yml@main`
- Não fixe `@<sha>` em `juninmd/base-actions`: a atualização é centralizada no
  `main` e passa a valer no próximo run.
- PRs cujos checks não iniciam por billing/spending limit são mesclados pelo bot central
  `juninmd/base-actions/.github/workflows/auto-merge-billing-blocked.yml`.
  Para impedir o merge automático de um PR, aplique a label `do-not-merge`.
