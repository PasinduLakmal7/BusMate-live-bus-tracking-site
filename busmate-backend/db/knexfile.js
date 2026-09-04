require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
require('dotenv').config();

const { knexSnakecaseMappers } = require('objection');


module.exports = {
  development: {
    client: 'postgresql',
    connection: process.env.DATABASE_URL
      ? {
          connectionString: process.env.DATABASE_URL,
          ssl: { rejectUnauthorized: false }
        }
      : {
          host: process.env.DB_HOST || 'localhost',
          port: process.env.DB_PORT || 5432,
          database: process.env.DB_DATABASE || 'busmate',
          user: process.env.DB_USER || 'postgres',
          password: process.env.DB_PASSWORD,
          ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
        },

    pool: {
      min: 2,
      max: 10,
    },

    migrations: {
      directory: './migrations'
    },

    seeds: {
      directory: './seeds',
    },

    // Safely apply knexSnakecaseMappers if available in this installation
    ...(require('objection').knexSnakecaseMappers ? require('objection').knexSnakecaseMappers() : {})
  }
};

