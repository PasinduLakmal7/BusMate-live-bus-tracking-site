/**
 * @param {import("knex").Knex} knex
 */
exports.seed = async function (knex) {

  // Clear old locations
  await knex.raw('TRUNCATE TABLE bus_locations RESTART IDENTITY CASCADE');

  // 1. Fetch buses and their assigned routes from schedules
  const busesWithRoutes = await knex('buses')
    .join('bus_schedules', 'buses.bus_id', 'bus_schedules.bus_id')
    .distinctOn('buses.bus_id')
    .select('buses.bus_id', 'bus_schedules.route_id');

  if (busesWithRoutes.length === 0) {
    console.warn('⚠️ No bus schedules found. Please seed schedules first!');
    return;
  }

  const locations = [];

  for (const bus of busesWithRoutes) {
    // 2. Fetch the very first stop for this route to use as terminal starting location
    const firstStop = await knex('route_stops')
      .where('route_id', bus.route_id)
      .orderBy('stop_order', 'asc')
      .first();

    if (firstStop) {
      locations.push({
        bus_id: bus.bus_id,
        latitude: firstStop.latitude,
        longitude: firstStop.longitude,
        speed: 0, // Initially stopped at terminal
        recorded_at: new Date(),
        heading: 0
      });
    }
  }

  if (locations.length > 0) {
    // Colombo District zone distribution
    // Each zone has a center lat/lng and a small random spread
    const zones = [
      // Near demo area (you) - 22 buses
      { lat: 6.776, lng: 79.882, spread: 0.015, count: 6, label: 'Moratuwa' },
      { lat: 6.799, lng: 79.923, spread: 0.015, count: 6, label: 'Piliyandala' },
      { lat: 6.820, lng: 79.896, spread: 0.012, count: 4, label: 'Katubedda-Ratmalana' },
      { lat: 6.758, lng: 79.895, spread: 0.012, count: 3, label: 'Horana-Panadura Road' },
      { lat: 6.798, lng: 79.952, spread: 0.012, count: 3, label: 'Kesbewa' },
      // Colombo city core - 8 buses
      { lat: 6.935, lng: 79.850, spread: 0.010, count: 2, label: 'Pettah-Fort' },
      { lat: 6.895, lng: 79.852, spread: 0.010, count: 2, label: 'Kollupitiya' },
      { lat: 6.919, lng: 79.876, spread: 0.010, count: 4, label: 'Borella' },
      // Southern suburbs - 8 buses
      { lat: 6.852, lng: 79.863, spread: 0.012, count: 2, label: 'Dehiwala' },
      { lat: 6.836, lng: 79.863, spread: 0.010, count: 2, label: 'Mount Lavinia' },
      { lat: 6.868, lng: 79.888, spread: 0.012, count: 4, label: 'Nugegoda' },
      // Eastern suburbs - 8 buses
      { lat: 6.906, lng: 79.914, spread: 0.012, count: 2, label: 'Battaramulla' },
      { lat: 6.848, lng: 79.926, spread: 0.012, count: 3, label: 'Maharagama' },
      { lat: 6.934, lng: 79.990, spread: 0.015, count: 3, label: 'Kaduwela' },
      // Northern suburbs - 6 buses
      { lat: 6.972, lng: 79.919, spread: 0.015, count: 3, label: 'Kelaniya' },
      { lat: 7.010, lng: 79.975, spread: 0.015, count: 3, label: 'Kiribathgoda' },
      // Intercity (Kandy, Galle, Badulla) - 3 buses
      { lat: 7.290, lng: 80.634, spread: 0.010, count: 1, label: 'Kandy' },
      { lat: 6.033, lng: 80.216, spread: 0.010, count: 1, label: 'Galle' },
      { lat: 6.993, lng: 81.055, spread: 0.010, count: 1, label: 'Badulla' },
    ];

    // Assign each bus to a zone in order
    let zoneIndex = 0;
    let zoneCount = 0;
    
    // Coordinates for specific request
    const katubeddaJunction = { lat: 6.791, lng: 79.882 };
    const piliyandala = { lat: 6.801, lng: 79.922 };
    let route13Count = 0;

    busesWithRoutes.forEach((bus) => {
      // SPECIAL CASE: Force Route 13 (Bus 255) to specific locations
      if (String(bus.route_id) === '13') {
        const dest = route13Count === 0 ? katubeddaJunction : piliyandala;
        locations.push({
          bus_id: bus.bus_id,
          latitude: dest.lat,
          longitude: dest.lng,
          speed: 15,
          recorded_at: new Date(),
          heading: route13Count === 0 ? 90 : 270 // Different headings for variety
        });
        route13Count++;
        return;
      }

      const zone = zones[zoneIndex];
      const lat = zone.lat + (Math.random() - 0.5) * zone.spread;
      const lng = zone.lng + (Math.random() - 0.5) * zone.spread;

      locations.push({
        bus_id: bus.bus_id,
        latitude: lat,
        longitude: lng,
        speed: 10 + Math.floor(Math.random() * 40),
        recorded_at: new Date(),
        heading: Math.floor(Math.random() * 360)
      });

      zoneCount++;
      if (zoneCount >= zone.count) {
        zoneIndex = Math.min(zoneIndex + 1, zones.length - 1);
        zoneCount = 0;
      }
    });

    await knex('bus_locations').insert(locations);
    console.log(`✅ Seeded ${locations.length} buses across Colombo district zones.`);
  }
};

