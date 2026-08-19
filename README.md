# Diocese de Franca - App

Aplicativo completo para a Diocese de Franca com backend API REST e app React Native.

> **Status: 100% Funcional e em Produção** - Tests: 19/19 passing

## Funcionalidades

### Backend API
- REST API com Express.js 5.x
- Compressão gzip e headers de segurança (Helmet)
- Health check endpoint para monitoramento
- Middleware de validação e tratamento de erros
- Respostas padronizadas com sucesso/erro
- **19 testes automatizados** cobrindo todos os endpoints

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
- Notificações locais automáticas de boas-vindas na inicialização do app (`App.js`), lembretes no acesso rápido do `HomeScreen`, e **novo:** Lembretes de Missa individuais no `MassesScreen` via `expo-notifications`, além de alertas locais para quando favoritar uma paróquia ou padre (`ChurchesScreen.js` e `PriestsScreen.js`). Novos lembretes locais para Agendar Visita (`ChurchDetailScreen.js`) e Lembrete Confissão (`PriestDetailScreen.js`) com triggers mais ágeis.
- Aprimoramentos de UI/UX: Refinamento na listagem de Padres e Igrejas (`ChurchesScreen.js`, `PriestsScreen.js`) melhorando a legibilidade dos nomes e endereços, e ajuste no padding/margin do componente quando não há notícias retornadas (`HomeScreen.js`). Aumento da largura e margin adequados no card de notícias (`HomeScreen.js`), além de melhorias nos empty states das buscas.
- Skeletons Loaders (Animação Shimmer) em diversas áreas como Notícias e Listas
- Correção de duplicação de variáveis na renderização do banner offline
- Pull-to-refresh com feedback visual
- Favoritos salvos localmente (persistem)
- Toast notifications animadas (success/error/info)
- Indicador de conexão em tempo real
- Filtro "Todos" vs "Favoritos" em Igrejas e Padres
- Botão de limpar filtros
- Seção de acesso rápido na home
- Badges de estatísticas clicáveis
- Testes E2E atualizados e screenshots regeradas com sucesso com Playwright.

### Backend
- Scraper autônomo aprimorado (`backend/scraper.js`) para capturar data e descrição (`.event_date` e `.post_text p`) garantindo fallbacks robustos inclusive utilizando regex combinando a descrição ou o título, se os campos estiverem vazios. O script era autônomo rodando a cada 1 hora via `setInterval` (desativado para execuções inline). Usa a classe `.section_post_left` para maior confiabilidade e bloca a execução individual em `try/catch` com timeout de 15s.
- Endpoint de health check `/api/health`
- Compressão gzip automática
- Helmet.js para headers de segurança
- Middleware de validação de ID e dia
- Logs de requisição com timestamp
- Tratamento centralizado de erros 404/500
- Respostas com wrapper `{ success, count, data }`

## Tecnologias

### Backend
- Node.js + Express.js 5.x
- CORS, Compression, Helmet
- Jest (19 testes)

### Mobile
- React Native (Expo SDK 54)
- React Navigation 7
- AsyncStorage (favoritos persistentes)
- @expo/vector-icons (Ionicons)
- Axios

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
│   ├── tests/                  # Testes automatizados
│   │   └── api.test.js
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
    │   └── services/           # Serviços
    │       ├── api.js
    │       └── FavoritesService.js
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
# Resultado: 19 testes passando

cd ../mobile
npx playwright test
# Testes E2E (Web) validando Home, Igrejas e Missas
```

## Endpoints da API

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/` | Raiz da API |
| GET | `/api/health` | Health check |
| GET | `/api/churches` | Lista todas as igrejas |
| GET | `/api/churches/:id` | Detalhes de uma igreja |
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
- Filtro: Todos / Favoritos
- Avatar com ícone da igreja
- Botões de ação: favoritar, compartilhar
- Pull-to-refresh
- Skeleton loader durante carregamento

### Detalhes da Igreja
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

## Testes

O backend possui **19 testes automatizados** cobrindo:

- Validação de ID inválido (400)
- Busca de igreja/padre inexistente (404)
- Listagem com wrapper de sucesso
- Verificação de campos obrigatórios
- Filtro por dia da semana
- Case insensitive para dias
- Arrays vazios para dias sem missa

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
![Home Screen](mobile/screenshots/home_full.png)

**Igrejas Screen**
![Igrejas Screen](mobile/screenshots/churches_full.png)

**Padres Screen**
![Padres Screen](mobile/screenshots/priests_full.png)

**Missas Screen**
![Missas Screen](mobile/screenshots/masses_full.png)

## Licença

ISC