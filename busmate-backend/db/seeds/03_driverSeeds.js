const bcrypt = require('bcrypt');

/**
 * @param {import("knex").Knex} knex
 */
exports.seed = async function (knex) {

  await knex.raw('TRUNCATE TABLE drivers RESTART IDENTITY CASCADE');

  const names = [
    'Amila Perera', 'Sunil Jayawardena', 'Nimal Silva', 'Kamal Gunaratne', 'Saman Kumara',
    'Chathura Weerasinghe', 'Kasun Rajapaksha', 'Dinesh Fernando', 'Ruwan Priyantha', 'Thushara Bandara',
    'Ajith Rohana', 'Susil Premajayantha', 'Namal Rajapaksa', 'Mahinda Perera', 'Indika Silva',
    'Lasantha Wickrematunge', 'Prasanna Ranatunga', 'Kanchana Wijesekera', 'Wimal Weerawansa', 'Patali Champika',
    'Sajith Premadasa', 'Anura Dissanayake', 'Ranil Wickremesinghe', 'Gotabaya Rajapaksa', 'Maithripala Sirisena'
  ];

  const passwordHash = await bcrypt.hash('password123', 10);

  const drivers = names.map((name, i) => ({
    full_name: name,
    phone: `077${(1000000 + i).toString()}`,
    nic: `${1970 + i}1234567${i % 10}`,
    photo_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`,
    password_hash: passwordHash,
    created_at: new Date()
  }));

  await knex('drivers').insert(drivers);
};

