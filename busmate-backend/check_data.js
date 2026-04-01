const pool = require('./db.js');
setTimeout(async () => {
    try {
        const p = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'pending_registrations'");
        console.log('PENDING COLUMNS:', p.rows.map(r => r.column_name));
        const r2 = await pool.query('SELECT * FROM pending_registrations LIMIT 5');
        console.log('PENDING ROWS:', JSON.stringify(r2.rows, null, 2));
    } catch (e) {
        console.error(e.message);
    }
    process.exit();
}, 2000);
