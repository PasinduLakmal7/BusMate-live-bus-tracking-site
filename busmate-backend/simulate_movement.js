const pool = require('./db.js');
require('dotenv').config();

// Simple polyline decoder
function decodePolyline(encoded) {
  let points = [];
  let index = 0, len = encoded.length;
  let lat = 0, lng = 0;
  while (index < len) {
    let b, shift = 0, result = 0;
    do { b = encoded.charCodeAt(index++) - 63; result |= (b & 0x1f) << shift; shift += 5; } while (b >= 0x20);
    let dlat = ((result & 1) ? ~(result >> 1) : (result >> 1)); lat += dlat;
    shift = 0; result = 0;
    do { b = encoded.charCodeAt(index++) - 63; result |= (b & 0x1f) << shift; shift += 5; } while (b >= 0x20);
    let dlng = ((result & 1) ? ~(result >> 1) : (result >> 1)); lng += dlng;
    points.push({ lat: lat / 1E5, lon: lng / 1E5 });
  }
  return points;
}

// Helper: Calculate distance in km between two lat/lon points
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

async function simulate() {
  console.log('🚀 Starting Road-Snapping Movement Simulation...');

  // Wipe old locations so we start fresh at terminals!
  await pool.query('TRUNCATE TABLE bus_locations RESTART IDENTITY');
  console.log('🧹 Cleared all old bus locations. Starting fresh at terminals...');

  const API_KEY = process.env.GOOGLE_MAPS_API_KEY;

  if (!API_KEY) {
    console.error('❌ Missing GOOGLE_MAPS_API_KEY in .env!');
    process.exit(1);
  }

  // 1. Fetch all routes and their stops
  const routesRes = await pool.query(`
    SELECT route_id, latitude as lat, longitude as lon, stop_order
    FROM route_stops
    ORDER BY route_id, stop_order ASC
  `);

  const rawRoutePaths = {};
  routesRes.rows.forEach(row => {
    if (!rawRoutePaths[row.route_id]) rawRoutePaths[row.route_id] = [];
    rawRoutePaths[row.route_id].push({ lat: parseFloat(row.lat), lon: parseFloat(row.lon) });
  });

  // 2. Use high-res GOOGLE ROADS path to strict-follow actual asphalt!
  const snappedRoutePaths = {};
  const axios = require('axios');

  for (const routeId of Object.keys(rawRoutePaths)) {
    console.log(`🛣  Fetching real-life road markers from Google for Route ID: ${routeId}...`);
    const stops = rawRoutePaths[routeId];
    if (stops.length < 2) continue;

    try {
      // Find the Route Number to see if it's an expressway!
      const routeRes = await pool.query('SELECT route_number FROM routes WHERE route_id = $1', [routeId]);
      const routeNum = routeRes.rows[0]?.route_number || "";
      const isExpressway = routeNum.startsWith("EX-");

      const origin = `${stops[0].lat},${stops[0].lon}`;
      const destination = `${stops[stops.length - 1].lat},${stops[stops.length - 1].lon}`;
      const waypoints = stops.slice(1, -1).map(s => `${s.lat},${s.lon}`).join('|');

      const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}&waypoints=optimize:true|${waypoints}&avoid=${isExpressway ? '' : 'highways'}&key=${API_KEY}`;
      const response = await axios.get(url);

      if (response.data.status === 'OK') {
        const points = [];
        const legs = response.data.routes[0].legs;
        for (let leg of legs) {
          for (let step of leg.steps) {
            const decoded = decodePolyline(step.polyline.points);
            points.push(...decoded);
          }
        }
        snappedRoutePaths[routeId] = points;
        console.log(`✅ Road-snapped path generated for Route ${routeNum} (${points.length} points).`);
      } else {
        throw new Error(response.data.status);
      }
      // Small pause to be nice to API limits
      await new Promise(r => setTimeout(r, 200));
    } catch (err) {
      console.warn(`⚠️  Google Roads failed for Route ${routeId}, falling back to linear:`, err.message);
      // Fallback to linear if API fails
      const interpolatedPath = [];
      for (let i = 0; i < stops.length - 1; i++) {
        const start = stops[i];
        const end = stops[i + 1];
        for (let step = 0; step < 200; step++) {
          const t = step / 200;
          interpolatedPath.push({ lat: start.lat + (end.lat - start.lat) * t, lon: start.lon + (end.lon - start.lon) * t });
        }
      }
      snappedRoutePaths[routeId] = interpolatedPath;
    }
  }
  console.log(`✅ ALL simulation paths successfully road-snapped.`);

  // 3. Fetch buses and strictly force them to start from the beginning!
  const busesRes = await pool.query(`
    SELECT DISTINCT ON (b.bus_id) 
           b.bus_id, s.route_id, r.estimated_duration
    FROM buses b
    JOIN bus_schedules s ON b.bus_id = s.bus_id
    JOIN routes r ON s.route_id = r.route_id
  `);

  const buses = busesRes.rows.filter(b => snappedRoutePaths[b.route_id]);

  // 4. Initialize all buses at the beginning of their specific paths
  const busStates = buses.map(bus => {
    const originalPoints = snappedRoutePaths[bus.route_id];

    // Balance the fleet: Even route IDs start at the end city and move toward Colombo
    const shouldStartReverse = (bus.route_id % 2 === 0);
    const initialPath = shouldStartReverse ? [...originalPoints].reverse() : originalPoints;

    const calculateCumulative = (p) => {
      let total = 0;
      const dists = [0];
      for (let i = 1; i < p.length; i++) {
        total += calculateDistance(p[i - 1].lat, p[i - 1].lon, p[i].lat, p[i].lon) * 1000;
        dists.push(total);
      }
      return { total, dists };
    };

    const { total, dists } = calculateCumulative(initialPath);
    const durationSeconds = (parseFloat(bus.estimated_duration) || 2) * 3600; 

    return {
      id: bus.bus_id,
      routeId: bus.route_id,
      path: initialPath,
      cumulativeDistances: dists,
      totalRouteMeters: total,
      currentMeters: 0,
      waitTime: 0,
      mps: total / durationSeconds,
      isReturning: shouldStartReverse,
      jitter: { 
        lat: (Math.random() - 0.5) * 0.0001, 
        lon: (Math.random() - 0.5) * 0.0001 
      }
    };
  });

  console.log(`📡 Simulating ${busStates.length} buses (Auto-Return Enabled) at realistic speeds...`);

  let lastUpdate = Date.now();
  let lastCleanup = Date.now();

  async function updateMovement() {
    const now = Date.now();
    const deltaTime = (now - lastUpdate) / 1000;
    lastUpdate = now;

    if (deltaTime <= 0) return;

    // Purge old location data every 5 minutes
    if (now - lastCleanup > 300000) {
      await pool.query("DELETE FROM bus_locations WHERE recorded_at < NOW() - INTERVAL '5 minutes'");
      lastCleanup = now;
    }

    for (const bus of busStates) {
      if (bus.waitTime > 0) {
        bus.waitTime -= deltaTime;
        continue;
      }

      // Move the bus
      bus.currentMeters += bus.mps * deltaTime;

      // TERMINAL LOGIC: If reached the end, wait, then turn around!
      if (bus.currentMeters >= bus.totalRouteMeters) {
        bus.currentMeters = bus.totalRouteMeters;
        bus.waitTime = 30; // Wait 30 seconds at the terminal
        
        // REVERSE THE PATH FOR THE RETURN TRIP
        bus.path = [...bus.path].reverse();
        const nextData = (() => {
          let total = 0;
          const dists = [0];
          for (let i = 1; i < bus.path.length; i++) {
            total += calculateDistance(bus.path[i - 1].lat, bus.path[i - 1].lon, bus.path[i].lat, bus.path[i].lon) * 1000;
            dists.push(total);
          }
          return { total, dists };
        })();

        bus.cumulativeDistances = nextData.dists;
        bus.totalRouteMeters = nextData.total;
        bus.currentMeters = 0;
        bus.isReturning = !bus.isReturning;
        
        console.log(`🔄 Bus ${bus.id} turning around at terminal for ${bus.isReturning ? 'Reverse' : 'Forward'} trip.`);
        continue;
      }

      // Find current position on path
      let foundIndex = 0;
      while (foundIndex < bus.cumulativeDistances.length - 1 && bus.cumulativeDistances[foundIndex + 1] < bus.currentMeters) {
        foundIndex++;
      }

      const currentPoint = bus.path[foundIndex];
      const nextPoint = bus.path[Math.min(foundIndex + 1, bus.path.length - 1)];

      const segStartDist = bus.cumulativeDistances[foundIndex];
      const segEndDist = bus.cumulativeDistances[foundIndex + 1];
      const segmentLen = segEndDist - segStartDist;
      const t = segmentLen > 0 ? (bus.currentMeters - segStartDist) / segmentLen : 0;

      const lat = currentPoint.lat + (nextPoint.lat - currentPoint.lat) * t + bus.jitter.lat;
      const lon = currentPoint.lon + (nextPoint.lon - currentPoint.lon) * t + bus.jitter.lon;

      const heading = (Math.atan2(nextPoint.lon - currentPoint.lon, nextPoint.lat - currentPoint.lat) * 180 / Math.PI) || 0;
      const speedKph = (bus.mps * 3.6);

      await pool.query(
        `INSERT INTO bus_locations (bus_id, latitude, longitude, speed, recorded_at, heading)
         VALUES ($1, $2, $3, $4, NOW(), $5)`,
        [bus.id, lat.toFixed(8), lon.toFixed(8), speedKph, heading]
      );
    }
    console.log(`🚀 [${new Date().toLocaleTimeString()}] Simulation sync: Delta ${deltaTime.toFixed(3)}s`);
  }

  setInterval(updateMovement, 1000);
  updateMovement();
}

simulate().catch(err => console.error('❌ Simulation Error:', err));
