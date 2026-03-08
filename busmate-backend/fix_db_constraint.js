const pool = require('./db.js');

async function fixDbConstraint() {
    console.log('--- Starting Database Fix ---');
    try {
        // 1. Delete duplicates keep only the latest row per bus_id
        console.log('Cleaning up duplicate bus_id entries...');
        await pool.query(`
            DELETE FROM bus_locations 
            WHERE location_id NOT IN (
                SELECT MAX(location_id) 
                FROM bus_locations 
                GROUP BY bus_id
            )
        `);
        console.log('Duplicates cleaned.');

        // 2. Add UNIQUE constraint to bus_id
        console.log('Adding UNIQUE constraint to bus_id...');
        await pool.query(`
            ALTER TABLE bus_locations 
            ADD CONSTRAINT unique_bus_id UNIQUE (bus_id)
        `);
        console.log('UNIQUE constraint added successfully!');

        console.log('--- Done! Your UPSERT logic should now work correctly. ---');
    } catch (err) {
        if (err.message.includes('already exists')) {
            console.log('Constraint already exists. Nothing to do.');
        } else {
            console.error('Error fixing database:', err.message);
            console.log('\nTry running this SQL manually in pgAdmin:');
            console.log('ALTER TABLE bus_locations ADD CONSTRAINT unique_bus_id UNIQUE (bus_id);');
        }
    } finally {
        pool.end();
    }
}

fixDbConstraint();
