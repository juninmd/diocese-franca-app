const request = require('supertest');
const app = require('../index');

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

    it('should return 400 for lat with garbage on the right or repeated param', async () => {
      const garbageRes = await request(app).get('/api/churches/nearby?lat=-20.5abc&lng=-47.4xyz');
      expect(garbageRes.statusCode).toBe(400);
      expect(garbageRes.body.error).toBe('Invalid Coordinates');

      const arrayRes = await request(app).get('/api/churches/nearby?lat=1&lat=2&lng=-47.4014');
      expect(arrayRes.statusCode).toBe(400);
      expect(arrayRes.body.error).toBe('Invalid Coordinates');
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

    it('should accept unaccented days, short forms, and case variations', async () => {
      for (const day of ['terca-feira', 'Sabado', 'domingo', 'quarta']) {
        const res = await request(app).get(`/api/masses/by-day/${day}`);
        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(Array.isArray(res.body.data)).toBe(true);
      }
    });

    it('should return 400 for feriado', async () => {
      const res = await request(app).get('/api/masses/by-day/feriado');
      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe('Invalid Day');
      expect(res.body.validDays).toEqual([
        'domingo', 'segunda-feira', 'terça-feira', 'quarta-feira',
        'quinta-feira', 'sexta-feira', 'sábado'
      ]);
    });

    it('should handle catalog containing a mass without dayOfWeek gracefully', async () => {
      const { getCatalog } = require('../utils/catalog');
      const catalog = getCatalog();
      const originalMasses = catalog.masses;

      try {
        catalog.masses = [...originalMasses, { id: 999999, churchId: 1, time: '10:00' }];
        const res = await request(app).get('/api/masses/by-day/domingo');
        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
      } finally {
        catalog.masses = originalMasses;
      }
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

describe('SecOps e LGPD (Logging & Privacy)', () => {
  it('GET /api/churches/nearby?lat=-20.5&lng=-47.4 não registra -20.5 nem -47.4 no log e inclui método, path, status e duração em ms', async () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    await request(app).get('/api/churches/nearby?lat=-20.5&lng=-47.4');
    expect(consoleSpy).toHaveBeenCalled();
    const logCalls = consoleSpy.mock.calls.map(call => call.join(' '));
    const nearbyLog = logCalls.find(msg => msg.includes('/api/churches/nearby'));
    expect(nearbyLog).toBeDefined();
    expect(nearbyLog).not.toContain('-20.5');
    expect(nearbyLog).not.toContain('-47.4');
    expect(nearbyLog).toMatch(/GET \/api\/churches\/nearby 200 \d+ms/);
    consoleSpy.mockRestore();
  });
});

describe('Error Handler', () => {
  const originalEnv = process.env.NODE_ENV;

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
  });

  it('responde com mensagem genérica quando NODE_ENV não é "development"', async () => {
    delete process.env.NODE_ENV;
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const res = await request(app).get('/api/test-error');
    expect(res.statusCode).toBe(500);
    expect(res.body.message).toBe('Ocorreu um erro interno no servidor');
    expect(res.body.message).not.toContain('Erro de teste interno detalhado');
    consoleErrorSpy.mockRestore();
  });

  it('responde com a mensagem de erro quando NODE_ENV === "development"', async () => {
    process.env.NODE_ENV = 'development';
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const res = await request(app).get('/api/test-error');
    expect(res.statusCode).toBe(500);
    expect(res.body.message).toBe('Erro de teste interno detalhado');
    consoleErrorSpy.mockRestore();
  });
});

describe('Rate Limiter', () => {
  it('responde 429 com Retry-After na 121ª requisição do mesmo IP em um minuto', async () => {
    let rateLimitedRes;
    for (let i = 0; i < 121; i++) {
      const res = await request(app).get('/api/health');
      if (res.statusCode === 429) {
        rateLimitedRes = res;
        break;
      }
    }
    expect(rateLimitedRes).toBeDefined();
    expect(rateLimitedRes.statusCode).toBe(429);
    expect(rateLimitedRes.headers['retry-after']).toBeDefined();
  });
});
