/**
 * Deduplicates and sorts a list of bundles.
 *
 * Two bundles are considered duplicates only when they have identical:
 *   - data amount (gprs_limit)
 *   - validity
 *   - exact set of covered countries (country_code values, order-independent)
 *
 * For each duplicate group only the cheapest bundle is kept.
 * Bundles with different country sets (e.g. EU[RO,AT,GB] vs EU[RO,IT,FR]) are
 * always kept as distinct entries, even if data and validity match.
 *
 * @param {Array} bundles - Raw bundle list from the API
 * @returns {Array} Deduplicated bundles sorted by data asc, then price asc
 */
export function deduplicateBundles(bundles) {
  if (!bundles || bundles.length === 0) return [];

  const getDataInMB = (bundle) => {
    if (bundle.unlimited || bundle.gprs_limit < 0) return Infinity;
    if (bundle.gprs_limit >= 100) return bundle.gprs_limit;
    return bundle.gprs_limit * 1000;
  };

  const getPrice = (bundle) =>
    parseFloat(bundle.price || bundle.original_price || 0);

  // Normalise validity across different field names used by different API responses
  const getValidity = (bundle) =>
    bundle.validity_in_days || bundle.validity_days || bundle.validity || 0;

  // Group by data + validity + exact country set
  const grouped = bundles.reduce((acc, bundle) => {
    const dataInMB = getDataInMB(bundle);
    const validity = getValidity(bundle);
    const sortedCountryCodes = (bundle.countries || [])
      .map((c) => c.country_code)
      .filter(Boolean)
      .sort()
      .join(",");
    const key = `${dataInMB}-${validity}-${sortedCountryCodes}`;

    if (!acc[key]) acc[key] = [];
    acc[key].push(bundle);
    return acc;
  }, {});

  // Keep cheapest per group, then sort by data asc → price asc
  return Object.values(grouped)
    .map((group) => group.sort((a, b) => getPrice(a) - getPrice(b))[0])
    .sort((a, b) => {
      const aData = getDataInMB(a);
      const bData = getDataInMB(b);
      if (aData === Infinity && bData === Infinity) return getPrice(a) - getPrice(b);
      if (aData === Infinity) return 1;
      if (bData === Infinity) return -1;
      const dataDiff = aData - bData;
      if (dataDiff !== 0) return dataDiff;
      return getPrice(a) - getPrice(b);
    });
}
