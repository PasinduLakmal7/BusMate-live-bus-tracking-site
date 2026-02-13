require('dotenv').config({ path: '../.env'});

const { knexSnakecaseMappers } = require('objection');


module.exports = {
  development: {
    client: 'postgresql',
    connection: {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      database: process.env.DB_DATABASE || 'busmate',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD
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
    }


    


      .directory.at.knexSnakecaseMappers,
  }
};