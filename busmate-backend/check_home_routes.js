const pool = require('./db.js');
async function check() {
  try {
    const res = await pool.query("SELECT * FROM routes LIMIT 2");
    console.log('Routes Data:', JSON.stringify(res.rows, null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
}
check();
