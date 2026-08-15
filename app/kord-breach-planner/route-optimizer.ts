export type DocKey = "technical" | "medical" | "user" | "test" | "blueprints" | "project" | "pmc" | "financial";

export type PlannerDocument = {
  key: DocKey;
  name: string;
  short: string;
  maps: string[];
};

export type RoutePickup = {
  key: DocKey;
  short: string;
  amount: number;
};

export type RouteStop = {
  name: string;
  pickups: RoutePickup[];
  total: number;
};

export type RoutePlan = {
  key: string;
  raids: number;
  total: number;
  stops: RouteStop[];
};

export type RouteOptimization = {
  plans: RoutePlan[];
  target: number;
  blocked: number;
};

const PER_TYPE_PER_RAID = 5;
const MAX_STORED_CANDIDATES = 250;

type Candidate = {
  maps: string[];
  coverage: number;
  completedDocuments: number;
  coverageRatio: number;
  uniqueMaps: number;
};

function candidateOrder(a: Candidate, b: Candidate, target: number) {
  return b.completedDocuments - a.completedDocuments
    || b.coverageRatio - a.coverageRatio
    || (a.coverage - target) - (b.coverage - target)
    || a.uniqueMaps - b.uniqueMaps
    || a.maps.join("|").localeCompare(b.maps.join("|"));
}

function allocateStops(
  mapRoute: string[],
  documents: PlannerDocument[],
  remaining: Record<DocKey, number>,
  enabledMaps: string[],
  target: number,
): RouteStop[] {
  const matrices = mapRoute.map(() => ({} as Partial<Record<DocKey, number>>));
  const totals = mapRoute.map(() => 0);
  let unassigned = target;

  const prioritizedDocuments = documents
    .filter((doc) => remaining[doc.key] > 0 && mapRoute.some((map) => doc.maps.includes(map)))
    .sort((a, b) => {
      const accessA = enabledMaps.filter((map) => a.maps.includes(map)).length;
      const accessB = enabledMaps.filter((map) => b.maps.includes(map)).length;
      return accessA - accessB || remaining[a.key] - remaining[b.key] || a.name.localeCompare(b.name);
    });

  for (const doc of prioritizedDocuments) {
    if (unassigned === 0) break;
    const possibleStops = mapRoute
      .map((map, index) => ({ map, index }))
      .filter(({ map }) => doc.maps.includes(map));
    const amount = Math.min(remaining[doc.key], unassigned, possibleStops.length * PER_TYPE_PER_RAID);

    for (let pickup = 0; pickup < amount; pickup += 1) {
      const destination = possibleStops
        .filter(({ index }) => (matrices[index][doc.key] ?? 0) < PER_TYPE_PER_RAID)
        .sort((a, b) => totals[a.index] - totals[b.index]
          || (matrices[a.index][doc.key] ?? 0) - (matrices[b.index][doc.key] ?? 0)
          || a.index - b.index)[0];

      if (!destination) break;
      matrices[destination.index][doc.key] = (matrices[destination.index][doc.key] ?? 0) + 1;
      totals[destination.index] += 1;
      unassigned -= 1;
    }
  }

  return mapRoute.map((name, index) => ({
    name,
    total: totals[index],
    pickups: documents
      .map((doc) => ({ key: doc.key, short: doc.short, amount: matrices[index][doc.key] ?? 0 }))
      .filter((pickup) => pickup.amount > 0),
  })).sort((a, b) => b.total - a.total || a.name.localeCompare(b.name));
}

export function optimizeRoutes(
  documents: PlannerDocument[],
  remaining: Record<DocKey, number>,
  cap: number,
  enabledMaps: string[],
): RouteOptimization {
  const safeCap = Math.max(0, Math.floor(cap));
  const totalRemaining = documents.reduce((sum, doc) => sum + remaining[doc.key], 0);
  const accessibleDocuments = documents.filter((doc) => remaining[doc.key] > 0 && doc.maps.some((map) => enabledMaps.includes(map)));
  const accessibleNeed = accessibleDocuments.reduce((sum, doc) => sum + remaining[doc.key], 0);
  const target = Math.min(safeCap, accessibleNeed);
  const blocked = totalRemaining - accessibleNeed;

  if (target === 0) return { plans: [], target, blocked };

  const activeMaps = enabledMaps
    .filter((map) => accessibleDocuments.some((doc) => doc.maps.includes(map)))
    .sort((a, b) => a.localeCompare(b));
  const mapDocumentIndexes = activeMaps.map((map) => documents
    .map((doc, index) => ({ doc, index }))
    .filter(({ doc }) => remaining[doc.key] > 0 && doc.maps.includes(map))
    .map(({ index }) => index));

  const oneRaidMaximum = Math.max(...mapDocumentIndexes.map((indexes) => indexes
    .reduce((sum, index) => sum + Math.min(remaining[documents[index].key], PER_TYPE_PER_RAID), 0)));
  const minimumRaids = Math.max(1, Math.ceil(target / oneRaidMaximum));
  const maximumRaids = accessibleDocuments.reduce((sum, doc) => sum + Math.ceil(Math.min(remaining[doc.key], target) / PER_TYPE_PER_RAID), 0);
  let candidates: Candidate[] = [];

  for (let raidCount = minimumRaids; raidCount <= maximumRaids; raidCount += 1) {
    const route: string[] = [];
    const capacities = documents.map(() => 0);

    const search = (startMap: number, slotsLeft: number) => {
      const optimisticCoverage = documents.reduce((sum, doc, index) => {
        const canStillSpawn = mapDocumentIndexes.slice(startMap).some((indexes) => indexes.includes(index));
        const optimisticCapacity = capacities[index] + (canStillSpawn ? slotsLeft * PER_TYPE_PER_RAID : 0);
        return sum + Math.min(remaining[doc.key], optimisticCapacity);
      }, 0);
      if (optimisticCoverage < target) return;

      if (slotsLeft === 0) {
        const coverage = documents.reduce((sum, doc, index) => sum + Math.min(remaining[doc.key], capacities[index]), 0);
        if (coverage < target) return;

        const completedDocuments = documents.filter((doc, index) => remaining[doc.key] > 0 && capacities[index] >= remaining[doc.key]).length;
        const coverageRatio = documents.reduce((sum, doc, index) => remaining[doc.key] > 0
          ? sum + Math.min(remaining[doc.key], capacities[index]) / remaining[doc.key]
          : sum, 0);
        candidates.push({ maps: [...route], coverage, completedDocuments, coverageRatio, uniqueMaps: new Set(route).size });
        candidates.sort((a, b) => candidateOrder(a, b, target));
        if (candidates.length > MAX_STORED_CANDIDATES) candidates.length = MAX_STORED_CANDIDATES;
        return;
      }

      for (let mapIndex = startMap; mapIndex < activeMaps.length; mapIndex += 1) {
        route.push(activeMaps[mapIndex]);
        for (const docIndex of mapDocumentIndexes[mapIndex]) capacities[docIndex] += PER_TYPE_PER_RAID;
        search(mapIndex, slotsLeft - 1);
        for (const docIndex of mapDocumentIndexes[mapIndex]) capacities[docIndex] -= PER_TYPE_PER_RAID;
        route.pop();
      }
    };

    search(0, raidCount);
    if (candidates.length > 0) break;
  }

  const plans = candidates.slice(0, 3).map((candidate, index) => ({
    key: `${index}-${candidate.maps.join("-")}`,
    raids: candidate.maps.length,
    total: target,
    stops: allocateStops(candidate.maps, documents, remaining, enabledMaps, target),
  }));

  return { plans, target, blocked };
}
