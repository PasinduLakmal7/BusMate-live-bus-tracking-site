const pool = require('../../db');

// Haversine distance calculator (in km) between two lat/lng points
const haversineKm = (lat1, lng1, lat2, lng2) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) *
    Math.sin(dLng / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

// Distance calculator (Haversine formula) in SQL
const proximityQuery = (lat, lng, radiusKm = 3.0) => {
  return `
    SELECT *, 
    (6371 * acos(cos(radians(${lat})) * cos(radians(latitude)) * cos(radians(longitude) - radians(${lng})) + sin(radians(${lat})) * sin(radians(latitude)))) AS distance
    FROM route_stops
    WHERE (6371 * acos(cos(radians(${lat})) * cos(radians(latitude)) * cos(radians(longitude) - radians(${lng})) + sin(radians(${lat})) * sin(radians(latitude)))) <= ${radiusKm}
    ORDER BY distance ASC
  `;
};

// Sri Lanka SLTB fare formula: Rs. 19 base + Rs. 13 per km
const calculateFare = (distanceKm) => {
  const base = 19;
  const perKm = 13;
  return Math.round(base + distanceKm * perKm);
};

// Estimate duration: average bus speed in Sri Lanka ~30 km/h
const estimateDuration = (distanceKm) => {
  const avgSpeedKph = 30;
  const minutes = Math.round((distanceKm / avgSpeedKph) * 60);
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h} hr ${m} min` : `${h} hr`;
};

const suggestRoutes = async (req, res) => {
  try {
    const { startLat, startLng, endLat, endLng } = req.query;

    if (!startLat || !startLng || !endLat || !endLng) {
      return res.status(400).json({ success: false, error: "Missing coordinates" });
    }

    const sLat = parseFloat(startLat);
    const sLng = parseFloat(startLng);
    const eLat = parseFloat(endLat);
    const eLng = parseFloat(endLng);

    // Straight-line distance between user's start and end (as an upper-bound estimate)
    const straightLineKm = haversineKm(sLat, sLng, eLat, eLng);

    // 1. Find stops near the start point
    const startStopsRes = await pool.query(proximityQuery(sLat, sLng, 3));
    const startStops = startStopsRes.rows;

    // 2. Find stops near the end point
    const endStopsRes = await pool.query(proximityQuery(eLat, eLng, 3));
    const endStops = endStopsRes.rows;

    if (startStops.length === 0 || endStops.length === 0) {
      return res.json({ success: true, suggestions: [], message: "No bus stops found near your locations." });
    }

    // 3. Find routes that connect these stops in the correct order
    const suggestions = [];
    const seenRoutes = new Set();

    for (const s of startStops) {
      for (const e of endStops) {
        if (s.route_id === e.route_id && s.stop_id !== e.stop_id) {
          const routeInfo = await pool.query("SELECT * FROM routes WHERE route_id = $1", [s.route_id]);
          if (routeInfo.rows.length > 0) {
            const r = routeInfo.rows[0];

            // Deduplicate by route number to avoid showing Up/Down variations of the same line
            if (seenRoutes.has(r.route_number)) continue;

            // FIX: Use straight-line distance between the actual bus stops
            const stopDistKm = haversineKm(s.latitude, s.longitude, e.latitude, e.longitude);
            
            // Add a 1.3x road factor since buses don't travel in straight lines
            // Plus add user walking distance (start->stop + stop->end)
            const walkToStart = s.distance || 0;
            const walkToEnd = e.distance || 0;
            const estimatedBusDistKm = (stopDistKm * 1.3) + walkToStart + walkToEnd;

            // FIX: Proper Sri Lanka bus fare formula
            const fare = calculateFare(estimatedBusDistKm);

            // FIX: Duration based on estimated distance and avg bus speed (not arbitrary multiplier)
            const durationText = estimateDuration(estimatedBusDistKm);

            // FIX: Crowd based on time of day, not random
            const hour = new Date().getHours();
            const isPeakHour = (hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19);
            const crowd = isPeakHour ? 'High' : 'Low';

            suggestions.push({
              id: r.route_id,
              routeNumber: r.route_number,
              name: r.route_name,
              start_stop: s.stop_name,
              end_stop: e.stop_name,
              duration: durationText,
              fare: "Rs. " + fare + ".00",
              distance: estimatedBusDistKm.toFixed(1) + " km",
              crowd,
              type: r.route_number.startsWith('EX-') ? 'Expressway' : 'Normal'
            });
            seenRoutes.add(r.route_number);
          }
        }
      }
    }

    // Sort: shortest duration (by distance) first
    suggestions.sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));

    return res.json({ success: true, suggestions });
  } catch (err) {
    console.error("Route Suggestion Error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
};

module.exports = { suggestRoutes };
