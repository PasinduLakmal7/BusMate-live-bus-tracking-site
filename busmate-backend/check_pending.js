const pool = require('./db.js');

const checkPendingSchema = async () => {
    try {
        const res = await pool.query(`
            SELECT column_name, data_type
            FROM information_schema.columns
            WHERE table_name = 'pending_registrations'
            ORDER BY ordinal_position;
        `);
        console.log('--- Columns in pending_registrations ---');
        res.rows.forEach(col => {
            console.log(col.column_name + ': ' + col.data_type);
        });
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

checkPendingSchema();
