const pool = require('../../db.js');

const verifyDriverExists = async (req, res) => {
    try {
        console.log('═══════════════════════════════════════════');
        console.log('[verifyDriverExists] HIT at', new Date().toISOString());
        console.log('[verifyDriverExists] Content-Type:', req.headers['content-type']);
        console.log('[verifyDriverExists] Raw body:', JSON.stringify(req.body));
        console.log('[verifyDriverExists] Body keys:', Object.keys(req.body || {}));
        console.log('═══════════════════════════════════════════');

        const { name, phone } = req.body;
        if (!phone || !name) return res.status(400).json({ success: false, error: 'name and phone required' });

        // Normalize phone: remove all spaces
        const normalizedPhone = phone.replace(/\s+/g, '');

        // Helper: try both +94XXXXXXXX and 0XXXXXXXX formats
        const getAlt = (p) => {
            if (p.startsWith('+94')) return '0' + p.slice(3);
            if (p.startsWith('0')) return '+94' + p.slice(1);
            return null;
        };
        const alt = getAlt(normalizedPhone);

        // ── 1. Check approved drivers table ──────────────────────────────────
        let result = await pool.query('SELECT * FROM drivers WHERE phone = $1 LIMIT 1', [normalizedPhone]);
        if (result.rows.length === 0 && alt) {
            result = await pool.query('SELECT * FROM drivers WHERE phone = $1 LIMIT 1', [alt]);
        }

        if (result.rows.length > 0) {
            const driver = result.rows[0];
            const savedName = (driver.full_name || '').toString().trim().toLowerCase();
            const ok = savedName === name.trim().toLowerCase();
            console.log('verifyDriverExists (approved):', { savedName, queryName: name, ok });
            return res.json({ success: true, exists: ok, status: 'approved' });
        }

        // ── 2. Check pending_registrations table ──────────────────────────────
        let pending = await pool.query('SELECT * FROM pending_registrations WHERE phone = $1 LIMIT 1', [normalizedPhone]);
        if (pending.rows.length === 0 && alt) {
            pending = await pool.query('SELECT * FROM pending_registrations WHERE phone = $1 LIMIT 1', [alt]);
        }

        if (pending.rows.length > 0) {
            const p = pending.rows[0];
            const savedName = (p.full_name || '').toString().trim().toLowerCase();
            const ok = savedName === name.trim().toLowerCase();
            console.log('verifyDriverExists (pending):', { savedName, queryName: name, ok });
            // Return exists:false but with status:'pending' so Flutter can show correct message
            return res.json({ success: true, exists: false, status: ok ? 'pending' : 'not_found' });
        }

        console.log('verifyDriverExists: not found in any table', normalizedPhone);
        return res.json({ success: true, exists: false, status: 'not_found' });

    } catch (err) {
        console.error('verifyDriverExists error', err);
        return res.status(500).json({ success: false, error: 'Server error' });
    }
};

module.exports = verifyDriverExists;

