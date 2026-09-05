# Diocese de Franca - App

Aplicativo completo para a Diocese de Franca com backend API REST e app React Native.

> **Status: 100% Funcional e em Produção** - Tests: 31/31 passing

## Funcionalidades

### Backend API
- REST API com Express.js 5.x
- Compressão gzip e headers de segurança (Helmet)
- Health check endpoint para monitoramento
- Middleware de validação e tratamento de erros
- Respostas padronizadas com sucesso/erro
- **Igrejas próximas** (`/api/churches/nearby`): ordena as paróquias pela distância (fórmula de Haversine) até uma coordenada e calcula a próxima missa de cada uma
- **31 testes automatizados** cobrindo todos os endpoints, além de utilitários de geolocalização e cálculo da próxima missa

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
- Deploy web 100% funcional no Netlify com Metro bundler suportando `react-native-web`
- Lembrete diário às 08:00 configurado na Home usando `expo-notifications`.
- Notificações locais automáticas de boas-vindas na inicialização do app (`App.js`), lembretes no acesso rápido do `HomeScreen` (incluindo notificação imediata ao clicar em "Ligar Diocese"), e Lembretes de Missa individuais no `MassesScreen` via `expo-notifications`, além de alertas locais para quando favoritar uma paróquia ou padre (`ChurchesScreen.js` e `PriestsScreen.js`). Lembretes locais para Agendar Visita (`ChurchDetailScreen.js`), Lembrete Confissão (`PriestDetailScreen.js`) com triggers mais ágeis, e notificação local de feedback ao limpar filtros em `MassesScreen.js`.
- Empty states mais empáticos para erros de rede, utilizando textos encorajadores nas telas de busca e listagem (`ChurchesScreen.js`, `MassesScreen.js`).
- Aprimoramentos de UI/UX: Refinamento na listagem de Padres e Igrejas (`ChurchesScreen.js`, `PriestsScreen.js`) melhorando a legibilidade e atualizando os empty states para uma linguagem mais acolhedora e empática (ex: "Puxa, não conseguimos carregar as igrejas agora. Tente novamente!"). O uso do tom empático "Puxa..." foi padronizado em todas as telas, incluindo "Puxa, não encontramos paróquias com este nome." nos empty states de busca.
- Skeletons Loaders (Animação Shimmer) em diversas áreas como Notícias e Listas
- Melhorias na UI/UX dos empty states, como no `MassesScreen.js`
- Correção de duplicação de variáveis na renderização do banner offline
- Pull-to-refresh com feedback visual
- Favoritos salvos localmente (persistem)
- Toast notifications animadas (success/error/info)
- Indicador de conexão em tempo real
- Filtro "Todos" vs "Favoritos" em Igrejas e Padres
- Botão de limpar filtros
- Seção de acesso rápido na home
- Badges de estatísticas clicáveis
- Testes E2E atualizados com Playwright, incluindo cenários específicos para empty states e screenshots regeradas com sucesso.
- **Igrejas próximas ("Perto de mim")**: novo filtro em `ChurchesScreen.js` que usa `expo-location` (`LocationService.js`) para pedir a localização do usuário e listar as paróquias ordenadas por distância, com badge de distância e a próxima missa de cada uma. Estados vazios acolhedores para permissão negada/timeout, com botão de tentar novamente.
- **Card "Igreja mais próxima" na Home**: botão que localiza o usuário e destaca a paróquia mais próxima com distância e horário da próxima missa, navegando direto para os detalhes dela.
- **Próxima missa na tela de detalhes**: banner em `ChurchDetailScreen.js` mostrando a próxima missa (dia, horário e "em quanto tempo"), calculada a partir dos horários cadastrados.
- **Notificações Locais (Lembrete Diário/Testes)**: Implementação de lembretes diários (8h da manhã) com `expo-notifications` para incentivo à oração, configurado globalmente em `App.js` na inicialização, e um novo botão de teste ("Lembrete Teste 5s") presente no Acesso Rápido na Home.

### Deploy (Web)
- **Netlify**: O projeto já encontra-se pré-configurado para ser compilado e entregue como Progressive Web App (PWA) / Single Page Application usando `npx expo export -p web` na pasta `mobile/`. A configuração para Netlify está estabelecida na raiz em `netlify.toml`, que mapeia corretamente o redirecionamento `/*` para `/index.html` (resolvendo roteamento client-side) e define a pasta de publicação como `mobile/dist`.

