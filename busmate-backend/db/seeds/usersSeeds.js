const bcrypt = require('bcrypt');

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function (knex) {

  await knex.raw('TRUNCATE TABLE users RESTART IDENTITY CASCADE');

  const hashedPass = await bcrypt.hash('password123', 10);

  await knex('users').insert([
    {
      username: 'admin_busmate',
      email: 'admin@busmate.com',
      password: hashedPass
    },
    {
      username: 'pasindu',
      email: 'pasindu@gmail.com',
      password: hashedPass
    },
    {
      username: 'lakmal',
      email: 'lakmal@gmail.com',
      password: hashedPass
    }
  ]);
};