/**
 * @param {import("knex").Knex} knex
 */
exports.seed = async function (knex) {

  await knex.raw('TRUNCATE TABLE bus_locations RESTART IDENTITY CASCADE');

  const locations = [];

  // Hub coordinates
  const hubs = [
    { name: 'Fort', lat: 6.9344, lng: 79.8524 },
    { name: 'Maharagama', lat: 6.8511, lng: 79.9212 },
    { name: 'Horana', lat: 6.7111, lng: 80.0611 },
    { name: 'Kiribathgoda', lat: 6.9911, lng: 79.9311 },
    { name: 'Kaduwela', lat: 6.9411, lng: 79.9811 }
  ];

  for (let i = 1; i <= 25; i++) {
    const hub = hubs[(i - 1) % hubs.length];
    
    locations.push({
      bus_id: i,
      latitude: (hub.lat + (Math.random() - 0.5) * 0.01).toFixed(8),
      longitude: (hub.lng + (Math.random() - 0.5) * 0.01).toFixed(8),
      speed: Math.floor(Math.random() * 45), // Speed between 0-45 km/h
      recorded_at: new Date()
    });
  }

  await knex('bus_locations').insert(locations);
};

