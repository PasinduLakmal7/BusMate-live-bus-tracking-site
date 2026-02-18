const bcrypt = require("bcrypt");
const pool = require("../../db.js");

const registerDriver = async (req, res) => {
    try {
        const {
            name,
            email,
            phone,
            password,
            nic,
            driver_photo_url,
            license_number,
            license_expiry,
            license_photo_url,
            bus_number,
            bus_type,
            depot_name,
            conductor_name,
            conductor_nic,
            conductor_phone,
            conductor_photo_url,
            route_number,
            route_name,
            trips_json,
        } = req.body;

        console.log("📥 Driver Registration Request:", { name, email, phone });

        // Validate required fields (including those required by DB migration)
        if (!name || !email || !phone || !password) {
            return res.status(400).json({
                success: false,
                error: "All fields (name, email, phone, password) are required",
            });
        }

        // Validate phone length
        if (phone.length < 9 || phone.length > 20) {
            return res.status(400).json({
                success: false,
                error: "Phone number must be between 9-20 characters",
            });
        }

        // Validate password length
        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                error: "Password must be at least 6 characters",
            });
        }

        // Validate additional required fields per migration
        if (!nic || !license_number || !license_expiry || !bus_number) {
            return res.status(400).json({
                success: false,
                error: "Fields nic, license_number, license_expiry and bus_number are required",
            });
        }

        // Check if already in pending_registrations or drivers table
        const existingPending = await pool.query(
            "SELECT * FROM pending_registrations WHERE phone = $1",
            [phone]
        );

        const existingDriver = await pool.query(
            "SELECT * FROM drivers WHERE phone = $1",
            [phone]
        );

        if (existingPending.rows.length > 0) {
            return res.status(409).json({
                success: false,
                error: "Registration already pending for this phone number",
            });
        }

        if (existingDriver.rows.length > 0) {
            return res.status(409).json({
                success: false,
                error: "Driver already registered with this phone number",
            });
        }

        // Hash password
        const hashed = await bcrypt.hash(password, 10);

        // Save to pending_registrations table (awaiting admin approval)
        const result = await pool.query(
            `INSERT INTO pending_registrations (
                full_name, email, phone, nic, password_hash, driver_photo_url,
                license_number, license_expiry, license_photo_url,
                bus_number, bus_type, depot_name,
                conductor_name, conductor_nic, conductor_phone, conductor_photo_url,
                route_number, route_name, trips_json, status, created_at
            ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21)
            RETURNING pending_id, full_name, email, phone, status`,
            [
                name,
                email,
                phone,
                nic,
                hashed,
                driver_photo_url || null,
                license_number,
                license_expiry,
                license_photo_url || null,
                bus_number,
                bus_type || null,
                depot_name || null,
                conductor_name || null,
                conductor_nic || null,
                conductor_phone || null,
                conductor_photo_url || null,
                route_number || null,
                route_name || null,
                trips_json ? JSON.stringify(trips_json) : null,
                "pending",
                new Date(),
            ]
        );

        const pendingReg = result.rows[0];

        console.log("✅ Driver registration submitted for approval:", pendingReg.pending_id);

        return res.status(201).json({
            success: true,
            message: "Registration submitted successfully! Please wait for admin approval.",
            data: {
                id: pendingReg.pending_id,
                name: pendingReg.full_name,
                email: pendingReg.email,
                phone: pendingReg.phone,
                status: pendingReg.status,
            },
        });
    } catch (err) {
        console.error("❌ Driver registration error:", err);

        return res.status(500).json({
            success: false,
            error: "Server error during registration: " + err.message,
        });
    }
};

module.exports = registerDriver;
