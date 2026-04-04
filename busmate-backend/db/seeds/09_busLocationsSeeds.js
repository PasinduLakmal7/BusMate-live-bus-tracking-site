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
    await knex('bus_locations').insert(locations);
    console.log(`✅ Successfully seeded ${locations.length} bus starting locations at their terminals.`);
  }
};

