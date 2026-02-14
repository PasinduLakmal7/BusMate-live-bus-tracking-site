/**
 * @param {import("knex").Knex} knex
 */
exports.seed = async function (knex) {

  await knex('depot_companies').del();

  const depots = [];

  for (let i = 1; i <= 25; i++) {
    depots.push({
      name: `Depot Company ${i}`,
      address: `No. ${i}, Main Road, Colombo ${i}`,
      contact_number: `0113000${i.toString().padStart(2, '0')}`,
      created_at: new Date()
    });
  }

  await knex('depot_companies').insert(depots);
};
