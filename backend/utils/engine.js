// Haversine Distance Function
const getDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  return R * c; // Distance in km
};

export const generateItineraryPlan = (places, days, budget, groupSize) => {
  // 1. Budget Calculation
  const perPersonBudget = budget / groupSize;
  const fixedPerDay = 800 + 350 + 200; // accommodation, food, transport
  const totalFixedCosts = fixedPerDay * days;
  
  const remainingBudget = perPersonBudget - totalFixedCosts;
  if (remainingBudget < 0) {
    throw new Error('Budget is too low for basic fixed costs (accommodation, food, transport)');
  }

  // 2. Site Selection (Greedy)
  // Sort by priority (asc) then entryFee (asc)
  let sortedPlaces = [...places].sort((a, b) => {
    if (a.priority !== b.priority) return a.priority - b.priority;
    return a.entryFee - b.entryFee;
  });

  const maxHours = days * 11;
  let totalHours = 0;
  let currentBudgetSpent = 0;
  const selectedPlaces = [];

  for (const place of sortedPlaces) {
    const timeNeeded = place.visitDuration + 0.5; // with buffer
    if (
      totalHours + timeNeeded <= maxHours &&
      currentBudgetSpent + place.entryFee <= remainingBudget
    ) {
      selectedPlaces.push(place);
      totalHours += timeNeeded;
      currentBudgetSpent += place.entryFee;
    }
  }

  if (selectedPlaces.length === 0) {
    throw new Error('Could not select any places within the given constraints.');
  }

  // 3. Clustering
  // We need 'days' anchors. Identify anchors from priority 1 or just take top 'days' selected places.
  let anchors = selectedPlaces.filter(p => p.priority === 1);
  if (anchors.length > days) {
    anchors = anchors.slice(0, days);
  } else if (anchors.length < days) {
    // Fill the rest with the next best places from selected
    const remainingSelected = selectedPlaces.filter(p => p.priority !== 1);
    while(anchors.length < days && remainingSelected.length > 0) {
      anchors.push(remainingSelected.shift());
    }
  }

  // Initialize clusters array with the number of actual anchors we have
  const numClusters = Math.min(days, anchors.length);
  const clusters = Array.from({ length: numClusters }, () => []);

  // Set anchors as the first item in each cluster
  const anchorSet = new Set(anchors.map(a => a._id.toString()));
  anchors.forEach((anchor, i) => clusters[i].push(anchor));

  // Assign remaining to nearest anchor
  const placesToAssign = selectedPlaces.filter(p => !anchorSet.has(p._id.toString()));

  for (const place of placesToAssign) {
    let nearestIdx = 0;
    let minDistance = Infinity;

    for (let i = 0; i < anchors.length; i++) {
      const dist = getDistance(place.latitude, place.longitude, anchors[i].latitude, anchors[i].longitude);
      if (dist < minDistance) {
        minDistance = dist;
        nearestIdx = i;
      }
    }
    clusters[nearestIdx].push(place);
  }

  // 4. Route Optimization (Nearest Neighbor) per cluster
  const finalPlan = [];

  for (let i = 0; i < clusters.length; i++) {
    const cluster = clusters[i];
    if (cluster.length === 0) continue;

    // Start with the anchor (first element)
    const optimizedRoute = [];
    let currentPlace = cluster[0];
    const unvisited = new Set(cluster.slice(1));
    optimizedRoute.push(currentPlace);

    while (unvisited.size > 0) {
      let nearest = null;
      let minDistance = Infinity;

      for (const p of unvisited) {
        const dist = getDistance(currentPlace.latitude, currentPlace.longitude, p.latitude, p.longitude);
        if (dist < minDistance) {
          minDistance = dist;
          nearest = p;
        }
      }

      optimizedRoute.push(nearest);
      unvisited.delete(nearest);
      currentPlace = nearest;
    }

    // Assign to day
    finalPlan.push({
      day: i + 1,
      places: optimizedRoute.map(p => ({
        placeId: p._id,
        name: p.name,
        city: p.city,
        image: p.image,
        latitude: p.latitude,
        longitude: p.longitude,
        visitDuration: p.visitDuration,
        entryFee: p.entryFee,
        priority: p.priority,
        description: p.description
      }))
    });
  }

  return finalPlan;
};
