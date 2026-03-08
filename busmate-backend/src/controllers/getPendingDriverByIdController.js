const pool = require('../../db.js');

const getPendingDriverById = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(
            "SELECT * FROM pending_registrations WHERE pending_id = $1",
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: "Pending registration not found"
            });
        }

        return res.status(200).json({
            success: true,
            data: result.rows[0]
        });
    } catch (err) {
        console.error("❌ Error fetching pending driver details:", err);
        return res.status(500).json({
            success: false,
            error: "Server error while fetching registration details: " + err.message
        });
    }
};

module.exports = getPendingDriverById;