### Backend
- Scraper autônomo aprimorado (`backend/scraper.js`) para capturar data e descrição (`.event_date` e `.post_text p`) garantindo fallbacks robustos inclusive com regex para reconhecer datas curtas e gerar logs de debug das etapas para facilitar manutenção. O script agora corre via invocação inline exportando o modulo e finalizando limpo. Usa a classe `.section_post_left` para maior confiabilidade (com fallback adicional extraindo diretamente o texto de `h2.post_title` caso a tag `a` não esteja presente) e bloca a execução individual em `try/catch` com timeout de 20s. Foi adicionado também um **mecanismo de tentativas (retry loop)** para a requisição de rede inicial, tentando até 3 vezes caso o site da Diocese apresente falhas intermitentes, retornando um array vazio de fallback apenas se o site original continuar inacessível para evitar crashs na API.
- Endpoint de health check `/api/health`
- Compressão gzip automática
- Helmet.js para headers de segurança
- Middleware de validação de ID e dia
- Logs de requisição com timestamp
- Tratamento centralizado de erros 404/500
- Respostas com wrapper `{ success, count, data }`
- **Igrejas próximas e próxima missa**: `backend/utils/geo.js` (distância por Haversine) e `backend/utils/nextMass.js` (próxima ocorrência de missa a partir de agora) alimentam o endpoint `GET /api/churches/nearby` e o campo `nextMass` em `GET /api/churches/:id`

## Tecnologias

### Backend
- Node.js + Express.js 5.x
- CORS, Compression, Helmet
- Jest (31 testes)

### Mobile
- React Native (Expo SDK 54)
- React Navigation 7
- AsyncStorage (favoritos persistentes)
- @expo/vector-icons (Ionicons)
- Axios
- expo-location (geolocalização para "igrejas próximas")

## Estrutura do Projeto

```
diocese-franca-app/
├── backend/
│   ├── data/                    # Dados JSON
│   │   ├── churches.json
│   │   ├── priests.json
│   │   └── masses.json
│   ├── routes/                 # Rotas da API
│   │   ├── churches.js
│   │   ├── priests.js
│   │   └── masses.js
│   ├── middleware/             # Middleware Express
│   │   └── validation.js
│   ├── utils/                   # Funções auxiliares
│   │   ├── geo.js               # Distância entre coordenadas (Haversine)
│   │   └── nextMass.js          # Próxima ocorrência de missa a partir de agora
│   ├── tests/                  # Testes automatizados
│   │   ├── api.test.js
│   │   ├── geo.test.js
│   │   └── nextMass.test.js
│   ├── index.js                # Entry point
│   └── package.json
│
└── mobile/
    ├── src/
    │   ├── components/          # Componentes reutilizáveis
    │   │   ├── NetworkStatus.js
    │   │   └── Skeleton.js
    │   ├── context/            # Contextos React
    │   │   ├── DataCacheContext.js
    │   │   └── ToastContext.js
    │   ├── navigation/         # Navegação
    │   │   └── index.js
    │   ├── screens/            # Telas do app
    │   │   ├── HomeScreen.js
    │   │   ├── ChurchesScreen.js
    │   │   ├── ChurchDetailScreen.js
    │   │   ├── PriestsScreen.js
    │   │   ├── PriestDetailScreen.js
    │   │   └── MassesScreen.js
    │   ├── services/           # Serviços
    │   │   ├── api.js
    │   │   ├── FavoritesService.js
    │   │   └── LocationService.js  # Permissão e leitura de localização (expo-location)
    │   └── utils/              # Funções auxiliares de UI
    │       └── massTime.js     # Formata "próxima missa" e distância em texto
    ├── App.js
    └── package.json
```

## Instalação e Execução

### Backend

```bash
cd backend
pnpm install
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
cd backend
pnpm test
# Resultado: 31 testes passando

cd ../mobile
npx playwright test
# Testes E2E (Web) validando Home, Igrejas, Missas e Igrejas Próximas
```

