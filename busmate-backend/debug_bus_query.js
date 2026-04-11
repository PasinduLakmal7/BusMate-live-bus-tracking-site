const pool = require('./db.js');

async function test() {
    const id = 'SP NA-4455';
    try {
        const sql = `
            SELECT 
                b.bus_id as id,
                b.bus_number as "busNumber",
                b.bus_type as type,
                dc.name as "depotName",
                dc.address as "depotAddress",
                b.route_id as "routeId"
            FROM buses b
            JOIN depot_companies dc ON b.depot_id = dc.depot_id
            WHERE (b.bus_id::text = $1 OR b.bus_number = $1 OR TRIM(b.bus_number) ILIKE TRIM($1))
        `;
        const res = await pool.query(sql, [id]);
        console.log('Query Result Count:', res.rows.length);
        if (res.rows.length > 0) {
            console.log('Bus Data:', JSON.stringify(res.rows[0]));
            const bus = res.rows[0];
            
            // Check location
            const loc = await pool.query('SELECT latitude as lat, longitude as lon, speed, heading, recorded_at FROM bus_locations WHERE bus_id = $1 ORDER BY recorded_at DESC LIMIT 1', [bus.id]);
            console.log('Location Rows:', loc.rows.length);

            // Check route
            if (bus.routeId) {
                const rt = await pool.query('SELECT route_id as id, route_number as "routeNumber", start_location as "start", end_location as "end" FROM routes WHERE route_id = $1', [bus.routeId]);
                console.log('Route Info:', JSON.stringify(rt.rows[0]));

                const st = await pool.query('SELECT stop_id as id, stop_name as name, stop_order as "order", latitude as lat, longitude as lng FROM route_stops WHERE route_id = $1 ORDER BY stop_order ASC', [bus.routeId]);
                console.log('Stops Count:', st.rows.length);
                
                const upcomingStops = st.rows.slice(0, 5).map(s => ({
                    ...s,
                    eta: `${Math.floor(Math.random() * 20) + 2} mins`,
                    status: s.order === 1 ? 'Departed' : 'Upcoming'
                }));
                console.log('Upcoming stops count:', upcomingStops.length);
            }
        }
    } catch (e) {
        console.error('SERVER ERROR REPRODUCTION:', e);
    }
    process.exit(0);
}

test();
