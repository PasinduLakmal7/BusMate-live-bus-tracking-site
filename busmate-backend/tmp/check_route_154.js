const pool = require('../db.js');
async function checkRoute() {
  try {
    const result = await pool.query("SELECT route_id, route_number, start_location, end_location FROM routes WHERE route_number = '154';");
    console.log(JSON.stringify(result.rows, null, 2));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
checkRoute();
