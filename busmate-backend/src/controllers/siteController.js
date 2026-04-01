const pool = require('../../db.js');

/**
 * Get all available routes with their basic info.
 */
exports.getAllRoutes = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                route_id as id,
                route_number as "routeNumber",
                start_location as "startLocation",
                end_location as "endLocation",
                total_distance as distance,
                estimated_duration as duration,
                active_status as status
            FROM routes
            ORDER BY route_number ASC
        `);
        return res.json({ success: true, routes: result.rows });
    } catch (err) {
        console.error('getRoutes error', err);
        return res.status(500).json({ success: false, error: err.message });
    }
};

/**
 * Get detailed information for a specific route including its stops.
 */
exports.getRouteById = async (req, res) => {
    const { id } = req.params;
    try {
        // 1. Get route details
        const routeResult = await pool.query('SELECT * FROM routes WHERE route_id = $1', [id]);
        if (routeResult.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Route not found' });
        }
        
        // 2. Get stops for this route
        const stopsResult = await pool.query(`
            SELECT 
                stop_id as id, 
                stop_name as name, 
                stop_order as "order", 
                latitude as lat, 
                longitude as lng 
            FROM route_stops 
            WHERE route_id = $1 
            ORDER BY stop_order ASC
        `, [id]);
        
        return res.json({ 
            success: true, 
            route: {
                ...routeResult.rows[0],
                stops: stopsResult.rows
            }
        });
    } catch (err) {
        console.error('getRouteById error', err);
        return res.status(500).json({ success: false, error: err.message });
    }
};

/**
 * Get all bus schedules.
 */
exports.getAllSchedules = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                bs.schedule_id as id,
                b.bus_number as "busNumber",
                r.route_number as "routeNumber",
                r.start_location as "routeStart",
                r.end_location as "routeEnd",
                d.full_name as "driverName",
                bs.trip_no as "tripNo",
                bs.start_time as "startTime",
                bs.end_time as "endTime"
            FROM bus_schedules bs
            JOIN buses b ON bs.bus_id = b.bus_id
            JOIN routes r ON bs.route_id = r.route_id
            JOIN drivers d ON bs.driver_id = d.driver_id
            ORDER BY r.route_number, bs.start_time
        `);
        return res.json({ success: true, schedules: result.rows });
    } catch (err) {
        console.error('getSchedules error', err);
        return res.status(500).json({ success: false, error: err.message });
    }
};

/**
 * Get count of active objects for dashboard.
 */
exports.getStats = async (req, res) => {
    try {
        const routes = await pool.query('SELECT COUNT(*) FROM routes');
        const buses = await pool.query('SELECT COUNT(*) FROM buses');
        const drivers = await pool.query('SELECT COUNT(*) FROM drivers');
        
        return res.json({ 
            success: true, 
            stats: {
                routes: parseInt(routes.rows[0].count),
                buses: parseInt(buses.rows[0].count),
                drivers: parseInt(drivers.rows[0].count)
            }
        });
    } catch (err) {
        console.error('getStats error', err);
        return res.status(500).json({ success: false, error: err.message });
    }
};

/**
 * Get detailed info for a specific bus.
 */
exports.getBusById = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query(`
            SELECT 
                b.bus_id as id,
                b.bus_number as "busNumber",
                b.bus_type as type,
                dc.name as "depotName",
                dc.address as "depotAddress"
            FROM buses b
            JOIN depot_companies dc ON b.depot_id = dc.depot_id
            WHERE (b.bus_id::text = $1 OR b.bus_number = $1)
        `, [id]);
        
        if (result.rows.length === 0) {
            // fallback search by bus number
            const altResult = await pool.query(`
                SELECT b.*, dc.name as "depotName" FROM buses b 
                JOIN depot_companies dc ON b.depot_id = dc.depot_id 
                WHERE bus_number = $1`, [id]);
            if(altResult.rows.length > 0) return res.json({ success: true, bus: altResult.rows[0] });
            return res.status(404).json({ success: false, message: 'Bus not found' });
        }
        return res.json({ success: true, bus: result.rows[0] });
    } catch (err) {
        console.error('getBusById error', err);
        return res.status(500).json({ success: false, error: err.message });
    }
};

/**
 * Get detailed info for a specific stop including arriving buses from schedules.
 */
exports.getStopById = async (req, res) => {
    const { id } = req.params;
    try {
        const stopResult = await pool.query('SELECT * FROM route_stops WHERE stop_id = $1', [id]);
        if (stopResult.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Stop not found' });
        }

        // Get arriving buses for the route this stop belongs to
        const arrivals = await pool.query(`
            SELECT 
                bs.schedule_id as id,
                r.route_number as "routeNumber",
                r.end_location as destination,
                bs.start_time as "startTime"
            FROM bus_schedules bs
            JOIN routes r ON bs.route_id = r.route_id
            WHERE bs.route_id = $1
            ORDER BY bs.start_time ASC
            LIMIT 5
        `, [stopResult.rows[0].route_id]);

        return res.json({ 
            success: true, 
            stop: stopResult.rows[0],
            arrivals: arrivals.rows
        });
    } catch (err) {
        console.error('getStopById error', err);
        return res.status(500).json({ success: false, error: err.message });
    }
};
