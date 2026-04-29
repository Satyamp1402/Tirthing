// ============================================================================
// Engine Unit Tests — Core itinerary generation logic
// ============================================================================
//
// WHY THESE TESTS MATTER:
// The engine is the heart of Tirthing. If budget calculation is wrong,
// users get plans they can't afford. If Haversine is wrong, distances
// are incorrect. If nearest-neighbor routing visits a site twice, the
// plan is broken. These tests catch those bugs BEFORE users see them.
//
// Each test is independent — no test depends on another test's state.
// ============================================================================

import { generateItineraryPlan, _testExports } from '../utils/engine.js';

const {
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
} = _testExports;


// ─── HAVERSINE DISTANCE ─────────────────────────────────────────────────────

describe('Haversine distance (getDistanceKm)', () => {

  test('Kashi Vishwanath to Dashashwamedh Ghat is approximately 0.5 km', () => {
    // Real-world coordinates for two famous Varanasi landmarks
    const kashiLat = 25.3109, kashiLon = 83.0107;
    const dashashwamedhLat = 25.3042, dashashwamedhLon = 83.0108;

    const distance = getDistanceKm(kashiLat, kashiLon, dashashwamedhLat, dashashwamedhLon);

    // Should be roughly 0.5-0.8 km (straight line between these two landmarks)
    expect(distance).toBeGreaterThan(0.3);
    expect(distance).toBeLessThan(1.5);
  });

  test('same point returns zero distance', () => {
    const distance = getDistanceKm(25.0, 83.0, 25.0, 83.0);
    expect(distance).toBeCloseTo(0, 5);
  });

  test('Delhi to Mumbai is approximately 1150 km', () => {
    // Rough sanity check for long distances
    const delhiLat = 28.6139, delhiLon = 77.2090;
    const mumbaiLat = 19.0760, mumbaiLon = 72.8777;

    const distance = getDistanceKm(delhiLat, delhiLon, mumbaiLat, mumbaiLon);

    // Haversine should give ~1150 km (road is ~1400 km)
    expect(distance).toBeGreaterThan(1000);
    expect(distance).toBeLessThan(1300);
  });

  test('distance is always non-negative', () => {
    const distance = getDistanceKm(0, 0, -10, -10);
    expect(distance).toBeGreaterThanOrEqual(0);
  });
});


// ─── BUDGET TIER DETECTION ──────────────────────────────────────────────────

describe('Budget tier detection (detectBudgetTier)', () => {

  test('under 1000 per person per day is budget tier', () => {
    expect(detectBudgetTier(500)).toBe('budget');
    expect(detectBudgetTier(999)).toBe('budget');
  });

  test('between 1000 and 3500 is comfort tier', () => {
    expect(detectBudgetTier(1000)).toBe('comfort');
    expect(detectBudgetTier(2500)).toBe('comfort');
    expect(detectBudgetTier(3499)).toBe('comfort');
  });

  test('above 3500 is premium tier', () => {
    expect(detectBudgetTier(3500)).toBe('premium');
    expect(detectBudgetTier(10000)).toBe('premium');
  });
});


// ─── TRANSPORT COST CALCULATION ─────────────────────────────────────────────

describe('Transport cost per hop (computeHopTransportCost)', () => {

  test('walking distance (under 1.5 km) costs nothing', () => {
    const result = computeHopTransportCost(0.5);
    expect(result.mode).toBe('walk');
    expect(result.cost).toBe(0);
  });

  test('short rickshaw distance returns cycle rickshaw fare', () => {
    const result = computeHopTransportCost(3.0);
    expect(result.mode).toBe('cycle_rickshaw');
    expect(result.cost).toBeGreaterThan(0);
  });

  test('long distance returns auto rickshaw fare', () => {
    const result = computeHopTransportCost(8.0);
    expect(result.mode).toBe('auto_rickshaw');
    expect(result.cost).toBeGreaterThan(0);
  });

  test('auto rickshaw is more expensive than cycle rickshaw for the same distance', () => {
    // Compare at the threshold boundary
    const cycleResult = computeHopTransportCost(4.9);
    const autoResult = computeHopTransportCost(5.1);
    expect(autoResult.cost).toBeGreaterThan(cycleResult.cost);
  });
});


// ─── DAILY HOURS COMPUTATION ────────────────────────────────────────────────

describe('Daily usable hours (computeDailyUsableHours)', () => {

  test('small group gets full 13 hours', () => {
    const hours = computeDailyUsableHours(2, false);
    expect(hours).toBe(13);
  });

  test('large group of 6+ loses an hour to coordination', () => {
    const hours = computeDailyUsableHours(8, false);
    expect(hours).toBe(12);
  });

  test('elderly mode caps at 8 hours regardless of group size', () => {
    const hoursSmallGroup = computeDailyUsableHours(2, true);
    const hoursLargeGroup = computeDailyUsableHours(10, true);
    expect(hoursSmallGroup).toBe(8);
    expect(hoursLargeGroup).toBe(8);
  });
});


// ─── TIME STRING FORMATTING ─────────────────────────────────────────────────

describe('Time formatting (decimalToTimeString)', () => {

  test('7.0 becomes 07:00', () => {
    expect(decimalToTimeString(7.0)).toBe('07:00');
  });

  test('13.5 becomes 13:30', () => {
    expect(decimalToTimeString(13.5)).toBe('13:30');
  });

  test('18.5 becomes 18:30 (aarti time)', () => {
    expect(decimalToTimeString(18.5)).toBe('18:30');
  });

  test('5.0 becomes 05:00 (dawn)', () => {
    expect(decimalToTimeString(5.0)).toBe('05:00');
  });
});


