/**
 * @param {import("knex").Knex} knex
 */
exports.seed = async function (knex) {

  await knex.raw('TRUNCATE TABLE bus_schedules RESTART IDENTITY CASCADE');

  const schedules = [];

  // Generate schedules for all 12 routes
  // 12 routes, 1 bus per route = 12 buses total used
  for (let routeId = 1; routeId <= 12; routeId++) {
    const busId = routeId; // Bus 1 -> Route 1, Bus 2 -> Route 2, etc.
    const driverId = busId;
    const conductorId = busId;

    // Each bus does 2 round trips (4 total trips) 
    const startHours = [6, 14];
    
    startHours.forEach((hour, tripIdx) => {
      // Outward trip
      schedules.push({
        bus_id: busId,
        route_id: routeId,
        driver_id: driverId,
        conductor_id: conductorId,
        trip_no: (tripIdx * 2) + 1,
        start_time: `${hour}:00:00`,
        end_time: `${hour + 4}:00:00`,
        created_at: new Date()
      });

      // Inward trip
      schedules.push({
        bus_id: busId,
        route_id: routeId,
        driver_id: driverId,
        conductor_id: conductorId,
        trip_no: (tripIdx * 2) + 2,
        start_time: `${hour + 5}:00:00`,
        end_time: `${hour + 9}:00:00`,
        created_at: new Date()
      });
    });
  }

  await knex('bus_schedules').insert(schedules);
};

