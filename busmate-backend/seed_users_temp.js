const pool = require('./db.js');
const bcrypt = require('bcrypt');

async function seedUsers() {
  try {
    console.log('🌱 Starting User Seed Intelligence...');
    
    const password = await bcrypt.hash('password123', 10);
    
    const users = [
      ['admin_prime', 'admin@busmate.lk', password],
      ['passenger_x', 'passenger@busmate.lk', password],
      ['driver_01', 'driver@busmate.lk', password],
      ['kasun_silva', 'kasun.silva@example.com', password]
    ];

    for (const [username, email, pass] of users) {
      // Check if exists
      const exists = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
      if (exists.rows.length === 0) {
        await pool.query(
          'INSERT INTO users (username, email, password, created_at) VALUES ($1, $2, $3, NOW())',
          [username, email, pass]
        );
        console.log(`✅ Created Operative: ${username} (${email})`);
      } else {
        console.log(`ℹ️ Operative exists: ${username}`);
      }
    }

    console.log('🚀 Seed Success. Database synchronized.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed Failure:', err);
    process.exit(1);
  }
}

seedUsers();
