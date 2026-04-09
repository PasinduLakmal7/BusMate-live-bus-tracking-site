/**
 * @param {import("knex").Knex} knex
 */
exports.seed = async function (knex) {

  await knex.raw('TRUNCATE TABLE routes RESTART IDENTITY CASCADE');

  const routes = [
    { route_number: "138", start_location: "Maharagama", end_location: "Fort", total_distance: 15.2, estimated_duration: 45 },
    { route_number: "120", start_location: "Horana", end_location: "Fort", total_distance: 28.5, estimated_duration: 75 },
    { route_number: "154", start_location: "Kiribathgoda", end_location: "Angulana", total_distance: 22.0, estimated_duration: 60 },
    { route_number: "122", start_location: "Avissawella", end_location: "Fort", total_distance: 48.0, estimated_duration: 120 },
    { route_number: "177", start_location: "Kaduwela", end_location: "Kollupitiya", total_distance: 18.5, estimated_duration: 50 },
    { route_number: "01", start_location: "Colombo", end_location: "Kandy", total_distance: 115.0, estimated_duration: 180 },
    { route_number: "02", start_location: "Colombo", end_location: "Galle", total_distance: 119.5, estimated_duration: 150 },
    { route_number: "32", start_location: "Colombo", end_location: "Kataragama", total_distance: 280.0, estimated_duration: 360 },
    { route_number: "15", start_location: "Colombo", end_location: "Anuradhapura", total_distance: 205.0, estimated_duration: 300 },
    { route_number: "04", start_location: "Colombo", end_location: "Anuradhapura (via Puttalam)", total_distance: 220.0, estimated_duration: 330 },
    { route_number: "EX-001", start_location: "Maharagama", end_location: "Galle (Expressway)", total_distance: 105.0, estimated_duration: 90 },
    { route_number: "EX-002", start_location: "Kaduwela", end_location: "Matara (Expressway)", total_distance: 155.0, estimated_duration: 120 },
    { route_number: "255", start_location: "Mount Lavinia", end_location: "Kottawa", total_distance: 12.5, estimated_duration: 35 },
    { route_number: "100", start_location: "Panadura", end_location: "Pettah", total_distance: 27.0, estimated_duration: 80 },
    { route_number: "101", start_location: "Moratuwa", end_location: "Pettah", total_distance: 20.0, estimated_duration: 55 },
    { route_number: "102", start_location: "Pettah", end_location: "Moratuwa", total_distance: 19.5, estimated_duration: 55 },
    { route_number: "400", start_location: "Aluthgama", end_location: "Colombo", total_distance: 65.0, estimated_duration: 150 },
    { route_number: "176", start_location: "Hettiyawatte", end_location: "Karagampitiya", total_distance: 16.0, estimated_duration: 50 },
    { route_number: "190", start_location: "Meegoda", end_location: "Pettah", total_distance: 22.5, estimated_duration: 70 },
    { route_number: "170", start_location: "Athurugiriya", end_location: "Pettah", total_distance: 20.8, estimated_duration: 65 },
    { route_number: "174", start_location: "Kottawa", end_location: "Borella", total_distance: 14.5, estimated_duration: 45 },
    { route_number: "168", start_location: "Nugegoda", end_location: "Kotahena", total_distance: 12.0, estimated_duration: 40 },
    { route_number: "163", start_location: "Battaramulla", end_location: "Dehiwala", total_distance: 11.5, estimated_duration: 35 },
    { route_number: "135", start_location: "Kohilawatte", end_location: "Pettah", total_distance: 9.8, estimated_duration: 30 },
    { route_number: "155", start_location: "Soysapura", end_location: "Mattakkuliya", total_distance: 18.2, estimated_duration: 55 },
    { route_number: "99", start_location: "Colombo", end_location: "Badulla", total_distance: 232.0, estimated_duration: 300 },
    { route_number: "42", start_location: "Kandy", end_location: "Anuradhapura", total_distance: 135.0, estimated_duration: 210 },
    { route_number: "17", start_location: "Kurunegala", end_location: "Panadura", total_distance: 120.0, estimated_duration: 180 },
    { route_number: "60", start_location: "Kandy", end_location: "Matara", total_distance: 245.0, estimated_duration: 330 },
    { route_number: "26", start_location: "Colombo", end_location: "Kurunegala", total_distance: 95.0, estimated_duration: 150 },
    { route_number: "48", start_location: "Colombo", end_location: "Polonnaruwa", total_distance: 215.0, estimated_duration: 270 },
    { route_number: "03", start_location: "Colombo", end_location: "Jaffna", total_distance: 395.0, estimated_duration: 480 },
    { route_number: "45", start_location: "Colombo", end_location: "Trincomalee", total_distance: 260.0, estimated_duration: 330 },
    { route_number: "08", start_location: "Colombo", end_location: "Matale", total_distance: 145.0, estimated_duration: 210 },
    { route_number: "10", start_location: "Kandy", end_location: "Colombo", total_distance: 115.0, estimated_duration: 180 },
    { route_number: "49", start_location: "Colombo", end_location: "Trincomalee", total_distance: 255.0, estimated_duration: 300 },
    { route_number: "98", start_location: "Colombo", end_location: "Ampara", total_distance: 315.0, estimated_duration: 420 },
    { route_number: "22", start_location: "Ambalangoda", end_location: "Colombo", total_distance: 85.0, estimated_duration: 120 },
    { route_number: "145", start_location: "Gampaha", end_location: "Colombo", total_distance: 28.0, estimated_duration: 60 },
    { route_number: "187", start_location: "Katunayake", end_location: "Pettah", total_distance: 32.0, estimated_duration: 45 },
    { route_number: "112", start_location: "Maharagama", end_location: "Kotahena", total_distance: 14.0, estimated_duration: 40 },
    { route_number: "150", start_location: "Pettah", end_location: "Gothatuwa", total_distance: 8.5, estimated_duration: 25 },
    { route_number: "164", start_location: "Himbutana", end_location: "Town Hall", total_distance: 10.5, estimated_duration: 35 },
    { route_number: "175", start_location: "Kohilawatte", end_location: "Kollupitiya", total_distance: 11.0, estimated_duration: 35 },
    { route_number: "125", start_location: "Padukka", end_location: "Pettah", total_distance: 32.5, estimated_duration: 75 },
    { route_number: "119", start_location: "Maharagama", end_location: "Dehiwala", total_distance: 8.2, estimated_duration: 25 },
    { route_number: "117", start_location: "Nugegoda", end_location: "Ratmalana", total_distance: 7.5, estimated_duration: 20 },
    { route_number: "129", start_location: "Kottawa", end_location: "Moratuwa", total_distance: 15.0, estimated_duration: 40 },
    { route_number: "142", start_location: "Moratuwa", end_location: "Kollupitiya", total_distance: 18.5, estimated_duration: 50 },
    { route_number: "250", start_location: "Dehiwala", end_location: "Mount Lavinia", total_distance: 3.5, estimated_duration: 10 }
  ];

  const formattedRoutes = routes.map(route => ({
    ...route,
    active_status: true,
    created_at: new Date()
  }));

  await knex('routes').insert(formattedRoutes);
};

