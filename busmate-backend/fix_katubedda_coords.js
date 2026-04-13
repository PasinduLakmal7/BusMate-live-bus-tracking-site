const pool = require('./db.js');

async function fixKatubedda() {
    const newLat = 6.796641672552571;
    const newLng = 79.88831673609876;
    
    console.log(`🚀 Updating Katubedda coordinates to: ${newLat}, ${newLng}...`);
    
    try {
        const result = await pool.query(
            "UPDATE route_stops SET latitude = $1, longitude = $2 WHERE stop_name = 'Katubedda'",
            [newLat, newLng]
        );
        console.log(`✅ Success: Updated ${result.rowCount} rows in route_stops.`);
    } catch (err) {
        console.error("❌ Error updating database:", err.message);
    } finally {
        process.exit();
    }
}

fixKatubedda();
