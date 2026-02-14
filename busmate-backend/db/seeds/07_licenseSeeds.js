/**
 * @param {import("knex").Knex} knex
 */
exports.seed = async function (knex) {

  await knex('driving_licenses').del();

  const licenses = [];

  for (let i = 1; i <= 25; i++) {
    licenses.push({
      driver_id: i, // assumes driver_id 1–25 exist
      license_number: `B${2020 + i}${i.toString().padStart(4, '0')}`,
      expiry_date: new Date(2028, i % 12, (i % 28) + 1), // future expiry dates
      photo_url: `https://example.com/license${i}.jpg`,
      verified_status: i % 4 === 0, // every 4th license verified
      created_at: new Date()
    });
  }

  await knex('driving_licenses').insert(licenses);
};
