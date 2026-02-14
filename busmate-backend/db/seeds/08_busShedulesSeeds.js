/**
 * @param {import("knex").Knex} knex
 */
exports.seed = async function (knex) {

  await knex('bus_schedules').del();

  const schedules = [];

  for (let i = 1; i <= 50; i++) {

    const tripNumber = ((i - 1) % 5) + 1; // 5 trips per bus

    schedules.push({
      bus_id: ((i - 1) % 25) + 1,        // assumes 25 buses
      route_id: ((i - 1) % 10) + 1,      // assumes 10 routes
      driver_id: ((i - 1) % 25) + 1,     // assumes 25 drivers
      conductor_id: ((i - 1) % 25) + 1,  // assumes 25 conductors
      trip_no: tripNumber,
      start_time: `${6 + tripNumber}:00:00`,
      end_time: `${7 + tripNumber}:30:00`,
      created_at: new Date()
    });
  }

  await knex('bus_schedules').insert(schedules);
};
