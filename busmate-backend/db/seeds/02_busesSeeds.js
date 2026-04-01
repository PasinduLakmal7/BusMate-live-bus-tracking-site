/**
 * @param {import("knex").Knex} knex
 */
exports.seed = async function (knex) {

  await knex.raw('TRUNCATE TABLE buses RESTART IDENTITY CASCADE');

  const plates = [
    'WP NB-1025', 'WP NB-2041', 'WP LY-4455', 'WP NE-6677', 'WP PF-1122',
    'CP NC-3344', 'CP NA-9900', 'CP NB-5566', 'SP NB-7788', 'SP NL-1122',
    'SP NA-4455', 'NW NB-3344', 'NW NE-8899', 'NC NA-2233', 'NC NB-6677',
    'WP NB-1111', 'WP NB-2222', 'WP NB-3333', 'WP NB-4444', 'WP NB-5555',
    'WP NB-6666', 'WP NB-7777', 'WP NB-8888', 'WP NB-9999', 'WP NB-1010'
  ];

  const buses = plates.map((plate, i) => ({
    bus_number: plate,
    bus_type: i % 2 === 0 ? 'Normal' : 'Luxury',
    depot_id: (i % 10) + 1, // linked to the 10 depots created in 01_depotCompaniesSeeds
    created_at: new Date()
  }));

  await knex('buses').insert(buses);
};

