# Diocese Franca - Mobile App

Aplicativo React Native para consulta de informações da Diocese de Franca.

## Funcionalidades

- 📱 **Igrejas**: Listagem e detalhes das paróquias
- 👨‍⚖️ **Padres**: Informações sobre os sacerdotes
- 📅 **Horários de Missa**: Consulta de horários por dia da semana
- 🔍 **Filtros**: Filtrar missas por dia da semana

## Tecnologias

- React Native
- Expo
- React Navigation
- Axios

## Instalação

```bash
pnpm install
```

## Configuração da API

Antes de executar o app, configure a URL da API no arquivo `src/services/api.js`:

```javascript
const API_BASE_URL = 'http://localhost:3000'; // URL do backend
```

**Nota**: Para testar no dispositivo físico ou emulador, use o IP da sua máquina em vez de `localhost`.

### Descobrir seu IP local:

**No Windows:**
```bash
ipconfig
# Procure por "IPv4 Address" na seção da sua rede ativa
```

**No Mac/Linux:**
```bash
ifconfig
# Ou use: hostname -I
# Procure por um IP no formato 192.168.x.x ou 10.0.x.x
```

**Configurações por tipo de emulador:**
- Emulador Android: `http://10.0.2.2:3000`
- Emulador iOS: `http://localhost:3000` ou o IP da máquina
- Dispositivo físico: `http://SEU_IP:3000` (ex: `http://192.168.1.100:3000`)

## Executar o app

```bash
# Iniciar o servidor de desenvolvimento
pnpm start

# Executar no Android
pnpm android

# Executar no iOS (requer macOS)
pnpm ios

# Executar no navegador
pnpm web
```

## Estrutura do Projeto

```
mobile/
├── src/
│   ├── navigation/      # Configuração de navegação
│   ├── screens/         # Telas do app
│   │   ├── HomeScreen.js
│   │   ├── ChurchesScreen.js
│   │   ├── ChurchDetailScreen.js
│   │   ├── PriestsScreen.js
│   │   ├── PriestDetailScreen.js
│   │   └── MassesScreen.js
│   └── services/        # Serviços e API
│       └── api.js
├── App.js
└── package.json
```

## Telas

### Início (Home)
Tela principal com acesso rápido às funcionalidades do app.

### Igrejas (Churches)
- Lista todas as paróquias da diocese
- Ao clicar, mostra detalhes completos incluindo:
  - Endereço e contato
  - Padre responsável
  - Horários de missa

### Padres (Priests)
- Lista todos os sacerdotes
- Detalhes incluem biografia, contato e paróquia

### Horários de Missa (Masses)
- Lista todos os horários de missa
- Filtro por dia da semana
- Informações da igreja para cada horário
