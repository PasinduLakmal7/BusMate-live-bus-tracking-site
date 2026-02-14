const bcrypt = require('bcrypt');

/**
 * @param {import("knex").Knex} knex
 */
exports.seed = async function (knex) {

  await knex('drivers').del();

  // Use a fixed hash for speed/consistency in seeds
  const passwordHash = await bcrypt.hash('password123', 10);

  const drivers = [];

  for (let i = 1; i <= 25; i++) {
    drivers.push({
      full_name: `Driver ${i}`,
      phone: `07700000${i.toString().padStart(2, '0')}`,
      nic: `1990${i.toString().padStart(2, '0')}12345${i}`,
      photo_url: `https://example.com/driver${i}.jpg`,
      password_hash: passwordHash,
      created_at: new Date()
    });
  }

  await knex('drivers').insert(drivers);
};
