// ============================================================================
// fetch-osm.js — Fetches pilgrimage sites from OpenStreetMap via Overpass API
// ============================================================================
//
// OpenStreetMap is the largest open geographic database. The Overpass API lets
// us query it with a SQL-like language (Overpass QL) to extract specific types
// of places within a city boundary.
//
// For pilgrimage planning, we care about three OSM tag categories:
//   amenity=place_of_worship  → temples, mosques, churches, gurudwaras
//   historic=*                → forts, ruins, monuments, archaeological sites
//   tourism=attraction        → notable tourist/cultural attractions
// ============================================================================


// ─── THEME DETECTION FROM OSM TAGS ──────────────────────────────────────────
// OSM tags carry rich semantic information that we can map to our theme_group
// field. This avoids making every seeded place default to 'other'.

/**
 * Infers the theme_group for the itinerary engine based on OSM tags and
 * the site's name. The name check catches cases where OSM tags are generic
 * but the name is a dead giveaway (e.g. "Assi Ghat" tagged as tourism=attraction).
 *
 * @param {Object} tags - Raw OSM tags for the element (key-value pairs)
 * @param {string} name - The site's name
 * @returns {'ghats' | 'temples' | 'historic' | 'nature' | 'other'} Detected theme
 */
const inferThemeGroup = (tags, name) => {
  const lowerName = name.toLowerCase();

  // "Ghat" in the name is the strongest signal — these are riverside steps
  // used for bathing, prayer, and cremation rituals along holy rivers
  if (lowerName.includes('ghat')) return 'ghats';

  // Places of worship in Indian pilgrimage context are overwhelmingly temples
  if (tags.amenity === 'place_of_worship') return 'temples';

  // Historic sites: forts, ruins, monuments, heritage buildings
  if (tags.historic) return 'historic';

  // Nature detection from name keywords — gardens, parks, lakes are common
  // pilgrimage-adjacent attractions (e.g. Deer Park at Sarnath)
  const natureKeywords = ['garden', 'park', 'lake', 'forest', 'zoo', 'botanical'];
  if (natureKeywords.some(keyword => lowerName.includes(keyword))) return 'nature';

  return 'other';
};


// ─── OVERPASS QUERY BUILDER ──────────────────────────────────────────────────

/**
 * Builds an Overpass QL query that fetches pilgrimage-relevant sites within
 * a named city area. The query searches for nodes AND ways (some temples are
 * mapped as building outlines, not just points).
 *
 * `out center;` is critical — for ways (polygon buildings), it returns the
 * centroid coordinates instead of all boundary nodes.
 *
 * @param {string} cityName - The city name as it appears in OSM (e.g. "Varanasi")
 * @returns {string} Complete Overpass QL query string
 */
const buildOverpassQuery = (cityName) => {
  // Overpass QL query — kept on a single logical block without block comments
  // because some Overpass servers reject /* */ syntax in POST bodies.
  // Line-by-line:
  //   1. Set output format to JSON with a 45-second timeout
  //   2. Resolve the city name to an OSM area boundary
  //   3. Union query: temples + historic sites + tourist attractions (nodes AND ways)
  //   4. `out center` gives centroids for ways (building polygons)
  return [
    '[out:json][timeout:45];',
    `area["name"="${cityName}"]->.city;`,
    '(',
    '  node["amenity"="place_of_worship"](area.city);',
    '  way["amenity"="place_of_worship"](area.city);',
    '  node["historic"](area.city);',
    '  way["historic"](area.city);',
    '  node["tourism"="attraction"](area.city);',
    '  way["tourism"="attraction"](area.city);',
    ');',
    'out center;'
  ].join('\n');
};


// ─── MAIN EXPORT ─────────────────────────────────────────────────────────────

/**
 * Fetches pilgrimage-relevant sites from OpenStreetMap for a given city.
 *
 * Sends a POST request to the Overpass API with a query that targets
 * temples, historic sites, and tourist attractions within the city boundary.
 * Results are normalized into the shape expected by the Place model.
 *
 * @param {string} cityName - City name as it appears in OSM (e.g. "Varanasi", "Amritsar")
 * @returns {Promise<Array<Object>>} Array of site objects with name, coordinates, defaults
 * @throws {Error} If the Overpass API request fails or returns invalid data
 *
 * @example
 * const sites = await fetchOSMSites('Varanasi');
 * // [{ name: "Kashi Vishwanath Temple", latitude: 25.31, longitude: 83.01, ... }]
 */
export const fetchOSMSites = async (cityName) => {
  const query = buildOverpassQuery(cityName);

  console.log(`  📡 Querying Overpass API for "${cityName}"...`);

  // POST to Overpass — we use POST because the query string can be long.
  // The Overpass API is free but rate-limited; no API key needed.
  // A User-Agent header is required — the API rejects requests without one
  // (returns 406 Not Acceptable) to discourage anonymous bot scraping.
  const response = await fetch('https://overpass-api.de/api/interpreter', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': 'TirthingPilgrimagePlanner/1.0 (educational project)'
    },
    body: new URLSearchParams({ data: query }).toString()
  });

  if (!response.ok) {
    throw new Error(`Overpass API returned ${response.status}: ${response.statusText}`);
  }

  const data = await response.json();
  const elements = data.elements || [];

  console.log(`  📦 Overpass returned ${elements.length} raw elements`);

  // Transform OSM elements into our Place-compatible shape
  const sites = elements
    .map(element => {
      const tags = element.tags || {};
      const name = tags.name || tags['name:en'];

      // Skip elements without a name — they're usually unmapped or irrelevant
      // (e.g. a tiny shrine with no identifying information)
      if (!name) return null;

      // For nodes, coordinates are directly on the element.
      // For ways, they're under element.center (thanks to `out center;`).
      const latitude = element.lat || element.center?.lat;
      const longitude = element.lon || element.center?.lon;

      // Skip if we couldn't resolve coordinates (shouldn't happen, but defensive)
      if (!latitude || !longitude) return null;

      return {
        name: name.trim(),
        latitude,
        longitude,
        visitDuration: 1.5,           // Default estimate — overrides can fix this
        entryFee: 0,                   // Most temples are free; overrides handle paid sites
        priority: 2,                   // Default to "recommended" — must-visits set in overrides
        time_slot: 'anytime',          // Default — overrides specify dawn/aarti slots
        theme_group: inferThemeGroup(tags, name)
      };
    })
    .filter(Boolean); // Remove nulls from the skipped elements

  // Deduplicate by name — OSM sometimes has the same temple mapped as
  // both a node (point) and a way (building outline)
  const uniqueByName = new Map();
  for (const site of sites) {
    // Keep the first occurrence (they'll have similar coordinates)
    if (!uniqueByName.has(site.name)) {
      uniqueByName.set(site.name, site);
    }
  }

  const uniqueSites = Array.from(uniqueByName.values());

  console.log(`  ✅ ${uniqueSites.length} named, unique sites after filtering`);

  return uniqueSites;
};
