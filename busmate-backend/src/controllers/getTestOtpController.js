const { redis } = require('../utils/redisClient');

const getTestOtp = async (req, res) => {
    try {
        const phone = req.params.phone;
        if (!phone) return res.status(400).json({ success: false, error: 'phone required' });

        // Try both +94 and 0-prefixed phone formats
        let phoneVariants = [phone];
        if (phone.startsWith('+94')) {
            phoneVariants.push('0' + phone.slice(3));
        } else if (phone.startsWith('0')) {
            phoneVariants.push('+94' + phone.slice(1));
        }

        let otp = null;
        let foundKey = null;
        for (const variant of phoneVariants) {
            const key = `otp:phone:${variant}`;
            otp = await redis.get(key);
            if (otp) {
                foundKey = key;
                break;
            }
        }

        if (!otp) {
            return res.json({ success: false, otp: null, phone, message: 'No OTP found or OTP expired for this phone (tried variants: ' + phoneVariants.join(', ') + ')' });
        }

        return res.json({ success: true, otp, phone, message: '✅ OTP retrieved', key: foundKey });
    } catch (err) {
        console.error('getTestOtp error', err);
        return res.status(500).json({ success: false, error: 'Server error', details: err.message });
    }
};

module.exports = getTestOtp;
