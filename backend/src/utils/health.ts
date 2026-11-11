import type { HealthStatus } from '../types';

export const DEFAULT_MAX_AGE_DAYS = 14;
const DAY_MS = 24 * 60 * 60 * 1000;

interface HealthInput {
  churchesCount: number;
  catalogUpdatedAt: string | null;
  now?: number;
  maxAgeDays?: number;
}

// Avalia o catálogo para /api/health: unhealthy se não há igrejas, degraded se os dados estão velhos.
export const evaluateHealth = ({ churchesCount, catalogUpdatedAt, now = Date.now(), maxAgeDays = DEFAULT_MAX_AGE_DAYS }: HealthInput): { status: HealthStatus; errors: string[] } => {
  const errors: string[] = [];
  if (churchesCount === 0) errors.push('Catálogo de igrejas vazio ou ilegível');

  if (catalogUpdatedAt) {
    const ageDays = (now - new Date(catalogUpdatedAt).getTime()) / DAY_MS;
    if (ageDays > maxAgeDays) errors.push(`Catálogo com mais de ${maxAgeDays} dias sem atualização`);
  }

  if (churchesCount === 0) return { status: 'unhealthy', errors };
  if (errors.length) return { status: 'degraded', errors };
  return { status: 'healthy', errors };
};
