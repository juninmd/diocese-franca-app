# Guia Rápido de Início 🚀

## Passo 1: Instalar pnpm

```bash
npm install -g pnpm
```

## Passo 2: Iniciar o Backend

```bash
# Entre no diretório do backend
cd backend

# Instale as dependências
pnpm install

# Inicie o servidor
pnpm start
```

✅ O servidor estará rodando em `http://localhost:3000`

## Passo 3: Configurar o Mobile

```bash
# Em outro terminal, entre no diretório mobile
cd mobile

# Instale as dependências
pnpm install
```

## Passo 4: Descobrir seu IP (importante!)

### Windows
```bash
ipconfig
```
Procure por "IPv4 Address" - será algo como `192.168.1.100`

### Mac/Linux
```bash
ifconfig
# ou
hostname -I
```
Procure por um IP no formato `192.168.x.x` ou `10.0.x.x`

## Passo 5: Configurar a URL da API

Edite o arquivo `mobile/src/services/api.js` e altere a linha 7:

```javascript
// Substitua pelo seu IP encontrado no passo 4
const API_BASE_URL = 'http://192.168.1.100:3000'; // Use SEU IP aqui!
```

**Dicas por tipo de ambiente:**
- 📱 Dispositivo físico: Use o IP da sua máquina (ex: `http://192.168.1.100:3000`)
- 🤖 Emulador Android: Use `http://10.0.2.2:3000`
- 🍎 Emulador iOS: Use `http://localhost:3000`

## Passo 6: Executar o App

```bash
# Dentro do diretório mobile
pnpm start
```

Um QR code aparecerá no terminal. Use o app Expo Go no seu celular para escanear!

Ou execute diretamente no emulador:
```bash
pnpm android  # Para Android
pnpm ios      # Para iOS (apenas Mac)
```

## ✨ Pronto!

Agora você pode:
- 📍 Ver todas as igrejas da diocese
- 👨‍⚖️ Conhecer os padres
- 📅 Consultar horários de missa por dia da semana

## 🆘 Problemas Comuns

### Erro de conexão no app
- Verifique se o backend está rodando
- Confirme se usou o IP correto no `api.js`
- Certifique-se que celular e computador estão na mesma rede Wi-Fi

### "Cannot find module"
```bash
# Reinstale as dependências
pnpm install
```

### Porta 3000 já em uso
```bash
# Mate o processo que está usando a porta
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:3000 | xargs kill
```
