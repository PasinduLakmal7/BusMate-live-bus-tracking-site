const pool = require('./db.js');

const alterTable = async () => {
    try {
        console.log('--- Updating drivers table schema ---');

        await pool.query(`
            ALTER TABLE drivers 
            ADD COLUMN IF NOT EXISTS email VARCHAR(255),
            ADD COLUMN IF NOT EXISTS license_number VARCHAR(100),
            ADD COLUMN IF NOT EXISTS license_expiry DATE,
            ADD COLUMN IF NOT EXISTS bus_number VARCHAR(50),
            ADD COLUMN IF NOT EXISTS bus_type VARCHAR(100),
            ADD COLUMN IF NOT EXISTS conductor_name VARCHAR(255),
            ADD COLUMN IF NOT EXISTS conductor_phone VARCHAR(20),
            ADD COLUMN IF NOT EXISTS conductor_nic VARCHAR(20),
            ADD COLUMN IF NOT EXISTS route_number VARCHAR(50),
            ADD COLUMN IF NOT EXISTS route_name VARCHAR(255),
            ADD COLUMN IF NOT EXISTS depot_name VARCHAR(255),
            ADD COLUMN IF NOT EXISTS license_photo_url TEXT,
            ADD COLUMN IF NOT EXISTS conductor_photo_url TEXT,
            ADD COLUMN IF NOT EXISTS trips_json JSONB;
        `);

        console.log('✅ Drivers table schema updated successfully');
        process.exit(0);
    } catch (err) {
        console.error('❌ Error updating drivers table:', err);
        process.exit(1);
    }
};

alterTable();
