# Diocese de Franca - App

![Diocese de Franca Banner](mobile/screenshots/home_full.png?v=35)

Aplicativo completo para a Diocese de Franca com backend API REST e app React Native.

> **Status: 100% Funcional e em Produção** - Backend Tests: 92/92 passing | E2E Playwright Tests: 17/17 passing

## Funcionalidades

### Backend API & Scraper Autônomo
- REST API com Express.js 5.x
- Compressão gzip e headers de segurança (Helmet)
- Health check endpoint para monitoramento
- Middleware de validação e tratamento de erros
- Respostas padronizadas com wrapper `{ success, count, data }`
- **Scraper Aprimorado (`backend/scraper.js`)**: Raspagem completa e autônoma de https://diocesefranca.org.br/ trazendo:
  - **Notícias**: títulos, categorias, fotos, links e data de publicação (extraída do carimbo no nome da imagem, sem inventar "hoje").
  - **Paróquias**: 41 paróquias com endereços, contatos, expediente, redes sociais (Facebook, Instagram, YouTube), capelas e comunidades vinculadas e links de imagem.
  - **Padres e Clero**: 95 sacerdotes e diáconos (incluindo Bispo Diocesano, Administradores Paroquiais, Reitores e Diáconos Permanentes) vinculados a cada comunidade.
  - **Horários de Missa**: 251 horários semanais estruturados por dia e horário ("06h30; 11h30 e 19 h", dias colados na mesma linha e listas "a/e" são interpretados; o que é irregular vira nota).
- **Igrejas próximas** (`/api/churches/nearby`): ordena as paróquias pela distância (fórmula de Haversine) até uma coordenada e calcula a próxima missa de cada uma.
- **Cache no backend**: leitura dos JSONs com invalidação por `mtime` (o scraper atualiza a API sem reinício), `Cache-Control` + `ETag`/304 e índices por id.
- **Scraper seguro**: escrita atômica e recusa de sobrescrever dados com resultado vazio ou muito menor (site fora do ar / layout alterado); ids de padres estáveis entre execuções.
- **92 testes automatizados (Jest)** cobrindo endpoints, cache HTTP, parsers (notícias, paróquias, redes sociais, capelas, missas), construção do catálogo, integridade dos JSONs, geolocalização, próxima missa (fuso de Brasília) e normalização de nomes.

### Mobile App
- Interface moderna com design profissional
- **Pull-to-refresh** em todas as listas
- **Skeleton loaders** durante carregamento
- **Sistema de favoritos** persistente (AsyncStorage)
- **Toast notifications** para feedback de ações
- **Indicador de rede** offline/online
- Busca em tempo real com filtros
- Compartilhamento via Share API
- Estados de loading e erro tratados

## Novidades Implementadas

### Mobile
- Deploy web 100% funcional no Netlify com Metro bundler suportando `react-native-web`.
- Lembrete diário às 08:00 configurado na Home usando `expo-notifications`.
- Adição de Notificações Locais (`expo-notifications`) para as interações de agendamento: "Lembrete Confissão" em Detalhes do Padre, notificações em horários de missas (`MassesScreen.js`), e em Detalhes da Igreja ("Agendar Visita").
- empty/error states de toda a aplicação (Home, Listas, Detalhes) padronizados com tom acolhedor e empático ("Puxa,...").
- Consistência de `activeOpacity={0.8}` para feedback tátil em botões e listas interativas.
- **Lembrete de Confissão e Missas**: Uso do `expo-notifications` para solicitar permissão e engatilhar agendamentos locais (`scheduleNotificationAsync`).
- **Igrejas próximas ("Perto de mim")**: filtro em `ChurchesScreen.js` que usa `expo-location` (`LocationService.js`) para solicitar a localização do usuário e ordenar as paróquias por distância com o badge da próxima missa.
- **Card "Igreja mais próxima" na Home**: destaca a paróquia mais próxima com horário da próxima missa.
- **Próxima missa na tela de detalhes**: banner em `ChurchDetailScreen.js` mostrando a próxima missa calculada.
- **Cache offline (stale-while-revalidate)**: `src/services/cache.js` + `src/hooks/useResource.js` mostram na hora o que já foi baixado (memória + AsyncStorage), revalidam em segundo plano e, sem rede, mantêm a cópia salva com aviso acolhedor (`NetworkStatus`, sem polling). A próxima missa é recalculada no aparelho.
- **17 Testes E2E (Playwright)** validando fluxos na versão Web, detalhes da igreja (com redes sociais e capelas), lembretes, validação de dados raspados, estados vazios e capturando screenshots atualizadas.

