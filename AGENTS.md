# AGENTS.md

App da Diocese de Franca: API REST (`backend/`) + app Expo/React Native com build web (`mobile/`). Dados raspados de https://diocesefranca.org.br/.

## Stack
- Backend: Node.js, Express 5, Axios, Cheerio, html-entities, Jest + Supertest. CommonJS. pnpm.
- Mobile: Expo SDK 54, React Native, React Navigation 7, expo-notifications, expo-location, Playwright (E2E). pnpm.

## Comandos (a partir da raiz)
- API: `cd backend && pnpm install && pnpm start` (porta `PORT`, padrao 3000)
- Testes backend: `cd backend && pnpm test` (53 testes, 7 suites)
- Scraper: `cd backend && node scraper.js` e `node scripts/syncDiocese.js` (precisam de rede e reescrevem `backend/data/*.json`). O scraper extrai notícias com seleção aprimorada de datas e suporte expandido a funções clericais (Administrador Paroquial, Reitor, Diácono Permanente).
- Mobile: `cd mobile && pnpm install && pnpm start`
- E2E: `cd mobile && npx expo export -p web && npx playwright test` (serve `dist` na 3001; regrava `mobile/screenshots/`)
- Lint: nao existe linter configurado.

## Gates de CI
- `validate.yml` e `security.yml` chamam reusables de `juninmd/base-actions` (validacao + Gitleaks).
- `release-drafter.yml` so atualiza o rascunho de release.

## Convencoes
- Arquivos curtos (limite informal de ~180 linhas), um modulo por responsabilidade: rotas em `backend/routes`, utilitarios em `backend/utils`.
- Complementos manuais de dados ficam em `backend/data/depara.json`; o scraper nao os sobrescreve.
- Notificacoes: sempre `await Notifications.requestPermissionsAsync()` antes de `scheduleNotificationAsync()`.
- Estados vazios/erro com tom acolhedor ("Puxa, ..."); `activeOpacity={0.8}` em toques de listas e detalhes.
- Locators do Playwright com regex (`getByText(/Diocese de Franca/i)`): React Native Web quebra texto multilinha.
- Tokens de design em `mobile/src/theme/index.js`.

## Nao fazer
- Nao commitar `.env`; use `.env.example` e so nomes de variaveis.
- Nao hardcodar outra URL de API sem atualizar `mobile/src/services/api.js` (a variavel `API_BASE_URL` do `.env.example` do mobile ainda nao e lida).
- Nao editar lockfiles (`pnpm-lock.yaml`) a mao.
- Nao usar mocks no lugar de dados reais nos testes de integracao/E2E.
