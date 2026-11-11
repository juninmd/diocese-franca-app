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
pnpm scrape         # notícias + catálogo (requer rede) — src/scraper.ts via tsx
pnpm sync:diocese   # só o catálogo (paróquias, clero, missas e data/cityCoords.json)
# após `pnpm build`: node dist/scraper.js / node dist/scripts/syncDiocese.js
```

- `src/utils/newsParser.ts`: notícias da home. A data vem do carimbo `AAAAMMDDHHMMSS_` no nome da imagem
  (a home não exibe data); sem carimbo válido o item fica sem data em vez de usar "hoje".
- `src/utils/parishParser.ts` / `src/utils/massParser.ts`: extraem paróquia, clero e horários semanais
  (horários irregulares viram `massNotes`). O HTML das paróquias às vezes é colado do Word (quebras de
  linha dentro de rótulos, "LOCAL E CONTATO" em maiúsculas): `src/utils/htmlText.ts` trata quebras do código-fonte
  como espaço e só `<br>`/blocos quebram linha.
- `src/utils/catalogBuilder.ts`: monta churches/priests/masses. Um padre em várias paróquias é um único
  registro (`churchIds`); ids de padres são preservados entre execuções (o app guarda favoritos por id).
- `src/utils/http.ts`: GET com retries/backoff. `src/utils/fileStore.ts`: escrita atômica e `writeIfSane` — o scraper
  **não** sobrescreve um JSON com lista vazia ou que encolheu mais de 40% (site fora do ar / layout alterado).
- `data/depara.json`: ajustes manuais por id, mesclados por `src/utils/applyDepara.ts` (via `src/utils/catalog.ts`).

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

O código é TypeScript (`src/`, tipos de domínio em `src/types.ts`) compilado para `dist/`.

```bash
pnpm build       # tsc: src/ -> dist/
pnpm start       # node dist/index.js
pnpm dev         # tsx watch src/index.ts (sem build)
pnpm typecheck   # tsc --noEmit no código e nos testes
pnpm test        # Jest + ts-jest (tests/*.test.ts)
```

O servidor estará disponível em `http://localhost:3000`

## Exemplos de uso

### Listar todas as igrejas
```bash
curl http://localhost:3000/api/churches
```

### Obter detalhes de uma igreja
```bash
curl http://localhost:3000/api/churches/2080
```

### Listar missas de domingo
```bash
curl http://localhost:3000/api/masses/by-day/domingo
```

### Listar missas de uma igreja específica
```bash
curl http://localhost:3000/api/masses/by-church/2080
```

### Listar igrejas próximas a uma coordenada
```bash
curl "http://localhost:3000/api/churches/nearby?lat=-20.5503&lng=-47.4053"
```

## Estrutura de Dados

### Church (Igreja)
```json
{
  "id": 2080,
  "name": "Sé Catedral Nossa Senhora da Conceição",
  "address": "Praça Nossa Senhora da Conceição, S/N - Centro",
  "city": "Franca",
  "state": "SP",
  "zipCode": "14400-970",
  "phone": "(16) 3721-4085",
  "image": "https://www.diocesefranca.org.br/images/20210413021455_33.jpg",
  "forania": "Nossa Senhora da Conceição",
  "latitude": -20.5503289,
  "longitude": -47.4053,
  "coordinatesVerified": false,
  "coordinatesPrecision": "address"
}
```

> **`coordinatesPrecision`:** `address` = endereço da matriz geocodificado (OpenStreetMap Nominatim, cache em `data/addressCoords.json`); `city` = centro da cidade (fallback quando o endereço não foi encontrado). `chapels[].masses`/`massNotes` trazem os horários próprios de cada capela.

`GET /api/churches/nearby` acrescenta a cada igreja:
```json
{
  "distanceKm": 0,
  "nextMass": {
    "id": 271,
    "churchId": 2080,
    "dayOfWeek": "Quarta-feira",
    "time": "19:00",
    "type": "Missa Semanal",
    "startsAt": "2026-11-11T22:00:00.000Z",
    "startsInMinutes": 377
  }
}
```

### Priest (Padre)
```json
{
  "id": 1,
  "name": "Dom Paulo Roberto Beloto",
  "title": "Bispo Diocesano",
  "churchId": 2080,
  "churchIds": [
    2080
  ],
  "email": null,
  "phone": "(16) 3701-0222",
  "bio": "4º Bispo Diocesano de Franca, nascido em Adamantina/SP (09/04/1957), com posse em 15/12/2013.",
  "image": "https://www.diocesefranca.org.br/images/20210403003119_bispo.png",
  "birthDate": "09/04/1957",
  "ordinationDate": "29/06/1986"
}
```

### Mass (Missa)
```json
{
  "id": 262,
  "churchId": 2080,
  "dayOfWeek": "Domingo",
  "time": "07:00",
  "type": "Missa Dominical"
}
```

## Tecnologias

- Node.js + TypeScript
- Express
- CORS
- Helmet
- Compression
- Express Rate Limit
