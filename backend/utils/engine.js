// ============================================================================
// Tirthing — Itinerary Generation Engine
// ============================================================================
//
// This engine turns a list of pilgrimage sites, a budget, and trip parameters
// into a day-by-day plan that respects:
//   1. Religious time constraints (dawn ghats, sunset aarti)
//   2. Budget tiers (backpacker → premium)
//   3. Group dynamics (large groups move slower, elderly need shorter days)
//   4. Geographic clustering (minimize travel between sites on the same day)
//   5. Real road distances via OSRM (with Haversine fallback for offline)
//
// The algorithm flows through five phases:
//   Budget Analysis → Site Selection → OSRM Fetch → Clustering → Scheduling
// ============================================================================

import { getRoadMatrices } from './osrm.js';


// ─── COST TIERS ──────────────────────────────────────────────────────────────
// Real-world costs for Indian pilgrimage cities (Varanasi, Haridwar, Puri, etc.)
// as of 2024–25. These are PER PERSON, PER DAY estimates.
//
// Budget tier:  Dharamshala/hostel stay, street food, walking mostly
// Comfort tier: Mid-range hotel, restaurant meals, auto-rickshaws
// Premium tier: Heritage hotel, curated dining, private transport

const COST_TIERS = {
  budget: {
    accommodation: 600,   // Dharamshala or budget guesthouse
    food: 200,            // Street food + chai stops
    misc: 100             // Puja offerings, small donations
  },
  comfort: {
    accommodation: 2000,  // 2–3 star hotel near the main sites
    food: 450,            // Restaurant meals, bottled water
    misc: 200             // Guided tours, better puja materials
  },
  premium: {
    accommodation: 5000,  // Heritage hotel or premium riverside stay
    food: 800,            // Fine dining, room service
    misc: 400             // Private guides, VIP darshan passes
  }
};


// ─── SCHEDULING CONSTANTS ────────────────────────────────────────────────────

// A pilgrim's usable day: 07:00 to 20:00 = 13 hours.
// Dawn slots (05:00–07:00) are handled separately — they add time before this window.
const BASE_DAILY_USABLE_HOURS = 13;

// Transit buffer between consecutive sites. Accounts for walking to vehicle,
// negotiating fare, traffic, and finding the entrance.
const BASE_TRANSIT_MINUTES = 30;

// Aarti is a sunset ritual — in most North Indian cities, the evening Ganga Aarti
// begins around 18:30 (varies ±15 min by season, but we use 18:30 as canonical).
const AARTI_START_TIME = '18:30';

// Dawn rituals at ghats happen at first light — typically 05:00 to 07:00.
const DAWN_WINDOW_START = '05:00';
const DAWN_WINDOW_END = '07:00';

// Morning session for temples that see heavy crowds post-lunch.
const MORNING_SESSION_START = '07:00';
const MORNING_SESSION_END = '13:00';

// Elderly or mobility-impaired pilgrims need a gentler schedule.
const ELDERLY_MAX_DAILY_HOURS = 8;
const ELDERLY_MAX_SITES_PER_DAY = 4;


// ─── TRANSPORT COST FORMULAS ─────────────────────────────────────────────────
// Based on typical rates in pilgrimage cities (not metro rates).
// Walk:           free for < 1.5 km (most ghat-to-ghat distances)
// Cycle rickshaw:  ₹60 base + ₹20/km for < 5 km (old city lanes)
// Auto rickshaw:   ₹120 base + ₹25/km for ≥ 5 km (cross-city trips)

const WALK_THRESHOLD_KM = 1.5;
const RICKSHAW_THRESHOLD_KM = 5;
const RICKSHAW_BASE_FARE = 60;
const RICKSHAW_PER_KM = 20;
const AUTO_BASE_FARE = 120;
const AUTO_PER_KM = 25;


// ─── HAVERSINE DISTANCE (FALLBACK) ──────────────────────────────────────────

/**
 * Calculates the great-circle distance between two GPS coordinates.
 * Used as a fallback when OSRM is unreachable. Haversine gives straight-line
 * distances which underestimate road distances in dense city grids, but it's
 * better than no distance estimate at all.
 *
 * @param {number} lat1 - Latitude of point A (degrees)
 * @param {number} lon1 - Longitude of point A (degrees)
 * @param {number} lat2 - Latitude of point B (degrees)
 * @param {number} lon2 - Longitude of point B (degrees)
 * @returns {number} Distance in kilometres (straight-line, not road)
 */
