const request = require('supertest');
const express = require('express');
const churchesRouter = require('../routes/churches');
const priestsRouter = require('../routes/priests');
const massesRouter = require('../routes/masses');

const app = express();
app.use('/api/churches', churchesRouter);
app.use('/api/priests', priestsRouter);
app.use('/api/masses', massesRouter);

const CATEDRAL_ID = 2080; // Sé Catedral (id da página no site da Diocese)

describe('Catálogo oficial', () => {
  it('detalhe da igreja traz o pároco primeiro e a equipe sem o bispo', async () => {
    const res = await request(app).get(`/api/churches/${CATEDRAL_ID}`);
    const { priest, clergy } = res.body.data;
    expect(priest.title).toBe('Pároco');
    expect(Array.isArray(clergy)).toBe(true);
    expect(clergy.map((p) => p.title)).not.toContain('Bispo Diocesano');
  });

  it('missas do dia trazem cidade e estado da igreja', async () => {
    const res = await request(app).get('/api/masses/by-day/domingo');
    expect(res.body.data.length).toBeGreaterThan(0);
    res.body.data.forEach((m) => {
      expect(m.church).toHaveProperty('city');
      expect(m.church).toHaveProperty('state');
    });
  });

  it('todo padre aponta para uma igreja existente e a lista traz o bispo', async () => {
    const [churches, priests] = await Promise.all([request(app).get('/api/churches'), request(app).get('/api/priests')]);
    const ids = new Set(churches.body.data.map((c) => c.id));
    priests.body.data.forEach((p) => expect(ids.has(p.churchId)).toBe(true));
    expect(priests.body.data.some((p) => p.title === 'Bispo Diocesano')).toBe(true);
  });
});
