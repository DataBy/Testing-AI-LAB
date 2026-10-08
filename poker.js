(function (root) {
  const DECK = ['0', '1', '2', '3', '5', '8', '13', '21', '?', '☕'];
  // Distancia (en posiciones de la baraja) a partir de la cual se pide discutir.
  const DISPERSION_GAP = 3;

  function isNumeric(card) {
    return DECK.includes(card) && !Number.isNaN(Number(card));
  }

  function median(sorted) {
    const mid = sorted.length >> 1;
    return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
  }

  // Devuelve todos los valores más repetidos, en orden ascendente.
  function modes(sorted) {
    const counts = new Map();
    for (const v of sorted) counts.set(v, (counts.get(v) || 0) + 1);
    const top = Math.max(...counts.values());
    return [...counts].filter(([, c]) => c === top).map(([v]) => v);
  }

  // votes: lista de cartas (strings de DECK). Ignora las no numéricas y las desconocidas.
  // status: 'empty' (sin votos numéricos), 'consensus', 'dispersed' o 'mixed'.
  function summarize(votes) {
    const nums = votes.filter(isNumeric).map(Number).sort((a, b) => a - b);
    if (!nums.length) {
      return { count: 0, average: null, median: null, modes: [], min: null, max: null, status: 'empty' };
    }
    const min = nums[0];
    const max = nums[nums.length - 1];
    const gap = DECK.indexOf(String(max)) - DECK.indexOf(String(min));
    let status = 'mixed';
    if (min === max) status = 'consensus';
    else if (gap >= DISPERSION_GAP) status = 'dispersed';
    return {
      count: nums.length,
      average: nums.reduce((a, b) => a + b, 0) / nums.length,
      median: median(nums),
      modes: modes(nums),
      min,
      max,
      status,
    };
  }

  const api = { DECK, isNumeric, summarize };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.Poker = api;
})(typeof window !== 'undefined' ? window : globalThis);
