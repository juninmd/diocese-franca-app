const PLACEHOLDER_IMAGE = /placeholder\.com/i;

/**
 * Mescla os registros base com o de-para (por id). Campos do de-para sobrescrevem
 * os do registro base; imagens placeholder viram `null` para o cliente usar fallback.
 */
const applyDepara = (items, overrides = {}) =>
  items.map((item) => {
    const { id, ...extra } = overrides[String(item.id)] || {};
    const merged = { ...item, ...extra };
    if (typeof merged.image === 'string' && PLACEHOLDER_IMAGE.test(merged.image)) {
      merged.image = null;
    }
    return merged;
  });

module.exports = { applyDepara };
