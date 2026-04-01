const bcrypt = require('bcrypt');

/**
 * @param {import("knex").Knex} knex
 */
exports.seed = async function (knex) {

  await knex.raw('TRUNCATE TABLE pending_registrations RESTART IDENTITY CASCADE');

  const passwordHash = await bcrypt.hash('password123', 10);

  const pending = [];

  const names = ['Lakshan Sandaruwan', 'Manoj Perera', 'Nuwan Chamara', 'Sahan Vithanage', 'Dilan De Silva'];
  const routes = [
    { num: '138', name: 'Maharagama - Fort' },
    { num: '120', name: 'Horana - Fort' },
    { num: '154', name: 'Kiribathgoda - Angulana' },
    { num: '01', name: 'Colombo - Kandy' },
    { num: '122', name: 'Avissawella - Fort' }
  ];

  for (let i = 1; i <= 10; i++) {
    const name = names[(i - 1) % names.length];
    const route = routes[(i - 1) % routes.length];

    pending.push({
      // Driver Info
      full_name: `${name} ${i}`,
      phone: `0759${(100000 + i).toString()}`,
      nic: `199${(i % 10)}12345678`,
      email: `driver${i}@example.com`,
      password_hash: passwordHash,
      driver_photo_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`,

      // License Info
      license_number: `DL${20000 + i}`,
      license_expiry: new Date(2027, i % 12, (i % 28) + 1),
      license_photo_url: `https://example.com/license_pending${i}.jpg`,

      // Bus Info
      bus_number: `WP NB-${5000 + i}`,
      bus_type: i % 2 === 0 ? 'Normal' : 'Luxury',
      depot_name: `Maharagama Depot`,

      // Conductor Info
      conductor_name: `Conductor ${name}`,
      conductor_nic: `199${(i % 10)}87654321`,
      conductor_phone: `0708${(100000 + i).toString()}`,
      conductor_photo_url: `https://ui-avatars.com/api/?name=Conductor+${encodeURIComponent(name)}&background=random`,

      // Route Info
      route_number: route.num,
      route_name: route.name,

      // Trips (JSON)
      trips_json: JSON.stringify([
        { trip_no: 1, start_time: "06:00:00", end_time: "08:00:00" },
        { trip_no: 2, start_time: "12:00:00", end_time: "14:00:00" }
      ]),

      status: i % 3 === 0 ? 'approved' : 'pending',
      created_at: new Date()
    });
  }


  await knex('pending_registrations').insert(pending);
};
