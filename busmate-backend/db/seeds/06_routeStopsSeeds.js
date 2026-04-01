/**
 * @param {import("knex").Knex} knex
 */
exports.seed = async function (knex) {

  await knex('route_stops').del();

  const stops = [];

  const routeStopsData = [
    // Route 1 - 138 Maharagama → Fort
    ["Maharagama", "Nawinna", "Nugegoda", "Kirulapone", "Havelock Town", "Town Hall", "Slave Island", "Fort"],

    // Route 2 - 120 Horana → Fort
    ["Horana", "Pokunuwita", "Kahathuduwa", "Polgasowita", "Piliyandala", "Boralesgamuwa", "Rathanapitiya", "Nugegoda", "Kohuwala", "Pamankada", "Havelock Town", "Thummulla", "Town Hall", "Slave Island", "Fort"],

    // Route 3 - 154 Kiribathgoda → Angulana
    ["Kiribathgoda", "Kelaniya", "Peliyagoda", "Grandpass", "Pettah", "Fort", "Galle Face", "Kollupitiya", "Bambalapitiya", "Wellawatte", "Mount Lavinia", "Ratmalana", "Angulana"],

    // Route 4 - 122 Avissawella → Fort
    ["Avissawella", "Kosgama", "Kaluaggala", "Hanwella", "Jathika Pasala", "Meepe", "Godagama", "Homagama", "Makumbura", "Kottawa", "Pannipitiya", "Maharagama", "Nugegoda", "High Level Road", "Fort"],

    // Route 5 - 177 Kaduwela → Kollupitiya
    ["Kaduwela", "Malabe", "Thalahena", "Koswatta", "Battaramulla", "Rajagiriya", "Borella", "Town Hall", "Kollupitiya"]
  ];

  // Base coordinates near Colombo
  let latitudeBase = 6.9271; 
  let longitudeBase = 79.8612;

  routeStopsData.forEach((stopsList, routeIndex) => {
    stopsList.forEach((stop, index) => {
      stops.push({
        route_id: routeIndex + 1,
        stop_name: stop,
        stop_order: index + 1,
        latitude: (latitudeBase + (routeIndex * 0.02) + (index * 0.005)).toFixed(8),
        longitude: (longitudeBase + (routeIndex * 0.02) + (index * 0.005)).toFixed(8),
        created_at: new Date()
      });
    });
  });

  await knex('route_stops').insert(stops);
};

