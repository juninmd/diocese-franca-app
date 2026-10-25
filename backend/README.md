# Diocese Franca - Backend API

API REST para consulta de informações da Diocese de Franca, incluindo igrejas, padres e horários de missa.

## Endpoints

### Root
- `GET /` - Informações da API e endpoints disponíveis

### Igrejas (Churches)
- `GET /api/churches` - Lista todas as igrejas
- `GET /api/churches/:id` - Obtém detalhes de uma igreja específica (inclui missas, padre e a próxima missa)
- `GET /api/churches/nearby?lat=&lng=` - Lista as igrejas ordenadas pela distância até as coordenadas informadas, cada uma com `distanceKm` e `nextMass`. O primeiro item também é retornado isoladamente em `nearest`.

### Padres (Priests)
- `GET /api/priests` - Lista todos os padres
- `GET /api/priests/:id` - Obtém detalhes de um padre específico (inclui igreja)

### Notícias (News)
- `GET /api/news` - Notícias da home do site da Diocese (`id`, `title`, `category`, `description`, `link`, `image`, `date`, `publishedAt`) e `updatedAt` (quando o scraper gravou o arquivo)

### Saúde
- `GET /api/health` - Status, uptime e contagem/data de atualização dos dados (nunca em cache)

### Missas (Masses)
- `GET /api/masses` - Lista todas as missas (inclui informação da igreja)
- `GET /api/masses/by-church/:churchId` - Lista missas por igreja
- `GET /api/masses/by-day/:day` - Lista missas por dia da semana
  - Dias aceitos: domingo, segunda-feira, terça-feira, quarta-feira, quinta-feira, sexta-feira, sábado

## Variáveis de Ambiente

O servidor pode ser configurado por meio das seguintes variáveis de ambiente (definidas via `.env` ou no ambiente do servidor):

- `PORT`: Porta na qual o servidor HTTP irá escutar (padrão: `3000`).
- `NODE_ENV`: Define o ambiente de execução (`development`, `production`, etc.).
  - Quando estritamente igual a `development`, o manipulador de erros HTTP expõe a mensagem detalhada (`err.message`) nas respostas de erro 500.
  - Para qualquer outro valor ou quando ausente, uma mensagem genérica de erro interno (`Ocorreu um erro interno no servidor`) é devolvida ao cliente para evitar vazamento de informações sensíveis.
- `TRUST_PROXY`: Configura a diretiva `trust proxy` do Express caso o backend esteja operando atrás de um proxy reverso ou load balancer (ex.: `true`, `false`, `1`, `loopback`).

## Segurança, Privacidade e LGPD (SecOps)

### Política de Logs
Por conformidade com a LGPD (Lei Geral de Proteção de Dados), coordenadas geográficas (`lat` e `lng`) enviadas pelo usuário em requisições como `GET /api/churches/nearby` são tratadas como dados pessoais e **nunca** são registradas nos logs do servidor.
- Os logs de acesso gravam apenas o caminho da requisição (`req.path`), omitindo query parameters (`?lat=...&lng=...`).
- As entradas de log são registradas ao finalizar a requisição (`res.on('finish')`) em linha única no formato:
  `[TIMESTAMP] METODO CAMINHO STATUS DURAÇÃOms` (ex.: `[2026-03-31T12:00:00.000Z] GET /api/churches/nearby 200 12ms`).

### Limitação de Taxa (Rate Limit)
A API utiliza `express-rate-limit` para prevenir abuso e ataques de negação de serviço (DoS):
- Limite máximo de **120 requisições por minuto por IP**.
- Caso o limite seja excedido, o servidor responde com código HTTP `429 Too Many Requests` e inclui o cabeçalho `Retry-After` indicando o tempo de espera até o envio de novas requisições.

## Dados oficiais (scraper)

`news.json`, `churches.json`, `priests.json` e `masses.json` são gerados a partir de diocesefranca.org.br:

```bash
node scraper.js               # notícias + catálogo (requer rede)
node scripts/syncDiocese.js   # só o catálogo (paróquias, clero, missas e data/cityCoords.json)
```

- `utils/newsParser.js`: notícias da home. A data vem do carimbo `AAAAMMDDHHMMSS_` no nome da imagem
  (a home não exibe data); sem carimbo válido o item fica sem data em vez de usar "hoje".
