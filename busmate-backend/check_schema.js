const pool = require('./db.js');

const checkSchema = async () => {
    try {
        console.log('--- Columns in drivers table ---');
        const res1 = await pool.query(`
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns
            WHERE table_name = 'drivers'
            ORDER BY ordinal_position;
        `);
        res1.rows.forEach(col => {
            console.log(col.column_name + ': ' + col.data_type + ' (Nullable: ' + col.is_nullable + ')');
        });

        console.log('\n--- Columns in pending_registrations table ---');
        const res2 = await pool.query(`
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns
            WHERE table_name = 'pending_registrations'
            ORDER BY ordinal_position;
        `);
        res2.rows.forEach(col => {
            console.log(col.column_name + ': ' + col.data_type + ' (Nullable: ' + col.is_nullable + ')');
        });
        process.exit(0);
    } catch (err) {
        console.error('Error checking schema:', err);
        process.exit(1);
    }
};

checkSchema();
