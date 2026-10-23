# Diocese de Franca - App

![Diocese de Franca Banner](mobile/screenshots/home_full.png?v=33)

Aplicativo completo para a Diocese de Franca com backend API REST e app React Native.

> **Status: 100% Funcional e em Produção** - Backend Tests: 53/53 passing | E2E Playwright Tests: 15/15 passing

## Funcionalidades

### Backend API & Scraper Autônomo
- REST API com Express.js 5.x
- Compressão gzip e headers de segurança (Helmet)
- Health check endpoint para monitoramento
- Middleware de validação e tratamento de erros
- Respostas padronizadas com wrapper `{ success, count, data }`
- **Scraper Aprimorado (`backend/scraper.js`)**: Raspagem completa e autônoma de https://diocesefranca.org.br/ trazendo:
  - **Notícias**: Destaques, títulos, fotos, links e parsing avançado de datas em formato extenso/relativo.
  - **Paróquias**: 40 paróquias com endereços, contatos, expediente e links de imagem.
  - **Padres e Clero**: 93 sacerdotes (incluindo o Bispo Diocesano e diáconos) vinculados a cada comunidade.
  - **Horários de Missa**: 231 horários semanais estruturados por dia e horário.
- **Igrejas próximas** (`/api/churches/nearby`): ordena as paróquias pela distância (fórmula de Haversine) até uma coordenada e calcula a próxima missa de cada uma.
- **53 testes automatizados (Jest)** cobrindo todos os endpoints, rotas de notícias, catálogo, geolocalização, cálculo da próxima missa, separação de diáconos/clero e normalização de nomes.

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
- **15 Testes E2E (Playwright)** validando fluxos na versão Web, lembretes, validação de dados raspados, estados vazios e capturando screenshots atualizadas.

### Backend & Scraper
- **Scraper Unificado e Aprimorado (`backend/scraper.js`)**: Raspagem de notícias, paróquias, clero e horários de missa em https://diocesefranca.org.br/.
- Tratamento robusto contra falhas de rede com retries exponenciais, User-Agents aleatórios e fallbacks gracioso para JSONs preservando a integridade dos dados.
- Decodificação completa de HTML Entities com a biblioteca `html-entities` e limpeza de formatação.
- Endpoint de health check `/api/health`
- Testes automatizados atualizados dinamicamente para validar IDs ativos no banco de dados.

## Tecnologias

### Backend
- Node.js + Express.js 5.x
- Axios + Cheerio + HTML-Entities
- CORS, Compression, Helmet
- Jest (53 testes)

### Mobile
- React Native (Expo SDK 54)
- React Navigation 7
- AsyncStorage (favoritos persistentes)
- @expo/vector-icons (Ionicons)
- Playwright E2E (15 testes)

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
│   │   └── validation.js
│   ├── utils/                   # Funções auxiliares e parsers
│   │   ├── geo.js
│   │   ├── nextMass.js
│   │   ├── parishParser.js
│   │   └── massParser.js
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
    │   ├── navigation/
    │   ├── screens/
    │   ├── services/
    │   └── utils/
    ├── App.js
    └── package.json
```

## Instalação e Execução

### Backend

```bash
cd backend
pnpm install
# Executar scraper para atualizar dados:
node scraper.js
# Iniciar o servidor:
pnpm start
# Servidor: http://localhost:3000
```

### Mobile

```bash
cd mobile
pnpm install
pnpm start
```

### Executar Testes

```bash
# Testes do Backend (53 testes)
cd backend
pnpm test

# Testes E2E Mobile com Playwright (15 testes)
cd ../mobile
npx playwright test
```

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
| Paróquias | 40 |
| Padres / Clero | 93 |
| Horários de Missa | 231 |
| Notícias em Destaque | 5+ |

## Screenshots

### Screenshots (Web Output E2E Test)
**Home Screen**
![Home Screen](mobile/screenshots/home_full.png?v=33)

**News Section**
![News Section](mobile/screenshots/news_section.png?v=33)

**Igrejas Screen**
![Igrejas Screen](mobile/screenshots/churches_full.png?v=33)

**Padres Screen**
![Padres Screen](mobile/screenshots/priests_full.png?v=33)

**Missas Screen**
![Missas Screen](mobile/screenshots/masses_full.png?v=33)

**Missas (Empty State)**
![Missas (Empty State)](mobile/screenshots/masses_empty.png?v=33)

**Lembrete de Missa**
![Lembrete de Missa](mobile/screenshots/masses_lembrete.png?v=33)

**Igrejas (Empty State)**
![Igrejas (Empty State)](mobile/screenshots/churches_empty.png?v=33)

**Padres (Empty State)**
![Padres (Empty State)](mobile/screenshots/priests_empty.png?v=33)

**Igreja Próxima**
![Igreja Próxima](mobile/screenshots/churches_nearby.png?v=33)

**Igreja Próxima (Permissão Negada)**
![Igreja Próxima Permissão Negada](mobile/screenshots/churches_nearby_denied.png?v=33)

## Licença

ISC