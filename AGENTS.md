# AGENTS.md

App da Diocese de Franca: API REST (`backend/`) + app Expo/React Native com build web (`mobile/`). Dados raspados de https://diocesefranca.org.br/.

## Stack
- Backend: Node.js, Express 5, Axios, Cheerio, html-entities, Jest + Supertest. CommonJS. pnpm.
- Mobile: Expo SDK 54, React Native, React Navigation 7, expo-notifications, expo-location, Playwright (E2E). pnpm.

## Comandos (a partir da raiz)
- API: `cd backend && pnpm install && pnpm start` (porta `PORT`, padrao 3000)
- Testes backend: `cd backend && pnpm test` (111 testes, 13 suites; inclui integridade dos JSONs em `data/`)
- Scraper: `cd backend && node scraper.js` e `node scripts/syncDiocese.js` (precisam de rede e reescrevem `backend/data/*.json`). O scraper extrai notícias (data = carimbo `AAAAMMDDHHMMSS_` do nome da imagem), funções clericais expandidas (Bispo, Pároco, Vigário Geral, Vigário Episcopal, Vigário Paroquial, Chanceler, Diretor Espiritual, Pároco Emérito, Padre Auxiliar, Assessor Diocesano, Diácono Colaborador, Colaborador, etc.), redes sociais (Facebook, Instagram, YouTube, WhatsApp) e capelas/comunidades/santuários/mosteiros/conventos vinculados. Ele nunca sobrescreve um JSON com resultado vazio/muito menor (`utils/fileStore.writeIfSane`) e preserva ids de padres (favoritos do app dependem deles).
- Mobile: `cd mobile && pnpm install && pnpm start`
- E2E: `cd mobile && npx expo export -p web && npx playwright test` (precisa da API em :3000 com dados reais; inclui `offline_cache.spec.js`) (serve `dist` na 3001; regrava `mobile/screenshots/`)
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
- Dados remotos no app: use `useResource`/hooks de `mobile/src/hooks/useData.js` (cache stale-while-revalidate em `services/cache.js`); não chame `api.js` direto em telas. Próxima missa é calculada no aparelho (`utils/massTime.computeNextMass`); no backend, `utils/nextMass` usa o fuso America/Sao_Paulo.
- Backend: rotas leem o catálogo via `utils/catalog.getCatalog()` (cache por `mtime`); respostas de dados levam `Cache-Control` (`middleware/cache.js`).
- Parsers: HTML do site às vezes é colado do Word; `htmlText` trata quebra de linha do código-fonte como espaço. Ao mexer em `massParser`/`parishParser`, valide contra páginas reais (ids 2030–2399) além dos fixtures.

## Nao fazer
- Nao commitar `.env`; use `.env.example` e so nomes de variaveis.
- Nao hardcodar outra URL de API sem atualizar `mobile/src/services/api.js` (a variavel `API_BASE_URL` do `.env.example` do mobile ainda nao e lida).
- Nao editar lockfiles (`pnpm-lock.yaml`) a mao.
- Nao usar mocks no lugar de dados reais nos testes de integracao/E2E.

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