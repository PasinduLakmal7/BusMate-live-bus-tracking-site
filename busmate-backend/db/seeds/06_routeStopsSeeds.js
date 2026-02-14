/**
 * @param {import("knex").Knex} knex
 */
exports.seed = async function (knex) {

  await knex('route_stops').del();

  const stops = [];

  const routeStopsData = [
    // Route 1 - Colombo → Galle
    ["Colombo Fort", "Kalutara", "Bentota", "Hikkaduwa", "Galle"],

    // Route 2 - Colombo → Kandy
    ["Colombo Fort", "Kadawatha", "Warakapola", "Peradeniya", "Kandy"],

    // Route 3 - Colombo → Matara
    ["Colombo Fort", "Kalutara", "Aluthgama", "Ambalangoda", "Matara"],

    // Route 4 - Colombo → Kurunegala
    ["Colombo Fort", "Nittambuwa", "Mirigama", "Narammala", "Kurunegala"],

    // Route 5 - Colombo → Anuradhapura
    ["Colombo Fort", "Kurunegala", "Dambulla", "Kekirawa", "Anuradhapura"]
  ];

  let latitudeBase = 6.9000;
  let longitudeBase = 79.8500;

  routeStopsData.forEach((stopsList, routeIndex) => {
    stopsList.forEach((stop, index) => {
      stops.push({
        route_id: routeIndex + 1,  // route_id 1–5
        stop_name: stop,
        stop_order: index + 1,
        latitude: (latitudeBase + (routeIndex * 0.05) + (index * 0.01)).toFixed(8),
        longitude: (longitudeBase + (routeIndex * 0.05) + (index * 0.01)).toFixed(8),
        created_at: new Date()
      });
    });
  });

  await knex('route_stops').insert(stops);
};
