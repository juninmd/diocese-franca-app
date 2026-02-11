# Diocese Franca - Backend API

API REST para consulta de informações da Diocese de Franca, incluindo igrejas, padres e horários de missa.

## Endpoints

### Root
- `GET /` - Informações da API e endpoints disponíveis

### Igrejas (Churches)
- `GET /api/churches` - Lista todas as igrejas
- `GET /api/churches/:id` - Obtém detalhes de uma igreja específica (inclui missas e padre)

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
npm install
```

## Executar o servidor

```bash
npm start
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
  "image": "https://via.placeholder.com/400x300?text=Catedral"
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