## Endpoints da API

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/` | Raiz da API |
| GET | `/api/health` | Health check |
| GET | `/api/churches` | Lista todas as igrejas |
| GET | `/api/churches/:id` | Detalhes de uma igreja (inclui a próxima missa) |
| GET | `/api/churches/nearby?lat=&lng=` | Igrejas ordenadas por distância até uma coordenada, com a próxima missa de cada uma |
| GET | `/api/priests` | Lista todos os padres |
| GET | `/api/priests/:id` | Detalhes de um padre |
| GET | `/api/masses` | Lista todos os horários |
| GET | `/api/masses/by-church/:id` | Missas por igreja |
| GET | `/api/masses/by-day/:dia` | Missas por dia |
| GET | `/api/news` | Notícias da Diocese (scraped) |

## Funcionalidades do App Detalhadas

### Tela Início
- Dashboard com estatísticas (paróquias, padres, missas)
- **NOVO:** Sessão "Notícias da Diocese" que exibe os destaques raspados diretamente do portal da Diocese com imagens e links
- Cards clicáveis para navegação rápida
- Seção de acesso rápido (Missa domingo, **Lembrete diário com notificações locais**, ligar, email)
- Pull-to-refresh para atualizar dados
- Informações de contato da diocese

### Igrejas
- Lista com busca em tempo real
- Filtro: Todos / Favoritos / **Perto de mim** (usa a localização do dispositivo para ordenar por distância e mostrar a próxima missa de cada igreja)
- Avatar com ícone da igreja
- Botões de ação: favoritar, compartilhar
- Pull-to-refresh
- Skeleton loader durante carregamento

### Detalhes da Igreja
- Banner com a próxima missa (dia, horário e "em quanto tempo")
- Informações completas (endereço, telefone, descrição)
- Pároco responsável com contato
- Lista de horários de missa
- Botão para abrir no mapa

### Padres
- Lista com busca por nome/título
- Filtro: Todos / Favoritos
- Avatar com iniciais do nome
- Badge com título (Pároco, Bispo)
- Pull-to-refresh

### Detalhes do Padre
- Perfil com biografia
- Contato (email, telefone)
- Paróquia com navegação

### Horários de Missa
- Filtros por dia da semana
- Filtros por tipo (Dominical/Semanal)
- Botão limpar filtros
- Lista organizada por dia
- Badge com contador de missas
- Pull-to-refresh

## Dados

| Entidade | Quantidade |
|----------|------------|
| Paróquias | 4 |
| Padres | 5 |
| Missas/semana | 22 |

> **Sobre a origem dos dados:** paróquias, padres e horários de missa (`backend/data/*.json`) são dados de exemplo criados manualmente para o desenvolvimento do app — este ambiente de desenvolvimento não teve acesso à internet para validá-los ou raspá-los diretamente do site oficial da Diocese de Franca (apenas o scraper de notícias, que já roda em produção, alcança o site real). Antes de publicar, homologue paróquias/padres/missas com a Diocese e substitua os dados de exemplo pelos reais; o campo `coordinatesVerified: false` em cada igreja sinaliza que as coordenadas geográficas também são aproximadas, pendentes de geocodificação real.

## Testes

O backend possui **31 testes automatizados** cobrindo:

- Validação de ID inválido (400)
- Busca de igreja/padre inexistente (404)
- Listagem com wrapper de sucesso
- Verificação de campos obrigatórios
- Filtro por dia da semana
- Case insensitive para dias
- Arrays vazios para dias sem missa
- Cálculo de distância entre coordenadas (Haversine) e ordenação de `GET /api/churches/nearby`
- Cálculo da próxima missa (mesmo dia, dias seguintes e virada de semana)
- Validação de coordenadas ausentes/fora do intervalo válido

## Pré-requisitos

- Node.js 18+
- pnpm (gerenciador de pacotes)

```bash
npm install -g pnpm
```

## Screenshots

O app possui interface moderna com:
- Cores consistentes (#2c3e50 como primária)
- Cards com elevation e sombras suaves
- Ícones Ionicons em todas as ações
- Feedback visual em todas as interações
- Estados de loading com skeleton
- Toasts animados para feedback

### Screenshots (Web Output E2E Test)
**Home Screen**
![Home Screen](mobile/screenshots/home_full.png?v=10)

**News Section**
![News Section](mobile/screenshots/news_section.png?v=10)

**Igrejas Screen**
![Igrejas Screen](mobile/screenshots/churches_full.png?v=10)

**Padres Screen**
![Padres Screen](mobile/screenshots/priests_full.png?v=10)

**Missas Screen**
![Missas Screen](mobile/screenshots/masses_full.png?v=10)

**Missas (Empty State)**
![Missas (Empty State)](mobile/screenshots/masses_empty.png?v=10)

**Igrejas (Empty State)**
![Igrejas (Empty State)](mobile/screenshots/churches_empty.png?v=10)

**Padres (Empty State)**
![Padres (Empty State)](mobile/screenshots/priests_empty.png?v=10)

**Igreja Próxima**
![Igreja Próxima](mobile/screenshots/churches_nearby.png?v=10)

**Igreja Próxima (Permissão Negada)**
![Igreja Próxima Permissão Negada](mobile/screenshots/churches_nearby_denied.png?v=10)

## Licença

ISC