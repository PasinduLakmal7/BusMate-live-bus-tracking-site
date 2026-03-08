const pool = require('../../db.js');

const getDriverById = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query(
            'SELECT * FROM drivers WHERE driver_id = $1',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Driver not found'
            });
        }

        return res.status(200).json({
            success: true,
            data: result.rows[0]
        });
    } catch (err) {
        console.error('❌ Error fetching driver by ID:', err);
        return res.status(500).json({
            success: false,
            error: 'Server error while fetching driver details: ' + err.message
        });
    }
};

module.exports = getDriverById;
