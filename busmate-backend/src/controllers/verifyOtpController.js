const pool = require('../../db.js');
const jwt = require('jsonwebtoken');
const { getOtp, delOtp } = require('../utils/otpStore');

function phoneVariants(phone) {
    const variants = [phone];
    if (phone.startsWith('+94') && phone.length >= 12) {
        variants.push('0' + phone.slice(3));
        variants.push(phone.slice(3));
    } else if (phone.startsWith('0')) {
        variants.push('+94' + phone.slice(1));
        variants.push(phone.slice(1));
    } else {
        variants.push('+94' + phone);
        variants.push('0' + phone);
    }
    return variants;
}

const verifyOtp = async (req, res) => {
    try {
        const { phone, otp } = req.body;
        if (!phone || !otp) return res.status(400).json({ success: false, error: 'phone and otp required' });

        const stored = await getOtp(phone);
        if (!stored) return res.status(400).json({ success: false, error: 'OTP expired or not found' });
        if (stored !== otp) return res.status(400).json({ success: false, error: 'Invalid OTP' });

        // OTP valid — remove it
        await delOtp(phone);

        // Find driver — try all phone format variants
        let driver = null;
        for (const v of phoneVariants(phone)) {
            const r = await pool.query('SELECT * FROM drivers WHERE phone = $1', [v]);
            if (r.rows.length > 0) { driver = r.rows[0]; break; }
        }

        if (!driver) {
            return res.status(404).json({ success: false, error: 'Driver not found' });
        }

        // Look up the driver's active/latest schedule for busId + routeId
        const schedRes = await pool.query(
            `SELECT s.schedule_id, s.bus_id, s.route_id
             FROM bus_schedules s
             WHERE s.driver_id = $1
             ORDER BY s.schedule_id DESC
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
            { id: driver.driver_id, phone: driver.phone, role: 'driver', busId, routeId },
            process.env.JWT_SECRET || 'secret',
            { expiresIn: '10h' }
        );

        return res.json({
            success: true,
            token,
            driver: { id: driver.driver_id, full_name: driver.full_name, phone: driver.phone, busId, routeId }
        });
    } catch (err) {
        console.error('verifyOtp error', err);
        return res.status(500).json({ success: false, error: 'Server error' });
    }
};

module.exports = verifyOtp;
