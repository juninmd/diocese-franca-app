const request = require('supertest');
const express = require('express');
const churchesRouter = require('../routes/churches');
const priestsRouter = require('../routes/priests');
const massesRouter = require('../routes/masses');
const newsRouter = require('../routes/news');
const { cacheControl } = require('../middleware/cache');

const app = express();
app.use(express.json());
app.use('/api/churches', cacheControl(), churchesRouter);
app.use('/api/priests', priestsRouter);
app.use('/api/masses', massesRouter);
app.use('/api/news', newsRouter);

describe('Churches API', () => {
  describe('GET /api/churches', () => {
    it('should return all churches with success wrapper', async () => {
      const res = await request(app).get('/api/churches');
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.count).toBeGreaterThan(0);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('should have required fields', async () => {
      const res = await request(app).get('/api/churches');
      const church = res.body.data[0];
      expect(church).toHaveProperty('id');
      expect(church).toHaveProperty('name');
      expect(church).toHaveProperty('address');
      expect(church).toHaveProperty('city');
    });
  });

  describe('GET /api/churches/:id', () => {
    it('should return church with masses and priest', async () => {
      const churchesRes = await request(app).get('/api/churches');
      const firstChurch = churchesRes.body.data[0];
      const res = await request(app).get(`/api/churches/${firstChurch.id}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('id');
      expect(res.body.data).toHaveProperty('name');
      expect(res.body.data).toHaveProperty('masses');
      expect(res.body.data).toHaveProperty('priest');
    });

    it('should return 404 for non-existent church', async () => {
      const res = await request(app).get('/api/churches/999999');
      expect(res.statusCode).toBe(404);
      expect(res.body.error).toBe('Church not found');
    });

    it('should return 400 for invalid id', async () => {
      const res = await request(app).get('/api/churches/invalid');
      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe('Invalid ID');
    });

    it('should include nextMass in the church detail', async () => {
      const churchesRes = await request(app).get('/api/churches');
      const firstChurch = churchesRes.body.data[0];
      const res = await request(app).get(`/api/churches/${firstChurch.id}`);
      expect(res.body.data).toHaveProperty('nextMass');
    });
  });

  describe('GET /api/churches/nearby', () => {
    it('should return churches sorted by distance from the given coordinates', async () => {
      const res = await request(app).get('/api/churches/nearby?lat=-20.5396&lng=-47.4014');
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
      expect(res.body.data[0]).toHaveProperty('distanceKm');
      expect(res.body.nearest).toBeDefined();

      // A lista deve estar ordenada por distância crescente
      const distances = res.body.data.map((c) => c.distanceKm);
      const sorted = [...distances].sort((a, b) => a - b);
      expect(distances).toEqual(sorted);
    });

    it('should return 400 when coordinates are missing', async () => {
      const res = await request(app).get('/api/churches/nearby');
      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe('Invalid Coordinates');
    });

    it('should return 400 for out-of-range coordinates', async () => {
      const res = await request(app).get('/api/churches/nearby?lat=999&lng=-47.4014');
      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe('Invalid Coordinates');
    });
  });
});

describe('Priests API', () => {
  describe('GET /api/priests', () => {
    it('should return all priests with success wrapper', async () => {
      const res = await request(app).get('/api/priests');
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.count).toBeGreaterThan(0);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('should have required fields', async () => {
      const res = await request(app).get('/api/priests');
      const priest = res.body.data[0];
      expect(priest).toHaveProperty('id');
      expect(priest).toHaveProperty('name');
      expect(priest).toHaveProperty('title');
    });
  });

  describe('GET /api/priests/:id', () => {
    it('should return priest with church info', async () => {
      const priestsRes = await request(app).get('/api/priests');
      const firstPriest = priestsRes.body.data[0];
      const res = await request(app).get(`/api/priests/${firstPriest.id}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('name');
      expect(res.body.data).toHaveProperty('church');
    });

    it('should return 404 for non-existent priest', async () => {
      const res = await request(app).get('/api/priests/999999');
      expect(res.statusCode).toBe(404);
    });

    it('should return 400 for invalid id', async () => {
      const res = await request(app).get('/api/priests/abc');
      expect(res.statusCode).toBe(400);
    });
  });
});

describe('Masses API', () => {
  describe('GET /api/masses', () => {
    it('should return all masses with church info', async () => {
      const res = await request(app).get('/api/masses');
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.count).toBeGreaterThan(0);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('should include church info in masses', async () => {
      const res = await request(app).get('/api/masses');
      const mass = res.body.data[0];
      expect(mass).toHaveProperty('church');
    });
  });

  describe('GET /api/masses/by-church/:churchId', () => {
    it('should return masses for a specific church', async () => {
      const churchesRes = await request(app).get('/api/churches');
      const churchWithMass = churchesRes.body.data.find(c => c.masses && c.masses.length > 0) || churchesRes.body.data[0];
      const res = await request(app).get(`/api/masses/by-church/${churchWithMass.id}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body).toHaveProperty('church');
      expect(res.body).toHaveProperty('data');
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('should return 404 for church with no masses', async () => {
      const res = await request(app).get('/api/masses/by-church/999999');
      expect(res.statusCode).toBe(404);
    });

    it('should return 400 for invalid church id', async () => {
      const res = await request(app).get('/api/masses/by-church/xyz');
      expect(res.statusCode).toBe(400);
    });
  });

  describe('GET /api/masses/by-day/:day', () => {
    it('should return masses for Sunday', async () => {
      const res = await request(app).get('/api/masses/by-day/domingo');
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      res.body.data.forEach(mass => {
        expect(mass.dayOfWeek.toLowerCase()).toBe('domingo');
      });
    });

    it('should be case insensitive', async () => {
      const res = await request(app).get('/api/masses/by-day/DOMINGO');
      expect(res.statusCode).toBe(200);
    });

    it('should return empty array for day with no masses', async () => {
      const res = await request(app).get('/api/masses/by-day/segunda-feira');
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('should return 400 for invalid day', async () => {
      const res = await request(app).get('/api/masses/by-day/invalid-day');
      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe('Invalid Day');
    });
  });
});

describe('Cache HTTP e news', () => {
  it('envia Cache-Control e ETag e responde 304 para If-None-Match', async () => {
    const first = await request(app).get('/api/churches');
    expect(first.headers['cache-control']).toMatch(/max-age=300/);
    expect(first.headers.etag).toBeTruthy();
    const second = await request(app).get('/api/churches').set('If-None-Match', first.headers.etag);
    expect(second.statusCode).toBe(304);
  });

  it('GET /api/news devolve notícias com data de atualização', async () => {
    const res = await request(app).get('/api/news');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.count).toBe(res.body.data.length);
    expect(res.body).toHaveProperty('updatedAt');
  });

  it('lista de padres traz a paróquia resumida', async () => {
    const res = await request(app).get('/api/priests');
    const withChurch = res.body.data.filter((p) => p.church);
    expect(withChurch.length).toBe(res.body.data.length);
    expect(withChurch[0].church).toEqual(expect.objectContaining({ id: expect.any(Number), name: expect.any(String), city: expect.any(String) }));
  });

  it('rejeita ids não numéricos (inclusive "12abc")', async () => {
    expect((await request(app).get('/api/churches/12abc')).statusCode).toBe(400);
    expect((await request(app).get('/api/priests/abc')).statusCode).toBe(400);
  });
});
