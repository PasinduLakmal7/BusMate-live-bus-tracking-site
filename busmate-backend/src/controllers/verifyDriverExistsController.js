const pool = require('../../db.js');

const verifyDriverExists = async (req, res) => {
    try {
        const { name, phone } = req.body;
        if (!phone || !name) return res.status(400).json({ success: false, error: 'name and phone required' });

        // Try exact phone
        let result = await pool.query('SELECT * FROM drivers WHERE phone = $1 LIMIT 1', [phone]);
        // If not found, try alternate formats: remove +94 -> leading 0, or add +94
        if (result.rows.length === 0) {
            let alt = phone;
            if (phone.startsWith('+94')) {
                alt = '0' + phone.slice(3);
            } else if (phone.startsWith('0')) {
                alt = '+94' + phone.slice(1);
            }
            if (alt !== phone) {
                result = await pool.query('SELECT * FROM drivers WHERE phone = $1 LIMIT 1', [alt]);
            }
        }

        if (result.rows.length === 0) {
            console.log('verifyDriverExists: phone not found', phone);
            return res.json({ success: true, exists: false });
        }

        const driver = result.rows[0];
        const savedName = (driver.full_name || '').toString().trim().toLowerCase();
        const ok = savedName === name.trim().toLowerCase();

        console.log('verifyDriverExists: found', { phoneInDb: driver.phone, savedName, queryName: name });
        return res.json({ success: true, exists: ok });
    } catch (err) {
        console.error('verifyDriverExists error', err);
        return res.status(500).json({ success: false, error: 'Server error' });
    }
};

module.exports = verifyDriverExists;