- `utils/parishParser.js` / `utils/massParser.js`: extraem paróquia, clero e horários semanais
  (horários irregulares viram `massNotes`). O HTML das paróquias às vezes é colado do Word (quebras de
  linha dentro de rótulos, "LOCAL E CONTATO" em maiúsculas): `utils/htmlText.js` trata quebras do código-fonte
  como espaço e só `<br>`/blocos quebram linha.
- `utils/catalogBuilder.js`: monta churches/priests/masses. Um padre em várias paróquias é um único
  registro (`churchIds`); ids de padres são preservados entre execuções (o app guarda favoritos por id).
- `utils/http.js`: GET com retries/backoff. `utils/fileStore.js`: escrita atômica e `writeIfSane` — o scraper
  **não** sobrescreve um JSON com lista vazia ou que encolheu mais de 40% (site fora do ar / layout alterado).
- `data/depara.json`: ajustes manuais por id, mesclados por `utils/applyDepara.js` (via `utils/catalog.js`).

## Cache

- Os JSONs são lidos com cache em memória invalidado pelo `mtime` (`fileStore.readCached`, checagem a cada 2 s):
  rodar o scraper com a API no ar atualiza as respostas sem reiniciar. Índices por id (`getCatalog`) evitam `find`/`filter` por requisição.
- `GET /api/{churches,priests,masses}`: `Cache-Control: public, max-age=300, stale-while-revalidate=3600`;
  `/api/news`: `max-age=120`. O Express envia `ETag`; clientes revalidam com `If-None-Match` e recebem `304`.
- `nextMass` usa o fuso `America/Sao_Paulo` (o servidor pode estar em UTC).

## Instalação

```bash
pnpm install
```

## Executar o servidor

```bash
pnpm start
```

O servidor estará disponível em `http://localhost:3000`

## Exemplos de uso

### Listar todas as igrejas
```bash
curl http://localhost:3000/api/churches
```

### Obter detalhes de uma igreja
```bash
curl http://localhost:3000/api/churches/1
```

### Listar missas de domingo
```bash
curl http://localhost:3000/api/masses/by-day/domingo
```

### Listar missas de uma igreja específica
```bash
curl http://localhost:3000/api/masses/by-church/1
```

### Listar igrejas próximas a uma coordenada
```bash
curl "http://localhost:3000/api/churches/nearby?lat=-20.5396&lng=-47.4014"
```

## Estrutura de Dados

### Church (Igreja)
```json
{
  "id": 1,
  "name": "Catedral Nossa Senhora da Conceição da Franca",
  "address": "Praça Nossa Senhora da Conceição, 85 - Centro",
  "city": "Franca",
  "state": "SP",
  "zipCode": "14400-670",
  "phone": "(16) 3711-1400",
  "description": "A Catedral é a igreja principal da Diocese de Franca",
  "image": "https://via.placeholder.com/400x300?text=Catedral",
  "latitude": -20.5396,
  "longitude": -47.4014,
  "coordinatesVerified": false
}
```

> **Nota sobre `latitude`/`longitude`:** as coordenadas atuais são aproximações a partir do endereço textual de cada igreja (`coordinatesVerified: false`), pois este ambiente de desenvolvimento não teve acesso à internet para geocodificá-las com uma API real (Google Geocoding, Nominatim, etc.). Antes de confiar nelas para navegação, geocode os endereços reais e marque `coordinatesVerified: true`.

`GET /api/churches/nearby` acrescenta a cada igreja:
```json
{
  "distanceKm": 1.3,
  "nextMass": {
    "id": 10,
    "churchId": 2,
    "dayOfWeek": "Domingo",
    "time": "08:00",
    "type": "Missa Dominical",
    "startsAt": "2026-08-23T11:00:00.000Z",
    "startsInMinutes": 247
  }
}
```

### Priest (Padre)
```json
{
  "id": 1,
  "name": "Dom Pedro Luiz Stringhini",
  "title": "Bispo Diocesano",
  "churchId": 1,
  "email": "bispo@diocesefranca.org.br",
  "phone": "(16) 3711-1400",
  "bio": "Bispo da Diocese de Franca desde 2014.",
  "image": "https://via.placeholder.com/200x200?text=Bispo"
}
```

### Mass (Missa)
```json
{
  "id": 1,
  "churchId": 1,
  "dayOfWeek": "Domingo",
  "time": "07:00",
  "type": "Missa Dominical"
}
```

## Tecnologias

- Node.js
- Express
- CORS
- Helmet
- Compression
- Express Rate Limit
