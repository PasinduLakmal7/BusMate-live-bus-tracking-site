const pool = require('../../db.js');
const Redis = require('ioredis');
const bcrypt = require('bcrypt');
const twilio = require('twilio');

const redis = new Redis(process.env.REDIS_URL || 'redis://127.0.0.1:6379', {
    maxRetriesPerRequest: 1, // Don't block the thread if Redis is down
    retryStrategy: (times) => null // Don't retry automatically
});

// Log Redis errors but don't crash
redis.on('error', (err) => {
    console.warn('⚠️ Redis connection error:', err.message);
});

async function sendSmsOtp(phone, otp) {
    // If Twilio is configured, send SMS; otherwise log the OTP
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const from = process.env.TWILIO_FROM;

    if (accountSid && authToken && from) {
        try {
            const client = twilio(accountSid, authToken);
            await client.messages.create({
                body: `Your BusMate verification code: ${otp}`,
                from,
                to: phone,
            });
            console.log('OTP SMS sent via Twilio to', phone);
            return true;
        } catch (err) {
            console.error('Twilio send error', err.message || err);
            return false;
        }
    }

    // fallback to log for development
    console.log(`DEV OTP for ${phone}: ${otp}`);
    return true;
}

const approveDriver = async (req, res) => {
    const pendingId = req.params.id;
    try {
        // fetch pending registration
        const pendingRes = await pool.query(
            'SELECT * FROM pending_registrations WHERE pending_id = $1',
            [pendingId]
        );
        if (pendingRes.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'Pending registration not found' });
        }

        const p = pendingRes.rows[0];

        // Check duplicates again
        const existingDriver = await pool.query('SELECT * FROM drivers WHERE phone = $1', [p.phone]);
        if (existingDriver.rows.length > 0) {
            return res.status(409).json({ success: false, error: 'Driver already exists' });
        }

        // Insert into drivers table
        console.log('--- Attempting to insert into drivers ---');
        const insertDriver = await pool.query(
            `INSERT INTO drivers (
                full_name, phone, nic, photo_url, email, 
                license_number, license_expiry, bus_number, bus_type, 
                conductor_name, conductor_phone, conductor_nic, conductor_photo_url,
                route_number, route_name, depot_name, license_photo_url, trips_json,
                password_hash, created_at
            )
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20) RETURNING driver_id`,
            [
                p.full_name,
                p.phone,
                p.nic,
                p.driver_photo_url || null,
                p.email || null,
                p.license_number || null,
                p.license_expiry ? new Date(p.license_expiry).toISOString().split('T')[0] : null,
                p.bus_number || null,
                p.bus_type || null,
                p.conductor_name || null,
                p.conductor_phone || null,
                p.conductor_nic || null,
                p.conductor_photo_url || null,
                p.route_number || null,
                p.route_name || null,
                p.depot_name || null,
                p.license_photo_url || null,
                p.trips_json ? JSON.stringify(p.trips_json) : null,
                p.password_hash,
                new Date(),
            ]
        );

        const driverId = insertDriver.rows[0].driver_id;
        console.log('✅ Inserted into drivers, ID:', driverId);

        // Insert into users table for auth (username -> phone)
        try {
            console.log('--- Attempting to insert into users ---');
            await pool.query(
                `INSERT INTO users (username, email, password, created_at, updated_at)
         VALUES ($1,$2,$3,now(),now())`,
                [p.phone, p.email || null, p.password_hash]
            );
        } catch (err) {
            console.warn('⚠️ User insert warning:', err.message || err);
            try {
                await pool.query(
                    `INSERT INTO users (username, password, created_at, updated_at)
           VALUES ($1,$2,now(),now())`,
                    [p.phone, p.password_hash]
                );
            } catch (e) {
                console.error('❌ User insert failed definitively:', e.message || e);
            }
        }

        // Update pending_registrations status to approved
        await pool.query(
            `UPDATE pending_registrations SET status = $1 WHERE pending_id = $2`,
            ['approved', pendingId]
        );

        // Generate OTP and store in Redis (Silently handle Redis being down)
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        try {
            const otpKey = `otp:phone:${p.phone}`;
            await redis.set(otpKey, otp, 'EX', 300); // 5 minutes
            console.log('✅ OTP stored in Redis');
        } catch (redisErr) {
            console.warn('⚠️ Redis is unavailable, skipping OTP persistence:', redisErr.message);
        }

        // Log OTP prominently for development
        console.log('\n🔐 ==========================================');
        console.log(`🔐 OTP FOR TESTING (DEVELOPMENT ONLY):`);
        console.log(`🔐 Phone: ${p.phone}`);
        console.log(`🔐 OTP Code: ${otp}`);
        console.log('🔐 ==========================================\n');

        // Send SMS
        const smsOk = await sendSmsOtp(p.phone, otp);

        return res.status(200).json({
            success: true,
            message: 'Driver approved',
            driverId,
            smsSent: smsOk
        });
    } catch (err) {
        console.error('❌ approveDriver CRITICAL error:', err);
        return res.status(500).json({
            success: false,
            error: 'Approval failed: ' + (err.detail || err.message)
        });
    }
};

module.exports = approveDriver;
