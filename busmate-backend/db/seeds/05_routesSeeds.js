/**
 * @param {import("knex").Knex} knex
 */
exports.seed = async function (knex) {

  await knex('routes').del();

  const routes = [
    { route_number: "100", start_location: "Colombo", end_location: "Galle", total_distance: 119.5, estimated_duration: 150 },
    { route_number: "101", start_location: "Colombo", end_location: "Kandy", total_distance: 115.0, estimated_duration: 180 },
    { route_number: "102", start_location: "Colombo", end_location: "Matara", total_distance: 160.0, estimated_duration: 210 },
    { route_number: "103", start_location: "Colombo", end_location: "Kurunegala", total_distance: 94.0, estimated_duration: 130 },
    { route_number: "104", start_location: "Colombo", end_location: "Anuradhapura", total_distance: 205.0, estimated_duration: 300 },

    { route_number: "105", start_location: "Kandy", end_location: "Badulla", total_distance: 140.0, estimated_duration: 240 },
    { route_number: "106", start_location: "Kandy", end_location: "Nuwara Eliya", total_distance: 76.0, estimated_duration: 150 },
    { route_number: "107", start_location: "Galle", end_location: "Matara", total_distance: 45.0, estimated_duration: 75 },
    { route_number: "108", start_location: "Kurunegala", end_location: "Puttalam", total_distance: 85.0, estimated_duration: 120 },
    { route_number: "109", start_location: "Anuradhapura", end_location: "Jaffna", total_distance: 195.0, estimated_duration: 260 },

    { route_number: "110", start_location: "Colombo", end_location: "Negombo", total_distance: 38.0, estimated_duration: 60 },
    { route_number: "111", start_location: "Colombo", end_location: "Kalutara", total_distance: 43.0, estimated_duration: 70 },
    { route_number: "112", start_location: "Colombo", end_location: "Panadura", total_distance: 27.0, estimated_duration: 45 },
    { route_number: "113", start_location: "Colombo", end_location: "Moratuwa", total_distance: 20.0, estimated_duration: 35 },
    { route_number: "114", start_location: "Colombo", end_location: "Ratnapura", total_distance: 101.0, estimated_duration: 150 },

    { route_number: "115", start_location: "Galle", end_location: "Hambantota", total_distance: 150.0, estimated_duration: 200 },
    { route_number: "116", start_location: "Matara", end_location: "Hambantota", total_distance: 110.0, estimated_duration: 150 },
    { route_number: "117", start_location: "Kandy", end_location: "Trincomalee", total_distance: 180.0, estimated_duration: 250 },
    { route_number: "118", start_location: "Kurunegala", end_location: "Colombo", total_distance: 94.0, estimated_duration: 130 },
    { route_number: "119", start_location: "Negombo", end_location: "Chilaw", total_distance: 60.0, estimated_duration: 90 },

    { route_number: "120", start_location: "Colombo", end_location: "Batticaloa", total_distance: 314.0, estimated_duration: 420 },
    { route_number: "121", start_location: "Anuradhapura", end_location: "Polonnaruwa", total_distance: 105.0, estimated_duration: 140 },
    { route_number: "122", start_location: "Jaffna", end_location: "Kilinochchi", total_distance: 45.0, estimated_duration: 60 },
    { route_number: "123", start_location: "Colombo", end_location: "Horana", total_distance: 42.0, estimated_duration: 65 },
    { route_number: "124", start_location: "Colombo", end_location: "Avissawella", total_distance: 58.0, estimated_duration: 90 }
  ];

  const formattedRoutes = routes.map(route => ({
    ...route,
    active_status: true,
    created_at: new Date()
  }));

  await knex('routes').insert(formattedRoutes);
};
