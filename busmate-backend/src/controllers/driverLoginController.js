const pool = require('../../db.js');
const jwt = require('jsonwebtoken');

/**
 * POST /drivers/login
 * Body: { phone: string }
 *
 * Called from the Flutter app AFTER Firebase phone OTP is successfully
 * verified. Firebase handles the actual phone ownership proof — this
 * endpoint just looks up the driver, attaches busId/routeId from the
 * latest schedule, and returns a signed JWT.
 */
const driverLogin = async (req, res) => {
    try {
        const { phone } = req.body;
        if (!phone) {
            return res.status(400).json({ success: false, error: 'phone is required' });
        }

        // Find the driver
        const dres = await pool.query(
            'SELECT * FROM drivers WHERE phone = $1',
            [phone]
        );
        if (dres.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'Driver not found' });
        }

        const driver = dres.rows[0];

        // Look up the driver's latest active schedule (bus_id + route_id)
        const schedRes = await pool.query(
            `SELECT schedule_id, bus_id, route_id
             FROM bus_schedules
             WHERE driver_id = $1
             ORDER BY schedule_id DESC
             LIMIT 1`,
            [driver.driver_id]
        );

        let busId = null;
        let routeId = null;
        if (schedRes.rows.length > 0) {
            busId = schedRes.rows[0].bus_id;
            routeId = schedRes.rows[0].route_id;
        }

        const token = jwt.sign(
            {
                id: driver.driver_id,
                phone: driver.phone,
                role: 'driver',
                busId,
                routeId,
            },
            process.env.JWT_SECRET || 'secret',
            { expiresIn: '10h' }
        );

        return res.json({
            success: true,
            token,
            driver: {
                id: driver.driver_id,
                full_name: driver.full_name,
                phone: driver.phone,
                busId,
                routeId,
            },
        });
    } catch (err) {
        console.error('driverLogin error', err);
        return res.status(500).json({ success: false, error: 'Server error' });
    }
};

module.exports = driverLogin;
