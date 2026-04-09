/**
 * @param {import("knex").Knex} knex
 */
exports.seed = async function (knex) {

  await knex.raw('TRUNCATE TABLE bus_schedules RESTART IDENTITY CASCADE');

  const schedules = [];

  // Generate schedules for all 50 routes
  for (let routeId = 1; routeId <= 50; routeId++) {
    const busId = routeId; // Bus 1 -> Route 1, Bus 2 -> Route 2, etc.
    // If it's Route 100 (ID 14), assign our Demo Driver (ID 51)
    const driverId = (routeId === 14) ? 51 : (routeId <= 50 ? routeId : 1);
    const conductorId = (routeId <= 50 ? routeId : 1);

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

