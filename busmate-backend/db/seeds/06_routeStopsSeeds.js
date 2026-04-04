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
    ["Kaduwela", "Malabe", "Thalahena", "Koswatta", "Battaramulla", "Rajagiriya", "Borella", "Town Hall", "Kollupitiya"],

    // Route 6 - 01 Colombo → Kandy
    ["Colombo", "Peliyagoda", "Kadawatha", "Nittambuwa", "Warakapola", "Kegalle", "Kadugannawa", "Peradeniya", "Kandy"],

    // Route 7 - 02 Colombo → Galle
    ["Colombo", "Dehiwala", "Mount Lavinia", "Moratuwa", "Panadura", "Kalutara", "Beruwala", "Aluthgama", "Ambalangoda", "Galle"],

    // Route 8 - 32 Colombo → Kataragama
    ["Colombo", "Panadura", "Kalutara", "Galle", "Matara", "Tangalle", "Hambantota", "Tissamaharama", "Kataragama"],

    // Route 9 - 15 Colombo → Anuradhapura
    ["Colombo", "Peliyagoda", "Kurunegala", "Dambulla", "Kekirawa", "Anuradhapura"],

    // Route 10 - 04 Colombo → Anuradhapura (via Puttalam)
    ["Colombo", "Negombo", "Chilaw", "Puttalam", "Nochchiyagama", "Anuradhapura"],

    // Route 11 - EX-001 Maharagama → Galle (Expressway)
    ["Maharagama", "Makumbura", "Galle"],

    // Route 12 - EX-002 Kaduwela → Matara (Expressway)
    ["Kaduwela", "Makumbura", "Galle", "Matara"],

    // Route 13 - 255 Mount Lavinia → Kottawa
    ["Mount Lavinia", "Katubedda", "Piliyandala", "Kottawa"]
  ];

  const hubs = {
    "Maharagama": { lat: 6.848, lng: 79.926 },
    "Fort": { lat: 6.934, lng: 79.853 },
    "Horana": { lat: 6.714, lng: 80.063 },
    "Kiribathgoda": { lat: 6.989, lng: 79.931 },
    "Angulana": { lat: 6.809, lng: 79.878 },
    "Avissawella": { lat: 6.955, lng: 80.194 },
    "Kaduwela": { lat: 6.941, lng: 79.982 },
    "Kollupitiya": { lat: 6.914, lng: 79.850 },
    "Pettah": { lat: 6.936, lng: 79.851 },
    "Mount Lavinia": { lat: 6.836, lng: 79.866 },
    "Ratmalana": { lat: 6.816, lng: 79.874 },
    "Colombo": { lat: 6.927, lng: 79.861 },
    "Kandy": { lat: 7.290, lng: 80.633 },
    "Galle": { lat: 6.032, lng: 80.216 },
    "Matara": { lat: 5.949, lng: 80.535 },
    "Kataragama": { lat: 6.413, lng: 81.332 },
    "Anuradhapura": { lat: 8.311, lng: 80.403 },
    "Panadura": { lat: 6.711, lng: 79.907 },
    "Kalutara": { lat: 6.585, lng: 79.960 },
    "Tangalle": { lat: 6.024, lng: 80.794 },
    "Hambantota": { lat: 6.124, lng: 81.121 },
    "Tissamaharama": { lat: 6.276, lng: 81.288 },
    "Kurunegala": { lat: 7.486, lng: 80.364 },
    "Dambulla": { lat: 7.857, lng: 80.651 },
    "Negombo": { lat: 7.200, lng: 79.835 },
    "Chilaw": { lat: 7.575, lng: 79.795 },
    "Puttalam": { lat: 8.033, lng: 79.825 },
    "Makumbura": { lat: 6.841, lng: 79.993 },
    "Kottawa": { lat: 6.841, lng: 79.965 },
    "Katubedda": { lat: 6.801, lng: 79.891 },
    "Piliyandala": { lat: 6.801, lng: 79.922 }
  };

  routeStopsData.forEach((stopsList, routeIndex) => {
    const routeId = routeIndex + 1;
    const startName = stopsList[0];
    const endName = stopsList[stopsList.length - 1];

    // Get terminal coords or fallback to a slight offset
    const startPos = hubs[startName] || { lat: 6.927 + (routeId * 0.05), lng: 79.861 + (routeId * 0.05) };
    const endPos = hubs[endName] || { lat: 6.927, lng: 79.853 };

    stopsList.forEach((stop, index) => {
      // Linear interpolation between start and end for intermediate stops
      const t = index / (stopsList.length - 1);
      const lat = hubs[stop]?.lat || (startPos.lat + (endPos.lat - startPos.lat) * t);
      const lng = hubs[stop]?.lng || (startPos.lng + (endPos.lng - startPos.lng) * t);

      stops.push({
        route_id: routeId,
        stop_name: stop,
        stop_order: index + 1,
        latitude: lat.toFixed(8),
        longitude: lng.toFixed(8),
        created_at: new Date()
      });
    });
  });

  await knex('route_stops').insert(stops);
};

