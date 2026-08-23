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

### Missas (Masses)
- `GET /api/masses` - Lista todas as missas (inclui informação da igreja)
- `GET /api/masses/by-church/:churchId` - Lista missas por igreja
- `GET /api/masses/by-day/:day` - Lista missas por dia da semana
  - Dias aceitos: domingo, segunda-feira, terça-feira, quarta-feira, quinta-feira, sexta-feira, sábado

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