const getDistanceKm = (lat1, lon1, lat2, lon2) => {
  const EARTH_RADIUS_KM = 6371;

  // Convert degree differences to radians for trig functions
  const deltaLatRad = (lat2 - lat1) * (Math.PI / 180);
  const deltaLonRad = (lon2 - lon1) * (Math.PI / 180);

  // Haversine formula: accounts for spherical geometry
  const a =
    Math.sin(deltaLatRad / 2) * Math.sin(deltaLatRad / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(deltaLonRad / 2) * Math.sin(deltaLonRad / 2);

  const angularDistance = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return EARTH_RADIUS_KM * angularDistance;
};


// ─── TRANSPORT COST FOR A SINGLE HOP ────────────────────────────────────────

/**
 * Computes the transport cost between two consecutive sites based on distance.
 * Pilgrimage cities have dense old-town cores where walking is fastest, surrounded
 * by areas reachable by cycle rickshaw, with auto-rickshaws for longer hops.
 *
 * @param {number} distanceKm - Distance between the two sites (road or straight-line)
 * @returns {{ mode: string, cost: number }} Transport mode chosen and fare in INR
 */
const computeHopTransportCost = (distanceKm) => {
  // Most ghat-to-ghat walks in Varanasi are under 1.5 km — free and pleasant
  if (distanceKm < WALK_THRESHOLD_KM) {
    return { mode: 'walk', cost: 0 };
  }

  // Old city lanes are too narrow for autos — cycle rickshaws dominate under 5 km
  if (distanceKm < RICKSHAW_THRESHOLD_KM) {
    const fare = RICKSHAW_BASE_FARE + (distanceKm * RICKSHAW_PER_KM);
    return { mode: 'cycle_rickshaw', cost: Math.round(fare) };
  }

  // Cross-city trips need an auto-rickshaw (or shared tempo in some cities)
  const fare = AUTO_BASE_FARE + (distanceKm * AUTO_PER_KM);
  return { mode: 'auto_rickshaw', cost: Math.round(fare) };
};


// ─── BUDGET TIER DETECTION ───────────────────────────────────────────────────

/**
 * Determines which cost tier a pilgrim falls into based on their per-person
 * daily budget. The thresholds are set so that even the cheapest option in
 * a tier is comfortably covered.
 *
 * @param {number} perPersonPerDay - Total budget per person per day (INR)
 * @returns {'budget' | 'comfort' | 'premium'} Detected tier
 */
const detectBudgetTier = (perPersonPerDay) => {
  if (perPersonPerDay < 1000) return 'budget';
  if (perPersonPerDay < 3500) return 'comfort';
  return 'premium';
};


// ─── DAILY HOURS CALCULATION ─────────────────────────────────────────────────

/**
 * Determines how many usable hours a group has per day, accounting for
 * group size overhead and elderly/mobility constraints.
 *
 * @param {number} groupSize - Number of people in the group
 * @param {boolean} elderlyFriendly - Whether to cap hours for elderly pilgrims
 * @returns {number} Usable hours per day
 */
const computeDailyUsableHours = (groupSize, elderlyFriendly) => {
  if (elderlyFriendly) return ELDERLY_MAX_DAILY_HOURS;

  let hours = BASE_DAILY_USABLE_HOURS;

  // Groups of 6+ lose an hour daily to coordination overhead
  if (groupSize > 5) {
    hours -= 1;
  }

  return hours;
};


// ─── TRANSIT TIME WITH GROUP SIZE BUFFER ─────────────────────────────────────

/**
 * Computes the transit time between sites, inflated for large groups.
 * Groups of 5+ move 20% slower because of stragglers, luggage,
 * and the difficulty of fitting everyone in one vehicle.
 *
 * @param {number} groupSize - Number of people in the group
 * @returns {number} Transit time in hours between consecutive sites
 */
const computeTransitTimeHours = (groupSize) => {
  let transitMinutes = BASE_TRANSIT_MINUTES;

  if (groupSize > 4) {
    transitMinutes = Math.round(transitMinutes * 1.2);
  }

  return transitMinutes / 60;
};


// ─── TIME STRING HELPERS ─────────────────────────────────────────────────────

/**
 * Converts a decimal hour offset (from midnight) into a "HH:MM" string.
 *
 * @param {number} decimalHours - Hours since midnight (e.g. 13.75 = 1:45 PM)
 * @returns {string} Time in "HH:MM" format
 */
const decimalToTimeString = (decimalHours) => {
  const hours = Math.floor(decimalHours);
  const minutes = Math.round((decimalHours - hours) * 60);
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
};


// ─── OSRM-AWARE DISTANCE LOOKUP ─────────────────────────────────────────────

/**
 * Creates a distance/duration lookup function backed by OSRM matrices.
 * Given a list of sites and their OSRM matrices, returns a function that
 * can look up the road distance or duration between any two sites by
 * their index in the original array.
 *
 * If OSRM data is unavailable (null), the returned function falls back
 * to Haversine straight-line distance.
 *
 * @param {Array<Object>} sites - The selected sites (in matrix order)
 * @param {number[][]|null} matrix - OSRM distance or duration matrix (or null)
 * @param {'distance'|'duration'} type - Which metric this lookup provides
 * @returns {Function} (siteA, siteB) => number — road km or road minutes
 */
const createMatrixLookup = (sites, matrix, type) => {
  // Build a map from site ID to matrix index for O(1) lookups
  const idToIndex = new Map();
  sites.forEach((site, idx) => {
    idToIndex.set(site._id.toString(), idx);
  });

  return (siteA, siteB) => {
    const indexA = idToIndex.get(siteA._id.toString());
    const indexB = idToIndex.get(siteB._id.toString());

    // If both sites are in the matrix, use the OSRM value
    if (matrix && indexA !== undefined && indexB !== undefined) {
      return matrix[indexA][indexB];
    }

    // Fallback to Haversine ensures the engine always produces a result
    // even in offline/test environments where OSRM is unreachable
    const haversineKm = getDistanceKm(
      siteA.latitude, siteA.longitude,
      siteB.latitude, siteB.longitude
    );

    if (type === 'duration') {
      // Rough estimate: assume 15 km/h average speed in pilgrimage city traffic
      // (mix of walking, rickshaws, narrow lanes, crowds)
      return (haversineKm / 15) * 60; // convert hours to minutes
    }

    return haversineKm;
  };
};


// ─── MAIN ENGINE ─────────────────────────────────────────────────────────────

/**
 * Generates a complete day-by-day pilgrimage itinerary.
 *
 * Now async because it fetches real road distances from OSRM before
 * clustering and routing. Falls back to Haversine if OSRM is unreachable.
 *
 * Algorithm overview:
 *   1. Validate budget against tier-specific fixed costs
 *   2. Select sites greedily (priority first, then cheapest entry fee)
 *   3. Fetch OSRM road distance/duration matrices (one API call)
 *   4. Cluster selected sites into day-groups using travel time proximity
 *   5. Within each day, schedule time-locked slots first, then fill with nearest-neighbor
 *   6. Compute per-hop transport costs using road distances
 *
 * @param {Array<Object>} places - Array of Place documents from MongoDB
 * @param {number} days - Number of trip days
 * @param {number} budget - Total budget in INR (for the entire group)
 * @param {number} groupSize - Number of people in the group
 * @param {Object} [options={}] - Additional options
 * @param {boolean} [options.elderlyFriendly=false] - Gentler schedule for elderly pilgrims
 * @returns {Promise<Object>} Either the plan array + metadata, or an error object with suggestions
 */
export const generateItineraryPlan = async (places, days, budget, groupSize, options = {}) => {
  const elderlyFriendly = options.elderlyFriendly || false;

  // ════════════════════════════════════════════════════════════════════════════
  // PHASE 1: BUDGET ANALYSIS
  // ════════════════════════════════════════════════════════════════════════════

  const perPersonBudget = budget / groupSize;
  const perPersonPerDay = perPersonBudget / days;

  const detectedTier = detectBudgetTier(perPersonPerDay);
  const tierCosts = COST_TIERS[detectedTier];

  const fixedCostPerPersonPerDay = tierCosts.accommodation + tierCosts.food + tierCosts.misc;
  const totalFixedCosts = fixedCostPerPersonPerDay * days;

  const remainingBudgetPerPerson = perPersonBudget - totalFixedCosts;

  if (remainingBudgetPerPerson < 0) {
    const minimumBudgetPerPerson = fixedCostPerPersonPerDay * days;
    const minimumTotalBudget = minimumBudgetPerPerson * groupSize;
    const shortage = minimumTotalBudget - budget;
    const affordableDays = Math.floor(perPersonBudget / fixedCostPerPersonPerDay);

    return {
      error: true,
      detectedTier,
      message: `Budget is too low for a ${days}-day ${detectedTier} trip. ` +
               `The minimum needed is ₹${minimumTotalBudget.toLocaleString('en-IN')} ` +
               `(₹${fixedCostPerPersonPerDay}/person/day × ${days} days × ${groupSize} people).`,
      suggestion: {
        minimumBudget: minimumTotalBudget,
        shortage: shortage,
        alternativeDays: Math.max(affordableDays, 0)
      }
    };
  }

  // ════════════════════════════════════════════════════════════════════════════
  // PHASE 2: SITE SELECTION (Greedy)
  // ════════════════════════════════════════════════════════════════════════════

  const dailyUsableHours = computeDailyUsableHours(groupSize, elderlyFriendly);
  const transitTimeHours = computeTransitTimeHours(groupSize);
  const totalAvailableHours = dailyUsableHours * days;

  const sortedPlaces = [...places].sort((a, b) => {
    if (a.priority !== b.priority) return a.priority - b.priority;
    return a.entryFee - b.entryFee;
  });

  let accumulatedHours = 0;
  let accumulatedEntryCost = 0;
  const selectedSites = [];

  for (const place of sortedPlaces) {
    const timeNeeded = place.visitDuration + transitTimeHours;
    const withinTimeLimit = (accumulatedHours + timeNeeded) <= totalAvailableHours;
    const withinBudget = (accumulatedEntryCost + place.entryFee) <= remainingBudgetPerPerson;
    const withinElderlyLimit = !elderlyFriendly ||
      selectedSites.length < (ELDERLY_MAX_SITES_PER_DAY * days);

    if (withinTimeLimit && withinBudget && withinElderlyLimit) {
      selectedSites.push(place);
      accumulatedHours += timeNeeded;
      accumulatedEntryCost += place.entryFee;
    }
  }

  if (selectedSites.length === 0) {
    const cheapestEntry = sortedPlaces.length > 0
      ? Math.min(...sortedPlaces.map(p => p.entryFee))
      : 0;

    return {
      error: true,
      detectedTier,
      message: 'Could not fit any places into the budget and time constraints. ' +
               'Try increasing the budget, adding more days, or reducing the group size.',
      suggestion: {
        minimumBudget: (fixedCostPerPersonPerDay + cheapestEntry) * days * groupSize,
        shortage: Math.max(0, (fixedCostPerPersonPerDay + cheapestEntry) * days * groupSize - budget),
        alternativeDays: days + 1
      }
    };
  }

  // ════════════════════════════════════════════════════════════════════════════
  // PHASE 2.5: FETCH OSRM ROAD MATRICES
  // One API call gives us real road distances AND travel times for ALL pairs
  // of selected sites. This replaces Haversine straight-line estimates with
  // actual road-network data — critical for dense cities like Varanasi where
  // winding lanes make straight-line distances wildly inaccurate.
  // ════════════════════════════════════════════════════════════════════════════

  // Build coordinate pairs in OSRM format: [longitude, latitude]
  // (OSRM uses lon,lat — the opposite of the more common lat,lon convention)
  const coordPairs = selectedSites.map(site => [site.longitude, site.latitude]);

  // Fetch both distance and duration in a single API call
  const osrmMatrices = await getRoadMatrices(coordPairs);

  // Create lookup functions that transparently use OSRM when available
  // or fall back to Haversine when OSRM is unreachable.
  // This means the engine ALWAYS produces a result — OSRM failure never
  // blocks itinerary generation.
  const getDistanceBetween = createMatrixLookup(
    selectedSites,
    osrmMatrices?.distances || null,
    'distance'
  );

  const getDurationBetween = createMatrixLookup(
    selectedSites,
    osrmMatrices?.durations || null,
    'duration'
  );

  if (osrmMatrices) {
    console.log(`[Engine] Using OSRM road data for ${selectedSites.length} sites`);
  } else {
    // Fallback to Haversine ensures the engine always produces a result
    // even in offline/test environments where OSRM is unreachable
    console.log('[Engine] OSRM unavailable — falling back to Haversine distances');
  }

  // ════════════════════════════════════════════════════════════════════════════
  // PHASE 3: ANCHOR-BASED CLUSTERING
  // Group sites into day-clusters using travel TIME (not straight-line distance).
  // Travel time from OSRM is more accurate for clustering because it accounts
  // for one-way streets, river crossings, and traffic-heavy routes that make
  // some nearby sites effectively far apart.
  // ════════════════════════════════════════════════════════════════════════════

  let anchorCandidates = selectedSites.filter(site => site.priority === 1);

  if (anchorCandidates.length > days) {
    anchorCandidates = anchorCandidates.slice(0, days);
  } else if (anchorCandidates.length < days) {
    const nonAnchorSites = selectedSites.filter(site => site.priority !== 1);
    while (anchorCandidates.length < days && nonAnchorSites.length > 0) {
      anchorCandidates.push(nonAnchorSites.shift());
    }
  }

  const clusterCount = Math.min(days, anchorCandidates.length);
  const dayClusters = Array.from({ length: clusterCount }, () => []);

  const anchorIdSet = new Set(anchorCandidates.map(a => a._id.toString()));
  anchorCandidates.forEach((anchor, index) => dayClusters[index].push(anchor));

  // Assign non-anchor sites to the nearest anchor by TRAVEL TIME, not straight-line.
  // This is more accurate because OSRM accounts for actual road network topology —
  // two sites 500m apart on opposite sides of the Ganga river might be a 20-minute
  // drive via the nearest bridge.
  const unanchoredSites = selectedSites.filter(site => !anchorIdSet.has(site._id.toString()));

  for (const site of unanchoredSites) {
    let nearestClusterIndex = 0;
    let shortestTravelTime = Infinity;

    for (let i = 0; i < anchorCandidates.length; i++) {
      // Use duration (travel time) for clustering — it's a better proxy for
      // "how close are these sites in practice?" than raw distance
      const travelTime = getDurationBetween(site, anchorCandidates[i]);

      if (travelTime < shortestTravelTime) {
        shortestTravelTime = travelTime;
        nearestClusterIndex = i;
      }
    }

    dayClusters[nearestClusterIndex].push(site);
  }

  // ════════════════════════════════════════════════════════════════════════════
  // PHASE 4 & 5: TIME-SLOT SCHEDULING + ROUTE OPTIMIZATION
  // Uses OSRM travel time for nearest-neighbor routing (finds the truly
  // closest next site by road, not as the crow flies) and OSRM road distance
  // for transport cost calculation (road km gives realistic rickshaw fares).
  // ════════════════════════════════════════════════════════════════════════════

  const finalPlan = [];

  for (let dayIndex = 0; dayIndex < dayClusters.length; dayIndex++) {
    const cluster = dayClusters[dayIndex];
    if (cluster.length === 0) continue;

    // ── Partition sites by their time-slot constraint ──
    const dawnSites = cluster.filter(s => s.time_slot === 'dawn');
    const morningSites = cluster.filter(s => s.time_slot === 'morning');
    const aartiSites = cluster.filter(s => s.time_slot === 'aarti');
    const anytimeSites = cluster.filter(s =>
      s.time_slot === 'anytime' || !s.time_slot
    );

    // ── Build the day's ordered route ──
    // Dawn → Morning → Anytime (nearest-neighbor by ROAD time) → Aarti
    const orderedRoute = [];

    // Route each time-slot group using travel time, not straight-line distance.
    // This prevents the routing from sending pilgrims on a zigzag path that
    // looks short on the map but takes forever through narrow old-city lanes.
    orderedRoute.push(...applyNearestNeighborRouting(dawnSites, getDurationBetween));
    orderedRoute.push(...applyNearestNeighborRouting(morningSites, getDurationBetween));
    orderedRoute.push(...applyNearestNeighborRouting(anytimeSites, getDurationBetween));

    // Aarti is ALWAYS last — sunset ritual at the ghats, non-negotiable timing
    orderedRoute.push(...aartiSites);

    // ── Generate scheduled times and transport costs ──
    // Also compute per-hop transport data for each place so the frontend
    // can display mode, distance, time, and cost between consecutive sites
    let currentTimeDecimal;

    if (dawnSites.length > 0) {
      currentTimeDecimal = 5.0; // 05:00
    } else {
      currentTimeDecimal = 7.0; // 07:00
    }

    const scheduledTimes = [];
    let dayTransportCost = 0;

    // Per-hop transport data indexed by site position in orderedRoute.
    // Index i holds the transport info FROM site i-1 TO site i.
    // The first site (index 0) has no transport data — you're already there.
    const perHopTransport = new Array(orderedRoute.length).fill(null);

    for (let siteIndex = 0; siteIndex < orderedRoute.length; siteIndex++) {
      const site = orderedRoute[siteIndex];

      // Aarti is pinned to 18:30
      if (site.time_slot === 'aarti') {
        currentTimeDecimal = Math.max(currentTimeDecimal, 18.5);
      }

      const startTime = decimalToTimeString(currentTimeDecimal);
      const endTime = decimalToTimeString(currentTimeDecimal + site.visitDuration);

      scheduledTimes.push({
        placeName: site.name,
        startTime,
        endTime
      });

      currentTimeDecimal += site.visitDuration;

      // Compute transport cost to the NEXT site using ROAD distance
      if (siteIndex < orderedRoute.length - 1) {
        const nextSite = orderedRoute[siteIndex + 1];

        // Road distances from OSRM give more realistic transport cost estimates —
        // Haversine underestimates in dense city grids where roads wind through
        // narrow lanes, loop around rivers, and funnel through choke points
        const hopDistanceKm = getDistanceBetween(site, nextSite);
        const hopDurationMin = getDurationBetween(site, nextSite);

        const { mode, cost: hopCost } = computeHopTransportCost(hopDistanceKm);
        dayTransportCost += hopCost;

        // Store per-hop data on the DESTINATION site (nextSite = index+1)
        // so the frontend can show "how you get TO this site"
        perHopTransport[siteIndex + 1] = {
          transportMode: mode,
          transportCost: hopCost,
          distanceKm: hopDistanceKm,
          travelTimeMin: hopDurationMin
        };

        // Add transit time between sites
        currentTimeDecimal += transitTimeHours;
      }
    }

    // ── Assemble the day's plan entry ──
    finalPlan.push({
      day: dayIndex + 1,
      transport_cost: dayTransportCost,
      scheduled_times: scheduledTimes,
      places: orderedRoute.map((site, idx) => ({
        placeId: site._id,
        name: site.name,
        city: site.city,
        image: site.image,
        latitude: site.latitude,
        longitude: site.longitude,
        visitDuration: site.visitDuration,
        entryFee: site.entryFee,
        priority: site.priority,
        description: site.description,
        // Per-hop transport data — null for the first site of the day,
        // populated for subsequent sites so the frontend can show
        // walk/rickshaw mode, distance, travel time, and fare inline
        ...(perHopTransport[idx] || {})
      }))
    });
  }

  return {
    error: false,
    detectedTier,
    plan: finalPlan
  };
};


// ─── NEAREST-NEIGHBOR ROUTING ────────────────────────────────────────────────

/**
 * Orders a set of sites using the nearest-neighbor heuristic, using a
 * provided distance/duration function for proximity comparisons.
 *
 * When OSRM data is available, this routes by actual road travel time
 * instead of straight-line distance — finding the truly closest next
 * site through the actual street network.
 *
 * @param {Array<Object>} sites - Array of Place objects
 * @param {Function} getProximity - (siteA, siteB) => number (lower = closer)
 * @returns {Array<Object>} The same sites, reordered for minimal total travel
 */
const applyNearestNeighborRouting = (sites, getProximity) => {
  if (sites.length <= 1) return [...sites];

  const orderedResult = [];
  let currentSite = sites[0];
  const unvisited = new Set(sites.slice(1));
  orderedResult.push(currentSite);

  while (unvisited.size > 0) {
    let nearestSite = null;
    let shortestDistance = Infinity;

    // Scan all unvisited sites to find the closest by road travel time
    // (or Haversine if OSRM is unavailable — the getProximity function handles fallback)
    for (const candidate of unvisited) {
      const distance = getProximity(currentSite, candidate);
      if (distance < shortestDistance) {
        shortestDistance = distance;
        nearestSite = candidate;
      }
    }

    orderedResult.push(nearestSite);
    unvisited.delete(nearestSite);
    currentSite = nearestSite;
  }

  return orderedResult;
};


// ─── TEST EXPORTS ────────────────────────────────────────────────────────────
// These are internal functions exported ONLY for unit testing.
// Do NOT import them in production code — use generateItineraryPlan instead.

export const _testExports = {
  getDistanceKm,
  detectBudgetTier,
  computeHopTransportCost,
  computeDailyUsableHours,
  computeTransitTimeHours,
  decimalToTimeString,
  applyNearestNeighborRouting,
  COST_TIERS,
  WALK_THRESHOLD_KM,
  RICKSHAW_THRESHOLD_KM
};
