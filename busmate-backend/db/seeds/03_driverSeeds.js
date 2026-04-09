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
    'Sajith Premadasa', 'Anura Dissanayake', 'Ranil Wickremesinghe', 'Gotabaya Rajapaksa', 'Maithripala Sirisena',
    'Palitha Kohona', 'Dayasiri Jayasekara', 'Bandula Gunawardana', 'Nimal Siripala', 'John Amaratunga',
    'Ravi Karunanayake', 'Mangala Samaraweera', 'Dullas Alahapperuma', 'Wimal Weerawansa', 'Vidura Wickremanayake',
    'Roshan Ranasinghe', 'Dilum Amunugama', 'Lohan Ratwatte', 'Shehan Semasinghe', 'Janaka Wakkumbura',
    'Kanaka Herath', 'Thenuka Vidanagamage', 'Piyal Nishantha', 'Sisira Jayakody', 'Priyankara Jayaratne',
    'D.V. Chanaka', 'Indika Anuruddha', 'Siripala de Silva', 'A.L.M. Athaullah', 'Douglas Devananda'
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

  // INJECT: Demo Driver for Katubedda Testing
  drivers.push({
    full_name: 'Demo Driver (Katubedda)',
    phone: '0712345678',
    nic: '199512345678',
    photo_url: 'https://ui-avatars.com/api/?name=Demo&background=020617&color=ffffff',
    password_hash: passwordHash,
    created_at: new Date()
  });

  await knex('drivers').insert(drivers);
};

