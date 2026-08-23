const { distanceInKm } = require('../utils/geo');

describe('distanceInKm', () => {
  it('returns 0 for identical coordinates', () => {
    expect(distanceInKm(-20.5396, -47.4014, -20.5396, -47.4014)).toBeCloseTo(0, 5);
  });

  it('computes a plausible distance between two nearby points in Franca-SP', () => {
    // Catedral vs Paróquia São Benedito (ambos em Franca-SP)
    const km = distanceInKm(-20.5396, -47.4014, -20.5478, -47.4102);
    expect(km).toBeGreaterThan(0);
    expect(km).toBeLessThan(5);
  });

  it('is symmetric', () => {
    const a = distanceInKm(-20.5396, -47.4014, -20.5251, -47.3947);
    const b = distanceInKm(-20.5251, -47.3947, -20.5396, -47.4014);
    expect(a).toBeCloseTo(b, 8);
  });
});
