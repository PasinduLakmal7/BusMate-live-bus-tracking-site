/**
 * @param {import("knex").Knex} knex
 */
exports.seed = async function (knex) {

  await knex.raw('TRUNCATE TABLE driving_licenses RESTART IDENTITY CASCADE');

  const licenses = [];

  for (let i = 1; i <= 51; i++) {
    licenses.push({
      driver_id: i, // linked to drivers 1-25
      license_number: `B${1000000 + i}`,
      expiry_date: new Date(2028, i % 12, (i % 28) + 1), // realistic expiry dates
      photo_url: `https://example.com/license-photos/driver-${i}.jpg`,
      verified_status: true, // all current drivers are verified
      created_at: new Date()
    });
  }

  await knex('driving_licenses').insert(licenses);
};

