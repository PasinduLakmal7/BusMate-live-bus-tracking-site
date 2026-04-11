const pool = require('./db.js');

const id = 'CP NC-3344';

async function testAlerts() {
    try {
        console.log('Testing alerts query for:', id);
        const result = await pool.query(`
            SELECT a.alert_id as id, a.type, a.title, a.message, a.reported_at
            FROM bus_alerts a
            LEFT JOIN buses b ON a.bus_id = b.bus_id
            WHERE (a.bus_id::text = $1 OR b.bus_number = $1 OR a.bus_id IS NULL) 
            AND a.is_active = TRUE
            ORDER BY a.reported_at DESC
        `, [id]);
        console.log('QueryResult Success:', result.rows);
    } catch (err) {
        console.error('DATABASE ERROR DETECTED:', err.message);
        console.error('Stack:', err.stack);
    } finally {
        process.exit(0);
    }
}

testAlerts();
