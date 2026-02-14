/**
 * @param {import("knex").Knex} knex
 */
exports.seed = async function (knex) {

  // Delete existing entries
  await knex('bus_locations').del();

  const locations = [];

  for (let i = 1; i <= 25; i++) {
    locations.push({
      bus_id: ((i - 1) % 25) + 1, // assumes bus_id 1–25 exist
      latitude: (6.9000 + (i * 0.001)).toFixed(8),   // Colombo area variation
      longitude: (79.8500 + (i * 0.001)).toFixed(8),
      speed: Math.floor(Math.random() * 60), // random speed 0–59 km/h
      recorded_at: new Date()
    });
  }

  await knex('bus_locations').insert(locations);
};
