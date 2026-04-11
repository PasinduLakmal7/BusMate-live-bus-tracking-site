const pool = require('./db.js');
async function check() {
  try {
    const crowd = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'crowd_reports'");
    console.log('--- crowd_reports ---');
    console.table(crowd.rows);

    const alerts = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'bus_alerts'");
    console.log('--- bus_alerts ---');
    console.table(alerts.rows);

    const routes = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'routes'");
    console.log('--- routes ---');
    console.table(routes.rows);

  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
}
check();
