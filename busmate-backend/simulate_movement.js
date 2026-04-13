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
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Linear interpolation fallback for a list of stops
function linearInterpolate(stops) {
  const path = [];
  for (let i = 0; i < stops.length - 1; i++) {
    const start = stops[i];
    const end = stops[i + 1];
    for (let step = 0; step < 200; step++) {
      const t = step / 200;
      path.push({
        lat: start.lat + (end.lat - start.lat) * t,
        lon: start.lon + (end.lon - start.lon) * t
      });
    }
  }
  return path;
}

let simulationStarted = false;

async function simulate(io = null) {
  if (simulationStarted) return;
  simulationStarted = true;

  console.log('🚀 Starting Bus Movement Simulation...');

  // Wipe old locations so we start fresh at terminals
  await pool.query('TRUNCATE TABLE bus_locations RESTART IDENTITY');
  console.log('🧹 Cleared old bus locations. Starting fresh at route terminals...');

  const API_KEY = process.env.GOOGLE_MAPS_API_KEY;
  const useGoogleAPI = !!API_KEY;

  if (!useGoogleAPI) {
    console.warn('⚠️  No GOOGLE_MAPS_API_KEY — using linear interpolation for all routes (buses still move realistically).');
  }

  // 1. Fetch all route stops
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

  // 2. Build snapped paths (Google API or fallback)
  const snappedRoutePaths = {};

  if (useGoogleAPI) {
    const axios = require('axios');
    for (const routeId of Object.keys(rawRoutePaths)) {
      const stops = rawRoutePaths[routeId];
      if (stops.length < 2) continue;
      try {
        const routeRes = await pool.query('SELECT route_number FROM routes WHERE route_id = $1', [routeId]);
        const routeNum = routeRes.rows[0] ? routeRes.rows[0].route_number : '';
        const isExpressway = routeNum.startsWith('EX-');

        const origin = stops[0].lat + ',' + stops[0].lon;
        const destination = stops[stops.length - 1].lat + ',' + stops[stops.length - 1].lon;
        let waypointsArr = stops.slice(1, -1);
        if (waypointsArr.length > 20) {
          // Downsample to max 20 waypoints to avoid Google API MAX_WAYPOINTS_EXCEEDED
          const step = waypointsArr.length / 20;
          waypointsArr = Array.from({length: 20}, (_, i) => waypointsArr[Math.floor(i * step)]);
        }
        const waypoints = waypointsArr.map(s => s.lat + ',' + s.lon).join('|');

        const url = 'https://maps.googleapis.com/maps/api/directions/json' +
          '?origin=' + origin +
          '&destination=' + destination +
          '&waypoints=optimize:true|' + waypoints +
          '&avoid=' + (isExpressway ? '' : 'highways') +
          '&key=' + API_KEY;

        const response = await axios.get(url);

        if (response.data.status === 'OK') {
          const points = [];
          const legs = response.data.routes[0].legs;
          for (const leg of legs) {
            for (const step of leg.steps) {
              points.push(...decodePolyline(step.polyline.points));
            }
          }
          snappedRoutePaths[routeId] = points;
          console.log('✅ Road-snapped Route ' + routeNum + ' (' + points.length + ' points)');
        } else {
          throw new Error(response.data.status);
        }
        await new Promise(r => setTimeout(r, 200));
      } catch (err) {
        console.warn('⚠️  Google API failed for route ' + routeId + ', using fallback:', err.message);
        snappedRoutePaths[routeId] = linearInterpolate(rawRoutePaths[routeId]);
      }
    }
  } else {
    // No API key — use linear interpolation for all routes
    for (const routeId of Object.keys(rawRoutePaths)) {
      const stops = rawRoutePaths[routeId];
      if (stops.length < 2) continue;
      snappedRoutePaths[routeId] = linearInterpolate(stops);
    }
  }

  console.log('✅ All simulation paths ready (' + Object.keys(snappedRoutePaths).length + ' routes).');

  // 3. Fetch buses with their assigned routes
  const busesRes = await pool.query(`
    SELECT DISTINCT ON (b.bus_id)
           b.bus_id, b.bus_number, s.route_id, r.estimated_duration
    FROM buses b
    JOIN bus_schedules s ON b.bus_id = s.bus_id
    JOIN routes r ON s.route_id = r.route_id
  `);

  const buses = busesRes.rows.filter(b => snappedRoutePaths[b.route_id]);

  // 4. Initialize bus states
  const busStates = buses.map(bus => {
    const originalPoints = snappedRoutePaths[bus.route_id];
    const shouldStartReverse = (bus.route_id % 2 === 0);
    const initialPath = shouldStartReverse ? [...originalPoints].reverse() : originalPoints;

    let total = 0;
    const dists = [0];
    for (let i = 1; i < initialPath.length; i++) {
      total += calculateDistance(initialPath[i - 1].lat, initialPath[i - 1].lon, initialPath[i].lat, initialPath[i].lon) * 1000;
      dists.push(total);
    }

    const durationSeconds = (parseFloat(bus.estimated_duration) || 2) * 3600;

    return {
      id: bus.bus_id,
      busNumber: bus.bus_number,
      routeId: bus.route_id,
      path: initialPath,
      cumulativeDistances: dists,
      totalRouteMeters: total,
      currentMeters: Math.random() * total, // stagger starting positions
      waitTime: 0,
      mps: (total / durationSeconds) * 30, // DEMO MODE: 30x faster
      isReturning: shouldStartReverse,
      jitter: {
        lat: (Math.random() - 0.5) * 0.0001,
        lon: (Math.random() - 0.5) * 0.0001
      }
    };
  });

  // ▬▬ DEMO OVERRIDE 1: Teleport one Route 100 bus to Rawathawaththa ▬▬
  const demoBus100 = busStates.find(b => String(b.routeId) === '14'); 
  if (demoBus100) {
    console.log(`📡 DEMO: Teleporting Bus ${demoBus100.busNumber} to Rawathawaththa (Heading to Pettah)...`);
    demoBus100.currentMeters = demoBus100.totalRouteMeters * 0.22; 
    demoBus100.isReturning = false; 
  }

  // ▬▬ DEMO OVERRIDE 2: Teleport one Route 101 bus to Galkissa ▬▬
  const demoBus101 = busStates.find(b => String(b.routeId) === '15'); 
  if (demoBus101) {
    console.log(`📡 DEMO: Teleporting Bus ${demoBus101.busNumber} to Galkissa (Heading to Moratuwa)...`);
    // In return mode (Pettah -> Moratuwa), Galkissa is about 65% in
    demoBus101.currentMeters = demoBus101.totalRouteMeters * 0.65; 
    demoBus101.isReturning = true; 
  }

  // ▬▬ DEMO OVERRIDE 3: Teleport one Route 255 bus to Piliyandala (Heading to Mount Lavinia) ▬▬
  const demoBus255 = busStates.find(b => String(b.routeId) === '13'); 
  if (demoBus255) {
    console.log(`📡 DEMO: Teleporting Bus ${demoBus255.busNumber} to Piliyandala (Heading to Mount Lavinia)...`);
    // Piliyandala is about 20% along the path starting from Kottawa (Return trip)
    demoBus255.currentMeters = demoBus255.totalRouteMeters * 0.20; 
    demoBus255.isReturning = true; 
    // Ensure the path is reversed for this bus
    demoBus255.path = [...snappedRoutePaths[demoBus255.routeId]].reverse();
  }

  console.log('📡 Simulating ' + busStates.length + ' buses at realistic speeds...');

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

      bus.currentMeters += bus.mps * deltaTime;

      // Terminal logic: reached end, wait then reverse
      if (bus.currentMeters >= bus.totalRouteMeters) {
        bus.currentMeters = bus.totalRouteMeters;
        bus.waitTime = 30;

        bus.path = [...bus.path].reverse();

        let total = 0;
        const dists = [0];
        for (let i = 1; i < bus.path.length; i++) {
          total += calculateDistance(bus.path[i - 1].lat, bus.path[i - 1].lon, bus.path[i].lat, bus.path[i].lon) * 1000;
          dists.push(total);
        }

        bus.cumulativeDistances = dists;
        bus.totalRouteMeters = total;
        bus.currentMeters = 0;
        bus.isReturning = !bus.isReturning;
        continue;
      }

      // Find current position via binary search on cumulative distances
      let foundIndex = 0;
      while (foundIndex < bus.cumulativeDistances.length - 1 && bus.cumulativeDistances[foundIndex + 1] < bus.currentMeters) {
        foundIndex++;
      }

      const currentPoint = bus.path[foundIndex];
      const nextPoint = bus.path[Math.min(foundIndex + 1, bus.path.length - 1)];

      const segStartDist = bus.cumulativeDistances[foundIndex];
      const segEndDist = bus.cumulativeDistances[Math.min(foundIndex + 1, bus.cumulativeDistances.length - 1)];
      const segmentLen = segEndDist - segStartDist;
      const t = segmentLen > 0 ? (bus.currentMeters - segStartDist) / segmentLen : 0;

      const lat = currentPoint.lat + (nextPoint.lat - currentPoint.lat) * t + bus.jitter.lat;
      const lon = currentPoint.lon + (nextPoint.lon - currentPoint.lon) * t + bus.jitter.lon;
      const heading = (Math.atan2(nextPoint.lon - currentPoint.lon, nextPoint.lat - currentPoint.lat) * 180 / Math.PI) || 0;
      // Clamp displayed speed to look like a realistic bus (40-60 km/h range) while moving fast
      const baseRealSpeedForUI = (bus.mps / 30) * 3.6; // Get original real speed back
      const speedKph = Math.max(25, Math.min(80, baseRealSpeedForUI + (Math.random() * 5)));

      await pool.query(
        'INSERT INTO bus_locations (bus_id, latitude, longitude, speed, recorded_at, heading, is_returning) VALUES ($1, $2, $3, $4, NOW(), $5, $6)',
        [bus.id, lat.toFixed(8), lon.toFixed(8), speedKph.toFixed(1), heading.toFixed(2), bus.isReturning || false]
      );

      // Broadcast to socket
      if (io) {
        const payload = {
          id: bus.id,
          busId: bus.busNumber,
          routeId: bus.routeId,
          lat,
          lon,
          speed: speedKph,
          heading,
          isReturning: bus.isReturning || false,
          ts: new Date().toISOString()
        };
        io.to('route:' + bus.routeId).emit('bus:location', payload);
        io.to('admin').emit('bus:location', payload);
      }
    }
  }

  setInterval(updateMovement, 1000);
  updateMovement();
}

// Allow calling either via 'node simulate_movement.js' OR as a module in server.js
if (require.main === module) {
  simulate().catch(err => console.error('❌ Simulation Error:', err));
}

module.exports = simulate;
