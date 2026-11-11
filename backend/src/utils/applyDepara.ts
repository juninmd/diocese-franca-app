import type { DeparaOverrides } from '../types';

const PLACEHOLDER_IMAGE = /placeholder\.com/i;

/**
 * Mescla os registros base com o de-para (por id). Campos do de-para sobrescrevem
 * os do registro base; imagens placeholder viram `null` para o cliente usar fallback.
 */
export const applyDepara = <T extends { id: number }>(items: readonly T[], overrides: DeparaOverrides = {}): T[] =>
  items.map((item) => {
    const { id, ...extra } = overrides[String(item.id)] || {};
    // O de-para é um JSON editado à mão: os campos mesclados mantêm o formato do registro base.
    const merged: Record<string, unknown> = { ...item, ...extra };
    if (typeof merged.image === 'string' && PLACEHOLDER_IMAGE.test(merged.image)) {
      merged.image = null;
    }
    return merged as T;
  });
