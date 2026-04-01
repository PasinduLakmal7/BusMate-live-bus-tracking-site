/**
 * @param {import("knex").Knex} knex
 */
exports.seed = async function (knex) {

  await knex.raw('TRUNCATE TABLE bus_schedules RESTART IDENTITY CASCADE');

  const schedules = [];

  // Generate schedules for the first 5 routes (the ones with defined stops)
  // 5 routes, let's put 4 buses on each route = 20 buses total used
  for (let routeId = 1; routeId <= 5; routeId++) {
    for (let busOffset = 1; busOffset <= 4; busOffset++) {
      const busId = ((routeId - 1) * 4) + busOffset; // buses 1-20
      const driverId = busId;
      const conductorId = busId;

      // Each bus does 3 round trips (6 total trips)
      const startHours = [6, 12, 18];
      
      startHours.forEach((hour, tripIdx) => {
        // Outward trip
        schedules.push({
          bus_id: busId,
          route_id: routeId,
          driver_id: driverId,
          conductor_id: conductorId,
          trip_no: (tripIdx * 2) + 1,
          start_time: `${hour}:00:00`,
          end_time: `${hour + 2}:00:00`,
          created_at: new Date()
        });

        // Inward trip
        schedules.push({
          bus_id: busId,
          route_id: routeId,
          driver_id: driverId,
          conductor_id: conductorId,
          trip_no: (tripIdx * 2) + 2,
          start_time: `${hour + 3}:00:00`,
          end_time: `${hour + 5}:00:00`,
          created_at: new Date()
        });
      });
    }
  }

  await knex('bus_schedules').insert(schedules);
};

