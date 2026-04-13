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
    ["Horana", "Pokunuwita", "Kahathuduwa", "Polgasowita", "Piliyandala", "Boralesgamuwa", "Rathanapitiya", "Nugegoda", "Kohuwala", "Pamankada", "Thummulla", "Town Hall", "Slave Island", "Fort"],
    // Route 3 - 154 Kiribathgoda → Angulana
    ["Kiribathgoda", "Kelaniya", "Peliyagoda", "Grandpass", "Pettah", "Fort", "Galle Face", "Kollupitiya", "Bambalapitiya", "Wellawatte", "Mount Lavinia", "Ratmalana", "Angulana"],
    // Route 4 - 122 Avissawella → Fort
    ["Avissawella", "Kosgama", "Hanwella", "Homagama", "Kottawa", "Pannipitiya", "Maharagama", "Nugegoda", "Fort"],
    // Route 5 - 177 Kaduwela → Kollupitiya
    ["Kaduwela", "Malabe", "Battaramulla", "Rajagiriya", "Borella", "Town Hall", "Kollupitiya"],
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
    ["Mount Lavinia", "University of Moratuwa", "Piliyandala", "Kottawa"],
    // Route 14 - 100 Panadura → Pettah (Galle Road)
    ["Panadura", "Aturugiriya Junction", "Moratuwa", "Katubedda", "Ratmalana", "Mount Lavinia", "Dehiwala", "Wellawatte", "Bambalapitiya", "Kollupitiya", "Pettah"],
    // Route 15 - 101 Moratuwa → Pettah
    ["Moratuwa", "Katubedda", "Ratmalana", "Mount Lavinia", "Dehiwala", "Wellawatte", "Bambalapitiya", "Kollupitiya", "Slave Island", "Pettah"],
    // Route 16 - 102 Pettah → Moratuwa
    ["Pettah", "Slave Island", "Kollupitiya", "Bambalapitiya", "Wellawatte", "Dehiwala", "Mount Lavinia", "Ratmalana", "Katubedda", "Moratuwa"],
    // Route 17 - 400 Aluthgama → Colombo
    ["Aluthgama", "Beruwala", "Kalutara", "Panadura", "Moratuwa", "Dehiwala", "Colombo"],
    // Route 18 - 176 Hettiyawatte → Karagampitiya
    ["Hettiyawatte", "Moratuwa", "Katubedda", "Karagampitiya"],
    // Route 19 - 190 Meegoda → Pettah
    ["Meegoda", "Homagama", "Kottawa", "Piliyandala", "Kesbewa", "Nugegoda", "Borella", "Pettah"],
    // Route 20 - 170 Athurugiriya → Pettah
    ["Athurugiriya", "Malabe", "Battaramulla", "Rajagiriya", "Borella", "Pettah"],
    // Route 21 - 174 Kottawa → Borella
    ["Kottawa", "Piliyandala", "Dehiwala", "Mount Lavinia", "Ratmalana", "Borella"],
    // Route 22 - 168 Nugegoda → Kotahena
    ["Nugegoda", "Thummulla", "Borella", "Maradana", "Kotahena"],
    // Route 23 - 163 Battaramulla → Dehiwala
    ["Battaramulla", "Rajagiriya", "Borella", "Pamankada", "Dehiwala"],
    // Route 24 - 135 Kohilawatte → Pettah
    ["Kohilawatte", "Nugegoda", "Town Hall", "Pettah"],
    // Route 25 - 155 Soysapura → Mattakkuliya
    ["Soysapura", "Moratuwa", "Ratmalana", "Mount Lavinia", "Dehiwala", "Colombo", "Mattakkuliya"],
    // Route 26 - 99 Colombo → Badulla
    ["Colombo", "Kadugannawa", "Kandy", "Matale", "Dambulla", "Mahiyangana", "Badulla"],
    // Route 27 - 42 Kandy → Anuradhapura
    ["Kandy", "Matale", "Dambulla", "Kekirawa", "Anuradhapura"],
    // Route 28 - 17 Kurunegala → Panadura
    ["Kurunegala", "Giriulla", "Katunayake", "Negombo", "Ja-Ela", "Colombo", "Dehiwala", "Panadura"],
    // Route 29 - 60 Kandy → Matara
    ["Kandy", "Peradeniya", "Colombo", "Mount Lavinia", "Panadura", "Kalutara", "Galle", "Matara"],
    // Route 30 - 26 Colombo → Kurunegala
    ["Colombo", "Peliyagoda", "Ja-Ela", "Katunayake", "Giriulla", "Kurunegala"],
    // Route 31 - 48 Colombo → Polonnaruwa
    ["Colombo", "Kadawatha", "Nittambuwa", "Kandy", "Dambulla", "Polonnaruwa"],
    // Route 32 - 03 Colombo → Jaffna
    ["Colombo", "Kurunegala", "Anuradhapura", "Vavuniya", "Kilinochchi", "Jaffna"],
    // Route 33 - 45 Colombo → Trincomalee
    ["Colombo", "Kurunegala", "Dambulla", "Habarana", "Trincomalee"],
    // Route 34 - 08 Colombo → Matale
    ["Colombo", "Kadawatha", "Nittambuwa", "Kegalle", "Kandy", "Matale"],
    // Route 35 - 10 Kandy → Colombo
    ["Kandy", "Peradeniya", "Kadugannawa", "Kegalle", "Warakapola", "Nittambuwa", "Colombo"],
    // Route 36 - 49 Colombo → Trincomalee (via Polonnaruwa)
    ["Colombo", "Dambulla", "Habarana", "Polonnaruwa", "Trincomalee"],
    // Route 37 - 98 Colombo → Ampara
    ["Colombo", "Kandy", "Mahiyangana", "Ampara"],
    // Route 38 - 22 Ambalangoda → Colombo
    ["Ambalangoda", "Hikkaduwa", "Galle", "Kalutara", "Panadura", "Moratuwa", "Dehiwala", "Colombo"],
    // Route 39 - 145 Gampaha → Colombo
    ["Gampaha", "Ja-Ela", "Wattala", "Peliyagoda", "Colombo"],
    // Route 40 - 187 Katunayake → Pettah
    ["Katunayake", "Ja-Ela", "Wattala", "Peliyagoda", "Pettah"],
    // Route 41 - 112 Maharagama → Kotahena
    ["Maharagama", "Nugegoda", "Borella", "Maradana", "Kotahena"],
    // Route 42 - 150 Pettah → Gothatuwa
    ["Pettah", "Maradana", "Borella", "Rajagiriya", "Battaramulla", "Gothatuwa"],
    // Route 43 - 164 Himbutana → Town Hall
    ["Himbutana", "Malabe", "Battaramulla", "Rajagiriya", "Borella", "Town Hall"],
    // Route 44 - 175 Kohilawatte → Kollupitiya
    ["Kohilawatte", "Nugegoda", "Thummulla", "Town Hall", "Kollupitiya"],
    // Route 45 - 125 Padukka → Pettah
    ["Padukka", "Homagama", "Kottawa", "Maharagama", "Nugegoda", "Pettah"],
    // Route 46 - 119 Maharagama → Dehiwala
    ["Maharagama", "Boralesgamuwa", "Nugegoda", "Pamankada", "Dehiwala"],
    // Route 47 - 117 Nugegoda → Ratmalana
    ["Nugegoda", "Pamankada", "Dehiwala", "Mount Lavinia", "Ratmalana"],
    // Route 48 - 129 Kottawa → Moratuwa
    ["Kottawa", "Piliyandala", "Kesbewa", "Katubedda", "Moratuwa"],
    // Route 49 - 142 Moratuwa → Kollupitiya
    ["Moratuwa", "Ratmalana", "Mount Lavinia", "Dehiwala", "Wellawatte", "Bambalapitiya", "Kollupitiya"],
    // Route 50 - 250 Dehiwala → Mount Lavinia
    ["Dehiwala", "Mount Lavinia"]
  ];

  const hubs = {
    "Maharagama":           { lat: 6.848,  lng: 79.926 },
    "Fort":                 { lat: 6.934,  lng: 79.853 },
    "Pettah":               { lat: 6.936,  lng: 79.851 },
    "Horana":               { lat: 6.714,  lng: 80.063 },
    "Kiribathgoda":         { lat: 6.989,  lng: 79.931 },
    "Angulana":             { lat: 6.809,  lng: 79.878 },
    "Avissawella":          { lat: 6.955,  lng: 80.194 },
    "Kaduwela":             { lat: 6.941,  lng: 79.982 },
    "Kollupitiya":          { lat: 6.914,  lng: 79.850 },
    "Colombo":              { lat: 6.927,  lng: 79.861 },
    "Kandy":                { lat: 7.290,  lng: 80.633 },
    "Galle":                { lat: 6.032,  lng: 80.216 },
    "Matara":               { lat: 5.949,  lng: 80.535 },
    "Kataragama":           { lat: 6.413,  lng: 81.332 },
    "Anuradhapura":         { lat: 8.311,  lng: 80.403 },
    "Panadura":             { lat: 6.711,  lng: 79.907 },
    "Kalutara":             { lat: 6.585,  lng: 79.960 },
    "Tangalle":             { lat: 6.024,  lng: 80.794 },
    "Hambantota":           { lat: 6.124,  lng: 81.121 },
    "Tissamaharama":        { lat: 6.276,  lng: 81.288 },
    "Kurunegala":           { lat: 7.486,  lng: 80.364 },
    "Dambulla":             { lat: 7.857,  lng: 80.651 },
    "Negombo":              { lat: 7.200,  lng: 79.835 },
    "Chilaw":               { lat: 7.575,  lng: 79.795 },
    "Puttalam":             { lat: 8.033,  lng: 79.825 },
    "Makumbura":            { lat: 6.841,  lng: 79.993 },
    "Kottawa":              { lat: 6.841,  lng: 79.965 },
    "Katubedda Junction":   { lat: 6.791,  lng: 79.882 },
    "Katubedda":            { lat: 6.79664167, lng: 79.88831674 },
    "University of Moratuwa": { lat: 6.795432567476653, lng: 79.89978923255364 },
    "Piliyandala":          { lat: 6.801,  lng: 79.922 },
    "Moratuwa":             { lat: 6.774,  lng: 79.882 },
    "Mount Lavinia":        { lat: 6.836,  lng: 79.866 },
    "Ratmalana":            { lat: 6.816,  lng: 79.874 },
    "Dehiwala":             { lat: 6.852,  lng: 79.863 },
    "Wellawatte":           { lat: 6.876,  lng: 79.858 },
    "Bambalapitiya":        { lat: 6.892,  lng: 79.854 },
    "Slave Island":         { lat: 6.917,  lng: 79.851 },
    "Galle Face":           { lat: 6.924,  lng: 79.845 },
    "Town Hall":            { lat: 6.921,  lng: 79.862 },
    "Borella":              { lat: 6.919,  lng: 79.876 },
    "Nugegoda":             { lat: 6.868,  lng: 79.888 },
    "Battaramulla":         { lat: 6.906,  lng: 79.914 },
    "Rajagiriya":           { lat: 6.906,  lng: 79.892 },
    "Malabe":               { lat: 6.912,  lng: 79.975 },
    "Nawinna":              { lat: 6.858,  lng: 79.906 },
    "Kirulapone":           { lat: 6.878,  lng: 79.876 },
    "Havelock Town":        { lat: 6.898,  lng: 79.863 },
    "Pamankada":            { lat: 6.869,  lng: 79.866 },
    "Thummulla":            { lat: 6.886,  lng: 79.878 },
    "Homagama":             { lat: 6.843,  lng: 80.005 },
    "Pannipitiya":          { lat: 6.859,  lng: 79.949 },
    "Kelaniya":             { lat: 6.972,  lng: 79.922 },
    "Peliyagoda":           { lat: 6.960,  lng: 79.900 },
    "Grandpass":            { lat: 6.945,  lng: 79.862 },
    "Peradeniya":           { lat: 7.267,  lng: 80.599 },
    "Kadugannawa":          { lat: 7.251,  lng: 80.521 },
    "Kegalle":              { lat: 7.254,  lng: 80.344 },
    "Warakapola":           { lat: 7.163,  lng: 80.243 },
    "Nittambuwa":           { lat: 7.053,  lng: 80.029 },
    "Kadawatha":            { lat: 7.000,  lng: 79.974 },
    "Beruwala":             { lat: 6.478,  lng: 79.983 },
    "Aluthgama":            { lat: 6.432,  lng: 79.994 },
    "Ambalangoda":          { lat: 6.233,  lng: 80.054 },
    "Kekirawa":             { lat: 8.025,  lng: 80.497 },
    "Nochchiyagama":        { lat: 8.269,  lng: 80.227 },
    "Kosgama":              { lat: 6.897,  lng: 80.118 },
    "Hanwella":             { lat: 6.905,  lng: 80.079 },
    "Homagama":             { lat: 6.843,  lng: 80.005 },
    "Boralesgamuwa":        { lat: 6.843,  lng: 79.903 },
    "Rathanapitiya":        { lat: 6.852,  lng: 79.893 },
    "Kohuwala":             { lat: 6.855,  lng: 79.896 },
    "Pokunuwita":           { lat: 6.761,  lng: 79.989 },
    "Kahathuduwa":          { lat: 6.782,  lng: 79.965 },
    "Polgasowita":          { lat: 6.813,  lng: 79.946 },
    "High Level Road":      { lat: 6.857,  lng: 79.913 },
    "Thalahena":            { lat: 6.920,  lng: 79.955 },
    "Koswatta":             { lat: 6.916,  lng: 79.933 },
    "Badulla":              { lat: 6.993,  lng: 81.055 },
    "Mahiyangana":          { lat: 7.327,  lng: 80.999 },
    "Matale":               { lat: 7.466,  lng: 80.624 },
    "Polonnaruwa":          { lat: 7.940,  lng: 81.001 },
    "Habarana":             { lat: 8.050,  lng: 80.750 },
    "Trincomalee":          { lat: 8.577,  lng: 81.234 },
    "Ampara":               { lat: 7.296,  lng: 81.672 },
    "Jaffna":               { lat: 9.661,  lng: 80.026 },
    "Vavuniya":             { lat: 8.757,  lng: 80.498 },
    "Kilinochchi":          { lat: 9.397,  lng: 80.396 },
    "Hikkaduwa":            { lat: 6.139,  lng: 80.109 },
    "Gampaha":              { lat: 7.088,  lng: 79.999 },
    "Ja-Ela":               { lat: 7.073,  lng: 79.891 },
    "Wattala":              { lat: 6.995,  lng: 79.893 },
    "Katunayake":           { lat: 7.169,  lng: 79.884 },
    "Giriulla":             { lat: 7.337,  lng: 80.128 },
    "Maradana":             { lat: 6.929,  lng: 79.864 },
    "Kotahena":             { lat: 6.947,  lng: 79.862 },
    "Mattakkuliya":         { lat: 6.964,  lng: 79.869 },
    "Aturugiriya Junction": { lat: 6.772,  lng: 79.905 },
    "Karagampitiya":        { lat: 6.785,  lng: 79.888 },
    "Hettiyawatte":         { lat: 6.779,  lng: 79.882 },
    "Kesbewa":              { lat: 6.798,  lng: 79.952 },
    "Himbutana":            { lat: 6.918,  lng: 79.962 },
    "Gothatuwa":            { lat: 6.924,  lng: 79.993 },
    "Kohilawatte":          { lat: 6.867,  lng: 79.899 },
    "Padukka":              { lat: 6.840,  lng: 80.103 },
    "Soysapura":            { lat: 6.778,  lng: 79.885 },
    "Athurugiriya":         { lat: 6.872,  lng: 79.993 },
    "Meegoda":              { lat: 6.826,  lng: 79.995 }
  };

  routeStopsData.forEach((stopsList, routeIndex) => {
    const routeId = routeIndex + 1;
    const startName = stopsList[0];
    const endName   = stopsList[stopsList.length - 1];
    const startPos  = hubs[startName] || { lat: 6.927, lng: 79.861 };
    const endPos    = hubs[endName]   || { lat: 6.927, lng: 79.853 };

    stopsList.forEach((stop, index) => {
      const t   = stopsList.length > 1 ? index / (stopsList.length - 1) : 0;
      const lat = hubs[stop]?.lat ?? (startPos.lat + (endPos.lat - startPos.lat) * t);
      const lng = hubs[stop]?.lng ?? (startPos.lng + (endPos.lng - startPos.lng) * t);
      stops.push({
        route_id:   routeId,
        stop_name:  stop,
        stop_order: index + 1,
        latitude:   parseFloat(lat.toFixed(8)),
        longitude:  parseFloat(lng.toFixed(8)),
        created_at: new Date()
      });
    });
  });

  await knex('route_stops').insert(stops);
  console.log(`✅ Seeded ${stops.length} route stops across 50 routes.`);
};
