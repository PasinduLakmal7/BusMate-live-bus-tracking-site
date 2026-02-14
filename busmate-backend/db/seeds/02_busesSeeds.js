/**
 * @param {import("knex").Knex} knex
 */
exports.seed = async function (knex) {

  // Delete existing entries
  await knex('buses').del();

  const buses = [];

  for (let i = 1; i <= 25; i++) {
    buses.push({
      bus_number: `NB-${1000 + i}`,
      bus_type: i % 2 === 0 ? 'Normal' : 'Luxury',
      depot_id: (i % 5) + 1, // assumes you have depot_id 1–5 in depot_companies
      created_at: new Date()
    });
  }

  await knex('buses').insert(buses);
};
