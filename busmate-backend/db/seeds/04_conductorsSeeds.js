/**
 * @param {import("knex").Knex} knex
 */
exports.seed = async function (knex) {

  await knex.raw('TRUNCATE TABLE conductors RESTART IDENTITY CASCADE');

  const names = [
    'Upul Tharanga', 'Mahela Jayawardena', 'Kumar Sangakkara', 'Tillakaratne Dilshan', 'Angelo Mathews',
    'Lasith Malinga', 'Kusal Perera', 'Dhananjaya de Silva', 'Nuwan Kulasekara', 'Ajantha Mendis',
    'Rangana Herath', 'Chaminda Vaas', 'Muttiah Muralitharan', 'Sanath Jayasuriya', 'Arjuna Ranatunga',
    'Roshan Mahanama', 'Hashan Tillakaratne', 'Marvan Atapattu', 'Asanka Gurusinha', 'Rumesh Ratnayake',
    'Dhammika Prasad', 'Suranga Lakmal', 'Lahiru Kumara', 'Dushmantha Chameera', 'Wanindu Hasaranga',
    'Seekkuge Prasanna', 'Ishan Jayaratne', 'Kasun Fernando', 'Bhanuka Rajapaksha', 'Charith Asalanka',
    'Pathum Nissanka', 'Janith Liyanage', 'Niroshan Dickwella', 'Minod Bhanuka', 'Asitha Fernando',
    'Dilshan Madushanka', 'Pramod Madushan', 'Binura Fernando', 'Lakshan Sandakan', 'Vishwa Fernando',
    'Ramesh Mendis', 'Jeffrey Vandersay', 'Dasun Shanaka', 'Chamika Karunaratne', 'Akila Dananjaya',
    'Oshada Fernando', 'Sadeera Samarawickrama', 'Ashan Priyanjan', 'Lahiru Thirimanne', 'Roshen Silva'
  ];

  const conductors = names.map((name, i) => ({
    full_name: name,
    nic: `${1980 + i}5678901${i % 10}`,
    phone: `071${(1000000 + i).toString()}`,
    photo_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`,
    status: i % 10 === 0 ? 'inactive' : 'active',
    created_at: new Date()
  }));

  await knex('conductors').insert(conductors);
};

