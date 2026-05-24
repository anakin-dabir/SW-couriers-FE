import statesCitiesData from '@/constants/states-cities.json';

interface City {
  name: string;
  starred: boolean;
}
type UkRegions = Record<string, City[]>;

const ukRegions = (statesCitiesData as Record<string, UkRegions>)['United Kingdom'] ?? {};

/** Sorted, de-duplicated list of all UK cities across England / Scotland / Wales / NI. */
export const UK_CITIES: ReadonlyArray<{ value: string; label: string; region: string }> = (() => {
  const seen = new Set<string>();
  const rows: { value: string; label: string; region: string }[] = [];
  for (const [region, cities] of Object.entries(ukRegions)) {
    for (const c of cities) {
      const name = c.name?.trim();
      if (!name || seen.has(name)) continue;
      seen.add(name);
      rows.push({ value: name, label: name, region });
    }
  }
  rows.sort((a, b) => a.label.localeCompare(b.label));
  return rows;
})();