### Backend & Scraper
- **Scraper Unificado e Aprimorado (`backend/scraper.js`)**: Raspagem de notícias, paróquias, clero e horários de missa em https://diocesefranca.org.br/.
- Tratamento robusto contra falhas de rede com retries exponenciais e preservação dos JSONs atuais quando a raspagem falha.
- Decodificação completa de HTML Entities com a biblioteca `html-entities` e limpeza de formatação.
- Endpoint de health check `/api/health`
- Testes automatizados atualizados dinamicamente para validar IDs ativos no banco de dados.

## Tecnologias

### Backend
- Node.js + Express.js 5.x
- Axios + Cheerio + HTML-Entities
- CORS, Compression, Helmet
- Jest (92 testes)

### Mobile
- React Native (Expo SDK 54)
- React Navigation 7
- AsyncStorage (favoritos persistentes)
- @expo/vector-icons (Ionicons)
- Playwright E2E (17 testes)

## Estrutura do Projeto

```
diocese-franca-app/
├── backend/
│   ├── data/                    # Dados JSON (Notícias, Igrejas, Padres, Missas)
│   │   ├── news.json
│   │   ├── churches.json
│   │   ├── priests.json
│   │   └── masses.json
│   ├── routes/                 # Rotas da API
│   │   ├── churches.js
│   │   ├── priests.js
│   │   ├── masses.js
│   │   └── news.js
│   ├── middleware/             # Middleware Express
│   │   ├── cache.js
│   └── validation.js
│   ├── utils/                   # Funções auxiliares e parsers
│   │   ├── geo.js
│   │   ├── nextMass.js
│   │   ├── newsParser.js
│   │   ├── parishParser.js
│   │   ├── massParser.js
│   │   ├── catalogBuilder.js
│   │   ├── fileStore.js
│   │   └── http.js
│   ├── tests/                  # Testes automatizados Jest
│   ├── scraper.js              # Scraper completo da Diocese
│   ├── index.js                # Entry point API
│   └── package.json
│
└── mobile/
    ├── e2e/                    # Testes End-to-End com Playwright
    ├── screenshots/            # Screenshots geradas pelos testes E2E
    ├── src/
    │   ├── components/
    │   ├── context/
    │   ├── hooks/
    │   ├── navigation/
    │   ├── screens/
    │   ├── services/
    │   └── utils/
    ├── App.js
    └── package.json
```

## Requisitos

