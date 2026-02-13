# Diocese de Franca - App

Aplicativo completo para a Diocese de Franca com backend API e app React Native.

> 🚀 **[Veja o Guia Rápido de Início](./QUICK_START.md)** para começar em minutos!

## 📋 Estrutura do Projeto

Este projeto é dividido em duas partes principais:

- **`backend/`** - API REST Node.js/Express
- **`mobile/`** - Aplicativo React Native com Expo

## 🚀 Tecnologias

### Backend
- Node.js
- Express
- CORS

### Mobile
- React Native
- Expo
- React Navigation
- Axios

## 📦 Pré-requisitos

- Node.js 18+ 
- pnpm (gerenciador de pacotes)

### Instalar pnpm

```bash
npm install -g pnpm
```

## 🔧 Instalação e Execução

### 1. Backend API

```bash
cd backend
pnpm install
pnpm start
```

A API estará disponível em `http://localhost:3000`

**Endpoints disponíveis:**
- `GET /api/churches` - Lista todas as igrejas
- `GET /api/churches/:id` - Detalhes de uma igreja
- `GET /api/priests` - Lista todos os padres
- `GET /api/priests/:id` - Detalhes de um padre
- `GET /api/masses` - Lista todos os horários de missa
- `GET /api/masses/by-church/:id` - Missas por igreja
- `GET /api/masses/by-day/:day` - Missas por dia da semana

### 2. Mobile App

```bash
cd mobile
pnpm install
```

**Importante**: Antes de executar, configure a URL da API em `mobile/src/services/api.js`:

```javascript
const API_BASE_URL = 'http://SEU_IP:3000'; // Substitua pelo IP da sua máquina
```

**Executar o app:**

```bash
pnpm start    # Inicia o servidor de desenvolvimento
pnpm android  # Executa no Android
pnpm ios      # Executa no iOS (requer macOS)
pnpm web      # Executa no navegador
```

## 📱 Funcionalidades

### Backend API
- ✅ CRUD de Igrejas (Churches)
- ✅ CRUD de Padres (Priests)
- ✅ CRUD de Horários de Missa (Masses)
- ✅ Filtros por igreja e dia da semana
- ✅ Relacionamentos entre entidades

### Mobile App
- ✅ Navegação por tabs e stack
- ✅ Listagem de igrejas com detalhes
- ✅ Listagem de padres com detalhes
- ✅ Horários de missa com filtro por dia
- ✅ Interface intuitiva e responsiva
- ✅ Tratamento de erros e loading states

## 📖 Documentação

Cada subprojeto possui sua própria documentação detalhada:

- [Backend README](./backend/README.md)
- [Mobile README](./mobile/README.md)

## 🎯 Como Usar

1. **Inicie o backend** primeiro para que a API esteja disponível
2. **Configure o IP** da API no app mobile
3. **Execute o app mobile** no dispositivo ou emulador
4. **Explore** as funcionalidades:
   - Navegue pelas igrejas da diocese
   - Conheça os padres e suas paróquias
   - Consulte horários de missa por dia da semana

## 📄 Licença

Este projeto é open source e está disponível sob a licença ISC.
