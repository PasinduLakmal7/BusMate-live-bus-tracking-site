/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function (knex) {

  await knex.raw('TRUNCATE TABLE users RESTART IDENTITY CASCADE');


  await knex('users').insert([
    {
      username: 'admin_busmate',
      email: 'admin@busmate.com',
      password: 'password123'
    },
    {
      username: 'pasindu',
      email: 'pasindu@gmail.com',
      password: 'password123'
    },
    {
      username: 'lakmal',
      email: 'lakmal@gmail.com',
      password: 'password123'
    }
  ]);
};