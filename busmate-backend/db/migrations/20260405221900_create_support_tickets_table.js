/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable('support_tickets', (table) => {
    table.increments('ticket_id').primary();
    table.string('topic', 100).notNullable();
    table.string('full_name', 150).notNullable();
    table.text('message').notNullable();
    table.string('status', 50).defaultTo('OPEN');
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable('support_tickets');
};
