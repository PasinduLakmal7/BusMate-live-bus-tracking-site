/**
 * @param {import("knex").Knex} knex
 */
exports.seed = async function (knex) {

  await knex('conductors').del();

  const conductors = [];

  for (let i = 1; i <= 25; i++) {
    conductors.push({
      full_name: `Conductor ${i}`,
      nic: `1995${i.toString().padStart(2, '0')}56789${i}`,
      phone: `07150000${i.toString().padStart(2, '0')}`,
      photo_url: `https://example.com/conductor${i}.jpg`,
      status: i % 5 === 0 ? 'inactive' : 'active',
      created_at: new Date()
    });
  }

  await knex('conductors').insert(conductors);
};
