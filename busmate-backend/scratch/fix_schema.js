const pool = require('./db.js');

async function fixSchema() {
    try {
        console.log('Checking bus_locations schema...');
        await pool.query('ALTER TABLE bus_locations ADD COLUMN IF NOT EXISTS is_returning BOOLEAN DEFAULT FALSE;');
        console.log('✅ Column is_returning added successfully (or already exists).');
        process.exit(0);
    } catch (err) {
        console.error('❌ Failed to update schema:', err.message);
        process.exit(1);
    }
}

fixSchema();
