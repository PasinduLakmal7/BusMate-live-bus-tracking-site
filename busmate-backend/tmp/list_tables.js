const pool = require('../db.js');

async function listTables() {
  try {
    const res = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    console.log('TABLES FOUND:');
    res.rows.forEach(row => console.log(' - ' + row.table_name));
    process.exit(0);
  } catch (err) {
    console.error('DB ERROR:', err);
    process.exit(1);
  }
}

listTables();
