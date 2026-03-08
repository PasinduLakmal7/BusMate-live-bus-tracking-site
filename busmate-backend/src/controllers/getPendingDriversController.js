const pool = require('../../db.js');

const getPendingDrivers = async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT * FROM pending_registrations WHERE status = 'pending' ORDER BY created_at DESC"
        );

        return res.status(200).json({
            success: true,
            data: result.rows
        });
    } catch (err) {
        console.error("❌ Error fetching pending drivers:", err);
        return res.status(500).json({
            success: false,
            error: "Server error while fetching pending registrations: " + err.message
        });
    }
};

module.exports = getPendingDrivers;
