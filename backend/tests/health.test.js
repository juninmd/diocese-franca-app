const { evaluateHealth } = require('../utils/health');

const DAY = 24 * 60 * 60 * 1000;
const now = Date.parse('2026-10-26T12:00:00Z');

describe('evaluateHealth', () => {
  it('retorna healthy com catálogo recente', () => {
    const r = evaluateHealth({ churchesCount: 41, catalogUpdatedAt: new Date(now - DAY).toISOString(), now });
    expect(r).toEqual({ status: 'healthy', errors: [] });
  });

  it('retorna unhealthy quando não há igrejas', () => {
    const r = evaluateHealth({ churchesCount: 0, catalogUpdatedAt: null, now });
    expect(r.status).toBe('unhealthy');
    expect(r.errors).toHaveLength(1);
  });

  it('retorna degraded quando o catálogo passa de 14 dias (padrão)', () => {
    const r = evaluateHealth({ churchesCount: 41, catalogUpdatedAt: new Date(now - 15 * DAY).toISOString(), now });
    expect(r.status).toBe('degraded');
    expect(r.errors[0]).toMatch(/14 dias/);
  });

  it('respeita maxAgeDays informado', () => {
    const updated = new Date(now - 3 * DAY).toISOString();
    expect(evaluateHealth({ churchesCount: 1, catalogUpdatedAt: updated, now, maxAgeDays: 2 }).status).toBe('degraded');
    expect(evaluateHealth({ churchesCount: 1, catalogUpdatedAt: updated, now, maxAgeDays: 5 }).status).toBe('healthy');
  });
});
