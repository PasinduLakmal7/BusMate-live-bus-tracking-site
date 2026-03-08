const pool = require('../../db.js');
const { setOtp } = require('../utils/otpStore');

/** Returns an array of phone variants to try against the DB. */
function phoneVariants(phone) {
    const variants = [phone];
    if (phone.startsWith('+94') && phone.length >= 12) {
        variants.push('0' + phone.slice(3));   // +94778170067 → 0778170067
        variants.push(phone.slice(3));          // +94778170067 → 778170067
    } else if (phone.startsWith('0')) {
        variants.push('+94' + phone.slice(1)); // 0778170067 → +94778170067
        variants.push(phone.slice(1));          // 0778170067 → 778170067
    } else {
        variants.push('+94' + phone);           // 778170067 → +94778170067
        variants.push('0' + phone);             // 778170067 → 0778170067
    }
    return variants;
}

/**
 * POST /drivers/request-otp
 * Body: { phone: string }
 */
const requestOtp = async (req, res) => {
    try {
        const { phone } = req.body;
        if (!phone) {
            return res.status(400).json({ success: false, error: 'phone is required' });
        }

        // Find the driver (try all phone format variants)
        const variants = phoneVariants(phone);
        let foundPhone = null;
        for (const v of variants) {
            const r = await pool.query('SELECT driver_id FROM drivers WHERE phone = $1', [v]);
            if (r.rows.length > 0) { foundPhone = v; break; }
        }

        if (!foundPhone) {
            console.log(`[OTP] Driver not found for phone=${phone} (tried: ${variants.join(', ')})`);
            return res.status(404).json({ success: false, error: 'Driver not found. Please register first.' });
        }

        // Generate 6-digit OTP and store it
        const otp = String(Math.floor(100000 + Math.random() * 900000));
        await setOtp(phone, otp, 300);
        console.log(`[OTP] phone=${phone} (db=${foundPhone}) otp=${otp}`);

        return res.json({
            success: true,
            message: 'OTP sent',
            ...(process.env.NODE_ENV !== 'production' && { otp }),
        });
    } catch (err) {
        console.error('requestOtp error', err);
        return res.status(500).json({ success: false, error: 'Server error: ' + err.message });
    }
};

module.exports = requestOtp;