- Node.js 20+ (validado com Node 24) e [pnpm](https://pnpm.io/) (cada pacote tem `pnpm-lock.yaml`)
- Para os testes E2E: navegador Chromium do Playwright (`npx playwright install chromium`)
- Para o deploy manual: conta Netlify (`deploy.sh` usa `npx netlify deploy`)

## Configuração

| Onde | Variável | Uso |
|------|----------|-----|
| `backend/.env.example` | `PORT` | Porta da API (padrão `3000`) |
| `backend/.env.example` | `NODE_ENV` | Ambiente de execução |
| `mobile/.env.example` | `API_BASE_URL` | Documentada no exemplo, mas **ainda não é lida pelo código** |

O backend lê `PORT` direto de `process.env` (não carrega arquivo `.env` sozinho; exporte a variável no shell).
No mobile, a URL da API está fixa em `mobile/src/services/api.js` (`http://localhost:3000`); para emulador Android ou
dispositivo físico, edite a constante `API_BASE_URL` nesse arquivo.

## Instalação e Execução

### Backend

```bash
cd backend
pnpm install
pnpm start            # API em http://localhost:3000 (também: pnpm dev)
node scraper.js       # raspa diocesefranca.org.br e atualiza backend/data/*.json (precisa de rede)
node scripts/syncDiocese.js   # sincroniza igrejas/padres/missas com as páginas das paróquias (precisa de rede)
```

### Mobile

```bash
cd mobile
pnpm install
pnpm start            # Expo (também: pnpm android | pnpm ios | pnpm web)
```

## Testes

```bash
# Backend: 92 testes Jest em 11 suítes
cd backend
pnpm test

# Mobile: 17 testes E2E Playwright contra o bundle web exportado
cd ../mobile
pnpm install
npx expo export -p web      # gera mobile/dist
npx playwright test         # sobe `npx serve dist -p 3001` automaticamente
```

Os E2E esperam a API em `http://localhost:3000` (ou exibem os estados vazios) e regravam os prints em `mobile/screenshots/`.

## Lint

Não há linter configurado no repositório (nenhum script `lint` em `backend/` ou `mobile/`).

## Build e deploy

- **Web (Netlify):** `netlify.toml` roda `cd mobile && pnpm install && npx expo export -p web` e publica `mobile/dist`, com redirect `/*` para `/index.html`.
- **Manual:** `./deploy.sh` faz o mesmo build e executa `npx netlify deploy --prod --dir=dist`.
- **Backend:** não há Dockerfile nem pipeline de deploy no repositório; rode `pnpm start` no ambiente de destino.

## Gates de CI

| Workflow | Gatilho | O que checa |
|----------|---------|-------------|
| `validate.yml` | PR e push em `main`/`master` | Chama o reusable `juninmd/base-actions/.github/workflows/reusable-validate.yml` (validação de código definida no repositório `base-actions`) |
| `security.yml` | push em `main`/`master` | Chama o reusable `reusable-security-scan.yml` (Gitleaks) |
| `release-drafter.yml` | push em `main`/`master` e PR | Atualiza o rascunho de release (não bloqueia) |

## Endpoints da API

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/` | Raiz da API |
| GET | `/api/health` | Health check |
| GET | `/api/churches` | Lista todas as igrejas |
| GET | `/api/churches/:id` | Detalhes de uma igreja (inclui a próxima missa) |
| GET | `/api/churches/nearby?lat=&lng=` | Igrejas ordenadas por distância até uma coordenada |
| GET | `/api/priests` | Lista todos os padres |
| GET | `/api/priests/:id` | Detalhes de um padre |
| GET | `/api/masses` | Lista todos os horários de missas |
| GET | `/api/masses/by-church/:id` | Missas por igreja |
| GET | `/api/masses/by-day/:dia` | Missas por dia da semana |
| GET | `/api/news` | Notícias atualizadas da Diocese |

## Dados Atualizados

| Entidade | Quantidade Raspada |
|----------|--------------------|
| Paróquias | 41 |
| Padres / Clero | 95 |
| Horários de Missa | 251 |
| Notícias em Destaque | 5 |

## Screenshots

### Screenshots (Web Output E2E Test)
**Home Screen**
![Home Screen](mobile/screenshots/home_full.png?v=35)

**News Section**
![News Section](mobile/screenshots/news_section.png?v=35)

**Igrejas Screen**
![Igrejas Screen](mobile/screenshots/churches_full.png?v=35)

**Detalhes da Igreja (Redes Sociais e Capelas)**
![Detalhes da Igreja](mobile/screenshots/church_details_full.png?v=35)

**Padres Screen**
![Padres Screen](mobile/screenshots/priests_full.png?v=35)

**Missas Screen**
![Missas Screen](mobile/screenshots/masses_full.png?v=35)

**Missas (Empty State)**
![Missas (Empty State)](mobile/screenshots/masses_empty.png?v=35)

**Lembrete de Missa**
![Lembrete de Missa](mobile/screenshots/masses_lembrete.png?v=35)

**Igrejas (Empty State)**
![Igrejas (Empty State)](mobile/screenshots/churches_empty.png?v=35)

**Padres (Empty State)**
![Padres (Empty State)](mobile/screenshots/priests_empty.png?v=35)

**Igreja Próxima**
![Igreja Próxima](mobile/screenshots/churches_nearby.png?v=35)

**Igreja Próxima (Permissão Negada)**
![Igreja Próxima Permissão Negada](mobile/screenshots/churches_nearby_denied.png?v=35)

## Licença

ISC