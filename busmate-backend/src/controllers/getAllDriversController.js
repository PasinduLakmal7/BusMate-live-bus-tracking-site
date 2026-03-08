const pool = require('../../db.js');

const getAllDrivers = async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM drivers ORDER BY created_at DESC'
        );
        return res.status(200).json({
            success: true,
            data: result.rows
        });
    } catch (err) {
        console.error('❌ Error fetching all drivers:', err);
        return res.status(500).json({
            success: false,
            error: 'Server error while fetching drivers: ' + err.message
        });
    }
};

module.exports = getAllDrivers;
