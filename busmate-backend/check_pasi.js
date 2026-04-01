const pool = require('./db.js');

setTimeout(async () => {
    try {
        const r = await pool.query("SELECT full_name, phone FROM drivers WHERE full_name = 'pasi'");
        console.log('PASI DRIVER:');
        console.log(JSON.stringify(r.rows, null, 2));
        console.log('\nPhone as hex bytes:', r.rows[0]?.phone.split('').map(c => c.charCodeAt(0).toString(16)).join(' '));
    } catch (e) {
        console.error(e.message);
    }
    process.exit();
}, 500);
