const pool = require('./db.js');

const inspectPending = async (id) => {
    try {
        const res = await pool.query('SELECT * FROM pending_registrations WHERE pending_id = $1', [id]);
        if (res.rows.length === 0) {
            console.log('No pending registration found for ID:', id);
            process.exit(0);
        }
        const row = res.rows[0];
        console.log('--- Data for Pending ID:', id, '---');
        for (const [key, value] of Object.entries(row)) {
            console.log(`${key}:`, typeof value === 'object' ? JSON.stringify(value) : value);
        }
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

const id = process.argv[2];
if (!id) {
    console.log('Please provide a pending_id');
    process.exit(1);
}
inspectPending(id);
