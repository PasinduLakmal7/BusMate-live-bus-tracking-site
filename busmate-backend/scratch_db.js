const pool = require('./db.js');
pool.query('SELECT schedule_id, bus_id, route_id FROM bus_schedules WHERE driver_id = $1 ORDER BY schedule_id DESC LIMIT 1', [54])
  .then(r => console.log(r.rows))
  .catch(console.error)
  .finally(() => process.exit(0));
