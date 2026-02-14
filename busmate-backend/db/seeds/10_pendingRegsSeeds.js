const bcrypt = require('bcrypt');

/**
 * @param {import("knex").Knex} knex
 */
exports.seed = async function (knex) {

  await knex('pending_registrations').del();

  const passwordHash = await bcrypt.hash('password123', 10);

  const pending = [];

  for (let i = 1; i <= 25; i++) {

    pending.push({
      // Driver Info
      full_name: `Pending Driver ${i}`,
      phone: `07590000${i.toString().padStart(2, '0')}`,
      nic: `1993${i.toString().padStart(2, '0')}45678${i}`,
      password_hash: passwordHash,
      driver_photo_url: `https://example.com/pending_driver${i}.jpg`,

      // License Info
      license_number: `DL202${i}${i.toString().padStart(3, '0')}`,
      license_expiry: new Date(2027, i % 12, (i % 28) + 1),
      license_photo_url: `https://example.com/license_pending${i}.jpg`,

      // Bus Info
      bus_number: `PB-${2000 + i}`,
      bus_type: i % 2 === 0 ? 'Normal' : 'Luxury',
      depot_name: `Depot Company ${(i % 5) + 1}`,

      // Conductor Info
      conductor_name: `Pending Conductor ${i}`,
      conductor_nic: `1994${i.toString().padStart(2, '0')}78901${i}`,
      conductor_phone: `07080000${i.toString().padStart(2, '0')}`,
      conductor_photo_url: `https://example.com/pending_conductor${i}.jpg`,

      // Route Info
      route_number: `R${(i % 10) + 1}`,
      route_name: `Route ${(i % 10) + 1} - Colombo to Galle`,

      // Trips (JSON)
      trips_json: JSON.stringify([
        {
          trip_no: 1,
          start_time: "06:00:00",
          end_time: "08:00:00"
        },
        {
          trip_no: 2,
          start_time: "12:00:00",
          end_time: "14:00:00"
        }
      ]),

      status: i % 6 === 0 ? 'approved' : 'pending',

      created_at: new Date()
    });
  }

  await knex('pending_registrations').insert(pending);
};
