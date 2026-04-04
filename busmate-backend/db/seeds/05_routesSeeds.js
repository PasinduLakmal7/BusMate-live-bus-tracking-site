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
    { route_number: "255", start_location: "Mount Lavinia", end_location: "Kottawa", total_distance: 12.5, estimated_duration: 35 }
  ];

  const formattedRoutes = routes.map(route => ({
    ...route,
    active_status: true,
    created_at: new Date()
  }));

  await knex('routes').insert(formattedRoutes);
};

