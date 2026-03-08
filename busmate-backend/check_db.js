const pool = require('./db.js');

async function checkDriverSchedule(phone) {
    try {
        const dres = await pool.query('SELECT driver_id, full_name, phone FROM drivers WHERE phone = $1 OR phone = $2 OR phone = $3',
            [phone, '0' + phone.slice(3), phone.slice(3)]);

        if (dres.rows.length === 0) {
            console.log(`Driver not found for phone variants of ${phone}`);
            return;
        }

        const driver = dres.rows[0];
        console.log(`Checking schedule for Driver: ${driver.full_name} (ID: ${driver.driver_id})`);

        const schedRes = await pool.query(
            `SELECT schedule_id, bus_id, route_id 
             FROM bus_schedules 
             WHERE driver_id = $1 
             ORDER BY schedule_id DESC`,
            [driver.driver_id]
        );

        if (schedRes.rows.length === 0) {
            console.log('❌ NO SCHEDULE FOUND for this driver. location:update will skip database writes because busId is missing.');
        } else {
            console.log(`✅ FOUND ${schedRes.rows.length} schedules.`);
            console.table(schedRes.rows);
        }

        const locCount = await pool.query('SELECT COUNT(*) FROM bus_locations WHERE bus_id = $1', [schedRes.rows[0]?.bus_id || -1]);
        console.log(`Total location records in DB for bus ${schedRes.rows[0]?.bus_id || 'N/A'}: ${locCount.rows[0].count}`);

    } catch (err) {
        console.error('Check error:', err);
    } finally {
        pool.end();
    }
}

const phone = process.argv[2] || '+94778170067';
checkDriverSchedule(phone);
