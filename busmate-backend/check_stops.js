const pool = require('./db.js');

async function checkStops() {
    try {
        const res = await pool.query('SELECT rs.stop_id, rs.route_id, rs.stop_name, rs.latitude, rs.longitude FROM route_stops rs LIMIT 10;');
        console.table(res.rows);
    } catch (err) {
        console.error('Check error:', err);
    } finally {
        pool.end();
    }
}

checkStops();
