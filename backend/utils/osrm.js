// ============================================================================
// osrm.js — Real road distance and travel time estimates via OSRM
// ============================================================================
//
// OSRM (Open Source Routing Machine) provides free road-network routing.
// The public demo server at router.project-osrm.org requires no API key.
//
// We use the "table" endpoint which returns an NxN matrix of distances or
// durations in a single API call — much cheaper than making N² individual
// route requests. For 20 sites, that's 1 call instead of 400.
//
// Why this matters for pilgrimage cities:
//   Varanasi's old city has winding lanes where a 1km straight-line distance
//   can be 3-4km by road. Haversine dramatically underestimates travel time
//   and transport costs in dense urban grids.
// ============================================================================


// The OSRM public demo server — free, no API key, but rate-limited.
// For production use, consider self-hosting OSRM with India OSM data.
const OSRM_BASE_URL = 'http://router.project-osrm.org';

// User-Agent is good practice for public APIs — identifies our project
const USER_AGENT = 'TirthingPilgrimagePlanner/1.0 (educational project)';


/**
 * Formats an array of coordinate pairs into the semicolon-separated string
 * format that OSRM expects: "lon1,lat1;lon2,lat2;lon3,lat3"
 *
 * Note: OSRM uses [longitude, latitude] order (the opposite of most maps).
 *
 * @param {Array<[number, number]>} coordPairs - Array of [longitude, latitude] pairs
 * @returns {string} OSRM-formatted coordinate string
 */
const formatCoords = (coordPairs) => {
  return coordPairs.map(([lon, lat]) => `${lon},${lat}`).join(';');
};


/**
 * Fetches a pairwise road distance matrix from the OSRM table endpoint.
 *
 * // OSRM table endpoint returns an NxN matrix — one call for all pairwise
 * // distances, much cheaper than N² individual calls
 *
 * The returned matrix[i][j] gives the road distance in km from site i to site j.
 * OSRM returns meters internally, so we divide by 1000.
 *
 * @param {Array<[number, number]>} coordPairs - Array of [longitude, latitude] pairs
 * @returns {Promise<number[][]|null>} 2D matrix of distances in km, or null on failure
 *
 * @example
 * const coords = [[83.01, 25.31], [83.02, 25.30]]; // [lon, lat] pairs
 * const matrix = await getRoadDistanceKm(coords);
 * // matrix[0][1] = 2.3 (km by road from site 0 to site 1)
 */
export const getRoadDistanceKm = async (coordPairs) => {
  try {
    const coords = formatCoords(coordPairs);
    const url = `${OSRM_BASE_URL}/table/v1/driving/${coords}?annotations=distance`;

    const response = await fetch(url, {
      headers: { 'User-Agent': USER_AGENT }
    });

    if (!response.ok) {
      console.warn(`[OSRM] Distance API returned ${response.status}`);
      return null;
    }

    const data = await response.json();

    if (data.code !== 'Ok' || !data.distances) {
      console.warn(`[OSRM] Distance API error: ${data.code || 'no distance data'}`);
      return null;
    }

    // OSRM returns distances in meters — convert to km for our transport cost formulas
    const distancesKm = data.distances.map(row =>
      row.map(meters => meters / 1000)
    );

    return distancesKm;

  } catch (error) {
    // Network failure, DNS issues, OSRM server down, etc.
    // Never crash the engine — the caller will fall back to Haversine
    console.warn(`[OSRM] Distance fetch failed: ${error.message}`);
    return null;
  }
};


/**
 * Fetches a pairwise travel duration matrix from the OSRM table endpoint.
 *
 * // Duration is more useful than distance for scheduling — a 3km road
 * // through Varanasi's old city takes 20 min, not 5
 *
 * The returned matrix[i][j] gives the travel time in minutes from site i to site j.
 * OSRM returns seconds internally, so we divide by 60.
 *
 * @param {Array<[number, number]>} coordPairs - Array of [longitude, latitude] pairs
 * @returns {Promise<number[][]|null>} 2D matrix of travel times in minutes, or null on failure
 *
 * @example
 * const coords = [[83.01, 25.31], [83.02, 25.30]]; // [lon, lat] pairs
 * const matrix = await getRoadDurationMatrix(coords);
 * // matrix[0][1] = 12.5 (minutes by road from site 0 to site 1)
 */
export const getRoadDurationMatrix = async (coordPairs) => {
  try {
    const coords = formatCoords(coordPairs);
    const url = `${OSRM_BASE_URL}/table/v1/driving/${coords}?annotations=duration`;

    const response = await fetch(url, {
      headers: { 'User-Agent': USER_AGENT }
    });

    if (!response.ok) {
      console.warn(`[OSRM] Duration API returned ${response.status}`);
      return null;
    }

    const data = await response.json();

    if (data.code !== 'Ok' || !data.durations) {
      console.warn(`[OSRM] Duration API error: ${data.code || 'no duration data'}`);
      return null;
    }

    // OSRM returns durations in seconds — convert to minutes for scheduling
    const durationsMins = data.durations.map(row =>
      row.map(seconds => seconds / 60)
    );

    return durationsMins;

  } catch (error) {
    // Network failure — caller falls back to Haversine-based estimates
    console.warn(`[OSRM] Duration fetch failed: ${error.message}`);
    return null;
  }
};


/**
 * Fetches BOTH distance and duration matrices in a single OSRM API call.
 * This is more efficient than calling getRoadDistanceKm and getRoadDurationMatrix
 * separately — one HTTP request instead of two.
 *
 * @param {Array<[number, number]>} coordPairs - Array of [longitude, latitude] pairs
 * @returns {Promise<{ distances: number[][], durations: number[][] }|null>}
 *   distances in km, durations in minutes — or null on failure
 */
export const getRoadMatrices = async (coordPairs) => {
  try {
    const coords = formatCoords(coordPairs);

    // Request both annotations in one call — the OSRM table endpoint supports this
    const url = `${OSRM_BASE_URL}/table/v1/driving/${coords}?annotations=distance,duration`;

    const response = await fetch(url, {
      headers: { 'User-Agent': USER_AGENT }
    });

    if (!response.ok) {
      console.warn(`[OSRM] Combined API returned ${response.status}`);
      return null;
    }

    const data = await response.json();

    if (data.code !== 'Ok' || !data.distances || !data.durations) {
      console.warn(`[OSRM] Combined API error: ${data.code || 'incomplete data'}`);
      return null;
    }

    return {
      distances: data.distances.map(row => row.map(m => m / 1000)),  // meters → km
      durations: data.durations.map(row => row.map(s => s / 60))     // seconds → minutes
    };

  } catch (error) {
    console.warn(`[OSRM] Combined fetch failed: ${error.message}`);
    return null;
  }
};
