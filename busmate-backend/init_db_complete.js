const pool = require('./db.js');
const bcrypt = require('bcrypt');

async function initDB() {
  console.log('🚀 Starting Full Database & Seed Initialization on Supabase...');

  try {
    // 1. Create Tables
    console.log('📦 Creating tables...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) NOT NULL UNIQUE,
        email VARCHAR(120) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS depot_companies (
        depot_id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        address VARCHAR(255),
        contact_number VARCHAR(20),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS buses (
        bus_id SERIAL PRIMARY KEY,
        bus_number VARCHAR(50) NOT NULL UNIQUE,
        bus_type VARCHAR(50) DEFAULT 'Normal',
        depot_id INTEGER REFERENCES depot_companies(depot_id) ON DELETE SET NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS drivers (
        driver_id SERIAL PRIMARY KEY,
        full_name VARCHAR(255) NOT NULL,
        phone VARCHAR(20) NOT NULL UNIQUE,
        nic VARCHAR(20) NOT NULL UNIQUE,
        photo_url VARCHAR(500),
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS conductors (
        conductor_id SERIAL PRIMARY KEY,
        full_name VARCHAR(255) NOT NULL,
        nic VARCHAR(20) NOT NULL UNIQUE,
        phone_number VARCHAR(20) NOT NULL UNIQUE,
        photo_url VARCHAR(500),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS driving_license (
        license_id SERIAL PRIMARY KEY,
        driver_id INTEGER REFERENCES drivers(driver_id) ON DELETE CASCADE,
        license_number VARCHAR(50) NOT NULL UNIQUE,
        expiry_date DATE,
        license_photo_url VARCHAR(500),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS routes (
        route_id SERIAL PRIMARY KEY,
        route_number VARCHAR(50) NOT NULL,
        route_name VARCHAR(255),
        start_location VARCHAR(255) NOT NULL,
        end_location VARCHAR(255) NOT NULL,
        total_distance NUMERIC(6,2),
        estimated_duration INTEGER,
        active_status BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS route_stops (
        stop_id SERIAL PRIMARY KEY,
        route_id INTEGER REFERENCES routes(route_id) ON DELETE CASCADE,
        stop_name VARCHAR(255) NOT NULL,
        stop_order INTEGER NOT NULL,
        latitude NUMERIC(10,8),
        longitude NUMERIC(11,8),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS bus_schedules (
        schedule_id SERIAL PRIMARY KEY,
        bus_id INTEGER REFERENCES buses(bus_id) ON DELETE CASCADE,
        route_id INTEGER REFERENCES routes(route_id) ON DELETE CASCADE,
        driver_id INTEGER REFERENCES drivers(driver_id) ON DELETE SET NULL,
        conductor_id INTEGER REFERENCES conductors(conductor_id) ON DELETE SET NULL,
        trip_no INTEGER NOT NULL,
        start_time TIME NOT NULL,
        end_time TIME NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS bus_locations (
        location_id BIGSERIAL PRIMARY KEY,
        bus_id INTEGER REFERENCES buses(bus_id) ON DELETE CASCADE,
        latitude NUMERIC(10,8) NOT NULL,
        longitude NUMERIC(11,8) NOT NULL,
        speed NUMERIC(5,2),
        heading NUMERIC(5,2),
        is_returning BOOLEAN DEFAULT false,
        recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS pending_registrations (
        pending_id SERIAL PRIMARY KEY,
        full_name VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        phone VARCHAR(20) NOT NULL,
        nic VARCHAR(20) NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        driver_photo_url VARCHAR(500),
        license_number VARCHAR(50) NOT NULL,
        license_expiry DATE,
        license_photo_url VARCHAR(500),
        bus_number VARCHAR(50) NOT NULL,
        bus_type VARCHAR(50),
        depot_name VARCHAR(255),
        conductor_name VARCHAR(255),
        conductor_nic VARCHAR(20),
        conductor_phone VARCHAR(20),
        conductor_photo_url VARCHAR(500),
        route_number VARCHAR(50),
        route_name VARCHAR(255),
        trips_json JSONB,
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS crowd_reports (
        report_id SERIAL PRIMARY KEY,
        bus_id INTEGER REFERENCES buses(bus_id) ON DELETE CASCADE,
        occupancy_level INTEGER NOT NULL,
        reported_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS bus_alerts (
        alert_id SERIAL PRIMARY KEY,
        bus_id INTEGER REFERENCES buses(bus_id) ON DELETE SET NULL,
        stop_id INTEGER REFERENCES route_stops(stop_id) ON DELETE SET NULL,
        type VARCHAR(50) DEFAULT 'Delay',
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        is_active BOOLEAN DEFAULT true,
        reported_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS alerts (
        alert_id SERIAL PRIMARY KEY,
        type VARCHAR(50) DEFAULT 'System',
        title VARCHAR(255) NOT NULL,
        description TEXT,
        routes VARCHAR(255),
        is_read BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS user_favorites (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        item_type VARCHAR(50) NOT NULL,
        item_id VARCHAR(100) NOT NULL,
        item_name VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT unique_user_fav UNIQUE (user_id, item_type, item_id)
      );

      CREATE TABLE IF NOT EXISTS support_tickets (
        ticket_id SERIAL PRIMARY KEY,
        topic VARCHAR(100) NOT NULL,
        full_name VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ All tables verified/created successfully!');

    // 2. Check if data exists
    const routesCountRes = await pool.query('SELECT COUNT(*) FROM routes');
    const count = parseInt(routesCountRes.rows[0].count, 10);

    if (count > 0) {
      console.log(`ℹ️ Database already has ${count} routes. Skipping duplicate seeds.`);
      process.exit(0);
    }

    console.log('🌱 Seeding database...');

    // 2.1 Depots
    await pool.query(`
      INSERT INTO depot_companies (name, address, contact_number) VALUES
      ('Central Bus Stand (Pettah)', 'Pettah, Colombo 11', '0112328081'),
      ('Maharagama Depot', 'High Level Rd, Maharagama', '0112850262'),
      ('Kandy Goods Shed', 'William Gopallawa Mawatha, Kandy', '0812232222'),
      ('Galle Bus Stand', 'Galle Face Green, Galle', '0912234242'),
      ('Matara Depot', 'Beach Road, Matara', '0412222222'),
      ('Negombo Depot', 'Negombo Road, Negombo', '0312222222'),
      ('Kurunegala Depot', 'Colombo Road, Kurunegala', '0372222222'),
      ('Anuradhapura Depot', 'New Town, Anuradhapura', '0252222222'),
      ('Panadura Depot', 'Galle Road, Panadura', '0382222222'),
      ('Kalutara Depot', 'Galle Road, Kalutara', '0342222222');
    `);

    // 2.2 Buses
    const plates = [
      'WP NB-1025', 'WP NB-2041', 'WP LY-4455', 'WP NE-6677', 'WP PF-1122',
      'CP NC-3344', 'CP NA-9900', 'CP NB-5566', 'SP NB-7788', 'SP NL-1122',
      'SP NA-4455', 'NW NB-3344', 'NW NE-8899', 'NC NA-2233', 'NC NB-6677',
      'WP NB-1111', 'WP NB-2222', 'WP NB-3333', 'WP NB-4444', 'WP NB-5555',
      'WP NB-6666', 'WP NB-7777', 'WP NB-8888', 'WP NB-9999', 'WP NB-1010',
      'WP NC-1111', 'WP NC-2222', 'WP NC-3333', 'WP NC-4444', 'WP NC-5555',
      'CP NC-1111', 'CP NC-2222', 'CP NC-3333', 'CP NC-4444', 'CP NC-5555',
      'SP NC-1111', 'SP NC-2222', 'SP NC-3333', 'SP NC-4444', 'SP NC-5555',
      'UP NB-1111', 'UP NB-2222', 'UP NB-3333', 'UP NB-4444', 'UP NB-5555',
      'WP ND-1111', 'WP ND-2222', 'WP ND-3333', 'WP ND-4444', 'WP ND-5555'
    ];
    for (let i = 0; i < plates.length; i++) {
      await pool.query(
        'INSERT INTO buses (bus_number, bus_type, depot_id) VALUES ($1, $2, $3)',
        [plates[i], i % 2 === 0 ? 'Normal' : 'Luxury', (i % 10) + 1]
      );
    }

    // 2.3 Drivers
    const names = [
      'Amila Perera', 'Sunil Jayawardena', 'Nimal Silva', 'Kamal Gunaratne', 'Saman Kumara',
      'Chathura Weerasinghe', 'Kasun Rajapaksha', 'Dinesh Fernando', 'Ruwan Priyantha', 'Thushara Bandara',
      'Ajith Rohana', 'Susil Premajayantha', 'Namal Rajapaksa', 'Mahinda Perera', 'Indika Silva',
      'Lasantha Wickrematunge', 'Prasanna Ranatunga', 'Kanchana Wijesekera', 'Wimal Weerawansa', 'Patali Champika',
      'Sajith Premadasa', 'Anura Dissanayake', 'Ranil Wickremesinghe', 'Gotabaya Rajapaksa', 'Maithripala Sirisena',
      'Palitha Kohona', 'Dayasiri Jayasekara', 'Bandula Gunawardana', 'Nimal Siripala', 'John Amaratunga',
      'Ravi Karunanayake', 'Mangala Samaraweera', 'Dullas Alahapperuma', 'Wimal Weerawansa', 'Vidura Wickremanayake',
      'Roshan Ranasinghe', 'Dilum Amunugama', 'Lohan Ratwatte', 'Shehan Semasinghe', 'Janaka Wakkumbura',
      'Kanaka Herath', 'Thenuka Vidanagamage', 'Piyal Nishantha', 'Sisira Jayakody', 'Priyankara Jayaratne',
      'D.V. Chanaka', 'Indika Anuruddha', 'Siripala de Silva', 'A.L.M. Athaullah', 'Douglas Devananda'
    ];
    const passwordHash = await bcrypt.hash('password123', 10);
    for (let i = 0; i < names.length; i++) {
      await pool.query(
        'INSERT INTO drivers (full_name, phone, nic, photo_url, password_hash) VALUES ($1, $2, $3, $4, $5)',
        [
          names[i],
          `077${(1000000 + i).toString()}`,
          `${1970 + i}1234567${i % 10}`,
          `https://ui-avatars.com/api/?name=${encodeURIComponent(names[i])}&background=random`,
          passwordHash
        ]
      );
    }
    // Demo Driver
    await pool.query(
      'INSERT INTO drivers (full_name, phone, nic, photo_url, password_hash) VALUES ($1, $2, $3, $4, $5)',
      ['Demo Driver (Katubedda)', '0712345678', '199512345678', 'https://ui-avatars.com/api/?name=Demo&background=020617&color=ffffff', passwordHash]
    );

    // 2.4 Conductors
    for (let i = 0; i < names.length; i++) {
      await pool.query(
        'INSERT INTO conductors (full_name, nic, phone_number, photo_url) VALUES ($1, $2, $3, $4)',
        [
          `Conductor ${names[i].split(' ')[0]}`,
          `${1980 + i}1234567${i % 10}`,
          `071${(1000000 + i).toString()}`,
          `https://ui-avatars.com/api/?name=C+${encodeURIComponent(names[i].split(' ')[0])}&background=random`
        ]
      );
    }

    // 2.5 Routes
    const routesData = [
      { route_number: "138", start_location: "Maharagama", end_location: "Fort", total_distance: 15.2, estimated_duration: 45 },
      { route_number: "120", start_location: "Horana", end_location: "Fort", total_distance: 28.5, estimated_duration: 75 },
      { route_number: "154", start_location: "Kiribathgoda", end_location: "Angulana", total_distance: 22.0, estimated_duration: 60 },
      { route_number: "122", start_location: "Avissawella", end_location: "Fort", total_distance: 48.0, estimated_duration: 120 },
      { route_number: "177", start_location: "Kaduwela", end_location: "Kollupitiya", total_distance: 18.5, estimated_duration: 50 },
      { route_number: "01", start_location: "Colombo", end_location: "Kandy", total_distance: 115.0, estimated_duration: 180 },
      { route_number: "02", start_location: "Colombo", end_location: "Galle", total_distance: 119.5, estimated_duration: 150 },
      { route_number: "32", start_location: "Colombo", end_location: "Kataragama", total_distance: 280.0, estimated_duration: 360 },
      { route_number: "15", start_location: "Colombo", end_location: "Anuradhapura", total_distance: 205.0, estimated_duration: 300 },
      { route_number: "04", start_location: "Colombo", end_location: "Anuradhapura (via Puttalam)", total_distance: 220.0, estimated_duration: 330 },
      { route_number: "EX-001", start_location: "Maharagama", end_location: "Galle (Expressway)", total_distance: 105.0, estimated_duration: 90 },
      { route_number: "EX-002", start_location: "Kaduwela", end_location: "Matara (Expressway)", total_distance: 155.0, estimated_duration: 120 },
      { route_number: "255", start_location: "Mount Lavinia", end_location: "Kottawa", total_distance: 12.5, estimated_duration: 35 },
      { route_number: "100", start_location: "Panadura", end_location: "Pettah", total_distance: 27.0, estimated_duration: 80 },
      { route_number: "101", start_location: "Moratuwa", end_location: "Pettah", total_distance: 20.0, estimated_duration: 55 },
      { route_number: "102", start_location: "Pettah", end_location: "Moratuwa", total_distance: 19.5, estimated_duration: 55 },
      { route_number: "400", start_location: "Aluthgama", end_location: "Colombo", total_distance: 65.0, estimated_duration: 150 },
      { route_number: "176", start_location: "Hettiyawatte", end_location: "Karagampitiya", total_distance: 16.0, estimated_duration: 50 },
      { route_number: "190", start_location: "Meegoda", end_location: "Pettah", total_distance: 22.5, estimated_duration: 70 },
      { route_number: "170", start_location: "Athurugiriya", end_location: "Pettah", total_distance: 20.8, estimated_duration: 65 },
      { route_number: "174", start_location: "Kottawa", end_location: "Borella", total_distance: 14.5, estimated_duration: 45 },
      { route_number: "168", start_location: "Nugegoda", end_location: "Kotahena", total_distance: 12.0, estimated_duration: 40 },
      { route_number: "163", start_location: "Battaramulla", end_location: "Dehiwala", total_distance: 11.5, estimated_duration: 35 },
      { route_number: "135", start_location: "Kohilawatte", end_location: "Pettah", total_distance: 9.8, estimated_duration: 30 },
      { route_number: "155", start_location: "Soysapura", end_location: "Mattakkuliya", total_distance: 18.2, estimated_duration: 55 },
      { route_number: "99", start_location: "Colombo", end_location: "Badulla", total_distance: 232.0, estimated_duration: 300 },
      { route_number: "42", start_location: "Kandy", end_location: "Anuradhapura", total_distance: 135.0, estimated_duration: 210 },
      { route_number: "17", start_location: "Kurunegala", end_location: "Panadura", total_distance: 120.0, estimated_duration: 180 },
      { route_number: "60", start_location: "Kandy", end_location: "Matara", total_distance: 245.0, estimated_duration: 330 },
      { route_number: "26", start_location: "Colombo", end_location: "Kurunegala", total_distance: 95.0, estimated_duration: 150 },
      { route_number: "48", start_location: "Colombo", end_location: "Polonnaruwa", total_distance: 215.0, estimated_duration: 270 },
      { route_number: "03", start_location: "Colombo", end_location: "Jaffna", total_distance: 395.0, estimated_duration: 480 },
      { route_number: "45", start_location: "Colombo", end_location: "Trincomalee", total_distance: 260.0, estimated_duration: 330 },
      { route_number: "08", start_location: "Colombo", end_location: "Matale", total_distance: 145.0, estimated_duration: 210 },
      { route_number: "10", start_location: "Kandy", end_location: "Colombo", total_distance: 115.0, estimated_duration: 180 },
      { route_number: "49", start_location: "Colombo", end_location: "Trincomalee", total_distance: 255.0, estimated_duration: 300 },
      { route_number: "98", start_location: "Colombo", end_location: "Ampara", total_distance: 315.0, estimated_duration: 420 },
      { route_number: "22", start_location: "Ambalangoda", end_location: "Colombo", total_distance: 85.0, estimated_duration: 120 },
      { route_number: "145", start_location: "Gampaha", end_location: "Colombo", total_distance: 28.0, estimated_duration: 60 },
      { route_number: "187", start_location: "Katunayake", end_location: "Pettah", total_distance: 32.0, estimated_duration: 45 },
      { route_number: "112", start_location: "Maharagama", end_location: "Kotahena", total_distance: 14.0, estimated_duration: 40 },
      { route_number: "150", start_location: "Pettah", end_location: "Gothatuwa", total_distance: 8.5, estimated_duration: 25 },
      { route_number: "164", start_location: "Himbutana", end_location: "Town Hall", total_distance: 10.5, estimated_duration: 35 },
      { route_number: "175", start_location: "Kohilawatte", end_location: "Kollupitiya", total_distance: 11.0, estimated_duration: 35 },
      { route_number: "125", start_location: "Padukka", end_location: "Pettah", total_distance: 32.5, estimated_duration: 75 },
      { route_number: "119", start_location: "Maharagama", end_location: "Dehiwala", total_distance: 8.2, estimated_duration: 25 },
      { route_number: "117", start_location: "Nugegoda", end_location: "Ratmalana", total_distance: 7.5, estimated_duration: 20 },
      { route_number: "129", start_location: "Kottawa", end_location: "Moratuwa", total_distance: 15.0, estimated_duration: 40 },
      { route_number: "142", start_location: "Moratuwa", end_location: "Kollupitiya", total_distance: 18.5, estimated_duration: 50 },
      { route_number: "250", start_location: "Dehiwala", end_location: "Mount Lavinia", total_distance: 3.5, estimated_duration: 10 }
    ];

    for (let i = 0; i < routesData.length; i++) {
      const r = routesData[i];
      await pool.query(
        `INSERT INTO routes (route_number, route_name, start_location, end_location, total_distance, estimated_duration)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [r.route_number, `${r.start_location} - ${r.end_location}`, r.start_location, r.end_location, r.total_distance, r.estimated_duration]
      );
    }

    // 2.6 Route Stops
    const hubs = {
      "Maharagama": { lat: 6.848, lng: 79.926 },
      "Fort": { lat: 6.934, lng: 79.853 },
      "Pettah": { lat: 6.936, lng: 79.851 },
      "Horana": { lat: 6.714, lng: 80.063 },
      "Kiribathgoda": { lat: 6.989, lng: 79.931 },
      "Angulana": { lat: 6.809, lng: 79.878 },
      "Avissawella": { lat: 6.955, lng: 80.194 },
      "Kaduwela": { lat: 6.941, lng: 79.982 },
      "Kollupitiya": { lat: 6.914, lng: 79.850 },
      "Colombo": { lat: 6.927, lng: 79.861 },
      "Kandy": { lat: 7.290, lng: 80.633 },
      "Galle": { lat: 6.032, lng: 80.216 },
      "Matara": { lat: 5.949, lng: 80.535 },
      "Kataragama": { lat: 6.413, lng: 81.332 },
      "Anuradhapura": { lat: 8.311, lng: 80.403 },
      "Panadura": { lat: 6.711, lng: 79.907 },
      "Kalutara": { lat: 6.585, lng: 79.960 },
      "Tangalle": { lat: 6.024, lng: 80.794 },
      "Hambantota": { lat: 6.124, lng: 81.121 },
      "Tissamaharama": { lat: 6.276, lng: 81.288 },
      "Kurunegala": { lat: 7.486, lng: 80.364 },
      "Dambulla": { lat: 7.857, lng: 80.651 },
      "Negombo": { lat: 7.200, lng: 79.835 },
      "Chilaw": { lat: 7.575, lng: 79.795 },
      "Puttalam": { lat: 8.033, lng: 79.825 },
      "Makumbura": { lat: 6.841, lng: 79.993 },
      "Kottawa": { lat: 6.841, lng: 79.965 },
      "Katubedda Junction": { lat: 6.791, lng: 79.882 },
      "Katubedda": { lat: 6.79664167, lng: 79.88831674 },
      "University of Moratuwa": { lat: 6.795432567476653, lng: 79.89978923255364 },
      "Piliyandala": { lat: 6.801, lng: 79.922 },
      "Moratuwa": { lat: 6.774, lng: 79.882 },
      "Mount Lavinia": { lat: 6.836, lng: 79.866 },
      "Ratmalana": { lat: 6.816, lng: 79.874 },
      "Dehiwala": { lat: 6.852, lng: 79.863 },
      "Wellawatte": { lat: 6.876, lng: 79.858 },
      "Bambalapitiya": { lat: 6.892, lng: 79.854 },
      "Nugegoda": { lat: 6.865, lng: 79.899 },
      "Borella": { lat: 6.915, lng: 79.878 },
      "Town Hall": { lat: 6.917, lng: 79.866 },
      "Slave Island": { lat: 6.924, lng: 79.854 },
      "Malabe": { lat: 6.904, lng: 79.955 },
      "Battaramulla": { lat: 6.898, lng: 79.918 },
      "Rajagiriya": { lat: 6.908, lng: 79.892 },
      "Kadawatha": { lat: 7.001, lng: 79.952 },
      "Peliyagoda": { lat: 6.965, lng: 79.885 },
      "Wattala": { lat: 6.988, lng: 79.891 },
      "Ja-Ela": { lat: 7.075, lng: 79.891 },
      "Katunayake": { lat: 7.169, lng: 79.886 },
      "Gampaha": { lat: 7.091, lng: 79.999 },
      "Kelaniya": { lat: 6.955, lng: 79.918 },
      "Maradana": { lat: 6.930, lng: 79.865 },
      "Kotahena": { lat: 6.948, lng: 79.864 },
      "Grandpass": { lat: 6.948, lng: 79.872 },
      "Galle Face": { lat: 6.927, lng: 79.845 },
      "Aturugiriya Junction": { lat: 6.745, lng: 79.898 },
      "Nawinna": { lat: 6.858, lng: 79.912 },
      "Kirulapone": { lat: 6.879, lng: 79.876 },
      "Havelock Town": { lat: 6.889, lng: 79.865 },
      "Pokunuwita": { lat: 6.745, lng: 80.035 },
      "Kahathuduwa": { lat: 6.782, lng: 80.005 },
      "Polgasowita": { lat: 6.802, lng: 79.985 },
      "Boralesgamuwa": { lat: 6.840, lng: 79.905 },
      "Rathanapitiya": { lat: 6.852, lng: 79.902 },
      "Kohuwala": { lat: 6.860, lng: 79.885 },
      "Pamankada": { lat: 6.875, lng: 79.872 },
      "Thummulla": { lat: 6.899, lng: 79.862 },
      "Kosgama": { lat: 6.935, lng: 80.145 },
      "Hanwella": { lat: 6.905, lng: 80.085 },
      "Homagama": { lat: 6.843, lng: 80.003 },
      "Pannipitiya": { lat: 6.845, lng: 79.945 },
      "Nittambuwa": { lat: 7.145, lng: 80.095 },
      "Warakapola": { lat: 7.225, lng: 80.195 },
      "Kegalle": { lat: 7.255, lng: 80.345 },
      "Kadugannawa": { lat: 7.255, lng: 80.525 },
      "Peradeniya": { lat: 7.265, lng: 80.595 },
      "Beruwala": { lat: 6.478, lng: 79.982 },
      "Aluthgama": { lat: 6.432, lng: 79.998 },
      "Ambalangoda": { lat: 6.235, lng: 80.054 },
      "Hikkaduwa": { lat: 6.138, lng: 80.103 },
      "Kekirawa": { lat: 8.040, lng: 80.595 },
      "Nochchiyagama": { lat: 8.270, lng: 80.195 },
      "Hettiyawatte": { lat: 6.955, lng: 79.865 },
      "Karagampitiya": { lat: 6.845, lng: 79.870 },
      "Meegoda": { lat: 6.850, lng: 80.050 },
      "Kesbewa": { lat: 6.790, lng: 79.940 },
      "Athurugiriya": { lat: 6.875, lng: 79.990 },
      "Kohilawatte": { lat: 6.940, lng: 79.900 },
      "Soysapura": { lat: 6.812, lng: 79.880 },
      "Mattakkuliya": { lat: 6.975, lng: 79.870 },
      "Matale": { lat: 7.467, lng: 80.623 },
      "Mahiyangana": { lat: 7.320, lng: 80.995 },
      "Badulla": { lat: 6.993, lng: 81.055 },
      "Giriulla": { lat: 7.335, lng: 80.125 },
      "Polonnaruwa": { lat: 7.940, lng: 81.018 },
      "Vavuniya": { lat: 8.751, lng: 80.497 },
      "Kilinochchi": { lat: 9.380, lng: 80.398 },
      "Jaffna": { lat: 9.661, lng: 80.025 },
      "Habarana": { lat: 8.033, lng: 80.750 },
      "Trincomalee": { lat: 8.587, lng: 81.215 },
      "Ampara": { lat: 7.297, lng: 81.674 },
      "Gothatuwa": { lat: 6.925, lng: 79.910 },
      "Himbutana": { lat: 6.915, lng: 79.930 },
      "Padukka": { lat: 6.850, lng: 80.100 }
    };

    const routeStopsData = [
      ["Maharagama", "Nawinna", "Nugegoda", "Kirulapone", "Havelock Town", "Town Hall", "Slave Island", "Fort"],
      ["Horana", "Pokunuwita", "Kahathuduwa", "Polgasowita", "Piliyandala", "Boralesgamuwa", "Rathanapitiya", "Nugegoda", "Kohuwala", "Pamankada", "Thummulla", "Town Hall", "Slave Island", "Fort"],
      ["Kiribathgoda", "Kelaniya", "Peliyagoda", "Grandpass", "Pettah", "Fort", "Galle Face", "Kollupitiya", "Bambalapitiya", "Wellawatte", "Mount Lavinia", "Ratmalana", "Angulana"],
      ["Avissawella", "Kosgama", "Hanwella", "Homagama", "Kottawa", "Pannipitiya", "Maharagama", "Nugegoda", "Fort"],
      ["Kaduwela", "Malabe", "Battaramulla", "Rajagiriya", "Borella", "Town Hall", "Kollupitiya"],
      ["Colombo", "Peliyagoda", "Kadawatha", "Nittambuwa", "Warakapola", "Kegalle", "Kadugannawa", "Peradeniya", "Kandy"],
      ["Colombo", "Dehiwala", "Mount Lavinia", "Moratuwa", "Panadura", "Kalutara", "Beruwala", "Aluthgama", "Ambalangoda", "Galle"],
      ["Colombo", "Panadura", "Kalutara", "Galle", "Matara", "Tangalle", "Hambantota", "Tissamaharama", "Kataragama"],
      ["Colombo", "Peliyagoda", "Kurunegala", "Dambulla", "Kekirawa", "Anuradhapura"],
      ["Colombo", "Negombo", "Chilaw", "Puttalam", "Nochchiyagama", "Anuradhapura"],
      ["Maharagama", "Makumbura", "Galle"],
      ["Kaduwela", "Makumbura", "Galle", "Matara"],
      ["Mount Lavinia", "University of Moratuwa", "Piliyandala", "Kottawa"],
      ["Panadura", "Aturugiriya Junction", "Moratuwa", "Katubedda", "Ratmalana", "Mount Lavinia", "Dehiwala", "Wellawatte", "Bambalapitiya", "Kollupitiya", "Pettah"],
      ["Moratuwa", "Katubedda", "Ratmalana", "Mount Lavinia", "Dehiwala", "Wellawatte", "Bambalapitiya", "Kollupitiya", "Slave Island", "Pettah"],
      ["Pettah", "Slave Island", "Kollupitiya", "Bambalapitiya", "Wellawatte", "Dehiwala", "Mount Lavinia", "Ratmalana", "Katubedda", "Moratuwa"],
      ["Aluthgama", "Beruwala", "Kalutara", "Panadura", "Moratuwa", "Dehiwala", "Colombo"],
      ["Hettiyawatte", "Moratuwa", "Katubedda", "Karagampitiya"],
      ["Meegoda", "Homagama", "Kottawa", "Piliyandala", "Kesbewa", "Nugegoda", "Borella", "Pettah"],
      ["Athurugiriya", "Malabe", "Battaramulla", "Rajagiriya", "Borella", "Pettah"],
      ["Kottawa", "Piliyandala", "Dehiwala", "Mount Lavinia", "Ratmalana", "Borella"],
      ["Nugegoda", "Thummulla", "Borella", "Maradana", "Kotahena"],
      ["Battaramulla", "Rajagiriya", "Borella", "Pamankada", "Dehiwala"],
      ["Kohilawatte", "Nugegoda", "Town Hall", "Pettah"],
      ["Soysapura", "Moratuwa", "Ratmalana", "Mount Lavinia", "Dehiwala", "Colombo", "Mattakkuliya"],
      ["Colombo", "Kadugannawa", "Kandy", "Matale", "Dambulla", "Mahiyangana", "Badulla"],
      ["Kandy", "Matale", "Dambulla", "Kekirawa", "Anuradhapura"],
      ["Kurunegala", "Giriulla", "Katunayake", "Negombo", "Ja-Ela", "Colombo", "Dehiwala", "Panadura"],
      ["Kandy", "Peradeniya", "Colombo", "Mount Lavinia", "Panadura", "Kalutara", "Galle", "Matara"],
      ["Colombo", "Peliyagoda", "Ja-Ela", "Katunayake", "Giriulla", "Kurunegala"],
      ["Colombo", "Kadawatha", "Nittambuwa", "Kandy", "Dambulla", "Polonnaruwa"],
      ["Colombo", "Kurunegala", "Anuradhapura", "Vavuniya", "Kilinochchi", "Jaffna"],
      ["Colombo", "Kurunegala", "Dambulla", "Habarana", "Trincomalee"],
      ["Colombo", "Kadawatha", "Nittambuwa", "Kegalle", "Kandy", "Matale"],
      ["Kandy", "Peradeniya", "Kadugannawa", "Kegalle", "Warakapola", "Nittambuwa", "Colombo"],
      ["Colombo", "Dambulla", "Habarana", "Polonnaruwa", "Trincomalee"],
      ["Colombo", "Kandy", "Mahiyangana", "Ampara"],
      ["Ambalangoda", "Hikkaduwa", "Galle", "Kalutara", "Panadura", "Moratuwa", "Dehiwala", "Colombo"],
      ["Gampaha", "Ja-Ela", "Wattala", "Peliyagoda", "Colombo"],
      ["Katunayake", "Ja-Ela", "Wattala", "Peliyagoda", "Pettah"],
      ["Maharagama", "Nugegoda", "Borella", "Maradana", "Kotahena"],
      ["Pettah", "Maradana", "Borella", "Rajagiriya", "Battaramulla", "Gothatuwa"],
      ["Himbutana", "Malabe", "Battaramulla", "Rajagiriya", "Borella", "Town Hall"],
      ["Kohilawatte", "Nugegoda", "Thummulla", "Town Hall", "Kollupitiya"],
      ["Padukka", "Homagama", "Kottawa", "Maharagama", "Nugegoda", "Pettah"],
      ["Maharagama", "Boralesgamuwa", "Nugegoda", "Pamankada", "Dehiwala"],
      ["Nugegoda", "Pamankada", "Dehiwala", "Mount Lavinia", "Ratmalana"],
      ["Kottawa", "Piliyandala", "Kesbewa", "Katubedda", "Moratuwa"],
      ["Moratuwa", "Ratmalana", "Mount Lavinia", "Dehiwala", "Wellawatte", "Bambalapitiya", "Kollupitiya"],
      ["Dehiwala", "Mount Lavinia"]
    ];

    for (let rIdx = 0; rIdx < routeStopsData.length; rIdx++) {
      const routeId = rIdx + 1;
      const stopList = routeStopsData[rIdx];
      for (let sIdx = 0; sIdx < stopList.length; sIdx++) {
        const stopName = stopList[sIdx];
        const coords = hubs[stopName] || { lat: 6.9271 + (Math.random() - 0.5) * 0.1, lng: 79.8612 + (Math.random() - 0.5) * 0.1 };
        await pool.query(
          `INSERT INTO route_stops (route_id, stop_name, stop_order, latitude, longitude)
           VALUES ($1, $2, $3, $4, $5)`,
          [routeId, stopName, sIdx + 1, coords.lat, coords.lng]
        );
      }
    }

    // 2.7 Bus Schedules
    for (let routeId = 1; routeId <= 50; routeId++) {
      const busId = routeId;
      const driverId = (routeId === 14) ? 51 : (routeId <= 50 ? routeId : 1);
      const conductorId = (routeId <= 50 ? routeId : 1);
      const startHours = [6, 14];

      for (let tripIdx = 0; tripIdx < startHours.length; tripIdx++) {
        const hour = startHours[tripIdx];
        await pool.query(
          `INSERT INTO bus_schedules (bus_id, route_id, driver_id, conductor_id, trip_no, start_time, end_time)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [busId, routeId, driverId, conductorId, (tripIdx * 2) + 1, `${hour}:00:00`, `${hour + 4}:00:00`]
        );
        await pool.query(
          `INSERT INTO bus_schedules (bus_id, route_id, driver_id, conductor_id, trip_no, start_time, end_time)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [busId, routeId, driverId, conductorId, (tripIdx * 2) + 2, `${hour + 5}:00:00`, `${hour + 9}:00:00`]
        );
      }
    }

    // 2.8 Default Users
    const userPass = await bcrypt.hash('user123', 10);
    await pool.query(`
      INSERT INTO users (username, email, password) VALUES
      ('pasindu', 'pasindu@busmate.lk', '${userPass}'),
      ('passenger1', 'passenger1@gmail.com', '${userPass}')
      ON CONFLICT (username) DO NOTHING;
    `);

    // 2.9 Sample Alerts
    await pool.query(`
      INSERT INTO alerts (type, title, description, routes) VALUES
      ('Delay', 'Heavy Traffic near Galle Road', 'Traffic backlog observed due to road maintenance near Moratuwa junction.', '100, 101, 102'),
      ('System', 'System Synchronized', 'All fleet transit telemetry nodes operational.', 'ALL')
      ON CONFLICT DO NOTHING;
    `);

    console.log('🎉🎉🎉 DATABASE SEEDING COMPLETED 100% SUCCESSFULLY!');
    process.exit(0);

  } catch (err) {
    console.error('❌ DB Init Error:', err);
    process.exit(1);
  }
}

initDB();
