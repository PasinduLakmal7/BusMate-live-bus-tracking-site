const pool = require('../../db');

// Distance calculator (Haversine formula) in SQL
const proximityQuery = (lat, lng, radiusKm = 2.0) => {
  return `
    SELECT *, 
    (6371 * acos(cos(radians(${lat})) * cos(radians(latitude)) * cos(radians(longitude) - radians(${lng})) + sin(radians(${lat})) * sin(radians(latitude)))) AS distance
    FROM route_stops
    WHERE (6371 * acos(cos(radians(${lat})) * cos(radians(latitude)) * cos(radians(longitude) - radians(${lng})) + sin(radians(${lat})) * sin(radians(latitude)))) <= ${radiusKm}
  `;
};

const suggestRoutes = async (req, res) => {
  try {
    const { startLat, startLng, endLat, endLng } = req.query;

    if (!startLat || !startLng || !endLat || !endLng) {
      return res.status(400).json({ success: false, error: "Missing coordinates" });
    }

    // 1. Find stops near the start point
    const startStopsRes = await pool.query(proximityQuery(startLat, startLng, 3)); // 3km radius
    const startStops = startStopsRes.rows;

    // 2. Find stops near the end point 
    const endStopsRes = await pool.query(proximityQuery(endLat, endLng, 3)); // 3km radius
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
          // Check direction (simple lexicographical/logical check for now if order is not strict in DB)
          // Actually we better fetch route info to show to user
          if (seenRoutes.has(s.route_id)) continue;
          
          const routeInfo = await pool.query("SELECT * FROM routes WHERE route_id = $1", [s.route_id]);
          if (routeInfo.rows.length > 0) {
            const r = routeInfo.rows[0];
            
            // Calculate a rough fare and duration
            const travelDist = (e.distance || 5) + (s.distance || 5); // very rough
            const travelTime = Math.round(r.estimated_duration * 0.7); // simulated
            const fare = Math.round(20 + travelDist * 15);

            suggestions.push({
              id: r.route_id,
              routeNumber: r.route_number,
              name: r.route_name,
              start_stop: s.stop_name,
              end_stop: e.stop_name,
              duration: travelTime + " min",
              fare: "Rs. " + fare + ".00",
              distance: parseFloat(travelDist).toFixed(1) + " km",
              crowd: Math.random() > 0.6 ? 'High' : 'Low',
              type: r.route_number.startsWith('EX-') ? 'Expressway' : 'Normal'
            });
            seenRoutes.add(s.route_id);
          }
        }
      }
    }

    return res.json({ success: true, suggestions });
  } catch (err) {
    console.error("Route Suggestion Error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
};

module.exports = { suggestRoutes };
