const pool = require('../db.js');

async function checkUsers() {
  try {
    const res = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'users'
    `);
    console.log('USERS COLUMNS:');
    res.rows.forEach(row => console.log(` - ${row.column_name} (${row.data_type})`));
    process.exit(0);
  } catch (err) {
    console.error('DB ERROR:', err);
    process.exit(1);
  }
}

checkUsers();