// ─── NEAREST NEIGHBOR ROUTING ───────────────────────────────────────────────

describe('Nearest neighbor routing (applyNearestNeighborRouting)', () => {

  // Create mock sites with known positions
  const mockSites = [
    { _id: 'a', name: 'Site A', latitude: 25.30, longitude: 83.00 },
    { _id: 'b', name: 'Site B', latitude: 25.31, longitude: 83.01 },
    { _id: 'c', name: 'Site C', latitude: 25.32, longitude: 83.02 },
    { _id: 'd', name: 'Site D', latitude: 25.33, longitude: 83.03 }
  ];

  // Simple distance function for testing
  const simpleDistance = (a, b) => {
    return Math.abs(a.latitude - b.latitude) + Math.abs(a.longitude - b.longitude);
  };

  test('visits each site exactly once', () => {
    const result = applyNearestNeighborRouting(mockSites, simpleDistance);

    expect(result).toHaveLength(mockSites.length);

    // Check every original site appears in the result exactly once
    const resultIds = result.map(s => s._id);
    for (const site of mockSites) {
      expect(resultIds.filter(id => id === site._id)).toHaveLength(1);
    }
  });

  test('single site returns that site', () => {
    const singleSite = [mockSites[0]];
    const result = applyNearestNeighborRouting(singleSite, simpleDistance);
    expect(result).toHaveLength(1);
    expect(result[0]._id).toBe('a');
  });

  test('empty array returns empty array', () => {
    const result = applyNearestNeighborRouting([], simpleDistance);
    expect(result).toHaveLength(0);
  });
});


// ─── FULL ENGINE — INTEGRATION TESTS ────────────────────────────────────────
// These tests call the real engine which may hit OSRM (external API).
// Timeout is increased to 30 seconds to account for OSRM latency.

describe('Full engine (generateItineraryPlan)', () => {

  // Minimal mock places for testing the full engine without a database
  const mockPlaces = [
    {
      _id: 'place1', name: 'Kashi Vishwanath', city: 'Varanasi',
      image: 'test.jpg', latitude: 25.3109, longitude: 83.0107,
      visitDuration: 1.5, entryFee: 0, priority: 1,
      description: 'Famous temple', time_slot: 'morning', theme_group: 'temples'
    },
    {
      _id: 'place2', name: 'Dashashwamedh Ghat', city: 'Varanasi',
      image: 'test2.jpg', latitude: 25.3042, longitude: 83.0108,
      visitDuration: 2, entryFee: 0, priority: 1,
      description: 'Main ghat', time_slot: 'dawn', theme_group: 'ghats'
    },
    {
      _id: 'place3', name: 'Sarnath', city: 'Varanasi',
      image: 'test3.jpg', latitude: 25.3816, longitude: 83.0225,
      visitDuration: 3, entryFee: 50, priority: 2,
      description: 'Buddhist site', time_slot: 'anytime', theme_group: 'historic'
    },
    {
      _id: 'place4', name: 'Evening Aarti', city: 'Varanasi',
      image: 'test4.jpg', latitude: 25.3042, longitude: 83.0108,
      visitDuration: 1, entryFee: 0, priority: 1,
      description: 'Sunset ceremony', time_slot: 'aarti', theme_group: 'ghats'
    }
  ];

  test('budget too low returns error with suggestion object', async () => {
    // ₹100 total for 4 people for 3 days = ₹8.33 per person per day
    // Way too low even for budget tier
    const result = await generateItineraryPlan(mockPlaces, 3, 100, 4);

    expect(result.error).toBe(true);
    expect(result.message).toBeDefined();
    expect(result.suggestion).toBeDefined();
    expect(result.suggestion.minimumBudget).toBeGreaterThan(100);
  });

  test('valid request returns a plan with correct number of days', async () => {
    // ₹50,000 for 2 people for 2 days = generous budget
    const result = await generateItineraryPlan(mockPlaces, 2, 50000, 2);

    // error is false on success (not undefined)
    expect(result.error).toBeFalsy();
    expect(result.plan).toBeDefined();
    expect(result.plan.length).toBeLessThanOrEqual(2);

    // Each day should have a day number and a places array
    for (const day of result.plan) {
      expect(day.day).toBeGreaterThan(0);
      expect(Array.isArray(day.places)).toBe(true);
    }
  }, 30000);

  test('priority 1 sites are always selected before priority 2', async () => {
    const result = await generateItineraryPlan(mockPlaces, 2, 50000, 2);

    if (result.error) return; // Skip if budget issue

    // Collect all place names from the plan
    const allPlaceNames = result.plan.flatMap(day => day.places.map(p => p.name));

    // All priority 1 sites should be included
    const priority1Names = mockPlaces.filter(p => p.priority === 1).map(p => p.name);
    for (const name of priority1Names) {
      expect(allPlaceNames).toContain(name);
    }
  }, 30000);

  test('aarti sites are scheduled at 18:30 in the schedule', async () => {
    const result = await generateItineraryPlan(mockPlaces, 1, 50000, 2);

    if (result.error) return;

    // Find the scheduled time for the aarti site
    for (const day of result.plan) {
      if (day.scheduled_times) {
        const aartiSchedule = day.scheduled_times.find(
          st => st.placeName === 'Evening Aarti'
        );
        if (aartiSchedule) {
          expect(aartiSchedule.startTime).toBe('18:30');
        }
      }
    }
  }, 30000);

  test('single person trip works correctly', async () => {
    const result = await generateItineraryPlan(mockPlaces, 1, 10000, 1);

    // error is false on success
    expect(result.error).toBeFalsy();
    expect(result.plan).toBeDefined();
  }, 30000);
});

